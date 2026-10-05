import React, { useEffect, useMemo, useState } from 'react';
import {
  FileText,
  CreditCard,
  Plus,
  Search,
  Eye,
  RotateCcw,
  CheckCircle2,
  Clock,
  DollarSign,
  Printer,
  Trash2,
  X,
  Building,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  Receipt
} from 'lucide-react';
import { get, post, del, getInvoices, createInvoice, deleteInvoice, getPayments, recordPayment } from '../api';
import Modal from '../components/Modal';
import Logo from '../components/Logo';
import { PageHeader, StatCard } from '../components/Layout';
import { useCurrency } from '../context/CurrencyContext';

// Clean initial export invoices matching requirements
const defaultInvoices = [
  {
    _id: 'inv-101',
    invoiceNo: 'CI-2026-001',
    invoiceType: 'Commercial Invoice',
    orderNo: 'SO-1024',
    quotationNo: 'QT-204',
    customerId: 'CUST-101',
    customer: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    address: 'Office 402, Business Bay, Dubai, UAE',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: 'Jebel Ali, Dubai, UAE',
    invoiceDate: '2026-10-02',
    dueDate: '2026-11-01',
    paymentTerms: 'Net 30',
    currency: 'USD',
    incoterm: 'FOB',
    items: [
      {
        name: 'Basmati Rice 1121',
        description: 'Premium long grain export grade double polished 25kg bags',
        quantity: 50,
        unit: 'MT',
        unitPrice: 950.00,
        total: 47500.00
      }
    ],
    subtotal: 47500.00,
    shippingCharges: 2500.00,
    taxTotal: 0,
    totalAmount: 50000.00,
    amountPaid: 20000.00,
    remainingBalance: 30000.00,
    status: 'Partially Paid',
    notes: 'Advance $20,000 received via TT. Balance $30,000 due within 30 days of B/L date.'
  },
  {
    _id: 'inv-102',
    invoiceNo: 'CI-2026-002',
    invoiceType: 'Commercial Invoice',
    orderNo: 'SO-1025',
    quotationNo: 'QT-205',
    customerId: 'CUST-103',
    customer: 'Apex Imports',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    phone: '+1 929 555 0101',
    address: '500 7th Ave, New York, NY 10018, USA',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: 'New York Port, USA',
    invoiceDate: '2026-10-01',
    dueDate: '2026-10-31',
    paymentTerms: '30% Adv + 70% B/L',
    currency: 'USD',
    incoterm: 'CIF',
    items: [
      {
        name: 'Cotton Yarn 30s',
        description: 'Combed ring spun 100% cotton export yarn',
        quantity: 2000,
        unit: 'KG',
        unitPrice: 12.50,
        total: 25000.00
      }
    ],
    subtotal: 25000.00,
    shippingCharges: 3000.00,
    taxTotal: 0,
    totalAmount: 28000.00,
    amountPaid: 28000.00,
    remainingBalance: 0.00,
    status: 'Paid',
    notes: 'Full payment received against Document Release.'
  },
  {
    _id: 'inv-103',
    invoiceNo: 'PI-2026-003',
    invoiceType: 'Proforma Invoice',
    orderNo: 'SO-1026',
    quotationNo: 'QT-206',
    customerId: 'CUST-104',
    customer: 'Tokyo Trading',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    phone: '+81 3 5555 0123',
    address: '1-1-2 Marunouchi, Chiyoda-ku, Tokyo, Japan',
    origin: 'Chennai Port, India',
    destination: 'Yokohama Port, Japan',
    invoiceDate: '2026-09-28',
    dueDate: '2026-10-28',
    paymentTerms: 'Net 30',
    currency: 'USD',
    incoterm: 'CFR',
    items: [
      {
        name: 'Refined Soybean Oil',
        description: 'Deodorized food grade cooking oil in steel drums',
        quantity: 900,
        unit: 'KG',
        unitPrice: 12.22,
        total: 11000.00
      }
    ],
    subtotal: 11000.00,
    shippingCharges: 1500.00,
    taxTotal: 0,
    totalAmount: 12500.00,
    amountPaid: 0.00,
    remainingBalance: 12500.00,
    status: 'Unpaid',
    notes: 'Proforma issued for import license & LC opening at Bank of Tokyo.'
  },
  {
    _id: 'inv-104',
    invoiceNo: 'PI-2026-004',
    invoiceType: 'Proforma Invoice',
    orderNo: 'SO-1027',
    quotationNo: 'QT-207',
    customerId: 'CUST-102',
    customer: 'EuroFoods BV',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    phone: '+31 20 555 4321',
    address: 'Keizersgracht 421, Amsterdam, Netherlands',
    origin: 'Mundra Port, Gujarat, India',
    destination: 'Rotterdam Port, Netherlands',
    invoiceDate: '2026-10-03',
    dueDate: '2026-11-03',
    paymentTerms: 'Advance',
    currency: 'EUR',
    incoterm: 'CIF',
    items: [
      {
        name: 'Organic Spices Assorted',
        description: 'Certified organic whole black pepper & turmeric',
        quantity: 1500,
        unit: 'KG',
        unitPrice: 28.00,
        total: 42000.00
      }
    ],
    subtotal: 42000.00,
    shippingCharges: 3000.00,
    taxTotal: 0,
    totalAmount: 45000.00,
    amountPaid: 0.00,
    remainingBalance: 45000.00,
    status: 'Unpaid',
    notes: 'Awaiting 100% advance remittance via EUR SEPA/SWIFT transfer.'
  },
  {
    _id: 'inv-105',
    invoiceNo: 'CI-2026-005',
    invoiceType: 'Commercial Invoice',
    orderNo: 'SO-1020',
    quotationNo: 'QT-198',
    customerId: 'CUST-101',
    customer: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    address: 'Office 402, Business Bay, Dubai, UAE',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: 'Hamburg Port, Germany',
    invoiceDate: '2026-09-10',
    dueDate: '2026-10-10',
    paymentTerms: 'Net 30',
    currency: 'USD',
    incoterm: 'CIF',
    items: [
      {
        name: 'Industrial Valve Assemblies',
        description: 'Stainless steel high pressure export ball valves',
        quantity: 350,
        unit: 'PCS',
        unitPrice: 94.28,
        total: 33000.00
      }
    ],
    subtotal: 33000.00,
    shippingCharges: 2000.00,
    taxTotal: 0,
    totalAmount: 35000.00,
    amountPaid: 35000.00,
    remainingBalance: 0.00,
    status: 'Paid',
    notes: 'Fully settled upon shipment delivery.'
  },
  {
    _id: 'inv-106',
    invoiceNo: 'CI-2026-006',
    invoiceType: 'Commercial Invoice',
    orderNo: 'SO-1028',
    quotationNo: 'QT-208',
    customerId: 'CUST-105',
    customer: 'Oceanic Trading',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    phone: '+61 2 9876 5432',
    address: 'Level 18, 100 Miller St, North Sydney NSW 2060, Australia',
    origin: 'Mundra Port, Gujarat, India',
    destination: 'Long Beach, California, USA',
    invoiceDate: '2026-10-04',
    dueDate: '2026-11-04',
    paymentTerms: 'Net 30',
    currency: 'USD',
    incoterm: 'CIF',
    items: [
      {
        name: 'Cashew Kernels W320 Grade',
        description: 'Export vacuum packed 25lb tins cashew nuts',
        quantity: 6000,
        unit: 'KG',
        unitPrice: 9.80,
        total: 58800.00
      }
    ],
    subtotal: 58800.00,
    shippingCharges: 3200.00,
    taxTotal: 0,
    totalAmount: 62000.00,
    amountPaid: 42000.00,
    remainingBalance: 20000.00,
    status: 'Partially Paid',
    notes: 'Advance & shipping release paid. Final balance of $20,000 due upon port arrival.'
  },
  {
    _id: 'inv-107',
    invoiceNo: 'CI-2026-007',
    invoiceType: 'Commercial Invoice',
    orderNo: 'SO-1029',
    quotationNo: 'QT-209',
    customerId: 'CUST-106',
    customer: 'Singapore Global Logistics',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    phone: '+65 6789 0123',
    address: '10 Marina Boulevard, Tower 2, Singapore 018983',
    origin: 'Chennai Port, India',
    destination: 'Singapore Port, Singapore',
    invoiceDate: '2026-10-05',
    dueDate: '2026-11-05',
    paymentTerms: 'Advance',
    currency: 'USD',
    incoterm: 'CIF',
    items: [
      {
        name: 'Pure Leather Handcrafted Bags',
        description: 'Full grain artisanal export travel duffels & laptop bags',
        quantity: 550,
        unit: 'PCS',
        unitPrice: 65.00,
        total: 35750.00
      }
    ],
    subtotal: 35750.00,
    shippingCharges: 2250.00,
    taxTotal: 0,
    totalAmount: 38000.00,
    amountPaid: 38000.00,
    remainingBalance: 0.00,
    status: 'Paid',
    notes: '100% swift payment completed prior to vessel loading.'
  }
];

