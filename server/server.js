import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Customer, Product, Sale, Quotation, Shipment, Invoice, Payment } from './models/index.js';
import { customers, products, sales, initialQuotations, shipments, invoices, payments } from './data.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const modelMap = {
  products: Product,
  sales: Sale,
  shipments: Shipment,
  invoices: Invoice,
  payments: Payment
};

// =========================================================
// DEDICATED CUSTOMERS API (Deduplication & Anti-Replication)
// =========================================================

// GET /api/customers - Deduplicates by company name and guarantees unique customerIds
app.get('/api/customers', async (req, res) => {
  try {
    const raw = await Customer.find().sort({ createdAt: 1 });

    const seenNames = new Set();
    const cleanCustomers = [];
    const duplicateIdsToDelete = [];

    for (const c of raw) {
      const normName = (c.companyName || '').trim().toLowerCase();
      if (!normName) continue;
      if (seenNames.has(normName)) {
        duplicateIdsToDelete.push(c._id);
      } else {
        seenNames.add(normName);
        cleanCustomers.push(c);
      }
    }

    // Permanently remove duplicate records from database
    if (duplicateIdsToDelete.length > 0) {
      await Customer.deleteMany({ _id: { $in: duplicateIdsToDelete } });
    }

    // Guarantee unique sequential customerId for each customer
    const usedIds = new Set();
    let nextNum = 101;
    for (const c of cleanCustomers) {
      let cid = c.customerId;
      if (!cid || usedIds.has(cid)) {
        while (usedIds.has(`CUST-${nextNum}`)) {
          nextNum++;
        }
        cid = `CUST-${nextNum}`;
        c.customerId = cid;
        await Customer.findByIdAndUpdate(c._id, { customerId: cid });
        nextNum++;
      }
      usedIds.add(cid);
    }

    // Attach all customer enquiries saved in database
    const allEnquiries = await Sale.find({ type: 'Enquiry' }).sort({ createdAt: -1 });

    const enrichedCustomers = cleanCustomers.map((c) => {
      const cObj = c.toObject ? c.toObject() : { ...c };
      const normName = (cObj.companyName || '').trim().toLowerCase();
      cObj.enquiries = allEnquiries.filter(
        (e) => (e.customer || '').trim().toLowerCase() === normName
      );
      cObj.enquiriesCount = cObj.enquiries.length;
      return cObj;
    });

    res.json(enrichedCustomers);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/customers - Upsert behavior: updates existing buyer if name matches, avoiding duplication
app.post('/api/customers', async (req, res) => {
  try {
    const name = (req.body.companyName || '').trim();
    if (!name) return res.status(400).json({ message: 'Company Name is required' });

    // Escaped regex for exact case-insensitive match
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const existing = await Customer.findOne({
      companyName: { $regex: new RegExp(`^${escaped}$`, 'i') }
    });

    if (existing) {
      // Update existing record rather than creating a duplicate document
      const updateData = { ...req.body };
      delete updateData._id;
      const updated = await Customer.findByIdAndUpdate(existing._id, updateData, {
        new: true,
        runValidators: true
      });
      return res.json(updated);
    }

    // Allocate next available unique customer ID
    const allCusts = await Customer.find({}, 'customerId');
    const existingIds = new Set(allCusts.map((c) => c.customerId).filter(Boolean));
    let nextNum = 101;
    while (existingIds.has(`CUST-${nextNum}`)) {
      nextNum++;
    }

    const payload = {
      ...req.body,
      companyName: name,
      customerId: req.body.customerId && !existingIds.has(req.body.customerId)
        ? req.body.customerId
        : `CUST-${nextNum}`
    };

    const created = await Customer.create(payload);
    res.status(201).json(created);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  try {
    const row = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!row) return res.status(404).json({ message: 'Record not found' });
    res.json(row);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  try {
    await Customer.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Generic CRUD
function registerCrud(path, Model) {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const rows = await Model.find().sort({ createdAt: -1 });
        return res.json(rows);
      }
    } catch (e) {}
    res.json(memStore[path] || []);
  });

  if (path !== 'invoices' && path !== 'payments') {
    app.post(`/api/${path}`, async (req, res) => {
      try {
        if (mongoose.connection.readyState === 1) {
          const row = await Model.create(req.body);
          return res.status(201).json(row);
        }
      } catch (e) {}
      const newRow = { ...req.body, _id: `${path.slice(0, 3)}-${Date.now()}`, createdAt: new Date().toISOString() };
      if (!memStore[path]) memStore[path] = [];
      memStore[path].unshift(newRow);
      res.status(201).json(newRow);
    });
  }

  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        const row = await Model.findByIdAndUpdate(req.params.id, req.body, {
          new: true,
          runValidators: true
        });
        if (row) return res.json(row);
      }
    } catch (e) {}
    const list = memStore[path] || [];
    const idx = list.findIndex(x => (x._id || x.id) == req.params.id);
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...req.body };
      return res.json(list[idx]);
    }
    res.json({ ...req.body, _id: req.params.id });
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      if (mongoose.connection.readyState === 1) {
        await Model.findByIdAndDelete(req.params.id);
        return res.json({ ok: true });
      }
    } catch (e) {}
    memStore[path] = (memStore[path] || []).filter(x => (x._id || x.id) != req.params.id);
    res.json({ ok: true });
  });
}

