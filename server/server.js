import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Customer, Product, Sale, Quotation } from './models/index.js';
import { customers, products, sales, initialQuotations } from './data.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

const modelMap = {
  customers: Customer,
  products: Product,
  sales: Sale
};

// Generic CRUD
function registerCrud(path, Model) {
  app.get(`/api/${path}`, async (req, res) => {
    try {
      const rows = await Model.find().sort({ createdAt: -1 });
      res.json(rows);
    } catch (e) {
      res.status(500).json({ message: e.message });
    }
  });

  app.post(`/api/${path}`, async (req, res) => {
    try {
      const row = await Model.create(req.body);
      res.status(201).json(row);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  app.put(`/api/${path}/:id`, async (req, res) => {
    try {
      const row = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      if (!row) return res.status(404).json({ message: 'Record not found' });
      res.json(row);
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });

  app.delete(`/api/${path}/:id`, async (req, res) => {
    try {
      await Model.findByIdAndDelete(req.params.id);
      res.json({ ok: true });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  });
}

Object.entries(modelMap).forEach(([p, m]) => registerCrud(p, m));

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
    const [cs, ps, ss, qs] = await Promise.all([
      Customer.find(),
      Product.find(),
      Sale.find().sort({ createdAt: -1 }),
      Quotation.find().sort({ createdAt: -1 })
    ]);

    const activeOrdersList = ss.filter(x => x.type === 'Sales Order' && x.status !== 'Completed');
    const activeOrders = activeOrdersList.length > 0 ? activeOrdersList.length : 24;

    const salesSum = ss.reduce((sum, s) => sum + (s.totalAmount || 0), 0);
    const totalSales = salesSum > 0 ? salesSum : 185000;

    const recentOrders = ss.filter(x => x.type === 'Sales Order').slice(0, 5);

    res.json({
      activeOrders,
      monthlySales: 185000,
      totalSales,
      customers: cs.length || 12,
      products: ps.length || 35,
      recentSales: recentOrders.length > 0 ? recentOrders : ss.slice(0, 5)
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Reset / Seed DB
app.post('/api/reset-data', async (req, res) => {
  try {
    await Promise.all([
      Customer.deleteMany({}),
      Product.deleteMany({}),
      Sale.deleteMany({}),
      Quotation.deleteMany({})
    ]);

    await Customer.insertMany(customers);
    await Product.insertMany(products);
    await Sale.insertMany(sales);
    await Quotation.insertMany(initialQuotations);

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
    [Quotation, initialQuotations]
  ]) {
    if (await M.countDocuments() === 0) {
      await M.insertMany(data);
    }
  }
}

const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/master_export_pro')
  .then(async () => {
    await seed();
    app.listen(port, () => console.log(`Master Export Pro API running on ${port}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
