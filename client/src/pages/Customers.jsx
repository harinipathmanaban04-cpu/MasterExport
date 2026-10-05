import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  CheckCircle2,
  ChevronDown,
  Users,
  ClipboardList,
  Package,
  Truck,
  Receipt,
  CreditCard,
  Printer,
  Download,
  ArrowRight,
  DollarSign,
  Globe,
  Calendar,
  AlertCircle,
  Sparkles,
  X,
  ExternalLink
} from 'lucide-react';
import { get, post, put, del, createQuotation, convertQuotationToOrder } from '../api';
import Modal from '../components/Modal';
import { StatCard } from '../components/Layout';
import Logo from '../components/Logo';
import { useCurrency } from '../context/CurrencyContext';
import { generateQuotationPdf } from '../utils/generateQuotationPdf';

// Default initial customers matching export workflow
const defaultCustomers = [
  {
    _id: 'cust-1',
    customerId: 'CUST-101',
    companyName: 'ABC Trading LLC',
    avatar: 'AT',
    avatarColor: 'purple',
    country: 'UAE 🇦🇪',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    address: 'Office 402, Business Bay, Dubai, UAE',
    taxNumber: 'TRN 100234567890003',
    currency: 'USD',
    paymentTerms: 'Net 30',
    outstandingBalance: 35000,
    status: 'Active'
  },
  {
    _id: 'cust-2',
    customerId: 'CUST-102',
    companyName: 'EuroFoods BV',
    avatar: 'EB',
    avatarColor: 'coral',
    country: 'Netherlands 🇳🇱',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    phone: '+31 20 555 4321',
    address: 'Keizersgracht 421, Amsterdam, Netherlands',
    taxNumber: 'NL884210954B01',
    currency: 'EUR',
    paymentTerms: 'Advance',
    outstandingBalance: 0,
    status: 'Active'
  },
  {
    _id: 'cust-3',
    customerId: 'CUST-103',
    companyName: 'Apex Imports',
    avatar: 'AI',
    avatarColor: 'blue',
    country: 'USA 🇺🇸',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    phone: '+1 929 555 0101',
    address: '500 7th Ave, New York, NY 10018, USA',
    taxNumber: 'US123456789',
    currency: 'USD',
    paymentTerms: '30% Adv + 70% B/L',
    outstandingBalance: 0,
    status: 'Active'
  },
  {
    _id: 'cust-4',
    customerId: 'CUST-104',
    companyName: 'Tokyo Trading',
    avatar: 'TT',
    avatarColor: 'teal',
    country: 'Japan 🇯🇵',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    phone: '+81 3 5555 0123',
    address: '1-1-2 Marunouchi, Chiyoda-ku, Tokyo, Japan',
    taxNumber: 'JP9876543210123',
    currency: 'USD',
    paymentTerms: 'Net 30',
    outstandingBalance: 12500,
    status: 'Active'
  },
  {
    _id: 'cust-5',
    customerId: 'CUST-105',
    companyName: 'Oceanic Trading',
    avatar: 'OT',
    avatarColor: 'purple',
    country: 'Australia 🇦🇺',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    phone: '+61 2 9876 5432',
    address: 'Level 18, 100 Miller St, North Sydney NSW 2060, Australia',
    taxNumber: 'AU882190342',
    currency: 'USD',
    paymentTerms: 'Net 30',
    outstandingBalance: 20000,
    status: 'Active'
  },
  {
    _id: 'cust-6',
    customerId: 'CUST-106',
    companyName: 'Singapore Global Logistics',
    avatar: 'SG',
    avatarColor: 'coral',
    country: 'Singapore 🇸🇬',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    phone: '+65 6789 0123',
    address: '10 Marina Boulevard, Tower 2, Singapore 018983',
    taxNumber: 'SG201829104M',
    currency: 'USD',
    paymentTerms: 'Advance',
    outstandingBalance: 0,
    status: 'Active'
  },
  {
    _id: 'cust-7',
    customerId: 'CUST-107',
    companyName: 'Al-Mansoor Enterprises',
    avatar: 'AM',
    avatarColor: 'blue',
    country: 'Saudi Arabia 🇸🇦',
    contactPerson: 'Fahad Al-Mansoor',
    email: 'fahad@almansoor.sa',
    phone: '+966 11 482 9900',
    address: 'King Fahd Road, Al Olaya, Riyadh 12213, Saudi Arabia',
    taxNumber: 'SA310293847500003',
    currency: 'USD',
    paymentTerms: 'LC at Sight',
    outstandingBalance: 0,
    status: 'Active'
  }
];

// Baseline linked data for buyers to ensure rich, complete tabs
const defaultCustomerOrders = {
  'ABC Trading LLC': [
    { orderNo: 'SO-1024', date: '2026-09-15', items: 'Basmati Rice 1121 · 50 MT', total: 47500, advance: 14250, balance: 33250, status: 'Shipped', stage: 'Shipped' },
    { orderNo: 'SO-1018', date: '2026-08-20', items: 'Export Consignment · 25 MT', total: 22500, advance: 22500, balance: 0, status: 'Completed', stage: 'Completed' }
  ],
  'EuroFoods BV': [
    { orderNo: 'SO-1020', date: '2026-09-22', items: 'Premium Spices & Grains · 30 MT', total: 36000, advance: 36000, balance: 0, status: 'Delivered', stage: 'Delivered' }
  ],
  'Apex Imports': [
    { orderNo: 'SO-1025', date: '2026-09-18', items: 'Cotton Yarn 30s · 2,000 KG', total: 28000, advance: 8400, balance: 19600, status: 'In Preparation', stage: 'Preparing' }
  ],
  'Tokyo Trading': [
    { orderNo: 'SO-1026', date: '2026-09-12', items: 'Refined Soybean Oil · 900 KG', total: 12500, advance: 0, balance: 12500, status: 'Confirmed', stage: 'Confirmed' }
  ]
};

const defaultCustomerInvoices = {
  'ABC Trading LLC': [
    { invoiceNo: 'INV-301', date: '2026-09-18', dueDate: '2026-10-18', amount: 47500, due: 33250, status: 'Partially Paid' },
    { invoiceNo: 'INV-289', date: '2026-08-25', dueDate: '2026-09-25', amount: 22500, due: 0, status: 'Paid' }
  ],
  'EuroFoods BV': [
    { invoiceNo: 'INV-298', date: '2026-09-23', dueDate: '2026-10-23', amount: 36000, due: 0, status: 'Paid' }
  ],
  'Apex Imports': [
    { invoiceNo: 'INV-305', date: '2026-09-20', dueDate: '2026-10-20', amount: 28000, due: 19600, status: 'Partially Paid' }
  ],
  'Tokyo Trading': [
    { invoiceNo: 'INV-309', date: '2026-09-15', dueDate: '2026-10-15', amount: 12500, due: 12500, status: 'Due' }
  ]
};

const defaultCustomerPayments = {
  'ABC Trading LLC': [
    { receiptNo: 'REC-501', date: '2026-09-16', amount: 14250, mode: 'Swift / Wire Transfer', ref: 'SWIFT-UAE-98124', status: 'Cleared' },
    { receiptNo: 'REC-482', date: '2026-08-22', amount: 22500, mode: 'Advance TT', ref: 'TT-771204', status: 'Cleared' }
  ],
  'EuroFoods BV': [
    { receiptNo: 'REC-495', date: '2026-09-22', amount: 36000, mode: 'SEPA Transfer', ref: 'SEPA-NL-44912', status: 'Cleared' }
  ],
  'Apex Imports': [
    { receiptNo: 'REC-508', date: '2026-09-19', amount: 8400, mode: 'Wire Transfer', ref: 'FED-US-66102', status: 'Cleared' }
  ],
  'Tokyo Trading': []
};