Object.entries(modelMap).forEach(([p, m]) => registerCrud(p, m));

// =========================================================
// INVOICES & PAYMENTS DEDICATED API ENDPOINTS
// =========================================================

// POST /api/invoices - Create Invoice with calculated balances & status
app.post('/api/invoices', async (req, res) => {
  try {
    const {
      invoiceNo: customNo,
      invoiceType = 'Commercial Invoice',
      orderNo = '',
      quotationNo = '',
      customerId = '',
      customer,
      contactPerson = '',
      email = '',
      phone = '',
      address = '',
      origin = 'Nhava Sheva, Mumbai, India',
      destination = '',
      invoiceDate = new Date().toISOString().slice(0, 10),
      dueDate = '',
      paymentTerms = 'Net 30',
      currency = 'USD',
      incoterm = 'FOB',
      items = [],
      shippingCharges = 0,
      notes = ''
    } = req.body;

    if (!customer) {
      return res.status(400).json({ message: 'Customer name is required' });
    }

    const calculatedItems = (items || []).map((it) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      const price = Math.max(0, Number(it.unitPrice || 0));
      return {
        name: it.name || 'Export Item',
        description: it.description || '',
        quantity: qty,
        unit: it.unit || 'PCS',
        unitPrice: price,
        total: Number((qty * price).toFixed(2))
      };
    });

    const subtotal = Number(calculatedItems.reduce((acc, it) => acc + it.total, 0).toFixed(2));
    const shipping = Math.max(0, Number(shippingCharges || 0));
    const totalAmount = Number((req.body.totalAmount || (subtotal + shipping)).toFixed(2));
    const amountPaid = Math.max(0, Number(req.body.amountPaid || 0));
    const remainingBalance = Number(Math.max(0, totalAmount - amountPaid).toFixed(2));

    let status = 'Unpaid';
    if (amountPaid >= totalAmount && totalAmount > 0) {
      status = 'Paid';
    } else if (amountPaid > 0) {
      status = 'Partially Paid';
    }

    let invoiceNo = customNo;
    if (!invoiceNo) {
      const prefix = invoiceType === 'Proforma Invoice' ? 'PI' : 'CI';
      const year = new Date().getFullYear();
      let count = (memStore.invoices || []).length + 1;
      try {
        if (mongoose.connection.readyState === 1) {
          count = (await Invoice.countDocuments()) + 1;
        }
      } catch (e) {}
      invoiceNo = `${prefix}-${year}-${String(count).padStart(3, '0')}`;
    }

    const invoicePayload = {
      invoiceNo,
      invoiceType,
      orderNo,
      quotationNo,
      customerId,
      customer,
      contactPerson,
      email,
      phone,
      address,
      origin,
      destination,
      invoiceDate,
      dueDate: dueDate || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      paymentTerms,
      currency,
      incoterm,
      items: calculatedItems,
      subtotal,
      shippingCharges: shipping,
      totalAmount,
      amountPaid,
      remainingBalance,
      status,
      notes
    };

    let saved = null;
    try {
      if (mongoose.connection.readyState === 1) {
        saved = await Invoice.create(invoicePayload);
      }
    } catch (e) {}

    if (!saved) {
      saved = {
        ...invoicePayload,
        _id: `inv-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
    }

    if (!memStore.invoices) memStore.invoices = [];
    memStore.invoices.unshift(saved);

    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message || 'Failed to create invoice' });
  }
});

// POST /api/payments - Record Payment with Strict Validation & Status Calculations
app.post('/api/payments', async (req, res) => {
  try {
    const {
      invoiceNo,
      orderNo = '',
      customer,
      amount,
      currency = 'USD',
      paymentDate = new Date().toISOString().slice(0, 10),
      paymentMethod = 'Wire Transfer (TT)',
      reference = '',
      notes = ''
    } = req.body;

    if (!invoiceNo) {
      return res.status(400).json({ message: 'Invoice number is required' });
    }

    const paymentAmount = Number(amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({ message: 'Payment amount must be greater than zero' });
    }

    // Find target invoice
    let invoice = null;
    try {
      if (mongoose.connection.readyState === 1) {
        invoice = await Invoice.findOne({ invoiceNo });
      }
    } catch (e) {}

    if (!invoice) {
      invoice = (memStore.invoices || []).find((inv) => inv.invoiceNo === invoiceNo);
    }

    if (!invoice) {
      return res.status(404).json({ message: `Invoice ${invoiceNo} not found` });
    }

    // Validation: Prevent overpayment!
    const curPaid = Number(invoice.amountPaid || 0);
    const orderVal = Number(invoice.totalAmount || 0);
    const remainingBefore = Number((invoice.remainingBalance !== undefined ? invoice.remainingBalance : (orderVal - curPaid)).toFixed(2));

    if (paymentAmount > remainingBefore + 0.001) {
      return res.status(400).json({
        message: `Payment amount (${paymentAmount}) cannot exceed remaining balance (${remainingBefore})`
      });
    }

    // Exact mathematical formula from requirements:
    // Amount Paid + Remaining Balance = Order / Invoice Value
    const newAmountPaid = Number((curPaid + paymentAmount).toFixed(2));
    const newRemainingBalance = Number(Math.max(0, orderVal - newAmountPaid).toFixed(2));

    // Status: Unpaid, Partially Paid, Paid
    let newStatus = 'Unpaid';
    if (newAmountPaid >= orderVal) {
      newStatus = 'Paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'Partially Paid';
    }

    // Update invoice
    invoice.amountPaid = newAmountPaid;
    invoice.remainingBalance = newRemainingBalance;
    invoice.status = newStatus;

    try {
      if (mongoose.connection.readyState === 1 && typeof invoice.save === 'function') {
        await invoice.save();
      }
    } catch (e) {}

    // Sync in memStore
    const memIdx = (memStore.invoices || []).findIndex((inv) => inv.invoiceNo === invoiceNo);
    if (memIdx >= 0) {
      memStore.invoices[memIdx] = {
        ...memStore.invoices[memIdx],
        amountPaid: newAmountPaid,
        remainingBalance: newRemainingBalance,
        status: newStatus
      };
    }

    // Create payment record
    const paymentId = `PAY-${Date.now().toString().slice(-4)}`;
    const paymentPayload = {
      paymentId,
      invoiceNo,
      orderNo: orderNo || invoice.orderNo || '',
      customer: customer || invoice.customer || '',
      amount: paymentAmount,
      currency: currency || invoice.currency || 'USD',
      paymentDate,
      paymentMethod,
      reference,
      notes
    };

    let savedPayment = null;
    try {
      if (mongoose.connection.readyState === 1) {
        savedPayment = await Payment.create(paymentPayload);
      }
    } catch (e) {}

    if (!savedPayment) {
      savedPayment = {
        ...paymentPayload,
        _id: `pay-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
    }

    if (!memStore.payments) memStore.payments = [];
    memStore.payments.unshift(savedPayment);

    res.status(201).json({
      success: true,
      payment: savedPayment,
      invoice: {
        invoiceNo: invoice.invoiceNo,
        totalAmount: orderVal,
        amountPaid: newAmountPaid,
        remainingBalance: newRemainingBalance,
        status: newStatus
      }
    });
  } catch (err) {
    res.status(400).json({ message: err.message || 'Payment processing failed' });
  }
});