const defaultPayments = [
  {
    _id: 'pay-1',
    paymentId: 'PAY-1001',
    invoiceNo: 'CI-2026-001',
    orderNo: 'SO-1024',
    customer: 'ABC Trading LLC',
    amount: 20000.00,
    currency: 'USD',
    paymentDate: '2026-10-03',
    paymentMethod: 'Wire Transfer (TT)',
    reference: 'TXN-SCB-891024',
    notes: 'Part payment 40% initial advance received.'
  },
  {
    _id: 'pay-2',
    paymentId: 'PAY-1002',
    invoiceNo: 'CI-2026-002',
    orderNo: 'SO-1025',
    customer: 'Apex Imports',
    amount: 28000.00,
    currency: 'USD',
    paymentDate: '2026-10-02',
    paymentMethod: 'Letter of Credit (LC)',
    reference: 'LC-CITI-442100',
    notes: '100% LC realization confirmed by overseas correspondent.'
  },
  {
    _id: 'pay-3',
    paymentId: 'PAY-1003',
    invoiceNo: 'CI-2026-005',
    orderNo: 'SO-1020',
    customer: 'ABC Trading LLC',
    amount: 35000.00,
    currency: 'USD',
    paymentDate: '2026-09-15',
    paymentMethod: 'Wire Transfer (TT)',
    reference: 'TXN-HSBC-29104',
    notes: 'Full invoice settlement received.'
  },
  {
    _id: 'pay-4',
    paymentId: 'PAY-1004',
    invoiceNo: 'CI-2026-006',
    orderNo: 'SO-1028',
    customer: 'Oceanic Trading',
    amount: 30000.00,
    currency: 'USD',
    paymentDate: '2026-10-04',
    paymentMethod: 'Wire Transfer (TT)',
    reference: 'TXN-ANZ-771920',
    notes: 'Initial production deposit and freight allocation.'
  },
  {
    _id: 'pay-5',
    paymentId: 'PAY-1005',
    invoiceNo: 'CI-2026-007',
    orderNo: 'SO-1029',
    customer: 'Singapore Global Logistics',
    amount: 38000.00,
    currency: 'USD',
    paymentDate: '2026-10-05',
    paymentMethod: 'Wire Transfer (TT)',
    reference: 'SWIFT-DBS-991204',
    notes: '100% advance wire settlement via DBS Singapore.'
  },
  {
    _id: 'pay-6',
    paymentId: 'PAY-1006',
    invoiceNo: 'CI-2026-001',
    orderNo: 'SO-1024',
    customer: 'ABC Trading LLC',
    amount: 10000.00,
    currency: 'USD',
    paymentDate: '2026-10-04',
    paymentMethod: 'Wire Transfer (TT)',
    reference: 'TXN-ENBD-339182',
    notes: 'Interim stage payment received against dispatch note.'
  },
  {
    _id: 'pay-7',
    paymentId: 'PAY-1007',
    invoiceNo: 'CI-2026-006',
    orderNo: 'SO-1028',
    customer: 'Oceanic Trading',
    amount: 12000.00,
    currency: 'USD',
    paymentDate: '2026-10-05',
    paymentMethod: 'Letter of Credit (LC)',
    reference: 'LC-WBC-552109',
    notes: 'Document release tranche cleared through Westpac.'
  }
];