const defaultCustomerShipments = {
  'ABC Trading LLC': [
    { shipmentNo: 'SHP-101', orderNo: 'SO-1024', mode: 'Sea', containerNo: 'MSKU-782190', carrier: 'Maersk Line', route: 'Nhava Sheva ➔ Jebel Ali, Dubai', etd: '2026-10-10', eta: '2026-10-18', status: 'In Transit' }
  ],
  'EuroFoods BV': [
    { shipmentNo: 'SHP-104', orderNo: 'SO-1020', mode: 'Sea', containerNo: 'CMAU-918230', carrier: 'CMA CGM', route: 'Mundra ➔ Rotterdam, Netherlands', etd: '2026-09-28', eta: '2026-10-15', status: 'Delivered' }
  ],
  'Apex Imports': [
    { shipmentNo: 'SHP-102', orderNo: 'SO-1025', mode: 'Air', containerNo: 'AWB-8421904', carrier: 'Emirates SkyCargo', route: 'Mumbai BOM ➔ JFK, New York', etd: '2026-10-04', eta: '2026-10-06', status: 'Customs' }
  ],
  'Tokyo Trading': [
    { shipmentNo: 'SHP-103', orderNo: 'SO-1026', mode: 'Sea', containerNo: 'MAEU-410552', carrier: 'ONE Ocean Network', route: 'Chennai ➔ Yokohama, Japan', etd: '2026-10-22', eta: '2026-11-06', status: 'Preparing' }
  ]
};