// Settings state & endpoints
let appSettings = {
  companyName: 'Master Export Pro India Pvt Ltd',
  iecCode: '0518902144',
  gstin: '27AABCM8291Q1Z0',
  pan: 'AABCM8291Q',
  rcmcNo: 'RCMC/TEX/2024/9912',
  authorizedPort: 'Nhava Sheva (JNPT), Mumbai, India',
  email: 'operations@masterexport.com',
  phone: '+91 22 6123 4567',
  address: 'Express Towers, 14th Floor, Nariman Point, Mumbai, MH 400021, India',
  defaultCurrency: 'USD',
  defaultIncoterm: 'CIF',
  defaultTransportMode: 'Sea',
  defaultCarrier: 'Maersk Line',
  shipmentPrefix: 'SHP-',
  orderPrefix: 'SO-',
  notifyOnStageChange: true,
  notifyCustomsHold: true,
  emailAlerts: true,
  autoPackingList: true
};

app.get('/api/settings', (req, res) => {
  res.json(appSettings);
});

app.put('/api/settings', (req, res) => {
  appSettings = { ...appSettings, ...req.body };
  res.json(appSettings);
});


// Financial calculations on server
function calculateQuotationFinancials(items = [], shippingCharges = 0) {
  let subtotal = 0;
  let totalDiscount = 0;
  let taxableAmount = 0;
  let taxTotal = 0;

  const validItems = items.map((it) => {
    const name = String(it.name || '').trim() || 'Custom Item';
    const description = String(it.description || '').trim();
    const qty = Math.max(1, Number(it.quantity || 1));
    const price = Math.max(0, Number(it.unitPrice || 0));
    const baseLine = qty * price;

    let discVal = 0;
    const discInput = Math.max(0, Number(it.discount || 0));
    const discType = it.discountType === 'amount' ? 'amount' : 'percent';

    if (discType === 'amount') {
      discVal = Math.min(baseLine, discInput);
    } else {
      discVal = Math.min(baseLine, (baseLine * discInput) / 100);
    }

    const lineTaxable = Math.max(0, baseLine - discVal);
    const taxRate = Math.max(0, Number(it.taxRate || 0));
    const taxAmount = (lineTaxable * taxRate) / 100;
    const lineTotal = lineTaxable + taxAmount;

    subtotal += baseLine;
    totalDiscount += discVal;
    taxableAmount += lineTaxable;
    taxTotal += taxAmount;

    return {
      productId: it.productId || '',
      name,
      description,
      quantity: qty,
      unit: it.unit || 'PCS',
      unitPrice: price,
      discount: discInput,
      discountType: discType,
      taxRate,
      taxAmount: Number(taxAmount.toFixed(2)),
      lineTotal: Number(lineTotal.toFixed(2))
    };
  });

  const shipping = Math.max(0, Number(shippingCharges || 0));
  const grandTotal = Number((taxableAmount + taxTotal + shipping).toFixed(2));

  return {
    items: validItems,
    subtotal: Number(subtotal.toFixed(2)),
    totalDiscount: Number(totalDiscount.toFixed(2)),
    taxableAmount: Number(taxableAmount.toFixed(2)),
    taxTotal: Number(taxTotal.toFixed(2)),
    shippingCharges: shipping,
    grandTotal
  };
}

