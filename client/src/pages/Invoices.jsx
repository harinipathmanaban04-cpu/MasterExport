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
  Receipt,
  User,
  Layers,
  Package,
  ArrowRight
} from 'lucide-react';
import { get, post, del, getInvoices, createInvoice, deleteInvoice, getPayments, recordPayment } from '../api';
import Modal from '../components/Modal';
import Logo from '../components/Logo';
import { PageHeader, StatCard, Status } from '../components/Layout';
import { useCurrency } from '../context/CurrencyContext';
import { useToast } from '../context/ToastContext';

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
    accountHolder: 'ABC Trading LLC',
    payerBank: 'Standard Chartered Bank UAE',
    accountNumber: 'AE29 0330 0000 0012 3456 789',
    swiftCode: 'SCBLAEADXXX',
    bankBranch: 'Downtown Dubai Branch, UAE',
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
    accountHolder: 'Apex Imports Inc.',
    payerBank: 'Citibank N.A. New York',
    accountNumber: 'US44 CITI 0001 2345 6789 01',
    swiftCode: 'CITIUS33XXX',
    bankBranch: 'Wall Street Commercial, New York, USA',
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
    accountHolder: 'ABC Trading LLC',
    payerBank: 'HSBC Bank Middle East',
    accountNumber: 'AE44 0200 0000 0098 7654 321',
    swiftCode: 'HBMEAEADXXX',
    bankBranch: 'Sheikh Zayed Road, Dubai, UAE',
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
    accountHolder: 'Oceanic Trading Pty Ltd',
    payerBank: 'ANZ Bank Australia',
    accountNumber: 'AU88 ANZ0 0102 9384 7561 02',
    swiftCode: 'ANZBAU3MXXX',
    bankBranch: 'Collins Street, Melbourne, Australia',
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
    accountHolder: 'Singapore Global Logistics Pte Ltd',
    payerBank: 'DBS Bank Ltd Singapore',
    accountNumber: 'SG12 DBSS 0039 1827 3645 00',
    swiftCode: 'DBSSSGSGXXX',
    bankBranch: 'Marina Bay Financial Centre, Singapore',
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
    accountHolder: 'ABC Trading LLC',
    payerBank: 'Emirates NBD Bank PJSC',
    accountNumber: 'AE29 0330 0000 0012 3456 789',
    swiftCode: 'EBILAEADXXX',
    bankBranch: 'Business Bay Branch, Dubai, UAE',
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
    accountHolder: 'Oceanic Trading Pty Ltd',
    payerBank: 'Westpac Banking Corporation',
    accountNumber: 'AU12 WPAC 1928 3746 5019 82',
    swiftCode: 'WPACAU2SXXX',
    bankBranch: 'Sydney Commercial Centre, Australia',
    notes: 'Document release tranche cleared through Westpac.'
  }
];