export default function Customers() {
  const { currency: globalCurrency, currencySymbol: globalSymbol } = useCurrency();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const resolveCurrencySymbol = (curr) => {
    if (!curr) return globalSymbol || '₹';
    if (curr === 'INR') return '₹';
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    if (curr === 'GBP') return '£';
    if (curr === 'AED') return 'AED ';
    return curr;
  };

  const [customers, setCustomers] = useState(defaultCustomers);
  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(defaultCustomers[0]);
  const [drawerTab, setDrawerTab] = useState('Details'); // 'Details' | 'Orders' | 'Invoices' | 'Payments' | 'Shipments'

  // Backend data collections
  const [salesData, setSalesData] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [backendShipments, setBackendShipments] = useState([]);
  const [notification, setNotification] = useState(null);

  // Modals
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [isEditingCustomer, setIsEditingCustomer] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [previewDocModal, setPreviewDocModal] = useState(null);

  // Customer Management Form
  const [customerForm, setCustomerForm] = useState({
    customerId: '',
    companyName: '',
    contactPerson: '',
    country: 'UAE 🇦🇪',
    email: '',
    phone: '',
    address: '',
    taxNumber: '',
    currency: 'USD',
    paymentTerms: 'Net 30',
    outstandingBalance: 0,
    status: 'Active'
  });

  // Create Enquiry Form
  const [enquiryForm, setEnquiryForm] = useState({
    customer: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'UAE 🇦🇪',
    destination: 'Dubai, UAE',
    address: '',
    taxNumber: 'TRN 100234567890003',
    currency: 'USD',
    paymentTerms: 'Net 30',
    productName: 'Basmati Rice 1121',
    description: 'Premium long grain export grade, 25kg packaging',
    quantity: 50,
    unit: 'MT',
    unitPrice: 950,
    notes: 'All items inspected according to international export grade standards. Standard seaworthy export packaging.'
  });

  const showNotice = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 4500);
  };

  // Load backend data
  const load = async () => {
    try {
      const [custList, salesList, shpList] = await Promise.all([
        get('/customers').catch(() => []),
        get('/sales').catch(() => []),
        get('/shipments').catch(() => [])
      ]);

      if (custList && custList.length > 0) {
        // Deduplicate customers by normalized company name to avoid any replication
        const seenNames = new Set();
        const uniqueCusts = [];
        for (const c of custList) {
          const norm = (c.companyName || '').trim().toLowerCase();
          if (norm && !seenNames.has(norm)) {
            seenNames.add(norm);
            uniqueCusts.push(c);
          }
        }

        const mapped = uniqueCusts.map((c, idx) => ({
          ...c,
          customerId: c.customerId || `CUST-${101 + idx}`,
          avatar: c.companyName?.slice(0, 2).toUpperCase() || 'CU',
          avatarColor: idx % 4 === 0 ? 'purple' : idx % 4 === 1 ? 'coral' : idx % 4 === 2 ? 'blue' : 'teal',
          country: c.country?.includes('🇦🇪') || c.country === 'UAE' ? 'UAE 🇦🇪' :
                   c.country?.includes('🇳🇱') || c.country === 'Netherlands' ? 'Netherlands 🇳🇱' :
                   c.country?.includes('🇺🇸') || c.country === 'USA' ? 'USA 🇺🇸' :
                   c.country?.includes('🇯🇵') || c.country === 'Japan' ? 'Japan 🇯🇵' : (c.country || 'International 🌐'),
          outstandingBalance: c.outstandingBalance !== undefined ? c.outstandingBalance : (idx === 0 ? 35000 : idx === 3 ? 12500 : 0),
          status: c.status || 'Active'
        }));
        setCustomers(mapped);
        if (!selectedCustomer) {
          setSelectedCustomer(mapped[0]);
        } else {
          const match = mapped.find((m) => m._id === selectedCustomer._id || m.companyName?.trim().toLowerCase() === selectedCustomer.companyName?.trim().toLowerCase());
          if (match) setSelectedCustomer(match);
          else setSelectedCustomer(mapped[0]);
        }
      }

      if (salesList && salesList.length > 0) {
        setSalesData(salesList);
        setEnquiries(salesList.filter((s) => s.type === 'Enquiry'));
      }

      if (shpList && shpList.length > 0) {
        setBackendShipments(shpList);
      }
    } catch (e) {
      console.warn('Failed to load customers from backend, using defaults:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Handle Toggle Customer Status (Enquiry to Customer toggle)
  const handleToggleCustomerStatus = async (customer) => {
    if (!customer) return;
    const nextStatus = customer.status === 'Active' ? 'Inactive' : 'Active';
    const updated = { ...customer, status: nextStatus };

    // Update ONLY this specific customer by unique _id (never by customerId to prevent cross-customer replication)
    setCustomers((prev) =>
      prev.map((c) => (c._id === customer._id ? updated : c))
    );

    if (selectedCustomer && selectedCustomer._id === customer._id) {
      setSelectedCustomer(updated);
    }

    showNotice(
      `${customer.companyName} converted to ${nextStatus === 'Active' ? 'Customer (Total & Active Customers incremented)' : 'Enquiry Lead (Total & Active Customers decremented)'}.`
    );

    try {
      if (customer._id) {
        await put(`/customers/${customer._id}`, { status: nextStatus }).catch(() => null);
      }
    } catch (e) {
      console.warn('Failed to update customer status in backend:', e);
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = (customer) => {
    setIsEditingCustomer(true);
    setCustomerForm({
      _id: customer._id,
      customerId: customer.customerId || '',
      companyName: customer.companyName || '',
      contactPerson: customer.contactPerson || '',
      country: customer.country || 'UAE 🇦🇪',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      taxNumber: customer.taxNumber || '',
      currency: customer.currency || 'USD',
      paymentTerms: customer.paymentTerms || 'Net 30',
      outstandingBalance: customer.outstandingBalance || 0,
      status: customer.status || 'Active'
    });
    setCustomerModalOpen(true);
  };

  // Open Add Customer Modal
  const handleOpenAddCustomer = () => {
    setIsEditingCustomer(false);
    const nextId = `CUST-${101 + customers.length}`;
    setCustomerForm({
      customerId: nextId,
      companyName: '',
      contactPerson: '',
      country: 'UAE 🇦🇪',
      email: '',
      phone: '',
      address: '',
      taxNumber: 'TRN 100234567890003',
      currency: 'USD',
      paymentTerms: 'Net 30',
      outstandingBalance: 0,
      status: 'Active'
    });
    setCustomerModalOpen(true);
  };

  // Save Customer (Create or Update)
  const handleSaveCustomer = async (e) => {
    if (e) e.preventDefault();
    const name = customerForm.companyName.trim();
    if (!name) {
      alert('Please enter Company Name');
      return;
    }
    const normName = name.toLowerCase();

    try {
      if (isEditingCustomer && customerForm._id) {
        let updatedCust = { ...customerForm, companyName: name };
        try {
          const res = await put(`/customers/${customerForm._id}`, updatedCust);
          if (res) updatedCust = { ...updatedCust, ...res };
        } catch (err) {
          console.warn('Backend update customer failed, local fallback:', err);
        }

        setCustomers((prev) =>
          prev.map((c) => (c._id === customerForm._id ? { ...c, ...updatedCust } : c))
        );
        if (selectedCustomer?._id === customerForm._id) {
          setSelectedCustomer((prev) => ({ ...prev, ...updatedCust }));
        }
        showNotice(`Buyer ${name} updated successfully!`);
      } else {
        // Prevent duplicate creation: check if customer already exists by company name
        const existingCust = customers.find(
          (c) => c.companyName?.trim().toLowerCase() === normName
        );

        if (existingCust && existingCust._id) {
          const updatePayload = { ...existingCust, ...customerForm, companyName: name };
          const res = await put(`/customers/${existingCust._id}`, updatePayload).catch(() => null);
          const finalCust = res || updatePayload;
          setCustomers((prev) =>
            prev.map((c) => (c._id === existingCust._id ? finalCust : c))
          );
          setSelectedCustomer(finalCust);
          showNotice(`Buyer ${name} already exists and was updated.`);
          setCustomerModalOpen(false);
          return;
        }

        const newCustData = {
          ...customerForm,
          companyName: name,
          customerId: customerForm.customerId || `CUST-${101 + customers.length}`,
          avatar: name.slice(0, 2).toUpperCase(),
          avatarColor: 'purple'
        };

        let saved = newCustData;
        try {
          const res = await post('/customers', newCustData);
          if (res && res._id) saved = res;
        } catch (err) {
          console.warn('Backend create customer failed, local fallback:', err);
        }

        setCustomers((prev) => [
          saved,
          ...prev.filter((c) => c.companyName?.trim().toLowerCase() !== normName)
        ]);
        setSelectedCustomer(saved);
        showNotice(`New Buyer ${saved.companyName} registered successfully!`);
      }

      setCustomerModalOpen(false);
    } catch (err) {
      alert(err.message || 'Failed to save customer');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (customer) => {
    if (!customer) return;
    if (window.confirm(`Are you sure you want to delete ${customer.companyName}?`)) {
      try {
        if (customer._id) {
          await del(`/customers/${customer._id}`).catch(() => null);
        }
        setCustomers((prev) => prev.filter((c) => c._id !== customer._id));
        if (selectedCustomer?._id === customer._id) {
          setSelectedCustomer(customers.find((c) => c._id !== customer._id) || null);
        }
        showNotice(`Customer ${customer.companyName} removed.`);
      } catch (e) {
        alert('Failed to delete customer');
      }
    }
  };

  // Pre-fill enquiry form when selecting an existing customer
  const handleEnquiryCustomerChange = (val) => {
    const normVal = (val || '').trim().toLowerCase();
    const existing = customers.find((c) => c.companyName?.trim().toLowerCase() === normVal);
    if (existing) {
      setEnquiryForm((prev) => ({
        ...prev,
        customer: existing.companyName,
        contactPerson: existing.contactPerson || prev.contactPerson,
        email: existing.email || prev.email,
        phone: existing.phone || prev.phone,
        country: existing.country || prev.country,
        destination: existing.address || prev.destination,
        address: existing.address || prev.address,
        taxNumber: existing.taxNumber || prev.taxNumber,
        currency: existing.currency || prev.currency,
        paymentTerms: existing.paymentTerms || prev.paymentTerms
      }));
    } else {
      setEnquiryForm((prev) => ({ ...prev, customer: val }));
    }
  };

  // Save Enquiry Handler:
  // 1. Saves customer in Customer module (sets Active, increasing Active Customers card)
  // 2. Saves enquiry in Sales module (increasing Enquiries count)
  // 3. Generates quotation in Sales module
  // 4. Automatically displays official Quotation preview modal with print & convert options!
  const handleSaveEnquiry = async () => {
    const customer = (enquiryForm.customer || '').trim();
    if (!customer) {
      alert('Please enter or select a Buyer / Company Name');
      return;
    }
    const normCustomerName = customer.toLowerCase();

    const productName = (enquiryForm.productName || '').trim() || 'Basmati Rice 1121';
    const quantity = Math.max(1, Number(enquiryForm.quantity || 1));
    const unitPrice = Math.max(0, Number(enquiryForm.unitPrice || 0));
    const totalAmount = quantity * unitPrice;
    const enquiryNo = `ENQ-${1001 + enquiries.length + 1}`;
    const destination = enquiryForm.destination || enquiryForm.country || 'International Port';
    const country = enquiryForm.country || destination;
    const currency = enquiryForm.currency || globalCurrency || 'USD';

    // Step 1: Check existing customer strictly by normalized company name
    const existingCust = customers.find(
      (c) => c.companyName?.trim().toLowerCase() === normCustomerName
    );

    const customerPayload = {
      customerId: existingCust?.customerId || `CUST-${101 + customers.length}`,
      companyName: customer,
      contactPerson: enquiryForm.contactPerson || existingCust?.contactPerson || '',
      country: country || existingCust?.country || 'International 🌐',
      email: enquiryForm.email || existingCust?.email || '',
      phone: enquiryForm.phone || existingCust?.phone || '',
      address: enquiryForm.address || existingCust?.address || '',
      taxNumber: enquiryForm.taxNumber || existingCust?.taxNumber || 'TRN 100234567890003',
      currency: currency || existingCust?.currency || 'USD',
      paymentTerms: enquiryForm.paymentTerms || existingCust?.paymentTerms || 'Net 30',
      outstandingBalance: existingCust?.outstandingBalance || 0,
      status: 'Active'
    };

    let activeSavedCust = { ...customerPayload, _id: existingCust?._id || `cust-${Date.now()}` };
    try {
      if (existingCust && existingCust._id) {
        const res = await put(`/customers/${existingCust._id}`, customerPayload).catch(() => null);
        if (res) activeSavedCust = res;
      } else {
        const res = await post('/customers', customerPayload).catch(() => null);
        if (res && res._id) activeSavedCust = res;
      }
    } catch (custErr) {
      console.warn('Customer auto-save warning:', custErr);
    }

    // Update customers state cleanly without any duplicates:
    setCustomers((prev) => {
      const remaining = prev.filter(
        (c) => c._id !== activeSavedCust._id && c.companyName?.trim().toLowerCase() !== normCustomerName
      );
      return [{ ...activeSavedCust, status: 'Active' }, ...remaining];
    });
    setSelectedCustomer({ ...activeSavedCust, status: 'Active' });

    // Step 2: Save Enquiry in /sales
    const newEnquiryPayload = {
      type: 'Enquiry',
      enquiryNo,
      customer,
      contactPerson: enquiryForm.contactPerson || '',
      email: enquiryForm.email || '',
      phone: enquiryForm.phone || '',
      address: enquiryForm.address || '',
      country,
      destination,
      currency,
      paymentTerms: enquiryForm.paymentTerms || 'Net 30',
      notes: enquiryForm.notes || '',
      products: [
        {
          name: productName,
          description: enquiryForm.description || '',
          quantity,
          unit: enquiryForm.unit || 'MT',
          unitPrice,
          total: totalAmount
        }
      ],
      totalAmount,
      status: 'Open'
    };

    try {
      const res = await post('/sales', newEnquiryPayload).catch(() => null);
      if (res && res._id) {
        setEnquiries((prev) => [res, ...prev]);
      } else {
        setEnquiries((prev) => [newEnquiryPayload, ...prev]);
      }
    } catch (enqErr) {
      setEnquiries((prev) => [newEnquiryPayload, ...prev]);
    }

    // Step 3: Automatically generate Quotation
    const today = new Date().toISOString().slice(0, 10);
    const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const autoQuotationNo = `QUO-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;

    const quotationItems = [
      {
        name: productName,
        description: enquiryForm.description || 'Standard export specification',
        quantity,
        unit: enquiryForm.unit || 'MT',
        unitPrice,
        discount: 0,
        discountType: 'percent',
        taxRate: 0,
        taxAmount: 0,
        lineTotal: totalAmount
      }
    ];

    const quotationPayload = {
      quotationNo: autoQuotationNo,
      quotationDate: today,
      validUntil: in30Days,
      customer,
      companyName: customer,
      contactPerson: enquiryForm.contactPerson || '',
      email: enquiryForm.email || '',
      phone: enquiryForm.phone || '',
      address: enquiryForm.address || '',
      destination,
      currency,
      incoterm: 'CIF',
      shippingCharges: 0,
      paymentTerms: enquiryForm.paymentTerms || 'Net 30',
      deliveryTerms: 'CIF Destination Port',
      notes: enquiryForm.notes || 'All items inspected according to international export grade standards. Standard seaworthy export packaging.',
      termsAndConditions: '1. Prices valid until expiry date.\n2. Payment terms as agreed.\n3. Goods dispatch within 14 business days from order confirmation.',
      status: 'Draft',
      enquiryNo,
      items: quotationItems,
      subtotal: totalAmount,
      totalDiscount: 0,
      taxableAmount: totalAmount,
      taxTotal: 0,
      grandTotal: totalAmount
    };

    let savedQuotation = quotationPayload;
    try {
      const qRes = await createQuotation(quotationPayload).catch(() => null);
      if (qRes && (qRes._id || qRes.quotationNo)) {
        savedQuotation = qRes;
      }
    } catch (qErr) {
      console.warn('Backend save quotation warning:', qErr);
    }

    // Close enquiry modal
    setEnquiryModalOpen(false);

    showNotice(
      `Enquiry ${enquiryNo} saved! Buyer registered as Active Customer. Quotation ${autoQuotationNo} generated.`
    );

    // Step 4: Automatically show the official Quotation document preview layout!
    setPreviewDocModal({
      ...savedQuotation,
      type: 'Quotation',
      items: quotationItems,
      customer,
      contactPerson: enquiryForm.contactPerson,
      email: enquiryForm.email,
      address: enquiryForm.address,
      destination,
      currency,
      grandTotal: totalAmount
    });
  };

  // Print Quotation on the same page matching preview layout
  const handlePrintDocument = () => {
    document.body.classList.add('printing-quotation-mode');
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'visible';

    window.print();

    setTimeout(() => {
      document.body.classList.remove('printing-quotation-mode');
      document.body.style.overflow = originalOverflow;
    }, 1000);
  };

  // Convert Quotation to Order
  const handleConvertQuotation = async (quotation) => {
    if (!quotation) return;
    const qNo = quotation.quotationNo || 'Quotation';
    if (!window.confirm(`Convert Quotation ${qNo} to a Confirmed Sales Order?`)) {
      return;
    }
    try {
      const targetId = quotation._id || quotation.quotationNo;
      await convertQuotationToOrder(targetId, quotation).catch(() => null);
      showNotice(`Quotation ${qNo} successfully converted to Confirmed Sales Order!`);
      setPreviewDocModal(null);
      // Switch to Orders tab in selected customer profile
      setDrawerTab('Orders');
      load();
    } catch (err) {
      alert(err.message || 'Failed to convert quotation');
    }
  };

  // Calculate Metrics dynamically reacting to Enquiry to Customer toggle
  const activeCustomersCount = customers.filter((c) => c.status === 'Active').length;
  const enquiryLeadsCount = customers.filter((c) => c.status !== 'Active').length;
  // Total Customers dynamically reflects all active converted customers
  const totalCustomersCount = activeCustomersCount;
  const enquiriesCount = (salesData.filter((s) => s.type === 'Enquiry').length || enquiries.length || 7) + enquiryLeadsCount;
  const totalOutstandingBalance = customers
    .filter((c) => c.status === 'Active')
    .reduce((sum, c) => sum + Number(c.outstandingBalance || 0), 0);

  // Filtered customer rows
  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase();
      const matchSearch =
        !search ||
        c.companyName?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.customerId?.toLowerCase().includes(q);

      const matchCountry = !countryFilter || c.country?.toLowerCase().includes(countryFilter.toLowerCase());
      const matchStatus = !statusFilter || c.status === statusFilter;
      return matchSearch && matchCountry && matchStatus;
    });
  }, [customers, search, countryFilter, statusFilter]);

  // Resolve related commercial enquiries for selected customer
  const relatedEnquiries = useMemo(() => {
    if (!selectedCustomer) return [];
    const fromCustObj = selectedCustomer.enquiries || [];
    const fromSales = salesData.filter(
      (s) =>
        s.type === 'Enquiry' &&
        (s.customer?.trim().toLowerCase() === selectedCustomer.companyName?.trim().toLowerCase() ||
          s.customerId === selectedCustomer.customerId)
    );
    const map = new Map();
    [...fromCustObj, ...fromSales].forEach((e) => {
      const key = e.enquiryNo || e._id;
      if (key && !map.has(key)) map.set(key, e);
    });
    return Array.from(map.values());
  }, [selectedCustomer, salesData]);

  // Resolve related orders for selected customer
  const relatedOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    const fromSales = salesData.filter(
      (s) =>
        s.type === 'Sales Order' &&
        (s.customer?.trim().toLowerCase() === selectedCustomer.companyName?.trim().toLowerCase() ||
          s.customerId === selectedCustomer.customerId)
    );
    const mockList = defaultCustomerOrders[selectedCustomer.companyName] || [];
    return fromSales.length > 0 ? fromSales : mockList;
  }, [selectedCustomer, salesData]);

  // Resolve related invoices for selected customer
  const relatedInvoices = useMemo(() => {
    if (!selectedCustomer) return [];
    const mockList = defaultCustomerInvoices[selectedCustomer.companyName] || [
      {
        invoiceNo: `INV-${300 + Math.floor(Math.random() * 50)}`,
        date: '2026-09-20',
        dueDate: '2026-10-20',
        amount: Number(selectedCustomer.outstandingBalance || 25000),
        due: Number(selectedCustomer.outstandingBalance || 25000),
        status: selectedCustomer.outstandingBalance > 0 ? 'Due' : 'Paid'
      }
    ];
    return mockList;
  }, [selectedCustomer]);

  // Resolve related payments for selected customer
  const relatedPayments = useMemo(() => {
    if (!selectedCustomer) return [];
    const mockList = defaultCustomerPayments[selectedCustomer.companyName] || [
      {
        receiptNo: `REC-${400 + Math.floor(Math.random() * 50)}`,
        date: '2026-09-18',
        amount: 15000,
        mode: 'Swift / Wire Transfer',
        ref: 'SWIFT-TXN-88129',
        status: 'Cleared'
      }
    ];
    return mockList;
  }, [selectedCustomer]);

  // Resolve related shipments for selected customer
  const relatedShipments = useMemo(() => {
    if (!selectedCustomer) return [];
    const fromBackend = backendShipments.filter(
      (s) => s.customer?.trim().toLowerCase() === selectedCustomer.companyName?.trim().toLowerCase()
    );
    const mockList = defaultCustomerShipments[selectedCustomer.companyName] || [];
    return fromBackend.length > 0 ? fromBackend : mockList;
  }, [selectedCustomer, backendShipments]);

  return (
    <div className="customers-page">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          style={{
            background: notification.isErr ? '#ffe4e2' : '#dff5eb',
            color: notification.isErr ? '#c44d4d' : '#107b5c',
            padding: '10px 18px',
            borderRadius: '10px',
            marginBottom: '18px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '13px',
            border: `1.5px solid ${notification.isErr ? '#f5c6cb' : '#b2e2cd'}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
          }}
        >
          <Sparkles size={16} /> {notification.msg}
        </div>
      )}

      {/* Header matching PDF Page 2 & Customer Module */}
      <div className="dash-head">
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 4px', color: '#1e1e2d' }}>
            Customers & Buyers
          </h1>
          <p style={{ margin: 0, color: '#7e8299', fontSize: '13.5px' }}>
            Manage international buyer relationships, credit terms, and track linked orders, invoices, payments & shipments
          </p>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#0c5a48',
            background: '#eaf6f2',
            padding: '6px 14px',
            borderRadius: '8px',
            fontWeight: 600,
            border: '1px solid #c2e5dc',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <CheckCircle2 size={14} /> Created via Enquiries
        </div>
      </div>

      {/* 4 Summary KPI Cards linked dynamically to Customers & Toggle button */}
      <div className="stats module-stats" style={{ marginBottom: '22px' }}>
        <StatCard
          icon={Users}
          label="Total Customers"
          value={String(totalCustomersCount)}
          note="Registered international buyers"
          tone="purple"
        />
        <StatCard
          icon={CheckCircle2}
          label="Active Customers"
          value={String(activeCustomersCount)}
          note="Ready for trade · Increases via toggle"
          tone="green"
        />
        <StatCard
          icon={ClipboardList}
          label="Enquiries Received"
          value={String(enquiriesCount)}
          note="Direct buyer commercial inquiries"
          tone="orange"
        />
        <StatCard
          icon={DollarSign}
          label="Total Receivables"
          value={`$${Number(totalOutstandingBalance).toLocaleString()}`}
          note="Outstanding buyer balances"
          tone="blue"
        />
      </div>

      {/* Filter Toolbar matching PDF Page 2 */}
      <div className="filter-toolbar">
        <div className="global-search filter-search" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '20px' }}>
          <Search size={16} style={{ color: '#0c5a48', flexShrink: 0 }} />
          <input
            placeholder="Search company, contact person, country or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#8fa4a8',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="pill-select-wrap">
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="pill-select"
          >
            <option value="">All Countries</option>
            <option value="UAE">UAE 🇦🇪</option>
            <option value="Netherlands">Netherlands 🇳🇱</option>
            <option value="USA">USA 🇺🇸</option>
            <option value="Japan">Japan 🇯🇵</option>
          </select>
          <ChevronDown size={14} className="pill-select-arrow" />
        </div>

        <div className="pill-select-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pill-select"
          >
            <option value="">All Statuses</option>
            <option value="Active">Status: Active</option>
            <option value="Inactive">Status: Inactive</option>
          </select>
          <ChevronDown size={14} className="pill-select-arrow" />
        </div>
      </div>

      {/* Split Screen Layout matching PDF Page 2 */}
      <div className="customer-page-layout">
        {/* Main Customers Table */}
        <div
          className="customer-main-table panel"
          style={{
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            padding: '22px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
          }}
        >
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>COMPANY & BUYER</th>
                  <th>COUNTRY</th>
                  <th>CONTACT PERSON</th>
                  <th>CURRENCY</th>
                  <th>PAY TERMS</th>
                  <th>OUTSTANDING</th>
                  <th style={{ textAlign: 'center' }}>ENQUIRY TO CUSTOMER (STATUS)</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#889fa4' }}>
                      No customers found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((c) => {
                    const isSelected = selectedCustomer?._id === c._id;
                    const isActive = c.status === 'Active';
                    return (
                      <tr
                        key={c._id || c.customerId}
                        style={{
                          background: isSelected ? '#fbfbfe' : 'transparent',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onClick={() => setSelectedCustomer(c)}
                      >
                        <td>
                          <strong style={{ color: '#1e1e2d', fontSize: '12.5px' }}>{c.customerId}</strong>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span className={`avatar-tag ${c.avatarColor || 'purple'}`}>
                              {c.avatar || c.companyName.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <strong style={{ fontSize: '13px', color: '#1e1e2d', display: 'block' }}>
                                {c.companyName}
                              </strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                                <span style={{ fontSize: '11px', color: '#7e8299' }}>{c.email || '—'}</span>
                                {(() => {
                                  const enqCount = (c.enquiries?.length) || salesData.filter(s => s.type === 'Enquiry' && (s.customer?.trim().toLowerCase() === c.companyName?.trim().toLowerCase())).length;
                                  if (enqCount > 0) {
                                    return (
                                      <span
                                        style={{
                                          fontSize: '10px',
                                          fontWeight: 700,
                                          padding: '1px 6px',
                                          borderRadius: '999px',
                                          background: '#edf7f4',
                                          color: '#0c5a48',
                                          border: '1px solid #c2e5dc'
                                        }}
                                        title={`${enqCount} enquiry record(s) linked to this customer`}
                                      >
                                        {enqCount} {enqCount === 1 ? 'Enquiry' : 'Enquiries'}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>{c.country}</td>
                        <td>{c.contactPerson || '—'}</td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#4b5563' }}>{c.currency || 'USD'}</span>
                        </td>
                        <td>{c.paymentTerms || 'Net 30'}</td>
                        <td>
                          <strong style={{ color: c.outstandingBalance > 0 ? '#ca8a04' : '#1e1e2d', fontSize: '13px' }}>
                            {resolveCurrencySymbol(c.currency)}{Number(c.outstandingBalance || 0).toLocaleString()}
                          </strong>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '8px'
                            }}
                            onClick={(e) => e.stopPropagation()}
                            title={isActive ? 'Active Customer (Click to revert to Enquiry Lead)' : 'Enquiry Lead (Click to promote to Customer)'}
                          >
                            <label className="switch-control table-switch" style={{ margin: 0 }}>
                              <input
                                type="checkbox"
                                className="switch-input"
                                checked={isActive}
                                onChange={() => handleToggleCustomerStatus(c)}
                              />
                              <span className="switch-slider" />
                            </label>
                            <span
                              style={{
                                fontSize: '11.5px',
                                fontWeight: 700,
                                color: isActive ? '#0c5a48' : '#ca8a04',
                                minWidth: '65px',
                                textAlign: 'left'
                              }}
                            >
                              {isActive ? 'Customer' : 'Enquiry'}
                            </span>
                          </div>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              className="small-btn"
                              title="Edit Buyer Information"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditCustomer(c);
                              }}
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              className={isSelected ? 'btn-purple' : 'tab-pill'}
                              style={{ padding: '5px 12px', fontSize: '11.5px', borderRadius: '14px' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(c);
                              }}
                            >
                              View Profile
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

        {/* Selected Customer Side Drawer with 5 Connected Tabs */}
        {selectedCustomer && (
          <div className="customer-drawer" style={{ width: '400px', minWidth: '380px' }}>
            <div className="customer-drawer-head">
              <div className="customer-drawer-avatar">
                {selectedCustomer.avatar || selectedCustomer.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div className="customer-drawer-title" style={{ flex: 1, minWidth: 0 }}>
                <h3 style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  {selectedCustomer.companyName}
                </h3>
                <div className="meta-sub">
                  <span>{selectedCustomer.customerId}</span>
                  <span>•</span>
                  <span>{selectedCustomer.country}</span>
                  <span>•</span>
                  <span style={{ color: selectedCustomer.status === 'Active' ? '#10b981' : '#ca8a04', fontWeight: 700 }}>
                    {selectedCustomer.status === 'Active' ? '🟢 Active Customer' : '📋 Enquiry Lead'}
                  </span>
                </div>
              </div>
              <button
                className="customer-drawer-close"
                onClick={() => setSelectedCustomer(null)}
                title="Close Drawer"
              >
                ×
              </button>
            </div>

            {/* 5 Connected Tabs: Details, Orders, Invoices, Payments, Shipments */}
            <div
              className="customer-drawer-tabs"
              style={{
                display: 'flex',
                gap: '4px',
                background: '#f1f5f9',
                padding: '4px',
                borderRadius: '10px',
                marginBottom: '16px',
                overflowX: 'auto'
              }}
            >
              <button
                className={`customer-drawer-tab ${drawerTab === 'Details' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Details')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Details
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Enquiries' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Enquiries')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Enquiries ({relatedEnquiries.length})
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Orders' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Orders')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Orders ({relatedOrders.length})
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Invoices' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Invoices')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Invoices ({relatedInvoices.length})
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Payments' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Payments')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Payments ({relatedPayments.length})
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Shipments' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Shipments')}
                style={{ padding: '6px 8px', fontSize: '11.5px' }}
              >
                Shipments ({relatedShipments.length})
              </button>
            </div>

            {/* TAB 1: DETAILS */}
            {drawerTab === 'Details' && (
              <div className="customer-tab-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Buyer Information
                  </span>
                  <button
                    className="small-btn"
                    onClick={() => handleOpenEditCustomer(selectedCustomer)}
                    style={{ fontSize: '11.5px', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit2 size={12} /> Edit Profile
                  </button>
                </div>

                <div className="customer-field-group">
                  <label>Contact person</label>
                  <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Users size={14} color="#0c5a48" /> {selectedCustomer.contactPerson || 'Ahmed Ali'}
                  </div>
                </div>

                <div className="customer-field-group">
                  <label>Email Address</label>
                  <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Mail size={14} color="#0c5a48" /> {selectedCustomer.email || 'purchasing@buyer.com'}
                  </div>
                </div>

                <div className="customer-field-group">
                  <label>Phone Number</label>
                  <div className="value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={14} color="#0c5a48" /> {selectedCustomer.phone || '+971 50 123 4567'}
                  </div>
                </div>

                <div className="customer-field-group">
                  <label>Full Delivery / Billing Address</label>
                  <div className="value" style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <MapPin size={14} color="#0c5a48" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>{selectedCustomer.address || 'Office 402, Business Bay, Dubai, UAE'}</span>
                  </div>
                </div>

                <div className="customer-field-group">
                  <label>Tax / TRN Registration ID</label>
                  <div className="value">{selectedCustomer.taxNumber || 'TRN 100234567890003'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="customer-field-group">
                    <label>Currency</label>
                    <div className="value" style={{ fontWeight: 700, color: '#0c5a48' }}>
                      {selectedCustomer.currency || 'USD'}
                    </div>
                  </div>
                  <div className="customer-field-group">
                    <label>Payment terms</label>
                    <div className="value">{selectedCustomer.paymentTerms || 'Net 30'}</div>
                  </div>
                </div>

                <div className="customer-balance-box">
                  <div>
                    <span>Outstanding balance</span>
                    <small style={{ display: 'block', fontSize: '11px', color: '#a16207' }}>
                      Pending across commercial invoices
                    </small>
                  </div>
                  <strong>
                    {resolveCurrencySymbol(selectedCustomer.currency)}
                    {Number(selectedCustomer.outstandingBalance || 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            )}

            {/* TAB: RELATED ENQUIRIES */}
            {drawerTab === 'Enquiries' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Commercial Enquiries ({relatedEnquiries.length})
                  </span>
                </div>

                {relatedEnquiries.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 12px', color: '#94a3b8' }}>
                    <ClipboardList size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No enquiries recorded yet for this buyer.</p>
                  </div>
                ) : (
                  relatedEnquiries.map((enq, idx) => (
                    <div
                      key={enq.enquiryNo || enq._id || idx}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        marginBottom: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0c5a48', fontSize: '13px' }}>{enq.enquiryNo}</strong>
                        <span
                          style={{
                            padding: '2px 8px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: '#e0f2fe',
                            color: '#0369a1'
                          }}
                        >
                          {enq.status || 'Open'}
                        </span>
                      </div>
                      <div style={{ color: '#1e293b', fontWeight: 600, fontSize: '12px', marginTop: '6px' }}>
                        {enq.products?.[0]?.name || 'Commercial Consignment'}
                        {enq.products?.[0]?.quantity ? ` · ${enq.products[0].quantity} ${enq.products[0].unit || 'MT'}` : ''}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '11px', marginTop: '6px' }}>
                        <span>Destination: {enq.destination || selectedCustomer.country}</span>
                        <strong style={{ color: '#0c5a48' }}>
                          {resolveCurrencySymbol(enq.currency || selectedCustomer.currency)}
                          {Number(enq.totalAmount || enq.products?.[0]?.total || 0).toLocaleString()}
                        </strong>
                      </div>
                      {enq.notes && (
                        <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', fontStyle: 'italic', background: '#ffffff', padding: '6px 8px', borderRadius: '6px', border: '1px solid #eef2f6' }}>
                          "{enq.notes}"
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 2: RELATED ORDERS */}
            {drawerTab === 'Orders' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Commercial Orders ({relatedOrders.length})
                  </span>
                </div>

                {relatedOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 12px', color: '#94a3b8' }}>
                    <ClipboardList size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No orders recorded yet for this buyer.</p>
                  </div>
                ) : (
                  relatedOrders.map((ord, idx) => (
                    <div
                      key={ord._id || ord.orderNo || idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0c5a48', fontSize: '13px' }}>{ord.orderNo}</strong>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background: ord.status === 'Completed' || ord.status === 'Delivered' ? '#dcfce7' : '#e0e7ff',
                            color: ord.status === 'Completed' || ord.status === 'Delivered' ? '#15803d' : '#3730a3'
                          }}
                        >
                          {ord.status || ord.stage || 'Confirmed'}
                        </span>
                      </div>
                      <div style={{ color: '#4b5563', marginTop: '4px', fontSize: '11.5px' }}>
                        {ord.items || ord.products?.[0]?.name || 'Commercial export consignment'}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          color: '#64748b',
                          marginTop: '6px',
                          borderTop: '1px dashed #e2e8f0',
                          paddingTop: '6px'
                        }}
                      >
                        <span>
                          Value: <strong>{resolveCurrencySymbol(selectedCustomer.currency)}{Number(ord.total || ord.totalAmount || 0).toLocaleString()}</strong>
                        </span>
                        <span>
                          Advance: <strong style={{ color: '#16a34a' }}>{resolveCurrencySymbol(selectedCustomer.currency)}{Number(ord.advance || ord.advanceReceived || 0).toLocaleString()}</strong>
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 3: RELATED INVOICES */}
            {drawerTab === 'Invoices' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Commercial Invoices ({relatedInvoices.length})
                  </span>
                </div>

                {relatedInvoices.map((inv, idx) => (
                  <div
                    key={inv.invoiceNo || idx}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '8px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#1e1e2d', fontSize: '12.5px' }}>{inv.invoiceNo}</strong>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 7px',
                          borderRadius: '10px',
                          background: inv.status === 'Paid' ? '#dcfce7' : inv.status === 'Due' ? '#fee2e2' : '#fef3c7',
                          color: inv.status === 'Paid' ? '#16a34a' : inv.status === 'Due' ? '#b91c1c' : '#d97706'
                        }}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '5px', fontSize: '11px' }}>
                      <span>Issued: {inv.date}</span>
                      <span>Due Date: {inv.dueDate}</span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '6px',
                        borderTop: '1px dashed #e2e8f0',
                        paddingTop: '6px'
                      }}
                    >
                      <span>
                        Total: <strong>{resolveCurrencySymbol(selectedCustomer.currency)}{Number(inv.amount || 0).toLocaleString()}</strong>
                      </span>
                      <span>
                        Due: <strong style={{ color: inv.due > 0 ? '#ca8a04' : '#16a34a' }}>{resolveCurrencySymbol(selectedCustomer.currency)}{Number(inv.due || 0).toLocaleString()}</strong>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: RELATED PAYMENTS */}
            {drawerTab === 'Payments' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Payment Receipts & Ledger ({relatedPayments.length})
                  </span>
                </div>

                {relatedPayments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8' }}>
                    <CreditCard size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No payments registered for this buyer yet.</p>
                  </div>
                ) : (
                  relatedPayments.map((pay, idx) => (
                    <div
                      key={pay.receiptNo || idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#0c5a48', fontSize: '12.5px' }}>{pay.receiptNo}</strong>
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                          +{resolveCurrencySymbol(selectedCustomer.currency)}{Number(pay.amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '4px', fontSize: '11px' }}>
                        <span>{pay.mode}</span>
                        <span>{pay.date}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '10.5px', marginTop: '3px' }}>
                        Ref: {pay.ref} • Status: <strong style={{ color: '#15803d' }}>{pay.status}</strong>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: RELATED SHIPMENTS */}
            {drawerTab === 'Shipments' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Export Cargo Shipments ({relatedShipments.length})
                  </span>
                  <button
                    className="small-btn"
                    onClick={() => navigate('/shipments')}
                    style={{ fontSize: '11px', padding: '2px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                  >
                    View All <ExternalLink size={10} />
                  </button>
                </div>

                {relatedShipments.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#94a3b8' }}>
                    <Truck size={28} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                    <p style={{ margin: 0 }}>No active cargo shipments for this buyer.</p>
                  </div>
                ) : (
                  relatedShipments.map((shp, idx) => (
                    <div
                      key={shp.shipmentNo || idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        marginBottom: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '14px' }}>{shp.transportMode === 'Air' ? '✈️' : '🚢'}</span>
                          <strong style={{ color: '#0c5a48', fontSize: '12.5px' }}>{shp.shipmentNo}</strong>
                        </div>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: 700,
                            padding: '2px 7px',
                            borderRadius: '10px',
                            background: shp.status === 'Delivered' ? '#dcfce7' : '#e0f2fe',
                            color: shp.status === 'Delivered' ? '#15803d' : '#0369a1'
                          }}
                        >
                          {shp.status}
                        </span>
                      </div>
                      <div style={{ color: '#4b5563', marginTop: '4px', fontSize: '11.5px' }}>
                        Carrier: {shp.carrier || 'Ocean Line'} • Container: {shp.containerNo || '—'}
                      </div>
                      <div style={{ color: '#64748b', fontSize: '11px', marginTop: '3px' }}>
                        Route: {shp.route || `${shp.origin || 'Port'} ➔ ${shp.destination || 'Port'}`}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: '10.5px', marginTop: '5px' }}>
                        <span>ETD: {shp.etd || '—'}</span>
                        <span>ETA: {shp.eta || '—'}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================
          MODAL 1: ADD / EDIT CUSTOMER MODAL
          Manage buyer/company information such as company name, contact person, country, email, phone, address, currency, and payment terms
          ========================================================= */}
      {customerModalOpen && (
        <Modal
          eyebrow="BUYER RELATIONSHIP MANAGEMENT"
          title={isEditingCustomer ? `Edit Buyer: ${customerForm.companyName}` : 'Add New International Buyer'}
          onClose={() => setCustomerModalOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
              {isEditingCustomer && customerForm._id ? (
                <button
                  type="button"
                  style={{ background: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '12px' }}
                  onClick={() => {
                    handleDeleteCustomer(customerForm);
                    setCustomerModalOpen(false);
                  }}
                >
                  Delete Buyer
                </button>
              ) : <div />}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" className="secondary" onClick={() => setCustomerModalOpen(false)}>
                  Cancel
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleSaveCustomer}
                  style={{ padding: '8px 22px', fontWeight: 700 }}
                >
                  {isEditingCustomer ? 'Save Changes' : 'Register Customer'}
                </button>
              </div>
            </div>
          }
        >
          <form onSubmit={handleSaveCustomer}>
            <div className="form-grid">
              <div className="field">
                <label>Company / Buyer Name *</label>
                <input
                  value={customerForm.companyName}
                  onChange={(e) => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                  placeholder="e.g. ABC Trading LLC"
                  required
                />
              </div>

              <div className="field">
                <label>Contact Person</label>
                <input
                  value={customerForm.contactPerson}
                  onChange={(e) => setCustomerForm({ ...customerForm, contactPerson: e.target.value })}
                  placeholder="e.g. Ahmed Ali"
                />
              </div>

              <div className="field">
                <label>Country *</label>
                <input
                  value={customerForm.country}
                  onChange={(e) => setCustomerForm({ ...customerForm, country: e.target.value })}
                  placeholder="e.g. UAE 🇦🇪, Netherlands 🇳🇱"
                  required
                />
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="e.g. purchasing@buyer.ae"
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  value={customerForm.phone}
                  onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                  placeholder="e.g. +971 50 123 4567"
                />
              </div>

              <div className="field">
                <label>Tax / TRN Registration Number</label>
                <input
                  value={customerForm.taxNumber}
                  onChange={(e) => setCustomerForm({ ...customerForm, taxNumber: e.target.value })}
                  placeholder="e.g. TRN 100234567890003"
                />
              </div>

              <div className="field full">
                <label>Full Physical & Delivery Address</label>
                <textarea
                  rows="2"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="e.g. Office 402, Business Bay, Dubai, United Arab Emirates"
                />
              </div>

              <div className="field">
                <label>Preferred Currency</label>
                <select
                  value={customerForm.currency}
                  onChange={(e) => setCustomerForm({ ...customerForm, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>

              <div className="field">
                <label>Agreed Payment Terms</label>
                <select
                  value={customerForm.paymentTerms}
                  onChange={(e) => setCustomerForm({ ...customerForm, paymentTerms: e.target.value })}
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Advance">100% Advance</option>
                  <option value="30% Adv + 70% B/L">30% Adv + 70% against B/L Copy</option>
                  <option value="LC at Sight">Letter of Credit (LC at Sight)</option>
                  <option value="CAD">Cash Against Documents (CAD)</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>

              <div className="field">
                <label>Customer Status</label>
                <select
                  value={customerForm.status}
                  onChange={(e) => setCustomerForm({ ...customerForm, status: e.target.value })}
                >
                  <option value="Active">Active (Ready for Orders)</option>
                  <option value="Inactive">Inactive / Lead</option>
                </select>
              </div>

              <div className="field">
                <label>Outstanding Balance</label>
                <input
                  type="number"
                  value={customerForm.outstandingBalance}
                  onChange={(e) => setCustomerForm({ ...customerForm, outstandingBalance: Number(e.target.value || 0) })}
                  placeholder="0"
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================
          MODAL 2: CREATE CUSTOMER ENQUIRY MODAL (Customer Module)
          Auto-saves Customer into Customers module, increments Active Customer card, generates quotation, and displays quotation preview layout!
          ========================================================= */}
      {enquiryModalOpen && (
        <Modal
          eyebrow="COMMERCIAL WORKFLOW — CUSTOMER MODULE"
          title="Create Customer Enquiry"
          onClose={() => setEnquiryModalOpen(false)}
          large
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <button type="button" className="secondary" onClick={() => setEnquiryModalOpen(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="primary"
                onClick={handleSaveEnquiry}
                title="Save enquiry, auto-register customer, and show official Quotation layout"
                style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 700 }}
              >
                <Plus size={16} /> Save Enquiry & Generate Quote
              </button>
            </div>
          }
        >
          <form id="customer-enquiry-form" onSubmit={(e) => { e.preventDefault(); handleSaveEnquiry(); }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e1e2d', fontWeight: 700, borderBottom: '1px solid #f0f2f5', paddingBottom: '6px' }}>
              1. Customer / Buyer Details
            </h4>
            <div className="form-grid" style={{ marginBottom: '18px' }}>
              <div className="field">
                <label>Customer / Buyer Company *</label>
                <input
                  list="existing-customers-list"
                  placeholder="Type new company or select existing..."
                  value={enquiryForm.customer}
                  onChange={(e) => handleEnquiryCustomerChange(e.target.value)}
                  required
                />
                <datalist id="existing-customers-list">
                  {customers.map((c) => (
                    <option key={c._id || c.customerId} value={c.companyName} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label>Contact Person</label>
                <input
                  placeholder="Buyer representative name"
                  value={enquiryForm.contactPerson}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, contactPerson: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="purchasing@company.com"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, email: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Phone / WhatsApp</label>
                <input
                  placeholder="+971 50 123 4567"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, phone: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Destination Country / Port</label>
                <input
                  placeholder="e.g. Dubai, UAE"
                  value={enquiryForm.country}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, country: e.target.value, destination: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Billing & Delivery Address</label>
                <input
                  placeholder="Office address, city, country"
                  value={enquiryForm.address}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, address: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Tax / TRN Registration ID</label>
                <input
                  placeholder="TRN number"
                  value={enquiryForm.taxNumber}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, taxNumber: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Preferred Currency</label>
                <select
                  value={enquiryForm.currency}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, currency: e.target.value })}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="INR">INR (₹)</option>
                  <option value="AED">AED</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e1e2d', fontWeight: 700, borderBottom: '1px solid #f0f2f5', paddingBottom: '6px' }}>
              2. Products & Specifications
            </h4>
            <div className="form-grid" style={{ marginBottom: '18px' }}>
              <div className="field">
                <label>Product Name *</label>
                <input
                  placeholder="e.g. Basmati Rice 1121"
                  value={enquiryForm.productName}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, productName: e.target.value })}
                  required
                />
              </div>

              <div className="field">
                <label>Specification / Grade</label>
                <input
                  placeholder="Grade, mesh, packaging specs..."
                  value={enquiryForm.description}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, description: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Quantity *</label>
                <input
                  type="number"
                  min="1"
                  value={enquiryForm.quantity}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, quantity: Number(e.target.value || 1) })}
                  required
                />
              </div>

              <div className="field">
                <label>Unit of Measure</label>
                <select
                  value={enquiryForm.unit}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, unit: e.target.value })}
                >
                  <option value="MT">MT (Metric Tons)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="Bags">Bags (25/50kg)</option>
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="Containers">Containers (20/40ft)</option>
                </select>
              </div>

              <div className="field">
                <label>Target Unit Price ({resolveCurrencySymbol(enquiryForm.currency)})</label>
                <input
                  type="number"
                  step="0.01"
                  value={enquiryForm.unitPrice}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, unitPrice: Number(e.target.value || 0) })}
                />
              </div>

              <div className="field">
                <label>Total Estimate Amount</label>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontWeight: 800, color: '#0c5a48', fontSize: '15px' }}>
                  {resolveCurrencySymbol(enquiryForm.currency)}{Number((enquiryForm.quantity || 1) * (enquiryForm.unitPrice || 0)).toLocaleString()}
                </div>
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e1e2d', fontWeight: 700, borderBottom: '1px solid #f0f2f5', paddingBottom: '6px' }}>
              3. Commercial Terms & Notes
            </h4>
            <div className="form-grid">
              <div className="field">
                <label>Agreed Payment Terms</label>
                <select
                  value={enquiryForm.paymentTerms}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, paymentTerms: e.target.value })}
                >
                  <option value="Net 30">Net 30</option>
                  <option value="Advance">100% Advance</option>
                  <option value="30% Adv + 70% B/L">30% Adv + 70% against B/L Copy</option>
                  <option value="LC at Sight">Letter of Credit (LC at Sight)</option>
                  <option value="CAD">Cash Against Documents (CAD)</option>
                </select>
              </div>

              <div className="field">
                <label>Delivery Terms (Incoterm)</label>
                <input value="CIF Destination Port" readOnly style={{ background: '#f8fafc' }} />
              </div>

              <div className="field full">
                <label>Notes & Export Inspection Instructions</label>
                <textarea
                  rows="2"
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm({ ...enquiryForm, notes: e.target.value })}
                  placeholder="Special buyer notes, packaging requirements, certificates..."
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================
          MODAL 3: OFFICIAL QUOTATION LAYOUT PREVIEW MODAL
          Matches official quotation document layout with same-page Print, Download PDF, and Convert to Sales Order
          ========================================================= */}
      {previewDocModal && (
        <Modal
          eyebrow="COMMERCIAL DOCUMENT"
          title={`Quotation Preview: ${previewDocModal.quotationNo || 'QUO-2026'}`}
          onClose={() => setPreviewDocModal(null)}
          large
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <button
                type="button"
                className="secondary"
                onClick={handlePrintDocument}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                title="Print quotation on this exact page"
              >
                <Printer size={15} /> Print Document
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => generateQuotationPdf(previewDocModal)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Download size={15} /> Download PDF
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() => handleConvertQuotation(previewDocModal)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}
                  title="Convert this quotation directly into a confirmed Sales Order"
                >
                  <ArrowRight size={15} /> Convert to Sales Order
                </button>
              </div>
            </div>
          }
        >
          <div className="document-preview" id="printable-quotation-doc">
            {/* Header with Logo */}
            <div className="doc-header">
              <div className="doc-brand">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Logo size={36} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0c5a48', letterSpacing: '-0.02em' }}>
                      Apex Global Exporters Pro
                    </h2>
                    <span style={{ fontSize: '11px', color: '#68848a', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      International Trade & Export Management
                    </span>
                  </div>
                </div>
                <div className="doc-brand-sub" style={{ marginTop: '8px', fontSize: '11.5px', color: '#4d696e' }}>
                  Plot 14, Export Promotion Industrial Zone, Nhava Sheva, Navi Mumbai, India
                  <br />
                  Email: export@apexglobal.com | Phone: +91 22 5550 9100 | GSTIN: 27AABCM9102K1Z5
                </div>
              </div>
              <div className="doc-meta">
                <div className="doc-type-badge">COMMERCIAL QUOTATION</div>
                <div className="doc-meta-row">
                  <span>Quote No:</span>
                  <strong>{previewDocModal.quotationNo}</strong>
                </div>
                <div className="doc-meta-row">
                  <span>Date:</span>
                  <strong>{previewDocModal.quotationDate || new Date().toISOString().slice(0, 10)}</strong>
                </div>
                <div className="doc-meta-row">
                  <span>Valid Until:</span>
                  <strong>{previewDocModal.validUntil || '30 Days from date'}</strong>
                </div>
                {previewDocModal.enquiryNo && (
                  <div className="doc-meta-row">
                    <span>Enquiry Ref:</span>
                    <strong>{previewDocModal.enquiryNo}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Address blocks */}
            <div className="doc-addresses">
              <div className="doc-address-block">
                <h4>QUOTATION PREPARED FOR:</h4>
                <strong style={{ fontSize: '13px', color: '#1e1e2d' }}>
                  {previewDocModal.customer || previewDocModal.companyName}
                </strong>
                <br />
                {previewDocModal.address || 'Business Bay, Dubai, UAE'}
                <br />
                Attn: {previewDocModal.contactPerson || 'Purchasing Department'}
                <br />
                Email: {previewDocModal.email || 'purchasing@buyer.com'}
              </div>
              <div className="doc-address-block">
                <h4>COMMERCIAL & LOGISTICS TERMS:</h4>
                Currency: <strong>{previewDocModal.currency || 'USD'}</strong>
                <br />
                Incoterm: <strong>{previewDocModal.incoterm || 'CIF'}</strong>
                <br />
                Delivery Port: {previewDocModal.destination || 'Destination Port'}
                <br />
                Payment Terms: <strong>{previewDocModal.paymentTerms || 'Net 30'}</strong>
              </div>
            </div>

            {/* Line items table */}
            <table className="doc-table">
              <thead>
                <tr>
                  <th style={{ width: '30px' }}>#</th>
                  <th>ITEM & DESCRIPTION</th>
                  <th style={{ textAlign: 'center' }}>QTY</th>
                  <th style={{ textAlign: 'right' }}>UNIT PRICE</th>
                  <th style={{ textAlign: 'center' }}>DISCOUNT</th>
                  <th style={{ textAlign: 'center' }}>TAX</th>
                  <th style={{ textAlign: 'right' }}>LINE TOTAL</th>
                </tr>
              </thead>
              <tbody>
                {(previewDocModal.items || previewDocModal.products || [
                  {
                    name: 'Basmati Rice 1121',
                    description: 'Premium export grade, 25kg packaging',
                    quantity: 50,
                    unit: 'MT',
                    unitPrice: 950,
                    lineTotal: 47500
                  }
                ]).map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{it.name}</strong>
                      {it.description && <div style={{ fontSize: '11px', color: '#68848a' }}>{it.description}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {it.quantity} {it.unit || 'MT'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {resolveCurrencySymbol(previewDocModal.currency)}{Number(it.unitPrice || 0).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {it.discount > 0 ? (it.discountType === 'amount' ? `${resolveCurrencySymbol(previewDocModal.currency)}${it.discount}` : `${it.discount}%`) : '-'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {it.taxRate > 0 ? `${it.taxRate}%` : '-'}
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {resolveCurrencySymbol(previewDocModal.currency)}{Number(it.lineTotal || (it.quantity * it.unitPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Financial Summary */}
            <div className="doc-summary">
              <div className="doc-totals">
                <div className="doc-totals-row">
                  <span>Subtotal:</span>
                  <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.subtotal || previewDocModal.grandTotal || previewDocModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {previewDocModal.totalDiscount > 0 && (
                  <div className="doc-totals-row">
                    <span>Discount:</span>
                    <span>-{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.totalDiscount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {previewDocModal.taxTotal > 0 && (
                  <div className="doc-totals-row">
                    <span>Tax:</span>
                    <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.taxTotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="doc-totals-row grand-total">
                  <span>Grand Total:</span>
                  <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.grandTotal || previewDocModal.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Notes & Sign-off */}
            <div className="doc-footer-notes">
              <div>
                <strong>Notes & Specifications:</strong>
                <p style={{ margin: '4px 0 0' }}>{previewDocModal.notes || 'All items inspected according to international export grade standards.'}</p>
                <div style={{ marginTop: '8px' }}>
                  <strong>Terms & Conditions:</strong>
                  <p style={{ margin: '4px 0 0' }}>{previewDocModal.termsAndConditions || '1. Prices valid for 30 days from date of issue.\n2. Goods dispatch within 14 business days from order confirmation.'}</p>
                </div>
              </div>
              <div className="doc-sign-block">
                <div className="doc-sign-line" />
                <strong>Master Export Pro Inc.</strong>
                <br />
                <span style={{ fontSize: '10px', color: '#7a9499' }}>Authorized Commercial Signatory</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