export default function Invoices({ initialTab = 'Invoices' }) {
  const { formatAmount } = useCurrency();
  const [activeTab, setActiveTab] = useState(initialTab === 'Payments' ? 'Payments' : 'Invoices');

  const [invoices, setInvoices] = useState(defaultInvoices);
  const [payments, setPayments] = useState(defaultPayments);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [recordPaymentModalOpen, setRecordPaymentModalOpen] = useState(false);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Payment form state with real-time validation
  const [paymentForm, setPaymentForm] = useState({
    invoiceNo: '',
    amount: '',
    paymentMethod: 'Wire Transfer (TT)',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: ''
  });
  const [paymentError, setPaymentError] = useState('');

  // Fetch data
  const loadData = async () => {
    try {
      setLoading(true);
      const [invData, payData, salesData] = await Promise.all([
        getInvoices().catch(() => defaultInvoices),
        getPayments().catch(() => defaultPayments),
        get('/sales').catch(() => [])
      ]);

      if (Array.isArray(invData) && invData.length > 0) {
        setInvoices(invData);
      } else {
        setInvoices(defaultInvoices);
      }

      if (Array.isArray(payData) && payData.length > 0) {
        setPayments(payData);
      } else {
        setPayments(defaultPayments);
      }

      if (Array.isArray(salesData)) {
        const orders = salesData.filter((s) => s.type === 'Sales Order');
        setAvailableOrders(orders);
      }
    } catch (err) {
      console.error('Failed to load Invoices/Payments data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync initialTab prop change
  useEffect(() => {
    if (initialTab === 'Payments') {
      setActiveTab('Payments');
    }
  }, [initialTab]);

  // Statistics calculation
  const stats = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.amountPaid) || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => sum + (Number(inv.remainingBalance) || 0), 0);
    const unpaidCount = invoices.filter((inv) => inv.status === 'Unpaid' || inv.status === 'Partially Paid').length;
    const paidCount = invoices.filter((inv) => inv.status === 'Paid').length;
    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      unpaidCount,
      paidCount
    };
  }, [invoices]);

  // Unique customer list for filters
  const customersList = useMemo(() => {
    const set = new Set();
    invoices.forEach((inv) => {
      if (inv.customer) set.add(inv.customer);
    });
    return Array.from(set);
  }, [invoices]);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (inv.invoiceNo && inv.invoiceNo.toLowerCase().includes(q)) ||
        (inv.orderNo && inv.orderNo.toLowerCase().includes(q)) ||
        (inv.customer && inv.customer.toLowerCase().includes(q)) ||
        (inv.contactPerson && inv.contactPerson.toLowerCase().includes(q));

      const matchType = !typeFilter || inv.invoiceType === typeFilter;
      const matchStatus = !statusFilter || inv.status === statusFilter;
      const matchCustomer = !customerFilter || inv.customer === customerFilter;

      return matchSearch && matchType && matchStatus && matchCustomer;
    });
  }, [invoices, search, typeFilter, statusFilter, customerFilter]);

  // Filtered payments (for Payment Tracking tab)
  const filteredPayments = useMemo(() => {
    return payments.filter((pay) => {
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        (pay.paymentId && pay.paymentId.toLowerCase().includes(q)) ||
        (pay.invoiceNo && pay.invoiceNo.toLowerCase().includes(q)) ||
        (pay.orderNo && pay.orderNo.toLowerCase().includes(q)) ||
        (pay.customer && pay.customer.toLowerCase().includes(q)) ||
        (pay.reference && pay.reference.toLowerCase().includes(q));

      const matchCustomer = !customerFilter || pay.customer === customerFilter;
      return matchSearch && matchCustomer;
    });
  }, [payments, search, customerFilter]);

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('');
    setStatusFilter('');
    setCustomerFilter('');
  };

  // Open Record Payment Modal for a specific invoice
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentForm({
      invoiceNo: invoice ? invoice.invoiceNo : (invoices[0]?.invoiceNo || ''),
      amount: invoice ? (invoice.remainingBalance > 0 ? invoice.remainingBalance : '') : '',
      paymentMethod: 'Wire Transfer (TT)',
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: '',
      notes: ''
    });
    setPaymentError('');
    setRecordPaymentModalOpen(true);
  };

  // Payment target invoice object
  const currentTargetInvoice = useMemo(() => {
    return invoices.find((inv) => inv.invoiceNo === paymentForm.invoiceNo) || selectedInvoiceForPayment;
  }, [invoices, paymentForm.invoiceNo, selectedInvoiceForPayment]);

  // Real-time payment calculation & validation
  const paymentValidation = useMemo(() => {
    if (!currentTargetInvoice) return { isValid: false, message: 'Please select an invoice' };

    const enteredAmount = Number(paymentForm.amount);
    const orderVal = Number(currentTargetInvoice.totalAmount || 0);
    const curPaid = Number(currentTargetInvoice.amountPaid || 0);
    const remainingBefore = Number((currentTargetInvoice.remainingBalance !== undefined ? currentTargetInvoice.remainingBalance : (orderVal - curPaid)).toFixed(2));

    if (!paymentForm.amount || isNaN(enteredAmount)) {
      return { isValid: false, message: 'Enter a payment amount' };
    }
    if (enteredAmount <= 0) {
      return { isValid: false, message: 'Payment amount must be greater than zero ($0)' };
    }
    if (enteredAmount > remainingBefore + 0.001) {
      return {
        isValid: false,
        message: `Amount exceeds remaining balance. Max allowed: ${formatAmount(remainingBefore)}`
      };
    }

    const resultingPaid = Number((curPaid + enteredAmount).toFixed(2));
    const resultingRemaining = Number(Math.max(0, orderVal - resultingPaid).toFixed(2));
    const resultingStatus = resultingRemaining <= 0 ? 'Paid' : 'Partially Paid';

    return {
      isValid: true,
      enteredAmount,
      remainingBefore,
      resultingPaid,
      resultingRemaining,
      resultingStatus
    };
  }, [currentTargetInvoice, paymentForm.amount, formatAmount]);

  // Submit Payment
  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!paymentValidation.isValid) {
      setPaymentError(paymentValidation.message);
      return;
    }

    setPaymentError('');
    try {
      const payload = {
        invoiceNo: currentTargetInvoice.invoiceNo,
        orderNo: currentTargetInvoice.orderNo || '',
        customer: currentTargetInvoice.customer || '',
        amount: Number(paymentForm.amount),
        currency: currentTargetInvoice.currency || 'USD',
        paymentDate: paymentForm.paymentDate,
        paymentMethod: paymentForm.paymentMethod,
        reference: paymentForm.reference,
        notes: paymentForm.notes
      };

      const result = await recordPayment(payload);

      // Local optimistic update
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.invoiceNo === currentTargetInvoice.invoiceNo
            ? {
                ...inv,
                amountPaid: paymentValidation.resultingPaid,
                remainingBalance: paymentValidation.resultingRemaining,
                status: paymentValidation.resultingStatus
              }
            : inv
        )
      );

      const newPayment = result.payment || {
        _id: `pay-${Date.now()}`,
        paymentId: `PAY-${Date.now().toString().slice(-4)}`,
        ...payload
      };

      setPayments((prev) => [newPayment, ...prev]);

      setRecordPaymentModalOpen(false);
      setSelectedInvoiceForPayment(null);
    } catch (err) {
      console.error('Payment submission failed:', err);
      setPaymentError(err.message || 'Payment submission failed');
    }
  };

  // Generate Invoice Form state
  const [invoiceForm, setInvoiceForm] = useState({
    invoiceType: 'Commercial Invoice',
    selectedOrderId: '',
    customer: '',
    orderNo: '',
    quotationNo: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: '',
    invoiceDate: new Date().toISOString().slice(0, 10),
    dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    paymentTerms: 'Net 30',
    currency: 'USD',
    incoterm: 'FOB',
    itemName: 'Basmati Rice 1121',
    itemDescription: 'Standard export packaging',
    quantity: 50,
    unit: 'MT',
    unitPrice: 950.00,
    shippingCharges: 2000.00,
    notes: 'Goods to be dispatched per agreed export schedule.'
  });

  // When an order is picked in the modal, auto-fill invoice data
  const handleSelectOrder = (orderId) => {
    const found = availableOrders.find((o) => (o._id || o.orderNo) === orderId);
    if (found) {
      const firstItem = found.products && found.products[0] ? found.products[0] : null;
      setInvoiceForm((prev) => ({
        ...prev,
        selectedOrderId: orderId,
        orderNo: found.orderNo || '',
        quotationNo: found.quotationNo || '',
        customer: found.customer || '',
        contactPerson: found.contactPerson || '',
        email: found.email || '',
        phone: found.phone || '',
        origin: found.origin || prev.origin,
        destination: found.destination || prev.destination,
        currency: found.currency || prev.currency,
        incoterm: found.incoterm || prev.incoterm,
        paymentTerms: found.paymentTerms || prev.paymentTerms,
        shippingCharges: Number(found.freight || 2000),
        itemName: firstItem ? firstItem.name : prev.itemName,
        quantity: firstItem ? Number(firstItem.quantity || 1) : prev.quantity,
        unit: firstItem ? firstItem.unit || 'MT' : prev.unit,
        unitPrice: firstItem ? Number(firstItem.unitPrice || 0) : prev.unitPrice
      }));
    } else {
      setInvoiceForm((prev) => ({ ...prev, selectedOrderId: orderId }));
    }
  };

  // Submit Invoice Creation
  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    try {
      const qty = Math.max(1, Number(invoiceForm.quantity || 1));
      const price = Math.max(0, Number(invoiceForm.unitPrice || 0));
      const subtotal = Number((qty * price).toFixed(2));
      const shipping = Math.max(0, Number(invoiceForm.shippingCharges || 0));
      const grandTotal = Number((subtotal + shipping).toFixed(2));

      const prefix = invoiceForm.invoiceType === 'Proforma Invoice' ? 'PI' : 'CI';
      const count = invoices.length + 1;
      const invoiceNo = `${prefix}-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;

      const payload = {
        invoiceNo,
        invoiceType: invoiceForm.invoiceType,
        orderNo: invoiceForm.orderNo,
        quotationNo: invoiceForm.quotationNo,
        customer: invoiceForm.customer,
        contactPerson: invoiceForm.contactPerson,
        email: invoiceForm.email,
        phone: invoiceForm.phone,
        address: invoiceForm.address,
        origin: invoiceForm.origin,
        destination: invoiceForm.destination,
        invoiceDate: invoiceForm.invoiceDate,
        dueDate: invoiceForm.dueDate,
        paymentTerms: invoiceForm.paymentTerms,
        currency: invoiceForm.currency,
        incoterm: invoiceForm.incoterm,
        items: [
          {
            name: invoiceForm.itemName,
            description: invoiceForm.itemDescription,
            quantity: qty,
            unit: invoiceForm.unit,
            unitPrice: price,
            total: subtotal
          }
        ],
        subtotal,
        shippingCharges: shipping,
        totalAmount: grandTotal,
        amountPaid: 0,
        remainingBalance: grandTotal,
        status: 'Unpaid',
        notes: invoiceForm.notes
      };

      const created = await createInvoice(payload);
      setInvoices((prev) => [created, ...prev]);
      setCreateModalOpen(false);
    } catch (err) {
      console.error('Failed to create invoice:', err);
      alert('Error creating invoice: ' + err.message);
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(invId);
      setInvoices((prev) => prev.filter((i) => i._id !== invId && i.invoiceNo !== invId));
    } catch (err) {
      console.error('Delete invoice failed:', err);
    }
  };

  return (
    <div className="invoices-page">
      {/* Page Header */}
      <PageHeader
        title="Invoices & Payments"
        description="Manage export billing, generate proforma & commercial invoices, and track payments"
      >
        <button
          className="secondary"
          onClick={() => handleOpenPaymentModal(null)}
          type="button"
          style={{ height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CreditCard size={16} /> Record Payment
        </button>
        <button
          className="primary"
          onClick={() => setCreateModalOpen(true)}
          type="button"
          style={{ height: '40px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Plus size={16} /> Generate Invoice
        </button>
      </PageHeader>

      {/* Top 4 KPI Stat Cards (4x1 on desktop, 2x2 on mobile matching exact project theme) */}
      <div className="stats" style={{ marginBottom: '22px' }}>
        <StatCard
          icon={Receipt}
          label="Total Invoiced"
          value={formatAmount(stats.totalInvoiced)}
          note="Gross billing value across orders"
          tone="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Total Collected (Paid)"
          value={formatAmount(stats.totalCollected)}
          note={`${stats.paidCount} fully settled invoices`}
          tone="green"
        />
        <StatCard
          icon={Clock}
          label="Outstanding Balance"
          value={formatAmount(stats.totalOutstanding)}
          note="Pending export receivables"
          tone="orange"
        />
        <StatCard
          icon={AlertCircle}
          label="Unpaid / Partially Paid"
          value={stats.unpaidCount}
          note="Active billing items requiring collection"
          tone="blue"
        />
      </div>

      {/* Segmented Top View Tabs: Invoices vs Payment Tracking */}
      <div className="tabs-bar" style={{ marginBottom: '16px' }}>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'Invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('Invoices')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <FileText size={15} />
          <span>Invoices Directory ({invoices.length})</span>
        </button>
        <button
          type="button"
          className={`tab-pill ${activeTab === 'Payments' ? 'active' : ''}`}
          onClick={() => setActiveTab('Payments')}
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <CreditCard size={15} />
          <span>Payment Tracking ({payments.length})</span>
        </button>
      </div>

      {/* Segmented Status Filter Bar (When in Invoices tab) */}
      {activeTab === 'Invoices' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px', scrollbarWidth: 'none' }}>
          {[
            { label: 'All Statuses', value: '', count: invoices.length, dot: '#64748b' },
            { label: 'Unpaid', value: 'Unpaid', count: invoices.filter((i) => i.status === 'Unpaid').length, dot: '#f59e0b' },
            { label: 'Partially Paid', value: 'Partially Paid', count: invoices.filter((i) => i.status === 'Partially Paid').length, dot: '#3b82f6' },
            { label: 'Paid', value: 'Paid', count: invoices.filter((i) => i.status === 'Paid').length, dot: '#10b981' }
          ].map((st) => (
            <button
              key={st.label}
              type="button"
              className={`status-pill-btn ${statusFilter === st.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(st.value)}
            >
              <span className="pill-dot" style={{ background: st.dot }} />
              <span>{st.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '10px',
                  background: statusFilter === st.value ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: statusFilter === st.value ? '#ffffff' : '#64748b'
                }}
              >
                {st.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Toolbar Controls with responsive inputs */}
      <div className="pro-toolbar" style={{ marginBottom: '18px' }}>
        <div className="pro-search-box">
          <Search size={16} color="#0c5a48" />
          <input
            type="text"
            placeholder={activeTab === 'Invoices' ? 'Search by Invoice No, Order No, Customer...' : 'Search by Payment ID, Invoice No, Customer, Reference...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', padding: '2px', cursor: 'pointer', color: '#8fa4a8', display: 'flex', alignItems: 'center' }}
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="pro-filter-group">
          {activeTab === 'Invoices' && (
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="pro-select"
            >
              <option value="">All Invoice Types</option>
              <option value="Proforma Invoice">Proforma Invoice (PI)</option>
              <option value="Commercial Invoice">Commercial Invoice (CI)</option>
            </select>
          )}

          <select
            value={customerFilter}
            onChange={(e) => setCustomerFilter(e.target.value)}
            className="pro-select"
          >
            <option value="">All Customers</option>
            {customersList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {(search || typeFilter || statusFilter || customerFilter) && (
            <button
              type="button"
              className="pro-btn-reset"
              onClick={handleResetFilters}
              title="Reset Filters"
            >
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* MAIN VIEW: TAB 1 - INVOICES DIRECTORY */}
      {activeTab === 'Invoices' && (
        <div className="panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>INVOICE NO</th>
                  <th>TYPE</th>
                  <th>ORDER REF</th>
                  <th>CUSTOMER</th>
                  <th>DATE / DUE</th>
                  <th>INVOICE VALUE</th>
                  <th>PAID / BALANCE</th>
                  <th>PAYMENT STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                      <FileText size={36} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                      <strong style={{ display: 'block', color: '#475569', fontSize: '14px', marginBottom: '4px' }}>No invoices found</strong>
                      <span style={{ fontSize: '12.5px' }}>Try adjusting your search query or generate a new invoice</span>
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => {
                    const isPaid = inv.status === 'Paid';
                    const isPartiallyPaid = inv.status === 'Partially Paid';
                    const isProforma = inv.invoiceType === 'Proforma Invoice';

                    return (
                      <tr
                        key={inv._id || inv.invoiceNo}
                        onClick={() => setViewInvoice(inv)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '8px',
                                background: isProforma ? '#ede9fe' : '#e6f4f0',
                                color: isProforma ? '#6d28d9' : '#0c5a48',
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0
                              }}
                            >
                              <FileText size={15} />
                            </div>
                            <strong style={{ color: '#1e1e2d', fontSize: '13px' }}>{inv.invoiceNo}</strong>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: isProforma ? '#f5f3ff' : '#ecfdf5',
                              color: isProforma ? '#7c3aed' : '#059669',
                              border: isProforma ? '1px solid #ddd6fe' : '1px solid #a7f3d0'
                            }}
                          >
                            {isProforma ? 'Proforma (PI)' : 'Commercial (CI)'}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#0c5a48', fontSize: '12.5px' }}>
                            {inv.orderNo || '—'}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong style={{ color: '#1e1e2d', fontSize: '13px', display: 'block' }}>
                              {inv.customer}
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                              {inv.destination || 'Global Export'}
                            </small>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span style={{ color: '#334155', fontSize: '12.5px', display: 'block' }}>
                              {inv.invoiceDate}
                            </span>
                            <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                              Due: {inv.dueDate || inv.paymentTerms}
                            </small>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: '#1e1e2d', fontSize: '13.5px' }}>
                            {formatAmount(inv.totalAmount)}
                          </strong>
                        </td>
                        <td>
                          <div style={{ minWidth: '120px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '3px' }}>
                              <span style={{ color: '#10b981', fontWeight: 600 }}>
                                Paid: {formatAmount(inv.amountPaid || 0)}
                              </span>
                              <span style={{ color: inv.remainingBalance > 0 ? '#ef4444' : '#64748b', fontWeight: 600 }}>
                                Rem: {formatAmount(inv.remainingBalance || 0)}
                              </span>
                            </div>
                            <div style={{ width: '100%', height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${Math.min(100, Math.round(((inv.amountPaid || 0) / (inv.totalAmount || 1)) * 100))}%`,
                                  background: isPaid ? '#10b981' : isPartiallyPaid ? '#3b82f6' : '#e2e8f0',
                                  transition: 'width 0.3s ease'
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              isPaid ? 'badge-green' : isPartiallyPaid ? 'badge-blue' : 'badge-amber'
                            }`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '5px',
                              padding: '4px 10px',
                              borderRadius: '20px',
                              fontSize: '11.5px',
                              fontWeight: 700
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: isPaid ? '#10b981' : isPartiallyPaid ? '#3b82f6' : '#f59e0b'
                              }}
                            />
                            {inv.status}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="pro-icon-btn"
                              title="View Official Invoice Document"
                              onClick={() => setViewInvoice(inv)}
                            >
                              <Eye size={15} />
                            </button>
                            {!isPaid && (
                              <button
                                type="button"
                                className="pro-track-btn"
                                style={{
                                  background: '#e6f4f0',
                                  color: '#0c5a48',
                                  border: '1px solid #bbf0e4',
                                  padding: '4px 10px',
                                  fontSize: '11.5px',
                                  fontWeight: 600,
                                  borderRadius: '8px'
                                }}
                                title="Record a Payment"
                                onClick={() => handleOpenPaymentModal(inv)}
                              >
                                <CreditCard size={13} /> Pay
                              </button>
                            )}
                            <button
                              type="button"
                              className="pro-icon-btn danger"
                              title="Delete Invoice"
                              onClick={(e) => handleDeleteInvoice(inv._id || inv.invoiceNo, e)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MAIN VIEW: TAB 2 - PAYMENT TRACKING */}
      {activeTab === 'Payments' && (
        <div className="panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>
                Payment Tracking Ledger
              </h3>
              <p style={{ margin: '2px 0 0', color: '#64748b', fontSize: '12.5px' }}>
                Formula: Amount Paid + Remaining Balance = Order / Invoice Value
              </p>
            </div>
            <button
              className="primary"
              onClick={() => handleOpenPaymentModal(null)}
              type="button"
              style={{ height: '36px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} /> Record Payment
            </button>
          </div>

          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>PAYMENT ID</th>
                  <th>CUSTOMER</th>
                  <th>ORDER REF</th>
                  <th>INVOICE REF</th>
                  <th>PAYMENT DATE</th>
                  <th>AMOUNT PAID</th>
                  <th>METHOD</th>
                  <th>TRANSACTION REF</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px 16px', color: '#94a3b8' }}>
                      <CreditCard size={36} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                      <strong style={{ display: 'block', color: '#475569', fontSize: '14px', marginBottom: '4px' }}>No payments recorded yet</strong>
                      <span style={{ fontSize: '12.5px' }}>Click "Record Payment" to post a remittance against an export invoice</span>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const matchedInv = invoices.find((i) => i.invoiceNo === p.invoiceNo);
                    const status = matchedInv ? matchedInv.status : 'Paid';

                    return (
                      <tr key={p._id || p.paymentId}>
                        <td>
                          <strong style={{ color: '#0c5a48', fontSize: '13px' }}>
                            {p.paymentId || 'PAY-REF'}
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: '#1e1e2d', fontSize: '13px' }}>{p.customer}</strong>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontSize: '12.5px', fontWeight: 600 }}>
                            {p.orderNo || '—'}
                          </span>
                        </td>
                        <td>
                          <span
                            onClick={() => {
                              if (matchedInv) setViewInvoice(matchedInv);
                            }}
                            style={{
                              color: '#0c5a48',
                              fontWeight: 700,
                              cursor: matchedInv ? 'pointer' : 'default',
                              textDecoration: matchedInv ? 'underline' : 'none'
                            }}
                          >
                            {p.invoiceNo}
                          </span>
                        </td>
                        <td>
                          <span style={{ color: '#334155', fontSize: '12.5px' }}>{p.paymentDate}</span>
                        </td>
                        <td>
                          <strong style={{ color: '#10b981', fontSize: '13.5px' }}>
                            {formatAmount(p.amount)}
                          </strong>
                        </td>
                        <td>
                          <span style={{ color: '#475569', fontSize: '12px', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                            {p.paymentMethod || 'Wire Transfer'}
                          </span>
                        </td>
                        <td>
                          <code style={{ fontSize: '11.5px', color: '#64748b' }}>
                            {p.reference || '—'}
                          </code>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 8px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 700,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0'
                            }}
                          >
                            <CheckCircle2 size={12} /> Received
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 1: RECORD PAYMENT MODAL (WITH STRICT VALIDATION)
          ========================================================= */}
      {recordPaymentModalOpen && (
        <Modal
          open={recordPaymentModalOpen}
          onClose={() => {
            setRecordPaymentModalOpen(false);
            setSelectedInvoiceForPayment(null);
          }}
          title="Record Export Payment"
        >
          <form onSubmit={handleSubmitPayment}>
            <div className="form-grid">
              {/* Target Invoice */}
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Select Target Invoice *</label>
                <select
                  value={paymentForm.invoiceNo}
                  onChange={(e) => {
                    const invNo = e.target.value;
                    const found = invoices.find((i) => i.invoiceNo === invNo);
                    setSelectedInvoiceForPayment(found);
                    setPaymentForm((prev) => ({
                      ...prev,
                      invoiceNo: invNo,
                      amount: found ? (found.remainingBalance > 0 ? found.remainingBalance : '') : ''
                    }));
                  }}
                  required
                >
                  <option value="">-- Choose an Invoice --</option>
                  {invoices.map((inv) => (
                    <option key={inv.invoiceNo} value={inv.invoiceNo}>
                      {inv.invoiceNo} • {inv.customer} • {inv.orderNo} (Total: {formatAmount(inv.totalAmount)} | Balance: {formatAmount(inv.remainingBalance)}) [{inv.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Dynamic Invoice Balance Summary Card */}
              {currentTargetInvoice && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    marginBottom: '6px'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div>
                      <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Order / Invoice Value
                      </small>
                      <strong style={{ display: 'block', color: '#1e1e2d', fontSize: '15px', marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.totalAmount)}
                      </strong>
                    </div>
                    <div>
                      <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Already Paid
                      </small>
                      <strong style={{ display: 'block', color: '#10b981', fontSize: '15px', marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.amountPaid || 0)}
                      </strong>
                    </div>
                    <div>
                      <small style={{ color: '#64748b', fontSize: '11px', textTransform: 'uppercase', fontWeight: 600 }}>
                        Remaining Balance
                      </small>
                      <strong style={{ display: 'block', color: '#ef4444', fontSize: '15px', marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.remainingBalance || 0)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount to Pay */}
              <div className="field-group">
                <label>Payment Amount ({currentTargetInvoice?.currency || 'USD'}) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => {
                    setPaymentForm({ ...paymentForm, amount: e.target.value });
                    setPaymentError('');
                  }}
                  required
                />
              </div>

              {/* Payment Date */}
              <div className="field-group">
                <label>Payment Date *</label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                />
              </div>

              {/* Payment Method */}
              <div className="field-group">
                <label>Payment Mode / Instrument *</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                >
                  <option value="Wire Transfer (TT)">Telegraphic Transfer / Wire (TT)</option>
                  <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                  <option value="Documentary Collection (DP/DA)">Documents Against Payment (DP)</option>
                  <option value="Bank Draft / Cheque">Bank Draft / Cheque</option>
                  <option value="Online Escrow">Online Escrow / Card</option>
                </select>
              </div>

              {/* Reference Number */}
              <div className="field-group">
                <label>Bank Reference / Transaction ID</label>
                <input
                  type="text"
                  placeholder="e.g. TXN-SCB-984012"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>

              {/* Notes */}
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Remittance Notes</label>
                <textarea
                  rows="2"
                  placeholder="Optional bank swift notes or realization details..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>

              {/* Live Preview of Resulting Balance */}
              {paymentValidation.isValid && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    color: '#166534'
                  }}
                >
                  <strong>Resulting Status: {paymentValidation.resultingStatus}</strong>
                  <div style={{ marginTop: '3px' }}>
                    New Paid Total: <strong>{formatAmount(paymentValidation.resultingPaid)}</strong> • Balance Remaining: <strong>{formatAmount(paymentValidation.resultingRemaining)}</strong>
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {paymentError && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '12.5px',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <AlertCircle size={16} />
                  <span>{paymentError}</span>
                </div>
              )}
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="secondary"
                onClick={() => setRecordPaymentModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={!paymentValidation.isValid}
              >
                Confirm & Record Payment
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================
          MODAL 2: GENERATE PROFORMA OR COMMERCIAL INVOICE
          ========================================================= */}
      {createModalOpen && (
        <Modal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          title="Generate Export Invoice"
        >
          <form onSubmit={handleCreateInvoice}>
            <div className="form-grid">
              {/* Invoice Type */}
              <div className="field-group">
                <label>Invoice Type *</label>
                <select
                  value={invoiceForm.invoiceType}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceType: e.target.value })}
                  required
                >
                  <option value="Commercial Invoice">Commercial Invoice (CI)</option>
                  <option value="Proforma Invoice">Proforma Invoice (PI)</option>
                </select>
              </div>

              {/* Connected Order Reference */}
              <div className="field-group">
                <label>Connect to Sales Order (Optional)</label>
                <select
                  value={invoiceForm.selectedOrderId}
                  onChange={(e) => handleSelectOrder(e.target.value)}
                >
                  <option value="">-- Choose Existing Order or Custom --</option>
                  {availableOrders.map((ord) => (
                    <option key={ord._id || ord.orderNo} value={ord._id || ord.orderNo}>
                      {ord.orderNo} • {ord.customer} ({formatAmount(ord.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Customer */}
              <div className="field-group">
                <label>Customer Name *</label>
                <input
                  type="text"
                  placeholder="e.g. ABC Trading LLC"
                  value={invoiceForm.customer}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, customer: e.target.value })}
                  required
                />
              </div>

              {/* Order Reference Number */}
              <div className="field-group">
                <label>Order Reference No</label>
                <input
                  type="text"
                  placeholder="e.g. SO-1024"
                  value={invoiceForm.orderNo}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, orderNo: e.target.value })}
                />
              </div>

              {/* Contact Person */}
              <div className="field-group">
                <label>Contact Person</label>
                <input
                  type="text"
                  placeholder="e.g. Ahmed Ali"
                  value={invoiceForm.contactPerson}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, contactPerson: e.target.value })}
                />
              </div>

              {/* Destination Port */}
              <div className="field-group">
                <label>Destination Port & Country</label>
                <input
                  type="text"
                  placeholder="e.g. Jebel Ali, Dubai, UAE"
                  value={invoiceForm.destination}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, destination: e.target.value })}
                />
              </div>

              {/* Invoice Date */}
              <div className="field-group">
                <label>Invoice Date *</label>
                <input
                  type="date"
                  value={invoiceForm.invoiceDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, invoiceDate: e.target.value })}
                  required
                />
              </div>

              {/* Due Date */}
              <div className="field-group">
                <label>Payment Due Date</label>
                <input
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                />
              </div>

              {/* Payment Terms */}
              <div className="field-group">
                <label>Payment Terms</label>
                <select
                  value={invoiceForm.paymentTerms}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, paymentTerms: e.target.value })}
                >
                  <option value="Net 30">Net 30 Days</option>
                  <option value="Advance">100% Advance TT</option>
                  <option value="30% Adv + 70% B/L">30% Advance + 70% against B/L</option>
                  <option value="LC at Sight">Irrevocable LC at Sight</option>
                  <option value="Net 60">Net 60 Days</option>
                </select>
              </div>

              {/* Incoterm */}
              <div className="field-group">
                <label>Incoterm</label>
                <select
                  value={invoiceForm.incoterm}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, incoterm: e.target.value })}
                >
                  <option value="FOB">FOB - Free on Board</option>
                  <option value="CIF">CIF - Cost, Insurance & Freight</option>
                  <option value="CFR">CFR - Cost and Freight</option>
                  <option value="EXW">EXW - Ex Works</option>
                </select>
              </div>

              {/* Line Item Section */}
              <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                <h4 style={{ fontSize: '13.5px', fontWeight: 700, margin: '0 0 10px', color: '#1e1e2d' }}>
                  Export Line Item & Commercial Value
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Item Name</label>
                    <input
                      type="text"
                      placeholder="Product Name"
                      value={invoiceForm.itemName}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, itemName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={invoiceForm.quantity}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, quantity: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Unit</label>
                    <input
                      type="text"
                      placeholder="MT, KG, PCS"
                      value={invoiceForm.unit}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, unit: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Unit Rate ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={invoiceForm.unitPrice}
                      onChange={(e) => setInvoiceForm({ ...invoiceForm, unitPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Freight Charges */}
              <div className="field-group">
                <label>Freight / Shipping Charges ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={invoiceForm.shippingCharges}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, shippingCharges: e.target.value })}
                />
              </div>

              {/* Grand Total Preview */}
              <div className="field-group">
                <label>Calculated Invoice Grand Total</label>
                <div
                  style={{
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontWeight: 800,
                    color: '#0c5a48',
                    fontSize: '15px'
                  }}
                >
                  {formatAmount((Number(invoiceForm.quantity || 1) * Number(invoiceForm.unitPrice || 0)) + Number(invoiceForm.shippingCharges || 0))}
                </div>
              </div>

              {/* Notes */}
              <div className="field-group" style={{ gridColumn: 'span 2' }}>
                <label>Commercial Invoice Terms & Declarations</label>
                <textarea
                  rows="2"
                  value={invoiceForm.notes}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-foot">
              <button
                type="button"
                className="secondary"
                onClick={() => setCreateModalOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="primary">
                Generate Invoice Document
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================
          MODAL 3: OFFICIAL EXPORT INVOICE DOCUMENT PREVIEW
          ========================================================= */}
      {viewInvoice && (
        <Modal
          open={Boolean(viewInvoice)}
          onClose={() => setViewInvoice(null)}
          title={`${viewInvoice.invoiceType} — ${viewInvoice.invoiceNo}`}
        >
          <div className="document-preview invoice-document-sheet" style={{ background: '#ffffff', color: '#1e1e2d' }}>
            {/* Document Header */}
            <div className="doc-header" style={{ borderBottom: '2px solid #0c5a48', paddingBottom: '16px', marginBottom: '18px' }}>
              <div className="doc-brand">
                <Logo variant="document" width={270} />
                <div className="doc-brand-info">
                  <strong>Master Export Pro Inc.</strong>
                  <br />
                  123 Trade Center, Business Bay, New York, NY 10001, USA
                  <br />
                  Email: exports@masterexportpro.com | GST / Tax ID: 123456789
                </div>
              </div>
              <div className="doc-meta" style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 12px',
                    borderRadius: '4px',
                    background: viewInvoice.invoiceType === 'Proforma Invoice' ? '#ede9fe' : '#e6f4f0',
                    color: viewInvoice.invoiceType === 'Proforma Invoice' ? '#6d28d9' : '#0c5a48',
                    fontSize: '12px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    marginBottom: '6px'
                  }}
                >
                  {viewInvoice.invoiceType}
                </span>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#1e1e2d' }}>
                  {viewInvoice.invoiceNo}
                </div>
                <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                  Date: <strong>{viewInvoice.invoiceDate}</strong>
                </div>
              </div>
            </div>

            {/* Bill To & Export Logistics */}
            <div className="doc-addresses" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', padding: '14px 16px', borderRadius: '10px', marginBottom: '18px' }}>
              <div>
                <small style={{ color: '#0c5a48', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  CONSIGNEE / BUYER:
                </small>
                <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e1e2d', marginTop: '2px' }}>
                  {viewInvoice.customer}
                </div>
                <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
                  {viewInvoice.address || 'Commercial Office, International Trade Center'}<br />
                  Contact: {viewInvoice.contactPerson || 'Purchasing Director'} • {viewInvoice.phone || '+971 50 123 4567'}
                </div>
              </div>
              <div>
                <small style={{ color: '#0c5a48', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase' }}>
                  EXPORT & DELIVERY TERMS:
                </small>
                <div style={{ fontSize: '12px', color: '#1e1e2d', marginTop: '4px', lineHeight: 1.6 }}>
                  Order Ref: <strong>{viewInvoice.orderNo || '—'}</strong><br />
                  Port of Loading: <strong>{viewInvoice.origin || 'Nhava Sheva (JNPT), Mumbai'}</strong><br />
                  Port of Discharge: <strong>{viewInvoice.destination || 'Dubai, UAE'}</strong><br />
                  Terms: <strong>{viewInvoice.incoterm || 'FOB'}</strong> • <strong>{viewInvoice.paymentTerms || 'Net 30'}</strong>
                </div>
              </div>
            </div>

            {/* Goods Table */}
            <table className="doc-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '18px' }}>
              <thead>
                <tr style={{ background: '#0c5a48', color: '#ffffff', textAlign: 'left', fontSize: '11.5px' }}>
                  <th style={{ padding: '8px 10px' }}>NO</th>
                  <th style={{ padding: '8px 10px' }}>DESCRIPTION OF EXPORT GOODS</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>QTY</th>
                  <th style={{ padding: '8px 10px' }}>UNIT</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>RATE</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>TOTAL AMOUNT</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '12px' }}>
                {(viewInvoice.items || []).map((it, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '10px 10px' }}>{idx + 1}</td>
                    <td style={{ padding: '10px 10px' }}>
                      <strong style={{ color: '#1e1e2d', display: 'block' }}>{it.name}</strong>
                      <small style={{ color: '#64748b' }}>{it.description || 'Export grade standard seaworthy packing'}</small>
                    </td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>{it.quantity}</td>
                    <td style={{ padding: '10px 10px' }}>{it.unit || 'MT'}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right' }}>{formatAmount(it.unitPrice)}</td>
                    <td style={{ padding: '10px 10px', textAlign: 'right', fontWeight: 700, color: '#1e1e2d' }}>
                      {formatAmount(it.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
              {/* Bank Remittance Details */}
              <div style={{ flex: '1', minWidth: '240px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569' }}>
                <strong style={{ color: '#0c5a48', display: 'block', marginBottom: '4px' }}>
                  BANK WIRE REMITTANCE INSTRUCTIONS:
                </strong>
                Bank: <strong>State Bank of India (Overseas Commercial)</strong><br />
                Account: <strong>984012948102</strong> • Swift/BIC: <strong>SBININBBXXX</strong><br />
                Branch: <strong>Commercial Branch, Nariman Point, Mumbai, India</strong>
              </div>

              {/* Totals Calculation */}
              <div style={{ width: '280px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b' }}>
                  <span>FOB Goods Subtotal:</span>
                  <strong style={{ color: '#1e1e2d' }}>{formatAmount(viewInvoice.subtotal || viewInvoice.totalAmount)}</strong>
                </div>
                {viewInvoice.shippingCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#64748b' }}>
                    <span>Freight / Shipping Charges:</span>
                    <strong style={{ color: '#1e1e2d' }}>{formatAmount(viewInvoice.shippingCharges)}</strong>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px solid #0c5a48', borderBottom: '1px solid #e2e8f0', marginTop: '6px' }}>
                  <strong style={{ fontSize: '14px', color: '#0c5a48' }}>TOTAL INVOICE VALUE:</strong>
                  <strong style={{ fontSize: '15px', color: '#0c5a48' }}>{formatAmount(viewInvoice.totalAmount)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#10b981', marginTop: '4px' }}>
                  <span>Amount Paid / Settled:</span>
                  <strong>{formatAmount(viewInvoice.amountPaid || 0)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: viewInvoice.remainingBalance > 0 ? '#ef4444' : '#64748b' }}>
                  <span>Remaining Balance Due:</span>
                  <strong>{formatAmount(viewInvoice.remainingBalance || 0)}</strong>
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                This is a computer generated export document issued by Master Export Pro.
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: '160px', borderBottom: '1px solid #0c5a48', marginBottom: '6px' }} />
                <strong style={{ fontSize: '11.5px', color: '#1e1e2d', display: 'block' }}>
                  For Master Export Pro India Pvt Ltd
                </strong>
                <small style={{ fontSize: '10.5px', color: '#64748b' }}>Authorized Signatory & Seal</small>
              </div>
            </div>
          </div>

          <div className="modal-foot">
            <button
              type="button"
              className="secondary"
              onClick={() => setViewInvoice(null)}
            >
              Close
            </button>
            {viewInvoice.status !== 'Paid' && (
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  const inv = viewInvoice;
                  setViewInvoice(null);
                  handleOpenPaymentModal(inv);
                }}
              >
                <CreditCard size={15} /> Record Payment
              </button>
            )}
            <button
              type="button"
              className="primary"
              onClick={() => window.print()}
            >
              <Printer size={15} /> Print / Save PDF
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