export default function Invoices({ initialTab = 'Invoices' }) {
  const { formatAmount } = useCurrency();
  const toast = useToast();
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
  const [viewPaymentVoucher, setViewPaymentVoucher] = useState(null);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState('document');
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);

  // Payment form state with real-time validation & customer account details
  const [paymentForm, setPaymentForm] = useState({
    invoiceNo: '',
    amount: '',
    paymentMethod: 'Wire Transfer (TT)',
    paymentDate: new Date().toISOString().slice(0, 10),
    reference: '',
    notes: '',
    accountHolder: '',
    payerBank: '',
    accountNumber: '',
    swiftCode: '',
    bankBranch: ''
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
        (pay.payerBank && pay.payerBank.toLowerCase().includes(q)) ||
        (pay.accountNumber && pay.accountNumber.toLowerCase().includes(q)) ||
        (pay.swiftCode && pay.swiftCode.toLowerCase().includes(q)) ||
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
    const target = invoice || invoices[0];
    const prevPayment = target ? payments.find((p) => p.customer === target.customer && p.payerBank) : null;

    setSelectedInvoiceForPayment(invoice);
    setPaymentForm({
      invoiceNo: target ? target.invoiceNo : (invoices[0]?.invoiceNo || ''),
      amount: target ? (target.remainingBalance > 0 ? String(target.remainingBalance) : '') : '',
      paymentMethod: 'Wire Transfer (TT)',
      paymentDate: new Date().toISOString().slice(0, 10),
      reference: '',
      notes: '',
      accountHolder: target?.customer || '',
      payerBank: prevPayment?.payerBank || '',
      accountNumber: prevPayment?.accountNumber || '',
      swiftCode: prevPayment?.swiftCode || '',
      bankBranch: prevPayment?.bankBranch || ''
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
        notes: paymentForm.notes,
        accountHolder: paymentForm.accountHolder || currentTargetInvoice.customer || '',
        payerBank: paymentForm.payerBank || '',
        accountNumber: paymentForm.accountNumber || '',
        swiftCode: paymentForm.swiftCode || '',
        bankBranch: paymentForm.bankBranch || ''
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
      toast.success(
        `Payment of ${formatAmount(payload.amount)} recorded for ${payload.invoiceNo}!`,
        'Payment Realized'
      );
    } catch (err) {
      console.error('Payment submission failed:', err);
      setPaymentError(err.message || 'Payment submission failed');
      toast.error(err.message || 'Payment submission failed', 'Payment Failed');
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
      toast.success(`Invoice ${created.invoiceNo || payload.invoiceNo} generated successfully!`, 'Invoice Created');
    } catch (err) {
      console.error('Failed to create invoice:', err);
      toast.error('Error creating invoice: ' + err.message, 'Creation Failed');
    }
  };

  // Delete invoice
  const handleDeleteInvoice = async (invId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await deleteInvoice(invId);
      setInvoices((prev) => prev.filter((i) => i._id !== invId && i.invoiceNo !== invId));
      toast.info('Invoice deleted successfully.', 'Invoice Removed');
    } catch (err) {
      console.error('Delete invoice failed:', err);
      toast.error('Failed to delete invoice: ' + err.message, 'Delete Failed');
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
            <table className="data-table" style={{ width: '100%', minWidth: '1420px', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>INVOICE NO</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>TYPE</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>ORDER REF</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>CUSTOMER</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>DATE / DUE</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>INVOICE VALUE</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>PAID / BALANCE</th>
                  <th style={{ padding: '16px 24px', whiteSpace: 'nowrap' }}>PAYMENT STATUS</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
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
                        onClick={() => {
                          setViewInvoice(inv);
                          setActiveInvoiceTab('document');
                        }}
                        style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                      >
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
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
                            <span style={{ color: '#0c5a48', fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em' }}>
                              {inv.invoiceNo}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '4px 11px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              background: isProforma ? '#f5f3ff' : '#ecfdf5',
                              color: isProforma ? '#7c3aed' : '#059669',
                              border: isProforma ? '1px solid #ddd6fe' : '1px solid #a7f3d0',
                              letterSpacing: '0.02em'
                            }}
                          >
                            {isProforma ? 'Proforma (PI)' : 'Commercial (CI)'}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span className="order-badge" style={{ padding: '4px 10px', fontSize: '12px' }}>
                            {inv.orderNo || '—'}
                          </span>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <strong style={{ color: '#1e1e2d', fontSize: '13.5px', display: 'block' }}>
                              {inv.customer}
                            </strong>
                            <small style={{ color: '#64748b', fontSize: '11.5px' }}>
                              {inv.destination || 'Global Export'}
                            </small>
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span style={{ color: '#334155', fontSize: '12.5px', fontWeight: 600, display: 'block' }}>
                              {inv.invoiceDate}
                            </span>
                            <small style={{ color: '#94a3b8', fontSize: '11px' }}>
                              Due: {inv.dueDate || inv.paymentTerms}
                            </small>
                          </div>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#1e1e2d', fontSize: '14px', fontWeight: 700 }}>
                            {formatAmount(inv.totalAmount)}
                          </strong>
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {(() => {
                            const pct = Math.min(100, Math.round(((inv.amountPaid || 0) / (inv.totalAmount || 1)) * 100));
                            return (
                              <div style={{ minWidth: '165px', maxWidth: '190px' }}>
                                {/* Row 1: Paid Amount & Progress Badge */}
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '5px' }}>
                                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: isPaid ? '#059669' : inv.amountPaid > 0 ? '#0c5a48' : '#64748b', whiteSpace: 'nowrap' }}>
                                    {formatAmount(inv.amountPaid || 0)}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '10.5px',
                                      fontWeight: 700,
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background: isPaid ? '#ecfdf5' : isPartiallyPaid ? '#eff6ff' : '#f8fafc',
                                      color: isPaid ? '#059669' : isPartiallyPaid ? '#2563eb' : '#64748b',
                                      border: isPaid ? '1px solid #a7f3d0' : isPartiallyPaid ? '1px solid #bfdbfe' : '1px solid #e2e8f0',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {pct}%
                                  </span>
                                </div>

                                {/* Row 2: Sleek Progress Bar */}
                                <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden', marginBottom: '5px', border: '1px solid #e2e8f0' }}>
                                  <div
                                    style={{
                                      height: '100%',
                                      width: `${pct}%`,
                                      background: isPaid
                                        ? 'linear-gradient(90deg, #10b981, #059669)'
                                        : isPartiallyPaid
                                        ? 'linear-gradient(90deg, #38bdf8, #2563eb)'
                                        : '#cbd5e1',
                                      borderRadius: '10px',
                                      transition: 'width 0.4s ease'
                                    }}
                                  />
                                </div>

                                {/* Row 3: Remaining / Settlement info */}
                                <div style={{ fontSize: '11px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  {inv.remainingBalance > 0 ? (
                                    <span style={{ color: '#64748b' }}>
                                      Due: <strong style={{ color: '#e11d48', fontWeight: 600 }}>{formatAmount(inv.remainingBalance)}</strong>
                                    </span>
                                  ) : (
                                    <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                                      ✓ Settled
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span
                            className={`badge ${
                              isPaid ? 'badge-green' : isPartiallyPaid ? 'badge-blue' : 'badge-amber'
                            }`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '5px 12px',
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
                        <td style={{ padding: '18px 24px', verticalAlign: 'middle', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Action 1: View Invoice Document */}
                            <button
                              type="button"
                              className="pro-icon-btn"
                              title="View Official Invoice Document"
                              onClick={() => {
                                setViewInvoice(inv);
                                setActiveInvoiceTab('document');
                              }}
                            >
                              <Eye size={15} />
                            </button>

                            {/* Action 2: Record Payment / Settled Indicator (Constant width slot) */}
                            {!isPaid ? (
                              <button
                                type="button"
                                className="pro-icon-btn"
                                style={{
                                  background: '#e6f4f0',
                                  color: '#0c5a48',
                                  border: '1px solid #a7f3d0'
                                }}
                                title={`Record Payment (Balance: ${formatAmount(inv.remainingBalance || 0)})`}
                                onClick={() => handleOpenPaymentModal(inv)}
                              >
                                <CreditCard size={14} />
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="pro-icon-btn"
                                disabled
                                style={{
                                  background: '#f8fafc',
                                  color: '#10b981',
                                  border: '1px solid #e2e8f0',
                                  cursor: 'default',
                                  opacity: 0.7
                                }}
                                title="Invoice Fully Settled (Paid in Full)"
                              >
                                <CheckCircle2 size={14} />
                              </button>
                            )}

                            {/* Action 3: Delete Invoice */}
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
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>PAYMENT ID</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>CUSTOMER & INVOICE</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>BANK & ACCOUNT</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>DATE</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>AMOUNT</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>METHOD</th>
                  <th style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                      <CreditCard size={36} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.4 }} />
                      <strong style={{ display: 'block', color: '#475569', fontSize: '14px', marginBottom: '4px' }}>No payments recorded yet</strong>
                      <span style={{ fontSize: '12.5px' }}>Click "Record Payment" to post a remittance against an export invoice</span>
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => {
                    const matchedInv = invoices.find((i) => i.invoiceNo === p.invoiceNo);

                    return (
                      <tr
                        key={p._id || p.paymentId}
                        onClick={() => setViewPaymentVoucher(p)}
                        style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                        title="Click to view payment and account details"
                      >
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span style={{ display: 'inline-block', padding: '4px 9px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                            {p.paymentId || 'PAY-REF'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#1e1e2d', fontSize: '13px', display: 'block' }}>{p.customer}</strong>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                            <span
                              style={{
                                color: '#64748b',
                                fontSize: '11.5px',
                                fontWeight: 500
                              }}
                            >
                              {p.invoiceNo}
                            </span>
                            {p.orderNo && (
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>• {p.orderNo}</span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          {p.payerBank || p.accountNumber ? (
                            <div>
                              <div style={{ color: '#334155', fontSize: '12.5px', fontWeight: 600 }}>
                                {p.payerBank || 'Customer Bank'}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', marginTop: '1px' }}>
                                {p.accountNumber ? `A/C: ${p.accountNumber.length > 14 ? p.accountNumber.slice(0, 4) + ' •••• ' + p.accountNumber.slice(-4) : p.accountNumber}` : '—'}
                                {p.swiftCode ? ` • ${p.swiftCode}` : ''}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap', fontSize: '12.5px', color: '#64748b' }}>
                          {p.paymentDate}
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: '#1e293b', fontSize: '13.5px', fontWeight: 700 }}>
                            {formatAmount(p.amount)}
                          </strong>
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <div style={{ color: '#475569', fontSize: '12px', fontWeight: 500 }}>
                            {p.paymentMethod || 'Wire Transfer'}
                          </div>
                          {p.reference && (
                            <div style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>
                              Ref: {p.reference}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '14px 18px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '3px 9px',
                              borderRadius: '20px',
                              fontSize: '11px',
                              fontWeight: 600,
                              background: '#f0fdf4',
                              color: '#166534',
                              border: '1px solid #dcfce7'
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
          MODAL 1: RECORD PAYMENT MODAL (PROFESSIONAL EXECUTIVE DESIGN)
          ========================================================= */}
      {recordPaymentModalOpen && (
        <Modal
          open={recordPaymentModalOpen}
          onClose={() => {
            setRecordPaymentModalOpen(false);
            setSelectedInvoiceForPayment(null);
          }}
          eyebrow="COMMERCIAL TREASURY & REALIZATIONS"
          title="Record Export Payment"
          maxWidth="680px"
        >
          <form onSubmit={handleSubmitPayment}>
            <div className="form-grid" style={{ gap: '16px' }}>
              {/* Target Invoice Selector (Only shown if opened globally without a preselected invoice) */}
              {!selectedInvoiceForPayment && (
                <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Receipt size={13} style={{ color: '#0c5a48' }} />
                      Select Target Commercial Invoice *
                    </label>
                    {currentTargetInvoice && (
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>
                        Invoice: <strong style={{ color: '#0c5a48' }}>{currentTargetInvoice.invoiceNo}</strong>
                      </span>
                    )}
                  </div>
                  <select
                    value={paymentForm.invoiceNo}
                    onChange={(e) => {
                      const invNo = e.target.value;
                      const found = invoices.find((i) => i.invoiceNo === invNo);
                      const prevPayment = found ? payments.find((p) => p.customer === found.customer && p.payerBank) : null;
                      setSelectedInvoiceForPayment(null);
                      setPaymentForm((prev) => ({
                        ...prev,
                        invoiceNo: invNo,
                        amount: found ? (found.remainingBalance > 0 ? String(found.remainingBalance) : '') : '',
                        accountHolder: found ? found.customer : prev.accountHolder,
                        payerBank: prevPayment?.payerBank || prev.payerBank,
                        accountNumber: prevPayment?.accountNumber || prev.accountNumber,
                        swiftCode: prevPayment?.swiftCode || prev.swiftCode,
                        bankBranch: prevPayment?.bankBranch || prev.bankBranch
                      }));
                    }}
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#1e293b',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <option value="">-- Choose an Invoice to Record Payment --</option>
                    {invoices.map((inv) => (
                      <option key={inv.invoiceNo} value={inv.invoiceNo}>
                        {inv.invoiceNo} • {inv.customer} • {inv.orderNo} (Total: {formatAmount(inv.totalAmount)} | Balance: {formatAmount(inv.remainingBalance)}) [{inv.status}]
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Dynamic Invoice Balance Summary Card */}
              {currentTargetInvoice && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '14px',
                    padding: '16px 18px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                  }}
                >
                  {/* Meta bar */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '1px solid #e2e8f0',
                      paddingBottom: '10px',
                      marginBottom: '12px',
                      flexWrap: 'wrap',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          padding: '4px 10px',
                          borderRadius: '8px',
                          background: '#e6f4f0',
                          color: '#0c5a48',
                          fontWeight: 800,
                          fontSize: '12.5px',
                          letterSpacing: '0.03em',
                          border: '1px solid #a7f3d0'
                        }}
                      >
                        {currentTargetInvoice.invoiceNo}
                      </div>
                      <div>
                        <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>
                          {currentTargetInvoice.customer}
                        </strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>
                          Order: <strong>{currentTargetInvoice.orderNo || 'N/A'}</strong> • Terms: {currentTargetInvoice.paymentTerms || 'Net 30'}
                        </div>
                      </div>
                    </div>
                    <Status status={currentTargetInvoice.status} />
                  </div>

                  {/* 3 Metrics */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
                    <div style={{ background: '#ffffff', padding: '10px 8px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                      <small style={{ color: '#64748b', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Order / Invoice Value
                      </small>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '17px', fontWeight: 800, marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.totalAmount)}
                      </strong>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px 8px', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                      <small style={{ color: '#059669', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Already Paid
                      </small>
                      <strong style={{ display: 'block', color: '#10b981', fontSize: '17px', fontWeight: 800, marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.amountPaid || 0)}
                      </strong>
                    </div>
                    <div style={{ background: '#ffffff', padding: '10px 8px', borderRadius: '10px', border: '1px solid #fecaca' }}>
                      <small style={{ color: '#dc2626', fontSize: '10.5px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        Remaining Balance
                      </small>
                      <strong style={{ display: 'block', color: '#ef4444', fontSize: '17px', fontWeight: 800, marginTop: '2px' }}>
                        {formatAmount(currentTargetInvoice.remainingBalance || 0)}
                      </strong>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {(() => {
                    const total = Number(currentTargetInvoice.totalAmount) || 1;
                    const paid = Number(currentTargetInvoice.amountPaid) || 0;
                    const pct = Math.min(100, Math.max(0, Math.round((paid / total) * 100)));
                    return (
                      <div style={{ marginTop: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                          <span>Collection Realized ({pct}%)</span>
                          <span>{formatAmount(currentTargetInvoice.remainingBalance || 0)} outstanding</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              background: 'linear-gradient(90deg, #10b981, #0c5a48)',
                              borderRadius: '4px',
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Amount to Pay */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Payment Amount ({currentTargetInvoice?.currency || 'USD'}) *
                  </label>
                  {currentTargetInvoice && currentTargetInvoice.remainingBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentForm((prev) => ({ ...prev, amount: String(currentTargetInvoice.remainingBalance) }));
                        setPaymentError('');
                      }}
                      style={{
                        background: '#ecfdf5',
                        border: '1px solid #a7f3d0',
                        color: '#0c5a48',
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Pay Full Balance ({formatAmount(currentTargetInvoice.remainingBalance)})
                    </button>
                  )}
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span
                    style={{
                      position: 'absolute',
                      left: '12px',
                      fontSize: '14px',
                      fontWeight: 700,
                      color: '#64748b',
                      pointerEvents: 'none'
                    }}
                  >
                    {currentTargetInvoice?.currency === 'EUR' ? '€' : currentTargetInvoice?.currency === 'GBP' ? '£' : '$'}
                  </span>
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
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 30px',
                      fontSize: '14.5px',
                      fontWeight: 700,
                      color: '#0f172a',
                      background: '#ffffff',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '10px',
                      outline: 'none',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  />
                </div>
              </div>

              {/* Payment Date */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Payment Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              {/* Payment Method */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Payment Mode / Instrument *
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="Wire Transfer (TT)">Telegraphic Transfer / Wire (TT)</option>
                  <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                  <option value="Documentary Collection (DP/DA)">Documents Against Payment (DP)</option>
                  <option value="Bank Draft / Cheque">Bank Draft / Cheque</option>
                  <option value="Online Escrow">Online Escrow / Card</option>
                </select>
              </div>

              {/* Reference Number */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Bank Reference / Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. TXN-SCB-984012 / SWIFT Ref"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              {/* Customer Account & Bank Details Section */}
              <div style={{ gridColumn: 'span 2', marginTop: '6px', paddingTop: '14px', borderTop: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Building size={15} style={{ color: '#0c5a48' }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Customer Bank & Account Details
                    </span>
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Remitting customer account information</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Account Holder / Remitter
                </label>
                <input
                  type="text"
                  placeholder="e.g. Al-Mansoor Trading LLC"
                  value={paymentForm.accountHolder}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountHolder: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Customer Bank Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Emirates NBD, Chase, HSBC"
                  value={paymentForm.payerBank}
                  onChange={(e) => setPaymentForm({ ...paymentForm, payerBank: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Account / IBAN Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. AE29 0330 0000 0012 3456 789"
                  value={paymentForm.accountNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, accountNumber: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  SWIFT / BIC Code
                </label>
                <input
                  type="text"
                  placeholder="e.g. EBILAEADXXX"
                  value={paymentForm.swiftCode}
                  onChange={(e) => setPaymentForm({ ...paymentForm, swiftCode: e.target.value.toUpperCase() })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    fontFamily: 'monospace',
                    fontWeight: 600,
                    color: '#0c5a48',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Bank Branch / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. Deira Commercial Branch, Dubai, UAE"
                  value={paymentForm.bankBranch}
                  onChange={(e) => setPaymentForm({ ...paymentForm, bankBranch: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              {/* Notes */}
              <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '6px' }}>
                  Remittance Notes & Realization Details
                </label>
                <textarea
                  rows="2"
                  placeholder="Optional bank swift notes, intermediary charges, realization remarks..."
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: '13px',
                    color: '#1e293b',
                    background: '#ffffff',
                    border: '1.5px solid #cbd5e1',
                    borderRadius: '10px',
                    outline: 'none',
                    resize: 'vertical',
                    minHeight: '68px',
                    fontFamily: 'inherit',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                  }}
                />
              </div>

              {/* Live Preview of Resulting Balance */}
              {paymentValidation.isValid && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: paymentValidation.resultingStatus === 'Paid' ? '#f0fdf4' : '#eff6ff',
                    border: `1.5px solid ${paymentValidation.resultingStatus === 'Paid' ? '#86efac' : '#93c5fd'}`,
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: paymentValidation.resultingStatus === 'Paid' ? '#dcfce7' : '#dbeafe',
                      color: paymentValidation.resultingStatus === 'Paid' ? '#16a34a' : '#2563eb',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0
                    }}
                  >
                    {paymentValidation.resultingStatus === 'Paid' ? <CheckCircle2 size={18} /> : <Clock size={18} />}
                  </div>
                  <div style={{ flex: 1, fontSize: '13px' }}>
                    <div style={{ fontWeight: 800, color: paymentValidation.resultingStatus === 'Paid' ? '#15803d' : '#1d4ed8' }}>
                      Resulting Status: {paymentValidation.resultingStatus === 'Paid' ? 'Paid in Full (Settled)' : 'Partially Paid'}
                    </div>
                    <div style={{ marginTop: '2px', color: '#475569', fontSize: '12px' }}>
                      New Paid Total: <strong style={{ color: '#0f172a' }}>{formatAmount(paymentValidation.resultingPaid)}</strong> • Balance Remaining:{' '}
                      <strong style={{ color: paymentValidation.resultingRemaining > 0 ? '#b45309' : '#16a34a' }}>
                        {formatAmount(paymentValidation.resultingRemaining)}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Validation Error Banner */}
              {paymentError && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    background: '#fef2f2',
                    border: '1.5px solid #fca5a5',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '13px',
                    color: '#b91c1c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <AlertCircle size={18} style={{ flexShrink: 0 }} />
                  <span style={{ fontWeight: 600 }}>{paymentError}</span>
                </div>
              )}
            </div>

            <div className="modal-foot" style={{ marginTop: '20px', paddingTop: '16px' }}>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setRecordPaymentModalOpen(false);
                  setSelectedInvoiceForPayment(null);
                }}
                style={{
                  padding: '9px 18px',
                  borderRadius: '10px',
                  fontWeight: 600,
                  fontSize: '13px'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary"
                disabled={!paymentValidation.isValid}
                style={{
                  padding: '9px 22px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: paymentValidation.isValid ? '0 2px 8px rgba(12, 90, 72, 0.25)' : 'none'
                }}
              >
                <CheckCircle2 size={16} />
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
          MODAL 3: OFFICIAL EXPORT INVOICE & DETAILS MODAL
          (Neat multi-tab architecture matching Shipments module)
          ========================================================= */}
      {viewInvoice && (
        <Modal
          eyebrow="COMMERCIAL EXPORT INVOICE"
          title={`${viewInvoice.invoiceType || 'Commercial Invoice'} ${viewInvoice.invoiceNo} — ${viewInvoice.customer}`}
          onClose={() => setViewInvoice(null)}
          maxWidth="840px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#627b75', fontWeight: 600 }}>Payment Status:</span>
                <span
                  className={`badge ${
                    viewInvoice.status === 'Paid'
                      ? 'badge-green'
                      : viewInvoice.status === 'Partially Paid'
                      ? 'badge-blue'
                      : 'badge-amber'
                  }`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
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
                      background:
                        viewInvoice.status === 'Paid'
                          ? '#10b981'
                          : viewInvoice.status === 'Partially Paid'
                          ? '#3b82f6'
                          : '#f59e0b'
                    }}
                  />
                  {viewInvoice.status}
                </span>
                {viewInvoice.remainingBalance > 0 && (
                  <span style={{ fontSize: '11.5px', color: '#e11d48', fontWeight: 600 }}>
                    (Due: {formatAmount(viewInvoice.remainingBalance)})
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
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
                    <CreditCard size={14} style={{ marginRight: '6px' }} />
                    Record Payment
                  </button>
                )}
                <button
                  type="button"
                  className="secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={14} style={{ marginRight: '6px' }} />
                  Print / Save PDF
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => setViewInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          {/* Top Primary Summary Card (Immediate high-priority data without scrolling) */}
          <div
            style={{
              background: '#f8fafc',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              padding: '14px 18px',
              marginBottom: '16px'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
                gap: '12px',
                marginBottom: '12px'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span
                    style={{
                      background: '#0c5a48',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '13px',
                      padding: '3px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    {viewInvoice.invoiceNo}
                  </span>
                  <span className="order-badge" style={{ padding: '3px 8px', fontSize: '12px' }}>
                    Order: {viewInvoice.orderNo || 'SO-1024'}
                  </span>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: viewInvoice.invoiceType === 'Proforma Invoice' ? '#ede9fe' : '#e6f4f0',
                      color: viewInvoice.invoiceType === 'Proforma Invoice' ? '#6d28d9' : '#0c5a48',
                      border: viewInvoice.invoiceType === 'Proforma Invoice' ? '1px solid #ddd6fe' : '1px solid #bbf7d0'
                    }}
                  >
                    {viewInvoice.invoiceType || 'Commercial Invoice'}
                  </span>
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e1e2d', marginTop: '6px' }}>
                  {viewInvoice.customer}
                  <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b', marginLeft: '8px' }}>
                    • Port: {viewInvoice.destination || 'Dubai, UAE'}
                  </span>
                </div>
              </div>

              {/* Financial snapshot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', textAlign: 'right' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Total Value
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#1e1e2d' }}>
                    {formatAmount(viewInvoice.totalAmount)}
                  </div>
                </div>
                <div style={{ width: '1px', height: '28px', background: '#cbd5e1' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Paid
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>
                    {formatAmount(viewInvoice.amountPaid || 0)}
                  </div>
                </div>
                <div style={{ width: '1px', height: '28px', background: '#cbd5e1' }} />
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Balance Due
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: viewInvoice.remainingBalance > 0 ? '#e11d48' : '#059669' }}>
                    {formatAmount(viewInvoice.remainingBalance || 0)}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Progress Bar */}
            {(() => {
              const pct = Math.min(100, Math.round(((viewInvoice.amountPaid || 0) / (viewInvoice.totalAmount || 1)) * 100));
              return (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                    <span>Payment Realization ({pct}% Settled)</span>
                    <span>Terms: <strong>{viewInvoice.paymentTerms || 'Net 30'}</strong> (Due: {viewInvoice.dueDate || 'Upon Receipt'})</span>
                  </div>
                  <div style={{ width: '100%', height: '7px', background: '#e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: viewInvoice.status === 'Paid'
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #0ea5e9, #2563eb)',
                        borderRadius: '10px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sub-Navigation Tabs Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '10px',
              marginBottom: '16px',
              overflowX: 'auto'
            }}
          >
            <button
              type="button"
              className={`invoice-tab-btn ${activeInvoiceTab === 'document' ? 'active' : ''}`}
              onClick={() => setActiveInvoiceTab('document')}
            >
              <FileText size={14} /> Official Invoice
            </button>
            <button
              type="button"
              className={`invoice-tab-btn ${activeInvoiceTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveInvoiceTab('overview')}
            >
              <Layers size={14} /> Overview & Terms
            </button>
            <button
              type="button"
              className={`invoice-tab-btn ${activeInvoiceTab === 'items' ? 'active' : ''}`}
              onClick={() => setActiveInvoiceTab('items')}
            >
              <Package size={14} /> Goods & Items ({viewInvoice.items?.length || 0})
            </button>
            <button
              type="button"
              className={`invoice-tab-btn ${activeInvoiceTab === 'payments' ? 'active' : ''}`}
              onClick={() => setActiveInvoiceTab('payments')}
            >
              <CreditCard size={14} /> Payments & Remittance
            </button>
          </div>

          {/* TAB 1: OFFICIAL PRINTABLE INVOICE DOCUMENT */}
          {activeInvoiceTab === 'document' && (
            <div className="document-preview invoice-document-sheet" style={{ background: '#ffffff', color: '#1e1e2d', padding: '0' }}>
              {/* Document Header */}
              <div
                className="doc-header"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: '16px',
                  borderBottom: '2px solid #0c5a48',
                  paddingBottom: '16px',
                  marginBottom: '18px'
                }}
              >
                <div className="doc-brand" style={{ flex: '1 1 320px', maxWidth: '380px' }}>
                  <Logo variant="document" width={200} />
                  <div className="doc-brand-info" style={{ marginTop: '8px', fontSize: '11px', color: '#627b75', lineHeight: '1.5' }}>
                    <strong>Master Export Pro Inc.</strong>
                    <br />
                    123 Trade Center, Business Bay, New York, NY 10001, USA
                    <br />
                    Email: exports@masterexportpro.com | GST / Tax ID: 123456789
                  </div>
                </div>
                <div className="doc-meta" style={{ textAlign: 'right', flex: '0 0 auto' }}>
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
                    {viewInvoice.invoiceType || 'Commercial Invoice'}
                  </span>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#1e1e2d' }}>
                    {viewInvoice.invoiceNo}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    Date: <strong style={{ color: '#1e1e2d' }}>{viewInvoice.invoiceDate}</strong>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '2px' }}>
                    Due: <strong style={{ color: '#1e1e2d' }}>{viewInvoice.dueDate || 'Upon Receipt'}</strong>
                  </div>
                  <div style={{ marginTop: '4px' }}>
                    <Status>{viewInvoice.status}</Status>
                  </div>
                </div>
              </div>

              {/* Bill To & Export Logistics */}
              <div
                className="doc-addresses"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '16px',
                  background: '#f8fafc',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '18px'
                }}
              >
                <div>
                  <small style={{ color: '#0c5a48', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    CONSIGNEE / BUYER:
                  </small>
                  <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#1e1e2d', marginTop: '3px' }}>
                    {viewInvoice.customer}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', lineHeight: 1.4, marginTop: '2px' }}>
                    {viewInvoice.address || 'Commercial Office, International Trade Center'}<br />
                    Contact: <strong>{viewInvoice.contactPerson || 'Purchasing Director'}</strong> • {viewInvoice.phone || '+971 50 123 4567'}
                  </div>
                </div>
                <div>
                  <small style={{ color: '#0c5a48', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    EXPORT & DELIVERY TERMS:
                  </small>
                  <div style={{ fontSize: '12px', color: '#1e1e2d', marginTop: '4px', lineHeight: 1.6 }}>
                    Order Ref: <strong>{viewInvoice.orderNo || '—'}</strong><br />
                    Port of Loading: <strong>{viewInvoice.origin || 'Nhava Sheva (JNPT), Mumbai, India'}</strong><br />
                    Port of Discharge: <strong>{viewInvoice.destination || 'Dubai, UAE'}</strong><br />
                    Terms: <strong>{viewInvoice.incoterm || 'FOB'}</strong> • <strong>{viewInvoice.paymentTerms || 'Net 30'}</strong>
                  </div>
                </div>
              </div>

              {/* Goods Table */}
              <div style={{ overflowX: 'auto', marginBottom: '18px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <table className="doc-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#0c5a48', color: '#ffffff', fontSize: '11.5px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '9px 12px', width: '45px' }}>NO</th>
                      <th style={{ padding: '9px 12px' }}>DESCRIPTION OF EXPORT GOODS</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', width: '80px' }}>QTY</th>
                      <th style={{ padding: '9px 12px', width: '70px' }}>UNIT</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', width: '110px' }}>RATE</th>
                      <th style={{ padding: '9px 12px', textAlign: 'right', width: '130px' }}>TOTAL AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody style={{ fontSize: '12px' }}>
                    {(viewInvoice.items || []).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #edf2f7', background: idx % 2 === 0 ? '#ffffff' : '#fcfdfd' }}>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: '#1e1e2d', display: 'block', fontSize: '12.5px' }}>{it.name}</strong>
                          <small style={{ color: '#64748b', fontSize: '11px' }}>{it.description || 'Export grade standard seaworthy packing'}</small>
                        </td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600 }}>{it.quantity}</td>
                        <td style={{ padding: '10px 12px', color: '#64748b' }}>{it.unit || 'PCS'}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', color: '#475569' }}>{formatAmount(it.unitPrice)}</td>
                        <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#0c5a48' }}>
                          {formatAmount(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Financial Summary */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                {/* Bank Remittance Details */}
                <div style={{ flex: '1 1 300px', background: '#f8fafc', padding: '12px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: 1.6 }}>
                  <strong style={{ color: '#0c5a48', display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    BANK WIRE REMITTANCE INSTRUCTIONS:
                  </strong>
                  Beneficiary: <strong>Master Export Pro Inc.</strong><br />
                  Bank: <strong>State Bank of India (Overseas Commercial)</strong><br />
                  Account: <strong>984012948102</strong> • Swift/BIC: <strong>SBININBBXXX</strong><br />
                  Branch: <strong>Commercial Branch, Nariman Point, Mumbai, India</strong>
                </div>

                {/* Totals Calculation */}
                <div style={{ width: '280px', fontSize: '12px', background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                    <span>FOB Goods Subtotal:</span>
                    <strong style={{ color: '#1e1e2d' }}>{formatAmount(viewInvoice.subtotal || viewInvoice.totalAmount)}</strong>
                  </div>
                  {viewInvoice.shippingCharges > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', color: '#64748b' }}>
                      <span>Freight / Shipping Charges:</span>
                      <strong style={{ color: '#1e1e2d' }}>{formatAmount(viewInvoice.shippingCharges)}</strong>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderTop: '2px solid #0c5a48', borderBottom: '1px solid #e2e8f0', marginTop: '6px' }}>
                    <strong style={{ fontSize: '13px', color: '#0c5a48' }}>TOTAL INVOICE VALUE:</strong>
                    <strong style={{ fontSize: '14.5px', color: '#0c5a48' }}>{formatAmount(viewInvoice.totalAmount)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#059669', marginTop: '4px' }}>
                    <span>Amount Paid / Settled:</span>
                    <strong>{formatAmount(viewInvoice.amountPaid || 0)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: viewInvoice.remainingBalance > 0 ? '#ef4444' : '#059669' }}>
                    <span>Remaining Balance Due:</span>
                    <strong>{formatAmount(viewInvoice.remainingBalance || 0)}</strong>
                  </div>
                </div>
              </div>

              {/* Signature Block */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '16px', marginTop: '16px' }}>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  This is an authentic computer generated export commercial invoice issued by Master Export Pro Inc.
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '160px', borderBottom: '1px solid #0c5a48', marginBottom: '6px' }} />
                  <strong style={{ fontSize: '11.5px', color: '#1e1e2d', display: 'block' }}>
                    For Master Export Pro Inc.
                  </strong>
                  <small style={{ fontSize: '10.5px', color: '#64748b' }}>Authorized Signatory & Seal</small>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OVERVIEW & COMMERCIAL TERMS */}
          {activeInvoiceTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Route Visualizer Card */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '12px' }}>
                  Export Logistics Route
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>PORT OF LOADING (ORIGIN)</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e1e2d', marginTop: '2px' }}>
                      {viewInvoice.origin || 'Nhava Sheva (JNPT), Mumbai, India'}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', background: '#e6f4f0', borderRadius: '20px', color: '#0c5a48', fontWeight: 700, fontSize: '12px' }}>
                    <span>{viewInvoice.incoterm || 'FOB'} Terms</span>
                    <ArrowRight size={14} />
                  </div>
                  <div style={{ flex: '1 1 200px', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b' }}>PORT OF DISCHARGE (DESTINATION)</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#1e1e2d', marginTop: '2px' }}>
                      {viewInvoice.destination || 'Dubai, UAE'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Info Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Commercial Terms */}
                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
                    Commercial Terms
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '8px', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748b' }}>Sales Order:</span>
                    <strong>{viewInvoice.orderNo || 'SO-1024'}</strong>

                    <span style={{ color: '#64748b' }}>Invoice Type:</span>
                    <span>{viewInvoice.invoiceType || 'Commercial Invoice'}</span>

                    <span style={{ color: '#64748b' }}>Incoterm:</span>
                    <strong style={{ color: '#0c5a48' }}>{viewInvoice.incoterm || 'FOB'}</strong>

                    <span style={{ color: '#64748b' }}>Payment Terms:</span>
                    <strong>{viewInvoice.paymentTerms || 'Net 30'}</strong>

                    <span style={{ color: '#64748b' }}>Currency:</span>
                    <span>{viewInvoice.currency || 'USD'} ($)</span>

                    <span style={{ color: '#64748b' }}>Due Date:</span>
                    <strong>{viewInvoice.dueDate || 'Upon Receipt'}</strong>
                  </div>
                </div>

                {/* Consignee / Buyer Info */}
                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
                    Consignee Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', rowGap: '8px', fontSize: '12.5px' }}>
                    <span style={{ color: '#64748b' }}>Client:</span>
                    <strong>{viewInvoice.customer}</strong>

                    <span style={{ color: '#64748b' }}>Contact:</span>
                    <span>{viewInvoice.contactPerson || 'Purchasing Director'}</span>

                    <span style={{ color: '#64748b' }}>Phone:</span>
                    <span>{viewInvoice.phone || '+971 50 123 4567'}</span>

                    <span style={{ color: '#64748b' }}>Email:</span>
                    <span>{viewInvoice.email || 'purchasing@client.com'}</span>

                    <span style={{ color: '#64748b' }}>Address:</span>
                    <span style={{ fontSize: '11.5px', color: '#475569' }}>{viewInvoice.address || 'Commercial Office, International Trade Center'}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewInvoice.notes && (
                <div style={{ background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', padding: '12px 14px', fontSize: '12px', color: '#475569' }}>
                  <strong style={{ color: '#0c5a48', display: 'block', marginBottom: '3px' }}>Export Special Instructions / Notes:</strong>
                  {viewInvoice.notes}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: GOODS & LINE ITEMS */}
          {activeInvoiceTab === 'items' && (
            <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#1e1e2d' }}>
                  Export Consignment Line Items
                </h4>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {viewInvoice.items?.length || 0} product lines specified
                </span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      <th style={{ padding: '10px 14px' }}>NO</th>
                      <th style={{ padding: '10px 14px' }}>PRODUCT DESCRIPTION & PACKING</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>QUANTITY</th>
                      <th style={{ padding: '10px 14px' }}>UNIT</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>UNIT RATE</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TOTAL VALUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(viewInvoice.items || []).map((it, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '12px 14px', color: '#94a3b8' }}>{idx + 1}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <strong style={{ color: '#1e1e2d', display: 'block' }}>{it.name}</strong>
                          <span style={{ color: '#64748b', fontSize: '11.5px' }}>{it.description || 'Export grade seaworthy packaging'}</span>
                        </td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600 }}>{it.quantity}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{it.unit || 'PCS'}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', color: '#475569' }}>{formatAmount(it.unitPrice)}</td>
                        <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 700, color: '#0c5a48' }}>
                          {formatAmount(it.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', fontWeight: 700 }}>
                      <td colSpan={5} style={{ padding: '12px 14px', textAlign: 'right', color: '#475569' }}>
                        Total Goods Value:
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#0c5a48', fontSize: '14px' }}>
                        {formatAmount(viewInvoice.subtotal || viewInvoice.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS & REMITTANCE */}
          {activeInvoiceTab === 'payments' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Bank Wire Details Box */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 18px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#0c5a48', fontWeight: 700, marginBottom: '8px' }}>
                  Bank Wire Remittance Instructions
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>BENEFICIARY:</span>
                    <strong style={{ display: 'block', color: '#1e1e2d' }}>Master Export Pro Inc.</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>BANK NAME:</span>
                    <strong style={{ display: 'block', color: '#1e1e2d' }}>State Bank of India (Overseas Commercial)</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>ACCOUNT NO / IBAN:</span>
                    <strong style={{ display: 'block', color: '#1e1e2d' }}>984012948102</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', fontSize: '11px' }}>SWIFT / BIC CODE:</span>
                    <strong style={{ display: 'block', color: '#0c5a48' }}>SBININBBXXX</strong>
                  </div>
                </div>
              </div>

              {/* Payments Ledger for this Invoice */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: '#1e1e2d' }}>
                    Payment Transaction History
                  </h4>
                  {viewInvoice.status !== 'Paid' && (
                    <button
                      type="button"
                      className="primary"
                      style={{ fontSize: '11.5px', padding: '5px 12px' }}
                      onClick={() => {
                        const inv = viewInvoice;
                        setViewInvoice(null);
                        handleOpenPaymentModal(inv);
                      }}
                    >
                      <CreditCard size={13} style={{ marginRight: '5px' }} />
                      Record Payment
                    </button>
                  )}
                </div>

                {(() => {
                  const matchedPayments = payments.filter((p) => p.invoiceNo === viewInvoice.invoiceNo);
                  if (matchedPayments.length === 0) {
                    return (
                      <div style={{ padding: '32px 20px', textAlign: 'center', color: '#94a3b8' }}>
                        <Clock size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
                        <strong style={{ display: 'block', color: '#475569', fontSize: '13.5px', marginBottom: '3px' }}>
                          No payments recorded yet
                        </strong>
                        <span style={{ fontSize: '12px' }}>
                          Total outstanding balance of {formatAmount(viewInvoice.remainingBalance || viewInvoice.totalAmount)} is pending settlement.
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', color: '#475569', fontSize: '11px', textTransform: 'uppercase' }}>
                            <th style={{ padding: '9px 14px' }}>PAYMENT ID</th>
                            <th style={{ padding: '9px 14px' }}>CUSTOMER REMITTING BANK & A/C</th>
                            <th style={{ padding: '9px 14px' }}>DATE</th>
                            <th style={{ padding: '9px 14px' }}>METHOD</th>
                            <th style={{ padding: '9px 14px' }}>REFERENCE</th>
                            <th style={{ padding: '9px 14px', textAlign: 'right' }}>AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchedPayments.map((p) => (
                            <tr key={p._id || p.paymentId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0c5a48' }}>{p.paymentId}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <div style={{ fontWeight: 600, color: '#1e293b' }}>{p.payerBank || 'Customer Bank'}</div>
                                {p.accountNumber && (
                                  <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                                    A/C: {p.accountNumber}
                                  </div>
                                )}
                              </td>
                              <td style={{ padding: '10px 14px', color: '#64748b' }}>{p.paymentDate}</td>
                              <td style={{ padding: '10px 14px' }}>{p.paymentMethod}</td>
                              <td style={{ padding: '10px 14px' }}>
                                <span className="mono-code" style={{ fontSize: '11px', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px' }}>
                                  {p.reference || '—'}
                                </span>
                              </td>
                              <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 700, color: '#059669' }}>
                                {formatAmount(p.amount)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* =========================================================
          MODAL 4: PAYMENT RECEIPT & CUSTOMER ACCOUNT DETAILS
          ========================================================= */}
      {viewPaymentVoucher && (
        <Modal
          open={!!viewPaymentVoucher}
          onClose={() => setViewPaymentVoucher(null)}
          title={`Payment Details — ${viewPaymentVoucher.paymentId}`}
          maxWidth="540px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <span style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={14} style={{ color: '#10b981' }} /> Settled & Verified
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => window.print()}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setViewPaymentVoucher(null)}
                  style={{ fontSize: '12.5px', padding: '6px 16px' }}
                >
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Payment & Settlement Summary Grid (Clean & Faded) */}
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px 16px', fontSize: '12.5px' }}>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Amount</span>
                  <strong style={{ fontSize: '18px', color: '#1e293b', fontWeight: 700 }}>
                    {formatAmount(viewPaymentVoucher.amount)}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Status</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#166534', fontWeight: 600, marginTop: '3px' }}>
                    <CheckCircle2 size={13} style={{ color: '#10b981' }} /> {viewPaymentVoucher.status || 'Settled'}
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Commercial Invoice</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{viewPaymentVoucher.invoiceNo}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Date</span>
                  <span style={{ color: '#334155' }}>{viewPaymentVoucher.paymentDate}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Payment Method</span>
                  <span style={{ color: '#334155' }}>{viewPaymentVoucher.paymentMethod}</span>
                </div>
                <div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Reference / TXN ID</span>
                  <code style={{ fontSize: '11.5px', color: '#475569' }}>{viewPaymentVoucher.reference || '—'}</code>
                </div>
              </div>
            </div>

            {/* Customer Bank & Account Details (Clean & Faded) */}
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                padding: '14px 16px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                <Building size={14} style={{ color: '#64748b' }} />
                <strong style={{ fontSize: '12px', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  Customer Bank & Account Details
                </strong>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Account Holder / Payer</span>
                  <strong style={{ color: '#1e293b' }}>
                    {viewPaymentVoucher.accountHolder || viewPaymentVoucher.customer}
                  </strong>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Remitting Bank</span>
                  <span style={{ color: '#1e293b', fontWeight: 600 }}>
                    {viewPaymentVoucher.payerBank || 'Not recorded'}
                  </span>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Account / IBAN Number</span>
                  <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#334155' }}>
                    {viewPaymentVoucher.accountNumber || '—'}
                  </code>
                </div>

                <div>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>SWIFT / BIC Code</span>
                  <code style={{ background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', border: '1px solid #e2e8f0', color: '#475569' }}>
                    {viewPaymentVoucher.swiftCode || '—'}
                  </code>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', display: 'block', fontSize: '11px' }}>Branch / Location</span>
                  <span style={{ color: '#475569' }}>
                    {viewPaymentVoucher.bankBranch || 'Commercial Overseas Branch'}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes if present */}
            {viewPaymentVoucher.notes && (
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', fontSize: '11.5px', color: '#64748b' }}>
                <span style={{ fontWeight: 600, color: '#475569' }}>Notes: </span>
                {viewPaymentVoucher.notes}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