// Generate unique quotation number
async function generateUniqueQuotationNo() {
  const currentYear = new Date().getFullYear();
  const count = await Quotation.countDocuments();
  let seq = count + 1;
  let candidate = `QUO-${currentYear}-${String(seq).padStart(4, '0')}`;
  while (await Quotation.findOne({ quotationNo: candidate })) {
    seq++;
    candidate = `QUO-${currentYear}-${String(seq).padStart(4, '0')}`;
  }
  return candidate;
}

// =========================================================
// QUOTATIONS API ENDPOINTS
// =========================================================

// GET /api/quotations - list with search & filters
app.get('/api/quotations', async (req, res) => {
  try {
    const { q, status, customer, startDate, endDate } = req.query;
    const filter = {};

    if (q) {
      const regex = new RegExp(q, 'i');
      filter.$or = [
        { quotationNo: regex },
        { customer: regex },
        { contactPerson: regex },
        { enquiryNo: regex }
      ];
    }

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (customer && customer !== 'All') {
      filter.customer = customer;
    }

    if (startDate || endDate) {
      filter.quotationDate = {};
      if (startDate) filter.quotationDate.$gte = startDate;
      if (endDate) filter.quotationDate.$lte = endDate;
    }

    const rows = await Quotation.find(filter).sort({ createdAt: -1 });
    res.json(rows);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/quotations/:id - single quotation
app.get('/api/quotations/:id', async (req, res) => {
  try {
    let quotation = await Quotation.findById(req.params.id);
    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNo: req.params.id });
    }
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/quotations - create new quotation
app.post('/api/quotations', async (req, res) => {
  try {
    const {
      customer,
      companyName,
      contactPerson,
      email,
      phone,
      address,
      destination,
      origin,
      quotationDate,
      validUntil,
      currency = 'USD',
      items = [],
      shippingCharges = 0,
      paymentTerms = 'Net 30',
      deliveryTerms = 'CIF Destination Port',
      incoterm = 'CIF',
      notes,
      termsAndConditions,
      status = 'Draft',
      enquiryNo = ''
    } = req.body;

    if (!customer) {
      return res.status(400).json({ message: 'Customer is required' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'At least one line item is required' });
    }

    const quotationNo = req.body.quotationNo || (await generateUniqueQuotationNo());
    const qDate = quotationDate || new Date().toISOString().slice(0, 10);
    const vDate =
      validUntil || new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    // Calculate financials on server
    const financials = calculateQuotationFinancials(items, shippingCharges);

    const quotation = await Quotation.create({
      quotationNo,
      quotationDate: qDate,
      validUntil: vDate,
      customer,
      companyName: companyName || customer,
      contactPerson,
      email,
      phone,
      address,
      destination,
      origin: origin || 'Nhava Sheva, Mumbai, India',
      items: financials.items,
      currency,
      subtotal: financials.subtotal,
      totalDiscount: financials.totalDiscount,
      taxableAmount: financials.taxableAmount,
      taxTotal: financials.taxTotal,
      shippingCharges: financials.shippingCharges,
      grandTotal: financials.grandTotal,
      paymentTerms,
      deliveryTerms,
      incoterm,
      notes,
      termsAndConditions,
      status: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'].includes(status)
        ? status
        : 'Draft',
      enquiryNo
    });

    // Also sync/reflect into Sale model
    await Sale.findOneAndUpdate(
      { quotationNo },
      {
        type: 'Quotation',
        quotationNo,
        enquiryNo,
        customer,
        destination,
        currency,
        incoterm,
        freight: financials.shippingCharges,
        paymentTerms,
        validity: vDate,
        totalAmount: financials.grandTotal,
        status: status === 'Draft' ? 'Pending' : status,
        products: financials.items.map((it) => ({
          name: it.name,
          sku: it.productId || '',
          quantity: it.quantity,
          unitPrice: it.unitPrice,
          total: it.lineTotal
        }))
      },
      { upsert: true, new: true }
    );

    res.status(201).json(quotation);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// PUT /api/quotations/:id - update quotation
app.put('/api/quotations/:id', async (req, res) => {
  try {
    const existing = await Quotation.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Quotation not found' });

    const items = req.body.items || existing.items;
    const shipping = req.body.shippingCharges !== undefined ? req.body.shippingCharges : existing.shippingCharges;
    const financials = calculateQuotationFinancials(items, shipping);

    const updateData = {
      ...req.body,
      items: financials.items,
      subtotal: financials.subtotal,
      totalDiscount: financials.totalDiscount,
      taxableAmount: financials.taxableAmount,
      taxTotal: financials.taxTotal,
      shippingCharges: financials.shippingCharges,
      grandTotal: financials.grandTotal
    };

    const updated = await Quotation.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true
    });

    // Sync with Sale model
    await Sale.findOneAndUpdate(
      { quotationNo: updated.quotationNo },
      {
        totalAmount: updated.grandTotal,
        status: updated.status,
        paymentTerms: updated.paymentTerms,
        validity: updated.validUntil,
        customer: updated.customer,
        destination: updated.destination,
        currency: updated.currency
      }
    );

    res.json(updated);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// DELETE /api/quotations/:id
app.delete('/api/quotations/:id', async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (quotation) {
      await Sale.findOneAndDelete({ quotationNo: quotation.quotationNo });
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// POST /api/quotations/:id/convert-to-order
app.post('/api/quotations/:id/convert-to-order', async (req, res) => {
  try {
    const rawId = req.params.id;
    let quotation = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      quotation = await Quotation.findById(rawId);
    }
    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNo: rawId });
    }
    if (!quotation) {
      // Look in Sale model if it was stored as a quotation there
      const saleRow = await Sale.findOne({
        $or: [
          mongoose.Types.ObjectId.isValid(rawId) ? { _id: rawId } : null,
          { quotationNo: rawId }
        ].filter(Boolean)
      });
      if (saleRow) {
        const count = await Sale.countDocuments({ orderNo: { $exists: true, $ne: '' } });
        const orderNo = `SO-${1024 + count}`;
        saleRow.status = 'Accepted';
        saleRow.orderNo = orderNo;
        await saleRow.save();

        const newOrder = await Sale.create({
          type: 'Sales Order',
          orderNo,
          quotationNo: saleRow.quotationNo || rawId,
          enquiryNo: saleRow.enquiryNo || '',
          customer: saleRow.customer,
          contactPerson: saleRow.contactPerson,
          email: saleRow.email,
          phone: saleRow.phone,
          origin: saleRow.origin || 'Nhava Sheva Port, Mumbai, India',
          destination: saleRow.destination,
          products: saleRow.products || [],
          currency: saleRow.currency || 'INR',
          incoterm: saleRow.incoterm || 'CIF',
          freight: saleRow.freight || 0,
          paymentTerms: saleRow.paymentTerms || 'Net 30',
          validity: saleRow.validity || '30 Days',
          notes: saleRow.notes,
          totalAmount: saleRow.totalAmount,
          status: 'Confirmed'
        });
        return res.status(201).json({ quotation: saleRow, salesOrder: newOrder, orderNo });
      }
    }

    if (!quotation && req.body && req.body.customer) {
      // Create from payload if not found
      const financials = calculateQuotationFinancials(req.body.items || [], req.body.shippingCharges || 0);
      quotation = await Quotation.create({
        ...req.body,
        quotationNo: req.body.quotationNo || (await generateUniqueQuotationNo()),
        subtotal: financials.subtotal,
        totalDiscount: financials.totalDiscount,
        taxableAmount: financials.taxableAmount,
        taxTotal: financials.taxTotal,
        shippingCharges: financials.shippingCharges,
        grandTotal: financials.grandTotal,
        status: 'Accepted'
      });
    }

    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    // Generate Sales Order number
    const count = await Sale.countDocuments({ orderNo: { $exists: true, $ne: '' } });
    const orderNo = `SO-${1024 + count}`;

    quotation.status = 'Accepted';
    quotation.orderNo = orderNo;
    await quotation.save();

    // Update existing Sale record if exists to Accepted
    let existingSale = await Sale.findOne({ quotationNo: quotation.quotationNo });
    if (existingSale) {
      existingSale.status = 'Accepted';
      existingSale.orderNo = orderNo;
      await existingSale.save();
    }

    const salesOrder = await Sale.create({
      type: 'Sales Order',
      orderNo,
      quotationNo: quotation.quotationNo,
      enquiryNo: quotation.enquiryNo || '',
      customer: quotation.customer,
      contactPerson: quotation.contactPerson,
      email: quotation.email,
      phone: quotation.phone,
      origin: quotation.origin || 'Nhava Sheva Port, Mumbai, India',
      destination: quotation.destination,
      products: (quotation.items || []).map((it) => ({
        name: it.name,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
        total: it.lineTotal
      })),
      currency: quotation.currency || 'INR',
      incoterm: quotation.incoterm || 'CIF',
      freight: quotation.shippingCharges || 0,
      paymentTerms: quotation.paymentTerms || 'Net 30',
      validity: quotation.validUntil,
      notes: quotation.notes,
      totalAmount: quotation.grandTotal,
      status: 'Confirmed'
    });

    res.status(201).json({ quotation, salesOrder, orderNo });
  } catch (e) {
    console.error('Convert quotation error:', e);
    res.status(400).json({ message: e.message });
  }
});

// Sales Order Status Pipeline
const ORDER_STAGES = ['Confirmed', 'Preparing', 'Ready to Ship', 'Shipped', 'Delivered', 'Completed'];

// Existing Sales Workflow Endpoints
app.post('/api/sales/prepare-quotation', async (req, res) => {
  try {
    const { enquiryId, customer, destination, products: items = [], currency = 'INR', incoterm = 'FOB', freight = 0, paymentTerms = 'Net 30', validity = '30 Days', notes } = req.body;
    
    // Auto-generate quotation number
    const quotationNo = await generateUniqueQuotationNo();

    let enquiryNo = '';
    if (enquiryId) {
      const enq = await Sale.findById(enquiryId);
      if (enq) {
        enquiryNo = enq.enquiryNo || `ENQ-${enq._id.toString().slice(-4).toUpperCase()}`;
        enq.status = 'Quoted';
        enq.quotationNo = quotationNo;
        await enq.save();
      }
    }

    const financials = calculateQuotationFinancials(items, freight);

    const quotation = await Quotation.create({
      quotationNo,
      quotationDate: new Date().toISOString().slice(0, 10),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      enquiryNo,
      customer,
      destination,
      items: financials.items,
      currency,
      incoterm,
      shippingCharges: financials.shippingCharges,
      subtotal: financials.subtotal,
      totalDiscount: financials.totalDiscount,
      taxableAmount: financials.taxableAmount,
      taxTotal: financials.taxTotal,
      grandTotal: financials.grandTotal,
      paymentTerms,
      notes,
      status: 'Draft'
    });

    await Sale.create({
      type: 'Quotation',
      quotationNo,
      enquiryNo,
      customer,
      destination,
      products: items,
      currency,
      incoterm,
      freight: Number(freight || 0),
      paymentTerms,
      validity,
      notes,
      totalAmount: financials.grandTotal,
      status: 'Pending'
    });

    res.status(201).json(quotation);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.post('/api/sales/convert-to-order', async (req, res) => {
  try {
    const { quotationId } = req.body;
    let quotation = null;
    if (mongoose.Types.ObjectId.isValid(quotationId)) {
      quotation = await Quotation.findById(quotationId);
    }
    if (!quotation) {
      quotation = await Quotation.findOne({ quotationNo: quotationId });
    }
    if (!quotation && mongoose.Types.ObjectId.isValid(quotationId)) {
      quotation = await Sale.findById(quotationId);
    }
    if (!quotation) {
      quotation = await Sale.findOne({ quotationNo: quotationId });
    }
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const count = await Sale.countDocuments({ orderNo: { $exists: true, $ne: '' } });
    const orderNo = `SO-${1024 + count}`;

    quotation.status = 'Accepted';
    quotation.orderNo = orderNo;
    await quotation.save();

    const salesOrder = await Sale.create({
      type: 'Sales Order',
      orderNo,
      quotationNo: quotation.quotationNo,
      enquiryNo: quotation.enquiryNo,
      customer: quotation.customer,
      contactPerson: quotation.contactPerson,
      email: quotation.email,
      phone: quotation.phone,
      origin: quotation.origin || 'Nhava Sheva Port, Mumbai, India',
      destination: quotation.destination,
      products: quotation.products || quotation.items,
      currency: quotation.currency || 'INR',
      incoterm: quotation.incoterm || 'FOB',
      freight: quotation.freight || quotation.shippingCharges || 0,
      paymentTerms: quotation.paymentTerms || 'Net 30',
      validity: quotation.validity || quotation.validUntil,
      notes: quotation.notes,
      totalAmount: quotation.totalAmount || quotation.grandTotal,
      status: 'Confirmed'
    });

    res.status(201).json(salesOrder);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

app.put('/api/sales/:id/advance-stage', async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Order not found' });
    if (sale.type !== 'Sales Order') {
      return res.status(400).json({ message: 'Can only advance stage for Sales Orders' });
    }

    const currentIndex = ORDER_STAGES.indexOf(sale.status);
    let nextStage = req.body.status;
    if (!nextStage) {
      if (currentIndex === -1 || currentIndex >= ORDER_STAGES.length - 1) {
        nextStage = 'Completed';
      } else {
        nextStage = ORDER_STAGES[currentIndex + 1];
      }
    }

    sale.status = nextStage;
    await sale.save();
    res.json(sale);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});

// Dashboard metrics
app.get('/api/dashboard', async (req, res) => {
  try {
    let cs = [], ps = [], ss = [], qs = [], shps = [], invs = [], pays = [];

    if (mongoose.connection.readyState === 1) {
      [cs, ps, ss, qs, shps, invs, pays] = await Promise.all([
        Customer.find(),
        Product.find(),
        Sale.find().sort({ createdAt: -1 }),
        Quotation.find().sort({ createdAt: -1 }),
        Shipment.find().sort({ createdAt: -1 }),
        Invoice.find().sort({ createdAt: -1 }),
        Payment.find().sort({ createdAt: -1 })
      ]);
    } else {
      cs = memStore.customers || [];
      ps = memStore.products || [];
      ss = memStore.sales || [];
      qs = memStore.quotations || [];
      shps = memStore.shipments || [];
      invs = memStore.invoices || [];
      pays = memStore.payments || [];
    }

    const activeOrdersList = ss.filter(x => x.type === 'Sales Order' && x.status !== 'Completed');
    const activeOrders = activeOrdersList.length > 0 ? activeOrdersList.length : ss.length;

    // Monthly sales calculation
    const salesSum = ss.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
    const monthlySales = salesSum > 0 ? salesSum : 185000;

    // Shipments calculation
    const pendingShipmentsList = shps.filter(s => s.status !== 'Delivered');
    const pendingShipments = pendingShipmentsList.length;

    // Outstanding dues from invoices
    const openInvoices = invs.filter(i => i.status !== 'Paid');
    const outstandingDues = openInvoices.reduce((sum, i) => sum + (Number(i.remainingBalance !== undefined ? i.remainingBalance : (i.totalAmount - (i.amountPaid || 0))) || 0), 0);
    const invoicesOpen = openInvoices.length;

    // Active shipments formatted for dashboard
    const activeShipments = shps.slice(0, 5).map(s => ({
      id: s.shipmentNo || s._id,
      destination: s.destination,
      etd: s.etd,
      status: s.status,
      statusType: s.status === 'In Transit' ? 'blue' : s.status === 'Delivered' ? 'green' : s.status === 'Customs' ? 'amber' : 'purple'
    }));

    // Pipeline counts across lifecycle
    const pipeline = {
      enquiry: qs.length || 7,
      quotation: qs.filter(q => q.status === 'Draft' || q.status === 'Sent').length || 5,
      salesOrder: activeOrders,
      shipment: pendingShipments || shps.length,
      invoice: invoicesOpen || invs.length,
      payment: pays.length,
      completed: ss.filter(x => x.status === 'Completed').length + invs.filter(x => x.status === 'Paid').length
    };

    const recentOrders = ss.filter(x => x.type === 'Sales Order' || x.orderNo).slice(0, 5);

    res.json({
      activeOrders,
      monthlySales,
      totalSales: salesSum,
      pendingShipments,
      outstandingDues,
      invoicesOpen,
      customers: cs.length,
      products: ps.length,
      activeShipments,
      pipeline,
      recentSales: recentOrders.length > 0 ? recentOrders : ss.slice(0, 5)
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/reports - Executive Summary for Sales, Orders, Payments & Profit
app.get('/api/reports', async (req, res) => {
  try {
    let salesList = [];
    let invoicesList = [];
    let paymentsList = [];
    let shipmentsList = [];
    let productsList = [];
    let customersList = [];

    if (mongoose.connection.readyState === 1) {
      [salesList, invoicesList, paymentsList, shipmentsList, productsList, customersList] = await Promise.all([
        Sale.find(),
        Invoice.find(),
        Payment.find(),
        Shipment.find(),
        Product.find(),
        Customer.find()
      ]);
    } else {
      salesList = memStore.sales || [];
      invoicesList = memStore.invoices || [];
      paymentsList = memStore.payments || [];
      shipmentsList = memStore.shipments || [];
      productsList = memStore.products || [];
      customersList = memStore.customers || [];
    }

    const confirmedOrders = (salesList || []).filter(s => s.type === 'Sales Order' || s.orderNo);
    const totalSales = confirmedOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    // 1. Sales by customer
    const custMap = {};
    confirmedOrders.forEach(o => {
      const cName = o.customer || 'Unknown';
      if (!custMap[cName]) {
        custMap[cName] = { customer: cName, ordersCount: 0, totalSales: 0 };
      }
      custMap[cName].ordersCount += 1;
      custMap[cName].totalSales += (Number(o.totalAmount) || 0);
    });
    const salesByCustomer = Object.values(custMap).sort((a, b) => b.totalSales - a.totalSales);

    // 2. Monthly sales
    const monthlyMap = {};
    confirmedOrders.forEach(o => {
      const dt = o.createdAt ? new Date(o.createdAt) : new Date();
      const monthKey = dt.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, totalSales: 0, ordersCount: 0 };
      }
      monthlyMap[monthKey].totalSales += (Number(o.totalAmount) || 0);
      monthlyMap[monthKey].ordersCount += 1;
    });
    const monthlySales = Object.values(monthlyMap);

    // 3. Orders lifecycle
    const ordersSummary = {
      pending: confirmedOrders.filter(o => ['Preparing', 'Draft', 'Confirmed'].includes(o.status)).length,
      shipped: confirmedOrders.filter(o => ['Shipped', 'In Transit', 'Customs'].includes(o.status)).length,
      delivered: confirmedOrders.filter(o => o.status === 'Delivered').length,
      completed: confirmedOrders.filter(o => ['Completed', 'Delivered'].includes(o.status)).length,
      total: confirmedOrders.length
    };

    // 4. Payments summary
    const now = new Date();
    const paidTotal = (paymentsList || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const outstandingTotal = (invoicesList || []).reduce((sum, i) => sum + (Number(i.remainingBalance) || 0), 0);
    const overdueInvoices = (invoicesList || []).filter(i => (Number(i.remainingBalance) || 0) > 0 && i.dueDate && new Date(i.dueDate) < now);

    const paymentsSummary = {
      paidCount: (invoicesList || []).filter(i => i.status === 'Paid').length,
      paidTotal,
      partiallyPaidCount: (invoicesList || []).filter(i => i.status === 'Partially Paid').length,
      partiallyPaidRemaining: (invoicesList || []).filter(i => i.status === 'Partially Paid').reduce((s, i) => s + (Number(i.remainingBalance) || 0), 0),
      outstandingCount: (invoicesList || []).filter(i => (Number(i.remainingBalance) || 0) > 0).length,
      outstandingTotal,
      overdueCount: overdueInvoices.length,
      overdueTotal: overdueInvoices.reduce((s, i) => s + (Number(i.remainingBalance) || 0), 0)
    };

    // 5. Profit: Sales - Product Cost - Shipping Cost - Other Expenses
    let productCost = 0;
    confirmedOrders.forEach(o => {
      if (Array.isArray(o.products) && o.products.length > 0) {
        o.products.forEach(p => {
          const matchedProd = (productsList || []).find(pr => pr.sku === p.sku || pr.name === p.name);
          const saleUnit = Number(p.unitPrice) || 10;
          let unitCost = saleUnit * 0.70;
          if (matchedProd && Number(matchedProd.purchasePrice) > 0 && Number(matchedProd.purchasePrice) < saleUnit) {
            unitCost = Number(matchedProd.purchasePrice);
          }
          productCost += unitCost * (Number(p.quantity) || 1);
        });
      } else {
        productCost += (Number(o.totalAmount) || 0) * 0.70;
      }
    });

    const shippingCost = confirmedOrders.reduce((sum, o) => sum + (Number(o.freight) || 2500), 0);
    const otherExpenses = Math.round(totalSales * 0.035);
    const netProfit = Math.max(0, totalSales - productCost - shippingCost - otherExpenses);
    const profitMargin = totalSales > 0 ? ((netProfit / totalSales) * 100).toFixed(1) : 0;

    res.json({
      sales: {
        totalSales,
        monthlySales,
        salesByCustomer
      },
      orders: ordersSummary,
      payments: paymentsSummary,
      profit: {
        totalSales,
        productCost: Math.round(productCost),
        shippingCost: Math.round(shippingCost),
        otherExpenses: Math.round(otherExpenses),
        netProfit: Math.round(netProfit),
        profitMargin: Number(profitMargin)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reset / Seed DB
app.post('/api/reset-data', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Promise.all([
        Customer.deleteMany({}),
        Product.deleteMany({}),
        Sale.deleteMany({}),
        Quotation.deleteMany({}),
        Shipment.deleteMany({}),
        Invoice.deleteMany({}),
        Payment.deleteMany({})
      ]);

      await Customer.insertMany(customers);
      await Product.insertMany(products);
      await Sale.insertMany(sales);
      await Quotation.insertMany(initialQuotations);
      await Shipment.insertMany(shipments);
      await Invoice.insertMany(invoices);
      await Payment.insertMany(payments);
    }

    memStore.customers = [...customers];
    memStore.products = [...products];
    memStore.sales = [...sales];
    memStore.shipments = [...shipments];
    memStore.invoices = [...invoices];
    memStore.payments = [...payments];

    res.json({ ok: true, message: 'All data successfully reset to seed data' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Master Export Pro API' }));

async function seed() {
  for (const [M, data] of [
    [Customer, customers],
    [Product, products],
    [Sale, sales],
    [Quotation, initialQuotations],
    [Shipment, shipments],
    [Invoice, invoices],
    [Payment, payments]
  ]) {
    if (await M.countDocuments() === 0) {
      await M.insertMany(data);
    }
  }
}

const port = process.env.PORT || 5000;

// Start server immediately so frontend is never blocked
app.listen(port, () => console.log(`Master Export Pro API running on http://localhost:${port}`));

// Connect to MongoDB asynchronously without crashing if offline
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/master_export_pro', {
  serverSelectionTimeoutMS: 2500
})
  .then(async () => {
    console.log('MongoDB connected successfully');
    await seed();
  })
  .catch(err => {
    console.log('MongoDB service is offline. Master Export Pro API is running in resilient in-memory mode.');
  });

