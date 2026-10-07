import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FileText,
  FileCheck2,
  ClipboardList,
  CircleDollarSign,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  ArrowRight,
  Printer,
  ChevronRight,
  CheckCircle,
  Truck,
  Receipt,
  RotateCcw,
  Sparkles,
  Building,
  DollarSign,
  Package,
  Clock
} from 'lucide-react';
import {
  get,
  post,
  put,
  del,
  getQuotations,
  createQuotation,
  updateQuotation,
  deleteQuotation,
  convertQuotationToOrder,
  prepareQuotation,
  convertToOrder,
  advanceOrderStage
} from '../api';
import { PageHeader, StatCard, Status, Toolbar } from '../components/Layout';
import Modal from '../components/Modal';
import { generateQuotationPdf } from '../utils/generateQuotationPdf';
import Logo from '../components/Logo';
import { useCurrency } from '../context/CurrencyContext';

const flagMap = {
  UAE: '🇦🇪',
  'Dubai, UAE': '🇦🇪',
  Germany: '🇩🇪',
  'Hamburg, Germany': '🇩🇪',
  Singapore: '🇸🇬',
  USA: '🇺🇸',
  'Los Angeles, USA': '🇺🇸',
  'New York, USA': '🇺🇸',
  Netherlands: '🇳🇱',
  'Rotterdam, Netherlands': '🇳🇱',
  China: '🇨🇳',
  'Tokyo, Japan': '🇯🇵',
  Japan: '🇯🇵'
};

const ORDER_STAGES = ['Confirmed', 'Preparing', 'Ready to Ship', 'Shipped', 'Delivered', 'Completed'];
const JOURNEY_STAGES = ['Confirmed', 'Advance Recd', 'Preparing', 'Ready to Ship', 'Shipped', 'Delivered'];

const getCustomerMeta = (name) => {
  if (!name) return { initials: 'CU', color: 'purple', flag: '🌐', port: 'International Port' };
  if (name.includes('ABC Trading')) return { initials: 'AT', color: 'purple', flag: '🇦🇪', port: 'Jebel Ali, UAE' };
  if (name.includes('Apex Imports')) return { initials: 'AI', color: 'coral', flag: '🇩🇪', port: 'Hamburg, Germany' };
  if (name.includes('EuroFoods')) return { initials: 'EF', color: 'teal', flag: '🇳🇱', port: 'Rotterdam, Netherlands' };
  if (name.includes('Tokyo Trading')) return { initials: 'TT', color: 'blue', flag: '🇯🇵', port: 'Yokohama, Japan' };
  return { initials: name.slice(0, 2).toUpperCase(), color: 'purple', flag: '🌐', port: 'Export Port' };
};

const EMPTY_LINE_ITEM = {
  name: '',
  description: '',
  quantity: 1,
  unit: 'PCS',
  unitPrice: 0,
  discount: 0,
  discountType: 'percent',
  taxRate: 0,
  lineTotal: 0
};

export const defaultEnquiries = [
  {
    _id: 'enq-1001',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1001',
    customer: 'ABC Trading LLC',
    customerId: 'CUST-101',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    destination: 'Dubai, UAE',
    currency: 'USD',
    products: [
      { name: 'Premium Basmati Rice 1121', quantity: 50, unit: 'MT', unitPrice: 950, total: 47500 }
    ],
    totalAmount: 47500,
    status: 'Open',
    createdAt: '2026-10-06T10:00:00Z'
  },
  {
    _id: 'enq-1002',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1002',
    customer: 'Global Foods Ltd',
    customerId: 'CUST-108',
    contactPerson: 'Maria Lopez',
    email: 'maria@globalfoods.de',
    phone: '+49 30 9876 5432',
    destination: 'Hamburg, Germany',
    currency: 'EUR',
    products: [
      { name: 'Frozen Shrimps Vannamei', quantity: 3400, unit: 'KG', unitPrice: 7.50, total: 25500 }
    ],
    totalAmount: 25500,
    status: 'Quoted',
    createdAt: '2026-10-05T14:30:00Z'
  },
  {
    _id: 'enq-1003',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1003',
    customer: 'EuroFoods BV',
    customerId: 'CUST-102',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    phone: '+31 20 555 4321',
    destination: 'Rotterdam, Netherlands',
    currency: 'EUR',
    products: [
      { name: 'Organic Spices Assorted', quantity: 1500, unit: 'KG', unitPrice: 28.00, total: 42000 }
    ],
    totalAmount: 42000,
    status: 'Reviewing',
    createdAt: '2026-10-04T09:15:00Z'
  },
  {
    _id: 'enq-1004',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1004',
    customer: 'Apex Imports',
    customerId: 'CUST-103',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    phone: '+1 929 555 0101',
    destination: 'New York, USA',
    currency: 'USD',
    products: [
      { name: 'Cotton Yarn 30s', quantity: 2000, unit: 'KG', unitPrice: 14.00, total: 28000 }
    ],
    totalAmount: 28000,
    status: 'Quoted',
    createdAt: '2026-10-03T11:00:00Z'
  },
  {
    _id: 'enq-1005',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1005',
    customer: 'Tokyo Trading',
    customerId: 'CUST-104',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    phone: '+81 3 5555 0123',
    destination: 'Yokohama, Japan',
    currency: 'USD',
    products: [
      { name: 'Refined Soybean Oil', quantity: 900, unit: 'KG', unitPrice: 13.88, total: 12500 }
    ],
    totalAmount: 12500,
    status: 'Open',
    createdAt: '2026-10-02T16:00:00Z'
  },
  {
    _id: 'enq-1006',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1006',
    customer: 'Oceanic Trading',
    customerId: 'CUST-105',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    phone: '+61 2 9876 5432',
    destination: 'Long Beach, USA',
    currency: 'USD',
    products: [
      { name: 'Cashew Kernels W320 Grade', quantity: 6000, unit: 'KG', unitPrice: 9.80, total: 58800 }
    ],
    totalAmount: 58800,
    status: 'Open',
    createdAt: '2026-10-01T12:00:00Z'
  },
  {
    _id: 'enq-1007',
    type: 'Enquiry',
    enquiryNo: 'ENQ-1007',
    customer: 'Singapore Global Logistics',
    customerId: 'CUST-106',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    phone: '+65 6789 0123',
    destination: 'Singapore Port, Singapore',
    currency: 'USD',
    products: [
      { name: 'Pure Leather Handcrafted Bags', quantity: 550, unit: 'PCS', unitPrice: 65.00, total: 35750 }
    ],
    totalAmount: 35750,
    status: 'Reviewing',
    createdAt: '2026-09-30T15:20:00Z'
  }
];

export const defaultQuotations = [
  {
    _id: 'quo-1',
    quotationNo: 'QT-204',
    quotationDate: '2026-09-15',
    validUntil: '2026-10-15',
    customer: 'ABC Trading LLC',
    companyName: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    destination: 'Dubai, UAE',
    currency: 'USD',
    incoterm: 'FOB',
    shippingCharges: 0,
    items: [
      { name: 'Product A - Basmati Rice', quantity: 5000, unit: 'units', unitPrice: 10.00, lineTotal: 50000 }
    ],
    subtotal: 50000,
    grandTotal: 50000,
    status: 'Accepted',
    orderNo: 'SO-1024',
    enquiryNo: 'ENQ-1001'
  },
  {
    _id: 'quo-2',
    quotationNo: 'QT-205',
    quotationDate: '2026-09-20',
    validUntil: '2026-10-20',
    customer: 'Apex Imports',
    companyName: 'Apex Imports',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    phone: '+1 929 555 0101',
    destination: 'New York, USA',
    currency: 'USD',
    incoterm: 'CIF',
    shippingCharges: 0,
    items: [
      { name: 'Cotton Yarn 30s', quantity: 2000, unit: 'units', unitPrice: 14.00, lineTotal: 28000 }
    ],
    subtotal: 28000,
    grandTotal: 28000,
    status: 'Draft',
    enquiryNo: 'ENQ-1004'
  },
  {
    _id: 'quo-3',
    quotationNo: 'QT-206',
    quotationDate: '2026-09-28',
    validUntil: '2026-10-28',
    customer: 'Tokyo Trading',
    companyName: 'Tokyo Trading',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    phone: '+81 3 5555 0123',
    destination: 'Yokohama, Japan',
    currency: 'USD',
    incoterm: 'CFR',
    shippingCharges: 0,
    items: [
      { name: 'Refined Soybean Oil', quantity: 900, unit: 'KG', unitPrice: 13.88, lineTotal: 12500 }
    ],
    subtotal: 12500,
    grandTotal: 12500,
    status: 'Sent',
    enquiryNo: 'ENQ-1005'
  },
  {
    _id: 'quo-4',
    quotationNo: 'QUO-2026-0001',
    quotationDate: '2026-10-01',
    validUntil: '2026-10-31',
    customer: 'Global Foods Ltd',
    companyName: 'Global Foods Ltd',
    contactPerson: 'Maria Lopez',
    email: 'maria@globalfoods.de',
    phone: '+49 30 9876 5432',
    destination: 'Hamburg, Germany',
    currency: 'EUR',
    incoterm: 'FOB',
    shippingCharges: 2400,
    items: [
      { name: 'Frozen Shrimps Vannamei', quantity: 3400, unit: 'KG', unitPrice: 7.50, lineTotal: 25500 }
    ],
    subtotal: 25500,
    grandTotal: 27900,
    status: 'Sent',
    enquiryNo: 'ENQ-1002'
  },
  {
    _id: 'quo-5',
    quotationNo: 'QUO-2026-0002',
    quotationDate: '2026-10-02',
    validUntil: '2026-11-02',
    customer: 'Alpine Co.',
    companyName: 'Alpine Co.',
    contactPerson: 'Robert Wilson',
    email: 'robert@alpine.nl',
    phone: '+31 20 123 4567',
    destination: 'Rotterdam, Netherlands',
    currency: 'EUR',
    incoterm: 'CIF',
    shippingCharges: 2800,
    items: [
      { name: 'Organic Honey 500g Jars', quantity: 3500, unit: 'KG', unitPrice: 8.50, lineTotal: 29750 }
    ],
    subtotal: 29750,
    grandTotal: 32550,
    status: 'Draft',
    enquiryNo: 'ENQ-1003'
  }
];

export const defaultSalesOrders = [
  {
    _id: 'so-1024',
    type: 'Sales Order',
    orderNo: 'SO-1024',
    enquiryNo: 'ENQ-1001',
    quotationNo: 'QT-204',
    customer: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    phone: '+971 50 123 4567',
    destination: 'Dubai, UAE',
    currency: 'USD',
    incoterm: 'FOB',
    freight: 2500,
    paymentTerms: 'Net 30',
    totalAmount: 50000,
    advanceReceived: 15000,
    balanceDue: 35000,
    status: 'Confirmed',
    products: [{ name: 'Basmati Rice 1121', quantity: 5000, unit: 'units', unitPrice: 10, total: 50000 }],
    createdAt: '2026-10-02T10:00:00Z'
  },
  {
    _id: 'so-1023',
    type: 'Sales Order',
    orderNo: 'SO-1023',
    enquiryNo: 'ENQ-1004',
    quotationNo: 'QT-205',
    customer: 'Apex Imports',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    destination: 'New York, USA',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: '30% Adv + 70% B/L',
    totalAmount: 28000,
    advanceReceived: 28000,
    balanceDue: 0,
    status: 'Ready to Ship',
    products: [{ name: 'Cotton Yarn 30s', quantity: 2000, unit: 'KG', unitPrice: 14, total: 28000 }],
    createdAt: '2026-10-01T14:30:00Z'
  },
  {
    _id: 'so-1022',
    type: 'Sales Order',
    orderNo: 'SO-1022',
    enquiryNo: 'ENQ-1005',
    quotationNo: 'QT-206',
    customer: 'Tokyo Trading',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    destination: 'Yokohama, Japan',
    currency: 'USD',
    incoterm: 'CFR',
    paymentTerms: 'Net 30',
    totalAmount: 12500,
    advanceReceived: 0,
    balanceDue: 12500,
    status: 'Preparing',
    products: [{ name: 'Refined Soybean Oil', quantity: 900, unit: 'KG', unitPrice: 13.88, total: 12500 }],
    createdAt: '2026-09-28T09:15:00Z'
  },
  {
    _id: 'so-1021',
    type: 'Sales Order',
    orderNo: 'SO-1021',
    enquiryNo: 'ENQ-1003',
    quotationNo: 'QT-207',
    customer: 'EuroFoods BV',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    destination: 'Rotterdam Port, Netherlands',
    currency: 'EUR',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 45000,
    advanceReceived: 0,
    balanceDue: 45000,
    status: 'Shipped',
    products: [{ name: 'Organic Spices Assorted', quantity: 1500, unit: 'KG', unitPrice: 30, total: 45000 }],
    createdAt: '2026-10-03T08:30:00Z'
  },
  {
    _id: 'so-1020',
    type: 'Sales Order',
    orderNo: 'SO-1020',
    enquiryNo: 'ENQ-1006',
    quotationNo: 'QT-208',
    customer: 'Oceanic Trading',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    destination: 'Long Beach, California, USA',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Net 30',
    totalAmount: 62000,
    advanceReceived: 42000,
    balanceDue: 20000,
    status: 'Confirmed',
    products: [{ name: 'Cashew Kernels W320 Grade', quantity: 6000, unit: 'KG', unitPrice: 10.33, total: 62000 }],
    createdAt: '2026-10-04T12:00:00Z'
  },
  {
    _id: 'so-1019',
    type: 'Sales Order',
    orderNo: 'SO-1019',
    enquiryNo: 'ENQ-1007',
    quotationNo: 'QT-209',
    customer: 'Singapore Global Logistics',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    destination: 'Singapore Port, Singapore',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 38000,
    advanceReceived: 38000,
    balanceDue: 0,
    status: 'Delivered',
    products: [{ name: 'Pure Leather Handcrafted Bags', quantity: 550, unit: 'PCS', unitPrice: 69.09, total: 38000 }],
    createdAt: '2026-10-05T09:00:00Z'
  },
  {
    _id: 'so-1018',
    type: 'Sales Order',
    orderNo: 'SO-1018',
    customer: 'Al-Mansoor Enterprises',
    contactPerson: 'Fahad Al-Mansoor',
    email: 'fahad@almansoor.sa',
    destination: 'Riyadh, Saudi Arabia',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'LC at Sight',
    totalAmount: 54000,
    advanceReceived: 20000,
    balanceDue: 34000,
    status: 'Confirmed',
    products: [{ name: 'Basmati Rice 1121', quantity: 55, unit: 'MT', unitPrice: 980, total: 54000 }],
    createdAt: '2026-09-25T11:00:00Z'
  },
  {
    _id: 'so-1017',
    type: 'Sales Order',
    orderNo: 'SO-1017',
    customer: 'Global Foods Ltd',
    contactPerson: 'Maria Lopez',
    email: 'maria@globalfoods.de',
    destination: 'Hamburg, Germany',
    currency: 'EUR',
    incoterm: 'FOB',
    paymentTerms: 'Net 30',
    totalAmount: 33000,
    advanceReceived: 33000,
    balanceDue: 0,
    status: 'Delivered',
    products: [{ name: 'Frozen Shrimps Vannamei', quantity: 4400, unit: 'KG', unitPrice: 7.5, total: 33000 }],
    createdAt: '2026-09-22T10:15:00Z'
  },
  {
    _id: 'so-1016',
    type: 'Sales Order',
    orderNo: 'SO-1016',
    customer: 'Alpine Co.',
    contactPerson: 'Robert Wilson',
    email: 'robert@alpine.nl',
    destination: 'Rotterdam, Netherlands',
    currency: 'EUR',
    incoterm: 'CIF',
    paymentTerms: 'Net 45',
    totalAmount: 35000,
    advanceReceived: 15000,
    balanceDue: 20000,
    status: 'Shipped',
    products: [{ name: 'Organic Honey', quantity: 4000, unit: 'KG', unitPrice: 8.75, total: 35000 }],
    createdAt: '2026-09-20T14:00:00Z'
  },
  {
    _id: 'so-1015',
    type: 'Sales Order',
    orderNo: 'SO-1015',
    customer: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    destination: 'Jebel Ali, UAE',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Net 30',
    totalAmount: 48000,
    advanceReceived: 48000,
    balanceDue: 0,
    status: 'Ready to Ship',
    products: [{ name: 'Industrial Valve Assemblies', quantity: 500, unit: 'PCS', unitPrice: 96, total: 48000 }],
    createdAt: '2026-09-18T08:30:00Z'
  },
  {
    _id: 'so-1014',
    type: 'Sales Order',
    orderNo: 'SO-1014',
    customer: 'Apex Imports',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    destination: 'Los Angeles, USA',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: '30% Adv',
    totalAmount: 42000,
    advanceReceived: 12000,
    balanceDue: 30000,
    status: 'Preparing',
    products: [{ name: 'Cotton Yarn 30s', quantity: 3000, unit: 'KG', unitPrice: 14, total: 42000 }],
    createdAt: '2026-09-16T12:00:00Z'
  },
  {
    _id: 'so-1013',
    type: 'Sales Order',
    orderNo: 'SO-1013',
    customer: 'Tokyo Trading',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    destination: 'Tokyo, Japan',
    currency: 'USD',
    incoterm: 'CFR',
    paymentTerms: 'Net 30',
    totalAmount: 25000,
    advanceReceived: 25000,
    balanceDue: 0,
    status: 'Completed',
    products: [{ name: 'Refined Soybean Oil', quantity: 1800, unit: 'KG', unitPrice: 13.88, total: 25000 }],
    createdAt: '2026-09-14T09:45:00Z'
  },
  {
    _id: 'so-1012',
    type: 'Sales Order',
    orderNo: 'SO-1012',
    customer: 'EuroFoods BV',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    destination: 'Amsterdam, Netherlands',
    currency: 'EUR',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 39000,
    advanceReceived: 10000,
    balanceDue: 29000,
    status: 'Confirmed',
    products: [{ name: 'Organic Spices Assorted', quantity: 1300, unit: 'KG', unitPrice: 30, total: 39000 }],
    createdAt: '2026-09-12T15:20:00Z'
  },
  {
    _id: 'so-1011',
    type: 'Sales Order',
    orderNo: 'SO-1011',
    customer: 'Oceanic Trading',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    destination: 'Sydney, Australia',
    currency: 'USD',
    incoterm: 'FOB',
    paymentTerms: 'Net 30',
    totalAmount: 51000,
    advanceReceived: 25500,
    balanceDue: 25500,
    status: 'Shipped',
    products: [{ name: 'Cashew Kernels W320 Grade', quantity: 5000, unit: 'KG', unitPrice: 10.2, total: 51000 }],
    createdAt: '2026-09-10T11:00:00Z'
  },
  {
    _id: 'so-1010',
    type: 'Sales Order',
    orderNo: 'SO-1010',
    customer: 'Singapore Global Logistics',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    destination: 'Singapore Port, Singapore',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 29000,
    advanceReceived: 29000,
    balanceDue: 0,
    status: 'Delivered',
    products: [{ name: 'Pure Leather Handcrafted Bags', quantity: 420, unit: 'PCS', unitPrice: 69.04, total: 29000 }],
    createdAt: '2026-09-08T13:10:00Z'
  },
  {
    _id: 'so-1009',
    type: 'Sales Order',
    orderNo: 'SO-1009',
    customer: 'Al-Mansoor Enterprises',
    contactPerson: 'Fahad Al-Mansoor',
    email: 'fahad@almansoor.sa',
    destination: 'Jeddah, Saudi Arabia',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'LC at Sight',
    totalAmount: 46000,
    advanceReceived: 15000,
    balanceDue: 31000,
    status: 'Preparing',
    products: [{ name: 'Basmati Rice 1121', quantity: 46, unit: 'MT', unitPrice: 1000, total: 46000 }],
    createdAt: '2026-09-06T10:30:00Z'
  },
  {
    _id: 'so-1008',
    type: 'Sales Order',
    orderNo: 'SO-1008',
    customer: 'Global Foods Ltd',
    contactPerson: 'Maria Lopez',
    email: 'maria@globalfoods.de',
    destination: 'Berlin, Germany',
    currency: 'EUR',
    incoterm: 'FOB',
    paymentTerms: 'Net 30',
    totalAmount: 37500,
    advanceReceived: 37500,
    balanceDue: 0,
    status: 'Ready to Ship',
    products: [{ name: 'Frozen Shrimps Vannamei', quantity: 5000, unit: 'KG', unitPrice: 7.5, total: 37500 }],
    createdAt: '2026-09-04T16:45:00Z'
  },
  {
    _id: 'so-1007',
    type: 'Sales Order',
    orderNo: 'SO-1007',
    customer: 'Alpine Co.',
    contactPerson: 'Robert Wilson',
    email: 'robert@alpine.nl',
    destination: 'Antwerp Port, Belgium',
    currency: 'EUR',
    incoterm: 'CIF',
    paymentTerms: 'Net 45',
    totalAmount: 31200,
    advanceReceived: 0,
    balanceDue: 31200,
    status: 'Confirmed',
    products: [{ name: 'Organic Honey', quantity: 3600, unit: 'KG', unitPrice: 8.66, total: 31200 }],
    createdAt: '2026-09-02T14:15:00Z'
  },
  {
    _id: 'so-1006',
    type: 'Sales Order',
    orderNo: 'SO-1006',
    customer: 'ABC Trading LLC',
    contactPerson: 'Ahmed Ali',
    email: 'ahmed@abctrading.ae',
    destination: 'Abu Dhabi, UAE',
    currency: 'USD',
    incoterm: 'FOB',
    paymentTerms: 'Net 30',
    totalAmount: 58000,
    advanceReceived: 58000,
    balanceDue: 0,
    status: 'Completed',
    products: [{ name: 'Basmati Rice 1121', quantity: 60, unit: 'MT', unitPrice: 966.66, total: 58000 }],
    createdAt: '2026-08-30T11:00:00Z'
  },
  {
    _id: 'so-1005',
    type: 'Sales Order',
    orderNo: 'SO-1005',
    customer: 'Apex Imports',
    contactPerson: 'Tom Reed',
    email: 'tom@apeximports.us',
    destination: 'Chicago, USA',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: '30% Adv',
    totalAmount: 44000,
    advanceReceived: 20000,
    balanceDue: 24000,
    status: 'Shipped',
    products: [{ name: 'Cotton Yarn 30s', quantity: 3100, unit: 'KG', unitPrice: 14.19, total: 44000 }],
    createdAt: '2026-08-28T09:30:00Z'
  },
  {
    _id: 'so-1004',
    type: 'Sales Order',
    orderNo: 'SO-1004',
    customer: 'Tokyo Trading',
    contactPerson: 'Kenji Sato',
    email: 'kenji@tokyotrading.jp',
    destination: 'Osaka, Japan',
    currency: 'USD',
    incoterm: 'CFR',
    paymentTerms: 'Net 30',
    totalAmount: 22400,
    advanceReceived: 22400,
    balanceDue: 0,
    status: 'Delivered',
    products: [{ name: 'Refined Soybean Oil', quantity: 1600, unit: 'KG', unitPrice: 14, total: 22400 }],
    createdAt: '2026-08-26T12:00:00Z'
  },
  {
    _id: 'so-1003',
    type: 'Sales Order',
    orderNo: 'SO-1003',
    customer: 'EuroFoods BV',
    contactPerson: 'Lisa Meyer',
    email: 'lisa@eurofoods.nl',
    destination: 'Utrecht, Netherlands',
    currency: 'EUR',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 36800,
    advanceReceived: 12000,
    balanceDue: 24800,
    status: 'Preparing',
    products: [{ name: 'Organic Spices Assorted', quantity: 1200, unit: 'KG', unitPrice: 30.66, total: 36800 }],
    createdAt: '2026-08-24T15:10:00Z'
  },
  {
    _id: 'so-1002',
    type: 'Sales Order',
    orderNo: 'SO-1002',
    customer: 'Oceanic Trading',
    contactPerson: 'David Miller',
    email: 'david@oceanictrading.com.au',
    destination: 'Melbourne, Australia',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Net 30',
    totalAmount: 47000,
    advanceReceived: 47000,
    balanceDue: 0,
    status: 'Ready to Ship',
    products: [{ name: 'Cashew Kernels W320 Grade', quantity: 4700, unit: 'KG', unitPrice: 10, total: 47000 }],
    createdAt: '2026-08-22T10:00:00Z'
  },
  {
    _id: 'so-1001',
    type: 'Sales Order',
    orderNo: 'SO-1001',
    customer: 'Singapore Global Logistics',
    contactPerson: 'Serena Tan',
    email: 'serena@sglogistic.sg',
    destination: 'Singapore Port, Singapore',
    currency: 'USD',
    incoterm: 'CIF',
    paymentTerms: 'Advance',
    totalAmount: 32000,
    advanceReceived: 10000,
    balanceDue: 22000,
    status: 'Confirmed',
    products: [{ name: 'Pure Leather Handcrafted Bags', quantity: 460, unit: 'PCS', unitPrice: 69.56, total: 32000 }],
    createdAt: '2026-08-20T11:30:00Z'
  }
];

export default function Sales({ initialTab = 'Quotations', openNewEnquiry = false }) {
  const { currency: globalCurrency, currencySymbol: globalSymbol, formatAmount } = useCurrency();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const newParam = searchParams.get('new');

  const resolveCurrencySymbol = (curr) => {
    if (!curr) return globalSymbol || '₹';
    if (curr === 'INR') return '₹';
    if (curr === 'USD') return '$';
    if (curr === 'EUR') return '€';
    if (curr === 'GBP') return '£';
    if (curr === 'AED') return 'AED ';
    return curr;
  };

  const [data, setData] = useState(() => [...defaultSalesOrders, ...defaultEnquiries]);
  const [quotationsList, setQuotationsList] = useState(() => [...defaultQuotations]);
  const [customers, setCustomers] = useState([]);
  const [productsCatalog, setProductsCatalog] = useState(() => {
    try {
      const saved = localStorage.getItem('export_pro_products');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { _id: 'prd-1', sku: 'PRD-01', name: 'Basmati Rice 1121', icon: '🌾', description: 'Long grain, double polished, 25kg PP bags', price: 950, unit: 'MT' },
      { _id: 'prd-2', sku: 'PRD-02', name: 'Cotton Yarn 30s', icon: '🧶', description: 'Combed ring spun 100% cotton yarn', price: 3.40, unit: 'KG' },
      { _id: 'prd-3', sku: 'PRD-03', name: 'Refined Soybean Oil', icon: '🫒', description: 'Deodorized food grade cooking oil', price: 850, unit: 'MT' },
      { _id: 'prd-4', sku: 'PRD-04', name: 'Organic Spices Assorted', icon: '🌶️', description: 'Certified organic whole black pepper & turmeric', price: 28, unit: 'KG' },
      { _id: 'prd-5', sku: 'PRD-05', name: 'Industrial Valve Assemblies', icon: '⚙️', description: 'Stainless steel high pressure export ball valves', price: 94.28, unit: 'PCS' },
      { _id: 'prd-6', sku: 'PRD-06', name: 'Cashew Kernels W320 Grade', icon: '🥜', description: 'Export vacuum packed 25lb tins cashew nuts', price: 9.80, unit: 'KG' },
      { _id: 'prd-7', sku: 'PRD-07', name: 'Pure Leather Handcrafted Bags', icon: '💼', description: 'Full grain artisanal export travel duffels & laptop bags', price: 65, unit: 'PCS' }
    ];
  });
  const [loading, setLoading] = useState(true);

  const normalizeTab = (t) => {
    if (!t) return 'Quotations';
    if (t === 'Quotation' || t === 'Quotations') return 'Quotations';
    if (t === 'Sales Order' || t === 'Sales Orders' || t === 'Orders') return 'Sales Orders';
    if (t === 'Enquiry' || t === 'Enquiries') return 'Enquiries';
    return 'Quotations';
  };

  // Tabs: 'Quotations', 'Sales Orders', 'Enquiries'
  const [activeTab, setActiveTab] = useState(() => normalizeTab(tabParam || initialTab));
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    if (tabParam) {
      setActiveTab(normalizeTab(tabParam));
    } else if (initialTab) {
      setActiveTab(normalizeTab(initialTab));
    }
  }, [tabParam, initialTab]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modals
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [quotationModalOpen, setQuotationModalOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState(null);
  const [previewDocModal, setPreviewDocModal] = useState(null);
  const [editSalesModal, setEditSalesModal] = useState(null);

  // Toggle state: Enquiry to Customer (ready to be customer)
  const [enquiryToCustomer, setEnquiryToCustomer] = useState(true);

  // Comprehensive Enquiry Form State (Auto-registers customer to Customers module)
  const [enquiryForm, setEnquiryForm] = useState({
    customer: '',
    contactPerson: '',
    email: '',
    phone: '',
    country: 'UAE 🇦🇪',
    destination: 'Dubai, UAE',
    address: '',
    taxNumber: '',
    paymentTerms: 'Net 30',
    currency: 'INR',
    productName: '',
    description: '',
    quantity: 100,
    unit: 'MT',
    unitPrice: 500,
    notes: ''
  });

  const handleCustomerChange = (custName) => {
    const found = customers.find(
      (c) => c.companyName?.trim().toLowerCase() === custName.trim().toLowerCase()
    );
    if (found) {
      setEnquiryForm((prev) => ({
        ...prev,
        customer: custName,
        contactPerson: found.contactPerson || prev.contactPerson,
        email: found.email || prev.email,
        phone: found.phone || prev.phone,
        country: found.country || prev.country,
        destination: found.address || found.country || prev.destination,
        address: found.address || prev.address,
        taxNumber: found.taxNumber || prev.taxNumber,
        paymentTerms: found.paymentTerms || prev.paymentTerms,
        currency: found.currency || prev.currency
      }));
    } else {
      setEnquiryForm((prev) => ({
        ...prev,
        customer: custName
      }));
    }
  };

  const handleProductChange = (prodName) => {
    const found = productsCatalog.find(
      (p) => p.name?.trim().toLowerCase() === prodName.trim().toLowerCase()
    );
    if (found) {
      setEnquiryForm((prev) => ({
        ...prev,
        productName: prodName,
        description: found.description || prev.description,
        unit: found.unit || prev.unit,
        unitPrice: found.price || prev.unitPrice
      }));
    } else {
      setEnquiryForm((prev) => ({
        ...prev,
        productName: prodName
      }));
    }
  };

  // Quotation Form State (Comprehensive line-items & financials)
  const [quotationForm, setQuotationForm] = useState({
    quotationNo: '',
    quotationDate: '',
    validUntil: '',
    customer: '',
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    destination: '',
    currency: 'INR',
    incoterm: 'CIF',
    shippingCharges: 0,
    paymentTerms: 'Net 30',
    deliveryTerms: 'CIF Destination Port',
    notes: 'All items inspected according to international export grade standards. Standard seaworthy export packaging.',
    termsAndConditions: '1. Prices valid until expiry date.\n2. Payment terms as agreed.\n3. Goods dispatch within 14 business days from order confirmation.',
    status: 'Draft',
    items: [{ ...EMPTY_LINE_ITEM }]
  });

  const [notification, setNotification] = useState(null);

  const showNotice = (msg, isErr = false) => {
    setNotification({ msg, isErr });
    setTimeout(() => setNotification(null), 3200);
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      const [salesRes, quotRes, custRes, prodRes] = await Promise.all([
        get('/sales').catch(() => []),
        getQuotations().catch(() => []),
        get('/customers').catch(() => []),
        get('/products').catch(() => [])
      ]);

      const backendSalesList = Array.isArray(salesRes) ? salesRes : [];
      const mergedSales = [...backendSalesList];
      const existingOrderNos = new Set(mergedSales.map((s) => s.orderNo).filter(Boolean));
      const existingEnquiryNos = new Set(mergedSales.map((s) => s.enquiryNo).filter(Boolean));

      let localSales = [];
      try {
        localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
      } catch (e) {}
      if (Array.isArray(localSales)) {
        localSales.forEach((ls) => {
          if (ls.orderNo && !existingOrderNos.has(ls.orderNo)) {
            mergedSales.unshift(ls);
            existingOrderNos.add(ls.orderNo);
          } else if (ls.enquiryNo && !existingEnquiryNos.has(ls.enquiryNo)) {
            mergedSales.unshift(ls);
            existingEnquiryNos.add(ls.enquiryNo);
          }
        });
      }

      defaultSalesOrders.forEach((dso) => {
        if (!existingOrderNos.has(dso.orderNo)) {
          mergedSales.push(dso);
        }
      });
      defaultEnquiries.forEach((denq) => {
        if (!existingEnquiryNos.has(denq.enquiryNo)) {
          mergedSales.push(denq);
        }
      });
      setData(mergedSales);

      const backendQuotList = Array.isArray(quotRes) ? quotRes : [];
      const mergedQuotations = [...backendQuotList];
      const existingQuotationNos = new Set(mergedQuotations.map((q) => q.quotationNo).filter(Boolean));

      let localQuots = [];
      try {
        localQuots = JSON.parse(localStorage.getItem('export_pro_quotations') || '[]');
      } catch (e) {}
      if (Array.isArray(localQuots)) {
        localQuots.forEach((lq) => {
          if (lq.quotationNo && !existingQuotationNos.has(lq.quotationNo)) {
            mergedQuotations.unshift(lq);
            existingQuotationNos.add(lq.quotationNo);
          }
        });
      }

      defaultQuotations.forEach((dq) => {
        if (!existingQuotationNos.has(dq.quotationNo)) {
          mergedQuotations.push(dq);
        }
      });
      setQuotationsList(mergedQuotations);

      let localCusts = [];
      try {
        localCusts = JSON.parse(localStorage.getItem('export_pro_customers') || '[]');
      } catch (e) {}
      const combinedCusts = [
        ...(Array.isArray(custRes) ? custRes : []),
        ...(Array.isArray(localCusts) ? localCusts : [])
      ];
      if (combinedCusts.length > 0) {
        const seenCustNames = new Set();
        const uniqueCusts = [];
        combinedCusts.forEach((c) => {
          const norm = (c.companyName || '').trim().toLowerCase();
          if (norm && !seenCustNames.has(norm)) {
            seenCustNames.add(norm);
            uniqueCusts.push(c);
          }
        });
        setCustomers(uniqueCusts);
      }
      let localProds = [];
      try {
        localProds = JSON.parse(localStorage.getItem('export_pro_products') || '[]');
      } catch (e) {}
      const combinedProds = [
        ...(Array.isArray(prodRes) ? prodRes : []),
        ...(Array.isArray(localProds) ? localProds : [])
      ];
      if (combinedProds.length > 0) {
        const seenProdNames = new Set();
        const uniqueProds = [];
        combinedProds.forEach((p) => {
          const norm = (p.name || '').trim().toLowerCase();
          if (norm && !seenProdNames.has(norm)) {
            seenProdNames.add(norm);
            uniqueProds.push(p);
          }
        });
        setProductsCatalog(uniqueProds);
      }
    } catch (err) {
      console.error('Failed to load sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  // Summary counts for General Sales
  const generalCounts = useMemo(() => {
    const enq = data.filter((x) => x.type === 'Enquiry').length;
    const qt = quotationsList.length > 0 ? quotationsList.length : data.filter((x) => x.type === 'Quotation').length;
    const so = data.filter((x) => x.type === 'Sales Order').length;
    const totalVal = data
      .filter((x) => x.type === 'Sales Order' || x.type === 'Quotation')
      .reduce((s, x) => s + (x.totalAmount || 0), 0);
    return { enq, qt, so, totalVal };
  }, [data, quotationsList]);

  // Summary counts for Quotations Tab
  const quotationStats = useMemo(() => {
    const total = quotationsList.length;
    const draft = quotationsList.filter((q) => q.status === 'Draft').length;
    const sent = quotationsList.filter((q) => q.status === 'Sent').length;
    const accepted = quotationsList.filter((q) => q.status === 'Accepted').length;
    return { total, draft, sent, accepted };
  }, [quotationsList]);

  const enquiriesList = useMemo(() => data.filter((x) => x.type === 'Enquiry'), [data]);
  const salesOrdersList = useMemo(() => data.filter((x) => x.type === 'Sales Order'), [data]);

  const selectedOrder = useMemo(() => {
    if (selectedOrderId) {
      const found = salesOrdersList.find((o) => (o.orderNo || o._id) === selectedOrderId);
      if (found) return found;
    }
    return salesOrdersList[0] || null;
  }, [salesOrdersList, selectedOrderId]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('');
    setCustomerFilter('');
    setDateFilter('');
  };

  // Filtered rows for General Sales Table
  const filteredSalesRows = useMemo(() => {
    return data.filter((row) => {
      if (activeTab === 'Sales Orders' && row.type !== 'Sales Order') return false;
      if (activeTab === 'Enquiries' && row.type !== 'Enquiry') return false;
      if (activeTab !== 'All' && activeTab !== 'Sales Orders' && activeTab !== 'Enquiries' && row.type !== activeTab) return false;
      if (searchQuery) {
        const str = `${row.enquiryNo || ''} ${row.quotationNo || ''} ${row.orderNo || ''} ${row.customer || ''} ${row.destination || ''}`.toLowerCase();
        if (!str.includes(searchQuery.toLowerCase())) return false;
      }
      if (statusFilter && row.status !== statusFilter) return false;
      if (customerFilter && row.customer !== customerFilter) return false;
      return true;
    });
  }, [data, activeTab, searchQuery, statusFilter, customerFilter]);

  // Filtered rows for Quotations Tab
  const filteredQuotationsRows = useMemo(() => {
    return quotationsList.filter((q) => {
      if (searchQuery) {
        const str = `${q.quotationNo || ''} ${q.customer || ''} ${q.contactPerson || ''} ${q.enquiryNo || ''}`.toLowerCase();
        if (!str.includes(searchQuery.toLowerCase())) return false;
      }
      if (statusFilter && q.status !== statusFilter) return false;
      if (customerFilter && q.customer !== customerFilter) return false;
      if (dateFilter) {
        if (dateFilter === 'today') {
          const today = new Date().toISOString().slice(0, 10);
          if (q.quotationDate !== today) return false;
        } else if (dateFilter === 'month') {
          const curMonth = new Date().toISOString().slice(0, 7);
          if (!q.quotationDate?.startsWith(curMonth)) return false;
        }
      }
      return true;
    });
  }, [quotationsList, searchQuery, statusFilter, customerFilter, dateFilter]);

  // =========================================================
  // QUOTATION FORM MANAGEMENT & CALCULATIONS
  // =========================================================

  const handleOpenCreateQuotation = (prefill = null) => {
    const today = new Date().toISOString().slice(0, 10);
    const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const nextSeq = String(quotationsList.length + 1).padStart(4, '0');
    const autoNo = `QUO-${new Date().getFullYear()}-${nextSeq}`;

    setEditingQuotation(null);
    setQuotationForm({
      quotationNo: autoNo,
      quotationDate: today,
      validUntil: in30Days,
      customer: prefill?.customer || customers[0]?.companyName || '',
      companyName: prefill?.customer || customers[0]?.companyName || '',
      contactPerson: prefill?.contactPerson || customers[0]?.contactPerson || '',
      email: prefill?.email || customers[0]?.email || '',
      phone: prefill?.phone || customers[0]?.phone || '',
      address: prefill?.address || customers[0]?.address || '',
      destination: prefill?.destination || customers[0]?.address || 'Dubai, UAE',
      currency: prefill?.currency || customers[0]?.currency || globalCurrency || 'INR',
      incoterm: prefill?.incoterm || 'CIF',
      shippingCharges: prefill?.freight || 2500,
      paymentTerms: prefill?.paymentTerms || customers[0]?.paymentTerms || 'Net 30',
      deliveryTerms: 'CIF Destination Port',
      notes: prefill?.notes || 'All items inspected according to international export grade standards. Standard seaworthy export packaging.',
      termsAndConditions: '1. Prices valid until expiry date.\n2. Payment terms as agreed.\n3. Goods dispatch within 14 business days from order confirmation.',
      status: 'Draft',
      enquiryNo: prefill?.enquiryNo || '',
      items: prefill?.products && prefill.products.length > 0
        ? prefill.products.map((p) => ({
            name: p.name || 'Export Item',
            description: p.description || 'Export grade specification',
            quantity: p.quantity || 50,
            unit: p.unit || 'MT',
            unitPrice: p.unitPrice || 500,
            discount: 0,
            discountType: 'percent',
            taxRate: 0,
            lineTotal: (p.quantity || 50) * (p.unitPrice || 500)
          }))
        : [
            {
              name: productsCatalog[0]?.name || 'Premium Basmati Rice',
              description: productsCatalog[0]?.description || 'Long grain, 25kg bag',
              quantity: 50,
              unit: productsCatalog[0]?.unit || 'MT',
              unitPrice: productsCatalog[0]?.price || 580,
              discount: 0,
              discountType: 'percent',
              taxRate: 0,
              lineTotal: 50 * (productsCatalog[0]?.price || 580)
            }
          ]
    });
    setQuotationModalOpen(true);
  };

  // Auto-open new enquiry or quotation modal if requested via URL or props
  useEffect(() => {
    if (newParam === 'true' || openNewEnquiry) {
      if (tabParam === 'Quotations' || tabParam === 'Quotation') {
        setActiveTab('Quotations');
        handleOpenCreateQuotation();
      } else {
        setActiveTab('Enquiries');
        setEnquiryModalOpen(true);
      }
    }
  }, [newParam, openNewEnquiry, tabParam]);

  // Ensure products catalog is freshly synced with Product Master module when opening enquiry modal
  useEffect(() => {
    if (enquiryModalOpen) {
      try {
        const localProds = JSON.parse(localStorage.getItem('export_pro_products') || '[]');
        if (Array.isArray(localProds) && localProds.length > 0) {
          setProductsCatalog((prev) => {
            const seen = new Set();
            const combined = [...localProds, ...prev];
            const unique = [];
            combined.forEach((p) => {
              const norm = (p.name || '').trim().toLowerCase();
              if (norm && !seen.has(norm)) {
                seen.add(norm);
                unique.push(p);
              }
            });
            return unique;
          });
        }
      } catch (e) {}
    }
  }, [enquiryModalOpen]);

  const handleOpenEditQuotation = (quotation) => {
    setEditingQuotation(quotation);
    setQuotationForm({
      ...quotation,
      shippingCharges: quotation.shippingCharges || 0,
      items: quotation.items && quotation.items.length > 0 ? [...quotation.items] : [{ ...EMPTY_LINE_ITEM }]
    });
    setQuotationModalOpen(true);
  };

  // Customer dropdown selection
  const handleCustomerSelect = (name) => {
    const cust = customers.find((c) => c.companyName === name);
    if (cust) {
      setQuotationForm((prev) => ({
        ...prev,
        customer: cust.companyName,
        companyName: cust.companyName,
        contactPerson: cust.contactPerson || '',
        email: cust.email || '',
        phone: cust.phone || '',
        address: cust.address || '',
        destination: cust.address || prev.destination,
        currency: cust.currency || prev.currency,
        paymentTerms: cust.paymentTerms || prev.paymentTerms
      }));
    } else {
      setQuotationForm((prev) => ({ ...prev, customer: name }));
    }
  };

  // Line item change
  const handleLineItemChange = (index, field, value) => {
    setQuotationForm((prev) => {
      const itemsCopy = [...prev.items];
      const item = { ...itemsCopy[index], [field]: value };

      if (field === 'name') {
        const prod = productsCatalog.find((p) => p.name === value);
        if (prod) {
          item.description = prod.description || '';
          item.unitPrice = Number(prod.price || 0);
          item.unit = prod.unit || 'PCS';
          item.productId = prod.sku || '';
        }
      }

      const qty = Math.max(1, Number(item.quantity || 1));
      const price = Math.max(0, Number(item.unitPrice || 0));
      const base = qty * price;
      const disc = Math.max(0, Number(item.discount || 0));
      const discVal = item.discountType === 'amount' ? Math.min(base, disc) : Math.min(base, (base * disc) / 100);
      const taxable = Math.max(0, base - discVal);
      const taxRate = Math.max(0, Number(item.taxRate || 0));
      const taxAmount = (taxable * taxRate) / 100;
      const lineTotal = taxable + taxAmount;

      item.quantity = qty;
      item.unitPrice = price;
      item.discount = disc;
      item.taxRate = taxRate;
      item.taxAmount = Number(taxAmount.toFixed(2));
      item.lineTotal = Number(lineTotal.toFixed(2));

      itemsCopy[index] = item;
      return { ...prev, items: itemsCopy };
    });
  };

  const handleAddLineItem = () => {
    setQuotationForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...EMPTY_LINE_ITEM }]
    }));
  };

  const handleRemoveLineItem = (index) => {
    if (quotationForm.items.length <= 1) {
      alert('Quotation requires at least one line item.');
      return;
    }
    setQuotationForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  // Real-time financial calculations
  const liveFinancials = useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let taxableAmount = 0;
    let taxTotal = 0;

    (quotationForm.items || []).forEach((it) => {
      const qty = Math.max(1, Number(it.quantity || 1));
      const price = Math.max(0, Number(it.unitPrice || 0));
      const base = qty * price;
      const disc = Math.max(0, Number(it.discount || 0));
      const discVal = it.discountType === 'amount' ? Math.min(base, disc) : Math.min(base, (base * disc) / 100);
      const lineTaxable = Math.max(0, base - discVal);
      const taxRate = Math.max(0, Number(it.taxRate || 0));
      const lineTax = (lineTaxable * taxRate) / 100;

      subtotal += base;
      totalDiscount += discVal;
      taxableAmount += lineTaxable;
      taxTotal += lineTax;
    });

    const shipping = Math.max(0, Number(quotationForm.shippingCharges || 0));
    const grandTotal = Number((taxableAmount + taxTotal + shipping).toFixed(2));

    return {
      subtotal: Number(subtotal.toFixed(2)),
      totalDiscount: Number(totalDiscount.toFixed(2)),
      taxableAmount: Number(taxableAmount.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      shippingCharges: shipping,
      grandTotal
    };
  }, [quotationForm.items, quotationForm.shippingCharges]);

  // Save Quotation (Draft or Sent)
  const handleSaveQuotation = async (statusOverride = null, andDownload = false) => {
    if (!quotationForm.customer) {
      alert('Please select or specify a customer.');
      return null;
    }
    if (!quotationForm.items || quotationForm.items.length === 0) {
      alert('Please add at least one line item.');
      return null;
    }

    const payload = {
      ...quotationForm,
      status: statusOverride || quotationForm.status || 'Draft',
      shippingCharges: liveFinancials.shippingCharges,
      subtotal: liveFinancials.subtotal,
      totalDiscount: liveFinancials.totalDiscount,
      taxableAmount: liveFinancials.taxableAmount,
      taxTotal: liveFinancials.taxTotal,
      grandTotal: liveFinancials.grandTotal
    };

    try {
      let saved;
      if (editingQuotation?._id) {
        saved = await updateQuotation(editingQuotation._id, payload);
        showNotice(`Quotation ${saved.quotationNo} updated successfully!`);
      } else {
        saved = await createQuotation(payload);
        showNotice(`Quotation ${saved.quotationNo} created successfully!`);
      }
      setQuotationModalOpen(false);
      loadAll();

      if (andDownload) {
        generateQuotationPdf(saved);
      }
      return saved;
    } catch (err) {
      alert(err.message || 'Failed to save quotation');
      return null;
    }
  };

  // Print Quotation / Document matching preview layout
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
    let orderNo = '';
    try {
      const targetId = quotation._id || quotation.quotationNo;
      const res = await convertQuotationToOrder(targetId, quotation);
      orderNo = res?.orderNo || res?.salesOrder?.orderNo || '';
    } catch (err) {
      console.warn('Primary convert endpoint failed, attempting fallback:', err);
      try {
        const fallbackRes = await convertToOrder(quotation._id || quotation.quotationNo);
        orderNo = fallbackRes?.orderNo || '';
      } catch (fallbackErr) {
        console.warn('Backend convert failed, using local conversion:', fallbackErr);
      }
    }

    if (!orderNo) {
      const soCount = data.filter((x) => x.type === 'Sales Order' || x.orderNo).length;
      orderNo = `SO-${1024 + soCount}`;
    }

    const newSalesOrder = {
      _id: `so-local-${Date.now()}`,
      type: 'Sales Order',
      orderNo,
      quotationNo: quotation.quotationNo || '',
      enquiryNo: quotation.enquiryNo || '',
      customer: quotation.customer,
      contactPerson: quotation.contactPerson || '',
      email: quotation.email || '',
      phone: quotation.phone || '',
      address: quotation.address || '',
      destination: quotation.destination || 'Dubai, UAE',
      currency: quotation.currency || globalCurrency || 'INR',
      incoterm: quotation.incoterm || 'CIF',
      freight: quotation.shippingCharges || 0,
      paymentTerms: quotation.paymentTerms || 'Net 30',
      validity: quotation.validUntil || '30 Days',
      notes: quotation.notes || '',
      products: quotation.items
        ? quotation.items.map((it) => ({
            name: it.name,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            unit: it.unit || 'MT',
            total: it.lineTotal || (it.quantity * it.unitPrice)
          }))
        : [],
      totalAmount: quotation.grandTotal || quotation.totalAmount || 0,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    // Save to local storage
    try {
      const localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
      localSales.unshift(newSalesOrder);
      localStorage.setItem('export_pro_sales', JSON.stringify(localSales));

      const localQuots = JSON.parse(localStorage.getItem('export_pro_quotations') || '[]');
      const qIdx = localQuots.findIndex((q) => q.quotationNo === quotation.quotationNo);
      if (qIdx >= 0) {
        localQuots[qIdx].status = 'Accepted';
        localQuots[qIdx].orderNo = orderNo;
        localStorage.setItem('export_pro_quotations', JSON.stringify(localQuots));
      }
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('sales-updated'));
    } catch (e) {}

    // Update state directly
    setData((prev) => [newSalesOrder, ...prev.filter((p) => p.orderNo !== orderNo)]);
    setQuotationsList((prev) =>
      prev.map((q) =>
        q.quotationNo === quotation.quotationNo ? { ...q, status: 'Accepted', orderNo } : q
      )
    );

    showNotice(
      `Quotation ${qNo} successfully converted to Confirmed Sales Order (${orderNo})!`
    );
    setPreviewDocModal(null);
    setActiveTab('Sales Orders');
    setSelectedOrderId(orderNo);
    loadAll();
  };

  // Delete Quotation
  const handleDeleteQuotation = async (id, no) => {
    if (confirm(`Are you sure you want to delete Quotation ${no}?`)) {
      try {
        await deleteQuotation(id);
      } catch (err) {
        console.warn('Backend quotation delete fallback:', err);
      }
      try {
        const localQuots = JSON.parse(localStorage.getItem('export_pro_quotations') || '[]');
        const updated = localQuots.filter((q) => q._id !== id && q.quotationNo !== no);
        localStorage.setItem('export_pro_quotations', JSON.stringify(updated));
      } catch (e) {}
      setQuotationsList((prev) => prev.filter((q) => q._id !== id && q.quotationNo !== no));
      showNotice(`Quotation ${no} deleted.`);
      loadAll();
    }
  };

  // Delete Sale Item (Order or Enquiry)
  const handleDeleteSale = async (item) => {
    const label = item.type === 'Enquiry' ? `Enquiry ${item.enquiryNo || ''}` : `Order ${item.orderNo || ''}`;
    if (!confirm(`Are you sure you want to delete ${label}?`)) return;
    try {
      if (item._id && !item._id.startsWith('so-local-')) {
        await del(`/sales/${item._id}`);
      }
    } catch (err) {
      console.warn('Backend sale delete fallback:', err);
    }
    try {
      const localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
      const updated = localSales.filter((s) => s._id !== item._id && s.orderNo !== item.orderNo && s.enquiryNo !== item.enquiryNo);
      localStorage.setItem('export_pro_sales', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('sales-updated'));
    } catch (e) {}
    setData((prev) => prev.filter((s) => s._id !== item._id && s.orderNo !== item.orderNo && s.enquiryNo !== item.enquiryNo));
    if (previewDocModal && (previewDocModal._id === item._id || previewDocModal.orderNo === item.orderNo || previewDocModal.enquiryNo === item.enquiryNo)) {
      setPreviewDocModal(null);
    }
    showNotice(`${label} deleted.`);
    loadAll();
  };

  // Advance Order Stage
  const handleAdvanceStage = async (order, customNext) => {
    try {
      await advanceOrderStage(order._id, customNext);
      loadAll();
      if (previewDocModal?._id === order._id) {
        setPreviewDocModal((prev) => ({
          ...prev,
          status: customNext || ORDER_STAGES[ORDER_STAGES.indexOf(prev.status) + 1] || 'Completed'
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to advance order stage');
    }
  };

  // Save Enquiry Handler - Auto-saves Customer (if toggle ON) & automatically generates Quotation in Sales module and shows Quotation layout
  const handleSaveEnquiry = async () => {
    const customer = (enquiryForm.customer || '').trim();
    if (!customer) {
      alert('Please enter or select a Customer / Buyer Company');
      return;
    }

    const productName = (enquiryForm.productName || '').trim() || 'Export Item';
    const quantity = Math.max(1, Number(enquiryForm.quantity || 1));
    const unitPrice = Math.max(0, Number(enquiryForm.unitPrice || 0));
    const totalAmount = quantity * unitPrice;
    const count = data.filter((x) => x.enquiryNo).length;
    const enquiryNo = `ENQ-${1001 + count}`;
    const destination = enquiryForm.destination || enquiryForm.country || 'International Port';
    const country = enquiryForm.country || destination;
    const currency = enquiryForm.currency || globalCurrency || 'INR';

    // 1. Always create or update Customer in Customer module
    const normCustomer = customer.trim().toLowerCase();
    const existingCust = customers.find(
      (c) => c.companyName?.trim().toLowerCase() === normCustomer
    );
    const determinedStatus = existingCust ? existingCust.status : 'Inactive';

    const customerPayload = {
      customerId: existingCust?.customerId || `CUST-${101 + customers.length}`,
      companyName: customer,
      contactPerson: enquiryForm.contactPerson || existingCust?.contactPerson || '',
      country: country || existingCust?.country || 'International 🌐',
      email: enquiryForm.email || existingCust?.email || '',
      phone: enquiryForm.phone || existingCust?.phone || '',
      address: enquiryForm.address || existingCust?.address || '',
      taxNumber: enquiryForm.taxNumber || existingCust?.taxNumber || 'TRN 100234567890003',
      currency: currency || existingCust?.currency || 'INR',
      paymentTerms: enquiryForm.paymentTerms || existingCust?.paymentTerms || 'Net 30',
      outstandingBalance: existingCust?.outstandingBalance || 0,
      status: determinedStatus
    };

    try {
      if (existingCust && existingCust._id) {
        await put(`/customers/${existingCust._id}`, customerPayload).catch(() => null);
      } else {
        await post('/customers', customerPayload).catch(() => null);
      }
    } catch (custErr) {
      console.warn('Customer auto-save error:', custErr);
    }

    try {
      const localCusts = JSON.parse(localStorage.getItem('export_pro_customers') || '[]');
      const norm = customer.trim().toLowerCase();
      const existingIdx = localCusts.findIndex(
        (c) => (c.companyName || '').trim().toLowerCase() === norm
      );
      if (existingIdx >= 0) {
        localCusts[existingIdx] = { ...localCusts[existingIdx], ...customerPayload };
      } else {
        localCusts.unshift({ ...customerPayload, _id: `cust-local-${Date.now()}` });
      }
      localStorage.setItem('export_pro_customers', JSON.stringify(localCusts));
    } catch (e) {}

    // 2. Create and save the Enquiry in Sales module
    const newEnquiry = {
      type: 'Enquiry',
      enquiryNo,
      customer,
      customerId: existingCust?.customerId || customerPayload.customerId,
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

    let createdEnquiry = newEnquiry;
    try {
      const res = await post('/sales', newEnquiry);
      if (res && res._id) createdEnquiry = res;
    } catch (enqErr) {
      console.warn('Backend save enquiry error:', enqErr);
    }

    try {
      const localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
      localSales.unshift(createdEnquiry);
      localStorage.setItem('export_pro_sales', JSON.stringify(localSales));
    } catch (e) {}
    setData((prev) => [createdEnquiry, ...prev]);

    // 3. Automatically create and save Quotation into Sales module Quotations
    const today = new Date().toISOString().slice(0, 10);
    const in30Days = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);
    const nextSeq = String(quotationsList.length + 1).padStart(4, '0');
    const autoQuotationNo = `QUO-${new Date().getFullYear()}-${nextSeq}`;

    const quotationItems = [
      {
        name: productName,
        description: enquiryForm.description || 'Export grade specification',
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
      const qRes = await createQuotation(quotationPayload);
      if (qRes && (qRes._id || qRes.quotationNo)) {
        savedQuotation = qRes;
      }
    } catch (qErr) {
      console.warn('Backend save quotation error:', qErr);
    }

    try {
      const localQuots = JSON.parse(localStorage.getItem('export_pro_quotations') || '[]');
      localQuots.unshift(savedQuotation);
      localStorage.setItem('export_pro_quotations', JSON.stringify(localQuots));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('sales-updated'));
    } catch (e) {}
    setQuotationsList((prev) => [savedQuotation, ...prev]);

    // 4. Close Enquiry modal and reload all data across Customer and Sales modules
    setEnquiryModalOpen(false);
    await loadAll();

    // 5. If user was on Enquiries tab, remain on Enquiries tab to see the newly created enquiry!
    if (activeTab !== 'Enquiries') {
      setActiveTab('Quotations');
    }

    showNotice(
      `Buyer "${customer}" registered in Customers module (Enquiry Lead). Enquiry ${enquiryNo} created in Sales module!`
    );

    // 6. Automatically show the Quotation preview layout & download PDF
    const previewDoc = {
      ...savedQuotation,
      type: 'Quotation',
      items: quotationItems,
      grandTotal: totalAmount,
      subtotal: totalAmount
    };
    setPreviewDocModal(previewDoc);

    // Automatically trigger PDF download of the preview quotation
    setTimeout(() => {
      generateQuotationPdf(previewDoc);
    }, 600);
  };

  // Convert an existing Enquiry directly to a Confirmed Sales Order
  const handleConvertEnquiryToOrder = async (enquiry) => {
    try {
      const soCount = data.filter((x) => x.type === 'Sales Order' || x.orderNo).length;
      const orderNo = `SO-${1024 + soCount}`;
      const totalAmount = Number(enquiry.totalAmount || 0);

      const salesOrderPayload = {
        type: 'Sales Order',
        orderNo,
        enquiryNo: enquiry.enquiryNo || '',
        customer: enquiry.customer,
        contactPerson: enquiry.contactPerson || '',
        email: enquiry.email || '',
        phone: enquiry.phone || '',
        address: enquiry.address || '',
        destination: enquiry.destination || '',
        currency: enquiry.currency || 'INR',
        incoterm: enquiry.incoterm || 'CIF',
        paymentTerms: enquiry.paymentTerms || 'Net 30',
        products: enquiry.products || [],
        totalAmount,
        advanceReceived: totalAmount * 0.3,
        balanceDue: totalAmount * 0.7,
        status: 'Confirmed'
      };

      await post('/sales', salesOrderPayload);
      if (enquiry._id) {
        await put(`/sales/${enquiry._id}`, { status: 'Converted', orderNo }).catch(() => null);
      }
      try {
        const localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
        localSales.unshift(salesOrderPayload);
        localStorage.setItem('export_pro_sales', JSON.stringify(localSales));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('sales-updated'));
      } catch (e) {}
      showNotice(`Enquiry ${enquiry.enquiryNo || ''} converted to Confirmed Sales Order (${orderNo})!`);
      await loadAll();
      setActiveTab('Sales Orders');
    } catch (err) {
      alert(err.message || 'Failed to convert enquiry to sales order');
    }
  };

  const isQuotationsTab = activeTab === 'Quotations';
  const isSalesOrdersTab = activeTab === 'Sales Orders';
  const isEnquiriesTab = activeTab === 'Enquiries';

  return (
    <>
      <PageHeader
        eyebrow="SALES & COMMERCIAL"
        title="Sales & Quotations"
        description="Manage export pipeline from lead enquiry to confirmed order"
      />

      {notification && (
        <div
          style={{
            background: notification.isErr ? '#ffe4e2' : '#dff5eb',
            color: notification.isErr ? '#c44d4d' : '#107b5c',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '12.5px',
            border: `1px solid ${notification.isErr ? '#f5c6cb' : '#b2e2cd'}`
          }}
        >
          <Sparkles size={16} /> {notification.msg}
        </div>
      )}

      {/* Tabs Switcher matching PDF Page 4 & 5 */}
      <div className="tabs-bar">
        <button
          className={`tab-pill ${isEnquiriesTab ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Enquiries');
            handleResetFilters();
          }}
        >
          Enquiries <span className="tab-count" style={{ background: isEnquiriesTab ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: isEnquiriesTab ? '#ffffff' : '#4b5563', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', marginLeft: '4px' }}>{enquiriesList.length}</span>
        </button>
        <button
          className={`tab-pill ${isQuotationsTab ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Quotations');
            handleResetFilters();
          }}
        >
          Quotations <span className="tab-count" style={{ background: isQuotationsTab ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: isQuotationsTab ? '#ffffff' : '#4b5563', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', marginLeft: '4px' }}>{quotationsList.length}</span>
        </button>
        <button
          className={`tab-pill ${isSalesOrdersTab ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('Sales Orders');
            handleResetFilters();
          }}
        >
          Sales Orders <span className="tab-count" style={{ background: isSalesOrdersTab ? 'rgba(255,255,255,0.25)' : '#e5e7eb', color: isSalesOrdersTab ? '#ffffff' : '#4b5563', padding: '1px 7px', borderRadius: '10px', fontSize: '11px', marginLeft: '4px' }}>{salesOrdersList.length}</span>
        </button>
      </div>

      {/* =========================================================
          VIEW 1: QUOTATIONS TAB (Page 4 of PDF)
          ========================================================= */}
      {isQuotationsTab && (
        <>
          {/* Tip Banner */}
         

          {/* 4 Summary KPI Cards */}
          <div className="stats module-stats">
            <StatCard
              icon={FileCheck2}
              label="Total Quotations"
              value={String(quotationStats.total)}
              note="Across all customers"
              tone="green"
            />
            <StatCard
              icon={Clock}
              label="Draft"
              value={String(quotationStats.draft)}
              note="Pending submission"
              tone="orange"
            />
            <StatCard
              icon={FileText}
              label="Sent"
              value={String(quotationStats.sent)}
              note="Awaiting customer review"
              tone="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Accepted"
              value={String(quotationStats.accepted)}
              note="Ready for Sales Order"
              tone="purple"
            />
          </div>

          {/* Main Quotations Table Panel */}
          <div className="panel table-panel" style={{ marginBottom: '24px' }}>
            <Toolbar
              search={{
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: 'Search by quotation number or customer name...'
              }}
              onReset={handleResetFilters}
            >
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
                <option value="Expired">Expired</option>
              </select>

              <select
                className="select"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {[...new Set(quotationsList.map((x) => x.customer).filter(Boolean))].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                className="select"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="">All Dates</option>
                <option value="today">Today</option>
                <option value="month">This Month</option>
              </select>
            </Toolbar>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '130px' }}>QUOTATION #</th>
                    <th style={{ width: '110px' }}>DATE</th>
                    <th>CUSTOMER</th>
                    <th style={{ width: '90px' }}>INCOTERM</th>
                    <th>PRODUCTS</th>
                    <th>TOTAL AMOUNT</th>
                    <th>VALIDITY</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotationsRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#889fa4' }}>
                        {loading ? 'Loading quotations...' : 'No quotations found matching your criteria.'}
                      </td>
                    </tr>
                  ) : (
                    filteredQuotationsRows.map((q) => {
                      const meta = getCustomerMeta(q.customer);
                      const currencySymbol = resolveCurrencySymbol(q.currency);
                      const itemsStr =
                        q.items && q.items.length > 0
                          ? q.items.map((it) => `${it.name} · ${it.quantity} ${it.unit || ''}`).join(', ')
                          : q.products && q.products.length > 0
                          ? q.products.map((it) => `${it.name} · ${it.quantity} ${it.unit || ''}`).join(', ')
                          : 'Export Items';

                      const isAccepted = q.status === 'Accepted';
                      const incoterm = q.incoterm || 'CIF';

                      return (
                        <tr key={q._id || q.quotationNo}>
                          <td>
                            <button
                              className="order-link"
                              style={{ background: 'none', border: 'none', padding: 0, fontWeight: 700, color: '#0c5a48', cursor: 'pointer' }}
                              onClick={() => setPreviewDocModal(q)}
                            >
                              {q.quotationNo}
                            </button>
                          </td>
                          <td style={{ color: '#4b5563', fontSize: '12.5px' }}>{q.quotationDate || '-'}</td>
                          <td>
                            <div className="customer-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`avatar-tag ${meta.color}`}>{meta.initials}</span>
                              <div>
                                <strong style={{ color: '#1f2937' }}>{q.customer}</strong>
                                <div style={{ fontSize: '11px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <span>{meta.flag}</span>
                                  <span>{q.destination || meta.port}</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              style={{
                                background: incoterm === 'CIF' ? '#e0f2fe' : incoterm === 'FOB' ? '#f3e8ff' : '#fef3c7',
                                color: incoterm === 'CIF' ? '#0369a1' : incoterm === 'FOB' ? '#7e22ce' : '#b45309',
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              {incoterm}
                            </span>
                          </td>
                          <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12.5px', color: '#374151' }}>
                            {itemsStr}
                          </td>
                          <td>
                            <strong style={{ color: '#111827', fontSize: '13px' }}>
                              {currencySymbol}
                              {Number(q.grandTotal || q.totalAmount || 0).toLocaleString(q.currency === 'INR' || !q.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </strong>
                          </td>
                          <td style={{ fontSize: '12px', color: '#4b5563' }}>{q.validUntil || '-'}</td>
                          <td>
                            <Status>{q.status}</Status>
                          </td>
                          <td>
                            <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                              {!isAccepted ? (
                                <button
                                  className="btn-purple"
                                  style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                                  title="Convert directly to Confirmed Sales Order"
                                  onClick={() => handleConvertQuotation(q)}
                                >
                                  Convert to Order →
                                </button>
                              ) : (
                                <span
                                  style={{
                                    background: '#dcfce7',
                                    color: '#15803d',
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    fontSize: '11px',
                                    fontWeight: 700
                                  }}
                                  title="Quotation already converted to Sales Order"
                                >
                                  {q.orderNo || 'Converted'}
                                </span>
                              )}
                              <button
                                className="small-btn"
                                title="View Quotation Document"
                                onClick={() => setPreviewDocModal(q)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Edit Quotation"
                                onClick={() => handleOpenEditQuotation(q)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="small-btn action-primary"
                                title="Download Official PDF"
                                onClick={() => generateQuotationPdf(q)}
                              >
                                <Download size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Delete Quotation"
                                onClick={() => handleDeleteQuotation(q._id, q.quotationNo)}
                              >
                                <Trash2 size={14} />
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

            <div className="pagination">
              <span>Showing 1 to {filteredQuotationsRows.length} of {quotationsList.length} records</span>
              <div className="pages">
                <button>‹</button>
                <button className="active">1</button>
                <button>›</button>
              </div>
            </div>
          </div>

          {/* Latest Enquiries (Awaiting Quote) section right below Quotations Table */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                  Latest Enquiries (Awaiting Quote)
                </h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  Direct buyer inquiries ready for commercial quote preparation
                </span>
              </div>
            </div>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>ENQUIRY #</th>
                    <th style={{ width: '110px' }}>DATE</th>
                    <th>CUSTOMER</th>
                    <th>ITEMS INTERESTED</th>
                    <th>DESTINATION</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {enquiriesList.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '24px', color: '#889fa4' }}>
                        No pending enquiries at this time.
                      </td>
                    </tr>
                  ) : (
                    enquiriesList.slice(0, 5).map((enq) => {
                      const meta = getCustomerMeta(enq.customer);
                      const itemsStr =
                        enq.products && enq.products.length > 0
                          ? enq.products.map((p) => `${p.name} · ${p.quantity} ${p.unit || 'Bags'}`).join(', ')
                          : enq.notes || 'Export Items';

                      return (
                        <tr key={enq._id || enq.enquiryNo}>
                          <td>
                            <strong style={{ color: '#0c5a48', fontSize: '12.5px' }}>{enq.enquiryNo}</strong>
                          </td>
                          <td style={{ color: '#4b5563', fontSize: '12px' }}>
                            {enq.createdAt ? new Date(enq.createdAt).toISOString().slice(0, 10) : '26 Apr 2025'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{meta.flag}</span>
                              <strong style={{ color: '#1f2937', fontSize: '12.5px' }}>{enq.customer}</strong>
                            </div>
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#4b5563' }}>{itemsStr}</td>
                          <td style={{ fontSize: '12px', color: '#4b5563' }}>{enq.destination || meta.port}</td>
                          <td>
                            <Status>{enq.status || 'Open'}</Status>
                          </td>
                          <td>
                            <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                className="btn-purple"
                                style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                                title="Pre-fill and prepare quotation"
                                onClick={() => handleOpenCreateQuotation(enq)}
                              >
                                Quotation →
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
        </>
      )}

      {/* =========================================================
          VIEW 2: SALES ORDERS TAB (Page 5 of PDF)
          ========================================================= */}
      {isSalesOrdersTab && (
        <>
          {/* 4 Summary KPI Cards */}
          <div className="stats module-stats">
            <StatCard
              icon={ClipboardList}
              label="Active Orders"
              value={String(salesOrdersList.length)}
              note="▲ 12% from last month"
              tone="green"
            />
            <StatCard
              icon={Package}
              label="In Preparation"
              value={String(salesOrdersList.filter(o => o.status === 'Preparing').length || 4)}
              note="Under packaging & QA"
              tone="orange"
            />
            <StatCard
              icon={CheckCircle}
              label="Ready to Ship"
              value={String(salesOrdersList.filter(o => o.status === 'Ready to Ship').length || 5)}
              note="Awaiting port container"
              tone="blue"
            />
            <StatCard
              icon={CircleDollarSign}
              label="Total Order Value"
              value={formatAmount(salesOrdersList.reduce((sum, o) => sum + (o.totalAmount || 0), 0) || 185000)}
              note="Confirmed pipeline"
              tone="green"
            />
          </div>

          {/* Main Sales Orders Table Panel */}
          <div className="panel table-panel" style={{ marginBottom: '24px' }}>
            <Toolbar
              search={{
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: 'Search by order no, customer, destination...'
              }}
              onReset={handleResetFilters}
            >
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Preparing">Preparing</option>
                <option value="Ready to Ship">Ready to Ship</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                className="select"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {[...new Set(salesOrdersList.map((x) => x.customer).filter(Boolean))].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Toolbar>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>ORDER #</th>
                    <th style={{ width: '100px' }}>DATE</th>
                    <th>CUSTOMER</th>
                    <th>DESTINATION</th>
                    <th>VALUE</th>
                    <th>ADVANCE</th>
                    <th>BALANCE</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesRows.length === 0 ? (
                    <tr>
                      <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#889fa4' }}>
                        No sales orders found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSalesRows.map((so) => {
                      const meta = getCustomerMeta(so.customer);
                      const isSelected = selectedOrder && (selectedOrder.orderNo === so.orderNo || selectedOrder._id === so._id);
                      const currencySymbol = resolveCurrencySymbol(so.currency);
                      const totalVal = Number(so.totalAmount || 45000);
                      const advVal = Number(so.advanceReceived !== undefined ? so.advanceReceived : totalVal * 0.3);
                      const balVal = Number(so.balanceDue !== undefined ? so.balanceDue : totalVal * 0.7);
                      const advPct = totalVal > 0 ? Math.round((advVal / totalVal) * 100) : 30;
                      const balPct = 100 - advPct;
                      const isINR = so.currency === 'INR' || !so.currency;

                      return (
                        <tr
                          key={so._id || so.orderNo}
                          style={{
                            background: isSelected ? '#f5f3ff' : 'transparent',
                            cursor: 'pointer'
                          }}
                          onClick={() => setSelectedOrderId(so.orderNo || so._id)}
                        >
                          <td>
                            <strong style={{ color: '#0c5a48', fontSize: '13px' }}>{so.orderNo}</strong>
                          </td>
                          <td style={{ color: '#4b5563', fontSize: '12px' }}>
                            {so.createdAt ? new Date(so.createdAt).toISOString().slice(0, 10) : '22 Apr 2025'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`avatar-tag ${meta.color}`}>{meta.initials}</span>
                              <strong style={{ color: '#1f2937' }}>{so.customer}</strong>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#4b5563' }}>
                              <span>{meta.flag}</span>
                              <span>{so.destination || meta.port}</span>
                            </div>
                          </td>
                          <td>
                            <strong style={{ color: '#111827', fontSize: '13px' }}>
                              {currencySymbol}{totalVal.toLocaleString(isINR ? 'en-IN' : undefined)}
                            </strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <strong style={{ color: '#15803d', fontSize: '12.5px' }}>
                                {currencySymbol}{advVal.toLocaleString(isINR ? 'en-IN' : undefined)}
                              </strong>
                              <span style={{ background: '#dcfce7', color: '#15803d', fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 700 }}>
                                {advPct}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <strong style={{ color: '#374151', fontSize: '12.5px' }}>
                                {currencySymbol}{balVal.toLocaleString(isINR ? 'en-IN' : undefined)}
                              </strong>
                              <span style={{ background: '#f3f4f6', color: '#4b5563', fontSize: '10px', padding: '1px 5px', borderRadius: '4px', fontWeight: 600 }}>
                                {balPct}%
                              </span>
                            </div>
                          </td>
                          <td>
                            <Status>{so.status}</Status>
                          </td>
                          <td>
                            <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                              <button
                                className="action-pill-btn"
                                style={{ background: '#fef3c7', color: '#d97706', borderColor: '#fde68a', fontWeight: 600 }}
                                title="Advance order to next workflow stage"
                                onClick={() => handleAdvanceStage(so)}
                              >
                                Advance ⚡
                              </button>
                              <button
                                className="small-btn"
                                title="View Document"
                                onClick={() => setPreviewDocModal(so)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Edit Sales Order"
                                onClick={() => setEditSalesModal(so)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Delete Order"
                                onClick={() => handleDeleteSale(so)}
                              >
                                <Trash2 size={14} />
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

            <div className="pagination">
              <span>Showing 1 to {filteredSalesRows.length} of {salesOrdersList.length} records</span>
              <div className="pages">
                <button>‹</button>
                <button className="active">1</button>
                <button>›</button>
              </div>
            </div>
          </div>

          {/* Selected Order Information & Order Journey Panel matching PDF Page 5 */}
          {selectedOrder && (
            <div className="order-details-journey-grid">
              {/* Left Column: Order Information */}
              <div className="panel" style={{ padding: '20px' }}>
                <h3 style={{ margin: '0 0 14px', fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                  Order information · {selectedOrder.orderNo}
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Customer:</span>
                    <strong style={{ color: '#111827' }}>{selectedOrder.customer}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Incoterm:</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.incoterm || 'CIF'} {selectedOrder.destination || 'Jebel Ali'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Items:</span>
                    <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>
                      {selectedOrder.products?.map((p) => `${p.name} · ${p.quantity} ${p.unit || ''} @ ${resolveCurrencySymbol(selectedOrder.currency)}${Number(p.unitPrice || 0).toLocaleString(selectedOrder.currency === 'INR' || !selectedOrder.currency ? 'en-IN' : undefined)}`).join(', ') || `Basmati Rice 1121 · 25 MT @ ${resolveCurrencySymbol(selectedOrder.currency)}1,100`}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Payment terms:</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>{selectedOrder.paymentTerms || '30% Advance, 70% against B/L copy'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6', paddingBottom: '8px' }}>
                    <span style={{ color: '#6b7280' }}>Advance rec'd:</span>
                    <strong style={{ color: '#15803d' }}>
                      {resolveCurrencySymbol(selectedOrder.currency)}
                      {Number(selectedOrder.advanceReceived !== undefined ? selectedOrder.advanceReceived : (selectedOrder.totalAmount || 45000) * 0.3).toLocaleString(selectedOrder.currency === 'INR' || !selectedOrder.currency ? 'en-IN' : undefined)} (Wire transfer 23 Apr)
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Est. dispatch:</span>
                    <span style={{ fontWeight: 600, color: '#111827' }}>28 Apr 2025 · Mundra Port</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Journey 6-stage Stepper */}
              <div className="panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ margin: 0, fontSize: '14.5px', fontWeight: 700, color: '#111827' }}>
                      Order journey · {selectedOrder.orderNo}
                    </h3>
                    <button
                      className="btn-purple"
                      style={{ padding: '4px 10px', fontSize: '11px', height: '26px' }}
                      onClick={() => handleAdvanceStage(selectedOrder)}
                    >
                      Advance Stage →
                    </button>
                  </div>

                  {/* 6 Stage Horizontal Stepper */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', marginTop: '14px', marginBottom: '20px' }}>
                    {/* Connecting background bar */}
                    <div style={{ position: 'absolute', top: '14px', left: '16px', right: '16px', height: '3px', background: '#e5e7eb', zIndex: 1 }} />
                    {JOURNEY_STAGES.map((stg, i) => {
                      const curIndex = JOURNEY_STAGES.indexOf(selectedOrder.status);
                      const effectiveIndex = curIndex === -1 ? (selectedOrder.status === 'Completed' ? 5 : 2) : curIndex;
                      const isPassed = i < effectiveIndex;
                      const isActive = i === effectiveIndex;

                      return (
                        <div key={stg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '50%',
                              background: isPassed ? '#10b981' : isActive ? '#0c5a48' : '#ffffff',
                              border: `2px solid ${isPassed ? '#10b981' : isActive ? '#0c5a48' : '#d1d5db'}`,
                              display: 'grid',
                              placeItems: 'center',
                              color: isPassed || isActive ? '#ffffff' : '#9ca3af',
                              fontSize: '11px',
                              fontWeight: 700,
                              boxShadow: isActive ? '0 0 0 4px rgba(12, 90, 72, 0.22)' : 'none',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            {isPassed ? '✓' : i + 1}
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              marginTop: '6px',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? '#0c5a48' : isPassed ? '#10b981' : '#6b7280',
                              textAlign: 'center',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {stg}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Stepper Tip Pill */}
                <div
                  style={{
                    background: '#f9fafb',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '9px 14px',
                    fontSize: '12px',
                    color: '#4b5563',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span>✨</span>
                  <span>Single click <strong>"Advance"</strong> progresses the order smoothly through preparation, QA, and fulfillment.</span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* =========================================================
          VIEW 3: ENQUIRIES TAB (Standalone Enquiries Management)
          ========================================================= */}
      {isEnquiriesTab && (
        <>
          <div className="stats module-stats">
            <StatCard
              icon={FileText}
              label="Total Enquiries"
              value={String(enquiriesList.length)}
              note="This month"
              tone="green"
            />
            <StatCard
              icon={Clock}
              label="Open RFQs"
              value={String(enquiriesList.filter(e => e.status === 'Open').length || 4)}
              note="Awaiting formal quote"
              tone="orange"
            />
            <StatCard
              icon={FileCheck2}
              label="Quoted"
              value={String(enquiriesList.filter(e => e.status === 'Quoted').length || 2)}
              note="Quotes in circulation"
              tone="blue"
            />
            <StatCard
              icon={CheckCircle}
              label="Conversion Rate"
              value="68%"
              note="Enquiry to Order ratio"
              tone="orange"
            />
          </div>

          <div className="panel table-panel">
            <Toolbar
              search={{
                value: searchQuery,
                onChange: (e) => setSearchQuery(e.target.value),
                placeholder: 'Search enquiries by number, customer, destination...'
              }}
              onReset={handleResetFilters}
            >
              <select
                className="select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="Open">Open</option>
                <option value="Reviewing">Reviewing</option>
                <option value="Quoted">Quoted</option>
              </select>

              <select
                className="select"
                value={customerFilter}
                onChange={(e) => setCustomerFilter(e.target.value)}
              >
                <option value="">All Customers</option>
                {[...new Set(enquiriesList.map((x) => x.customer).filter(Boolean))].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Toolbar>

            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '120px' }}>ENQUIRY #</th>
                    <th style={{ width: '110px' }}>DATE</th>
                    <th>CUSTOMER</th>
                    <th>DESTINATION</th>
                    <th>PRODUCTS REQUESTED</th>
                    <th>TARGET VALUE</th>
                    <th>STATUS</th>
                    <th style={{ textAlign: 'right' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSalesRows.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#889fa4' }}>
                        No enquiries found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredSalesRows.map((enq) => {
                      const meta = getCustomerMeta(enq.customer);
                      const itemsStr =
                        enq.products && enq.products.length > 0
                          ? enq.products.map((p) => `${p.name} · ${p.quantity} ${p.unit || ''}`).join(', ')
                          : enq.notes || 'Export Grade Specification';

                      return (
                        <tr key={enq._id || enq.enquiryNo}>
                          <td>
                            <strong style={{ color: '#0c5a48', fontSize: '13px' }}>{enq.enquiryNo}</strong>
                          </td>
                          <td style={{ color: '#4b5563', fontSize: '12px' }}>
                            {enq.createdAt ? new Date(enq.createdAt).toISOString().slice(0, 10) : '25 Apr 2025'}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span className={`avatar-tag ${meta.color}`}>{meta.initials}</span>
                              <strong style={{ color: '#1f2937' }}>{enq.customer}</strong>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12.5px', color: '#4b5563' }}>
                              <span>{meta.flag}</span>
                              <span>{enq.destination || meta.port}</span>
                            </div>
                          </td>
                          <td style={{ fontSize: '12.5px', color: '#4b5563' }}>{itemsStr}</td>
                          <td>
                            <strong style={{ color: '#111827', fontSize: '13px' }}>
                              {resolveCurrencySymbol(enq.currency)}{Number(enq.totalAmount || 0).toLocaleString(enq.currency === 'INR' || !enq.currency ? 'en-IN' : undefined)}
                            </strong>
                          </td>
                          <td>
                            <Status>{enq.status || 'Open'}</Status>
                          </td>
                          <td>
                            <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                              <button
                                className="btn-purple"
                                style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                                title="Prepare commercial quotation"
                                onClick={() => handleOpenCreateQuotation(enq)}
                              >
                                Quotation →
                              </button>
                              <button
                                className="small-btn"
                                title="View Enquiry"
                                onClick={() => setPreviewDocModal(enq)}
                              >
                                <Eye size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Edit Enquiry"
                                onClick={() => setEditSalesModal(enq)}
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                className="small-btn"
                                title="Delete Enquiry"
                                onClick={() => handleDeleteSale(enq)}
                              >
                                <Trash2 size={14} />
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

            <div className="pagination">
              <span>Showing 1 to {filteredSalesRows.length} of {enquiriesList.length} records</span>
              <div className="pages">
                <button>‹</button>
                <button className="active">1</button>
                <button>›</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* =========================================================
          CREATE / EDIT QUOTATION MODAL (Multi-item line calculations)
          ========================================================= */}
      {quotationModalOpen && (
        <Modal
          eyebrow="QUOTATION MANAGEMENT"
          title={editingQuotation ? `Edit Quotation — ${quotationForm.quotationNo}` : 'Create New Quotation'}
          onClose={() => setQuotationModalOpen(false)}
          large
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setQuotationModalOpen(false)}>
                Cancel
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setPreviewDocModal({
                      ...quotationForm,
                      type: 'Quotation',
                      subtotal: liveFinancials.subtotal,
                      totalDiscount: liveFinancials.totalDiscount,
                      taxableAmount: liveFinancials.taxableAmount,
                      taxTotal: liveFinancials.taxTotal,
                      shippingCharges: liveFinancials.shippingCharges,
                      grandTotal: liveFinancials.grandTotal,
                      totalAmount: liveFinancials.grandTotal
                    });
                  }}
                >
                  <Eye size={15} /> Preview Quotation
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => handleSaveQuotation('Draft', false)}
                >
                  <FileText size={15} /> Save as Draft
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={() =>
                    handleSaveQuotation(
                      quotationForm.status === 'Draft' ? 'Sent' : quotationForm.status,
                      true
                    )
                  }
                >
                  <Download size={15} /> Generate & Download PDF
                </button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Customer Details */}
            <div style={{ background: '#f9fcfb', padding: '16px', borderRadius: '9px', border: '1px solid #e2edeb' }}>
              <h3 style={{ margin: '0 0 12px', fontSize: '13.5px', color: '#0c4650', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Building size={16} color="#087a68" /> Customer Details
              </h3>
              <div className="form-grid">
                <div className="field">
                  <label>Quotation Number *</label>
                  <input
                    value={quotationForm.quotationNo}
                    onChange={(e) => setQuotationForm({ ...quotationForm, quotationNo: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Customer Selection *</label>
                  <select
                    value={quotationForm.customer}
                    onChange={(e) => handleCustomerSelect(e.target.value)}
                    required
                  >
                    <option value="">-- Select Customer --</option>
                    {customers.map((c) => (
                      <option key={c._id || c.companyName} value={c.companyName}>
                        {c.companyName} ({c.country || 'Global'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Quotation Date *</label>
                  <input
                    type="date"
                    value={quotationForm.quotationDate}
                    onChange={(e) => setQuotationForm({ ...quotationForm, quotationDate: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Valid Until Date *</label>
                  <input
                    type="date"
                    value={quotationForm.validUntil}
                    onChange={(e) => setQuotationForm({ ...quotationForm, validUntil: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>Contact Person</label>
                  <input
                    value={quotationForm.contactPerson}
                    onChange={(e) => setQuotationForm({ ...quotationForm, contactPerson: e.target.value })}
                    placeholder="e.g. Maria Lopez"
                  />
                </div>
                <div className="field">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={quotationForm.email}
                    onChange={(e) => setQuotationForm({ ...quotationForm, email: e.target.value })}
                    placeholder="buyer@example.com"
                  />
                </div>
                <div className="field">
                  <label>Phone Number</label>
                  <input
                    value={quotationForm.phone}
                    onChange={(e) => setQuotationForm({ ...quotationForm, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="field">
                  <label>Destination Port / City</label>
                  <input
                    value={quotationForm.destination}
                    onChange={(e) => setQuotationForm({ ...quotationForm, destination: e.target.value })}
                    placeholder="e.g. Dubai, UAE or Hamburg, Germany"
                  />
                </div>
                <div className="field full">
                  <label>Customer Billing & Delivery Address</label>
                  <input
                    value={quotationForm.address}
                    onChange={(e) => setQuotationForm({ ...quotationForm, address: e.target.value })}
                    placeholder="Street, District, City, Country"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '9px', border: '1px solid #e2edeb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '13.5px', color: '#0c4650', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Package size={16} color="#087a68" /> Line Items ({quotationForm.items.length})
                </h3>
                <button
                  type="button"
                  className="secondary"
                  style={{ height: '32px', fontSize: '11.5px', padding: '0 10px' }}
                  onClick={handleAddLineItem}
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ background: '#f8fcfa', borderBottom: '1px solid #e2edeb' }}>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'left', color: '#688086' }}>PRODUCT / SERVICE</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'left', width: '90px', color: '#688086' }}>QTY</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'left', width: '80px', color: '#688086' }}>UNIT</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'right', width: '110px', color: '#688086' }}>UNIT PRICE</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'center', width: '110px', color: '#688086' }}>DISCOUNT</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'center', width: '90px', color: '#688086' }}>TAX (%)</th>
                      <th style={{ padding: '8px 10px', fontSize: '11px', textAlign: 'right', width: '110px', color: '#688086' }}>TOTAL</th>
                      <th style={{ padding: '8px 10px', width: '40px' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotationForm.items.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #edf3f2' }}>
                        <td style={{ padding: '8px 6px' }}>
                          <input
                            list={`prod-opts-s-${idx}`}
                            placeholder="Product name or select"
                            value={item.name}
                            onChange={(e) => handleLineItemChange(idx, 'name', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px' }}
                          />
                          <datalist id={`prod-opts-s-${idx}`}>
                            {productsCatalog.map((p) => (
                              <option key={p._id || p.name} value={p.name} />
                            ))}
                          </datalist>
                          <input
                            placeholder="Description / specs"
                            value={item.description}
                            onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                            style={{ width: '100%', padding: '4px 8px', fontSize: '11px', border: '1px solid #edf3f2', borderRadius: '4px', marginTop: '4px', color: '#668085' }}
                          />
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleLineItemChange(idx, 'quantity', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px' }}
                          />
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <select
                            value={item.unit}
                            onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                            style={{ width: '100%', padding: '6px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px' }}
                          >
                            <option>PCS</option>
                            <option>MT</option>
                            <option>KG</option>
                            <option>ROLL</option>
                            <option>PAIR</option>
                            <option>BAG</option>
                          </select>
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => handleLineItemChange(idx, 'unitPrice', e.target.value)}
                            style={{ width: '100%', padding: '6px 8px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px', textAlign: 'right' }}
                          />
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <div style={{ display: 'flex', gap: '3px' }}>
                            <input
                              type="number"
                              min="0"
                              value={item.discount}
                              onChange={(e) => handleLineItemChange(idx, 'discount', e.target.value)}
                              style={{ width: '60px', padding: '6px 4px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px', textAlign: 'center' }}
                            />
                            <select
                              value={item.discountType || 'percent'}
                              onChange={(e) => handleLineItemChange(idx, 'discountType', e.target.value)}
                              style={{ padding: '6px 2px', fontSize: '11px', border: '1px solid #dce8e6', borderRadius: '6px' }}
                            >
                              <option value="percent">%</option>
                              <option value="amount">{resolveCurrencySymbol(quotationForm.currency)}</option>
                            </select>
                          </div>
                        </td>
                        <td style={{ padding: '8px 6px' }}>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.taxRate}
                            onChange={(e) => handleLineItemChange(idx, 'taxRate', e.target.value)}
                            style={{ width: '100%', padding: '6px 4px', fontSize: '12px', border: '1px solid #dce8e6', borderRadius: '6px', textAlign: 'center' }}
                          />
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600, color: '#0c4650' }}>
                          {resolveCurrencySymbol(quotationForm.currency)}{Number(item.lineTotal || 0).toFixed(2)}
                        </td>
                        <td style={{ padding: '8px 6px', textAlign: 'center' }}>
                          <button
                            type="button"
                            className="small-btn"
                            title="Remove line"
                            onClick={() => handleRemoveLineItem(idx)}
                            style={{ color: '#c44d4d' }}
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary & Commercial Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '16px' }}>
              <div style={{ background: '#f9fcfb', padding: '16px', borderRadius: '9px', border: '1px solid #e2edeb' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#0c4650' }}>Additional Terms</h3>
                <div className="form-grid">
                  <div className="field">
                    <label>Currency</label>
                    <select
                      value={quotationForm.currency}
                      onChange={(e) => setQuotationForm({ ...quotationForm, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Incoterm</label>
                    <select
                      value={quotationForm.incoterm}
                      onChange={(e) => setQuotationForm({ ...quotationForm, incoterm: e.target.value })}
                    >
                      <option value="CIF">CIF (Cost, Insurance & Freight)</option>
                      <option value="FOB">FOB (Free On Board)</option>
                      <option value="CFR">CFR (Cost & Freight)</option>
                      <option value="EXW">EXW (Ex Works)</option>
                      <option value="DDP">DDP (Delivered Duty Paid)</option>
                      <option value="CIP">CIP (Carriage & Insurance Paid)</option>
                    </select>
                  </div>
                  <div className="field full">
                    <label>Payment Terms</label>
                    <input
                      value={quotationForm.paymentTerms}
                      onChange={(e) => setQuotationForm({ ...quotationForm, paymentTerms: e.target.value })}
                      placeholder="e.g. Net 30 or 30% Advance, 70% against BL"
                    />
                  </div>
                  <div className="field full">
                    <label>Delivery Terms</label>
                    <input
                      value={quotationForm.deliveryTerms}
                      onChange={(e) => setQuotationForm({ ...quotationForm, deliveryTerms: e.target.value })}
                      placeholder="e.g. CIF Destination Port"
                    />
                  </div>
                  <div className="field full">
                    <label>Notes to Customer</label>
                    <textarea
                      value={quotationForm.notes}
                      onChange={(e) => setQuotationForm({ ...quotationForm, notes: e.target.value })}
                      style={{ minHeight: '55px' }}
                    />
                  </div>
                  <div className="field full">
                    <label>Terms & Conditions</label>
                    <textarea
                      value={quotationForm.termsAndConditions}
                      onChange={(e) => setQuotationForm({ ...quotationForm, termsAndConditions: e.target.value })}
                      style={{ minHeight: '55px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Financial Summary Box */}
              <div style={{ background: '#f5faf8', padding: '18px', borderRadius: '9px', border: '1px solid #d4e7e3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ margin: '0 0 14px', fontSize: '13.5px', color: '#0c4650', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <DollarSign size={16} color="#087a68" /> Financial Summary
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#4a676d' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Subtotal:</span>
                      <strong>{resolveCurrencySymbol(quotationForm.currency)}{liveFinancials.subtotal.toLocaleString(quotationForm.currency === 'INR' || !quotationForm.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                    </div>

                    {liveFinancials.totalDiscount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c44d4d' }}>
                        <span>Total Discount:</span>
                        <strong>-{resolveCurrencySymbol(quotationForm.currency)}{liveFinancials.totalDiscount.toLocaleString(quotationForm.currency === 'INR' || !quotationForm.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Taxable Amount:</span>
                      <span>{resolveCurrencySymbol(quotationForm.currency)}{liveFinancials.taxableAmount.toLocaleString(quotationForm.currency === 'INR' || !quotationForm.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tax / VAT:</span>
                      <span>{resolveCurrencySymbol(quotationForm.currency)}{liveFinancials.taxTotal.toLocaleString(quotationForm.currency === 'INR' || !quotationForm.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                      <span>Shipping / Freight:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span>{resolveCurrencySymbol(quotationForm.currency)}</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={quotationForm.shippingCharges}
                          onChange={(e) => setQuotationForm({ ...quotationForm, shippingCharges: Number(e.target.value || 0) })}
                          style={{ width: '85px', padding: '4px 6px', fontSize: '12px', textAlign: 'right', border: '1px solid #cedfe0', borderRadius: '6px' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '2px solid #087a68', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0c4650' }}>Grand Total:</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: '#087a68' }}>
                    {resolveCurrencySymbol(quotationForm.currency)}{liveFinancials.grandTotal.toLocaleString(quotationForm.currency === 'INR' || !quotationForm.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          QUOTATION PREVIEW & PDF DOWNLOAD MODAL
          ========================================================= */}
      {previewDocModal && (
        <Modal
          eyebrow={
            previewDocModal.type === 'Sales Order'
              ? 'CENTRAL SALES ORDER'
              : previewDocModal.type === 'Enquiry'
              ? 'CUSTOMER ENQUIRY'
              : 'EXPORT QUOTATION'
          }
          title={
            previewDocModal.quotationNo ||
            previewDocModal.orderNo ||
            previewDocModal.enquiryNo ||
            'Document Preview'
          }
          onClose={() => setPreviewDocModal(null)}
          large
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px', flexWrap: 'wrap' }}>
              <button type="button" className="secondary" onClick={() => setPreviewDocModal(null)}>
                Close
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                {(previewDocModal.type === 'Quotation' || previewDocModal.quotationNo) && (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => generateQuotationPdf(previewDocModal)}
                  >
                    <Download size={15} /> Download PDF File
                  </button>
                )}
                {previewDocModal.type === 'Sales Order' && previewDocModal.status !== 'Completed' && (
                  <button
                    type="button"
                    className="primary"
                    onClick={() => handleAdvanceStage(previewDocModal)}
                  >
                    <Sparkles size={15} /> Advance Next Stage
                  </button>
                )}
              </div>
            </div>
          }
        >
          <div className="document-preview" id="printable-quotation-doc">
            <div className="doc-header">
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
              <div className="doc-meta">
                <h2>
                  {previewDocModal.type === 'Sales Order'
                    ? 'SALES ORDER CONFIRMATION'
                    : previewDocModal.type === 'Enquiry'
                    ? 'CUSTOMER ENQUIRY'
                    : 'QUOTATION'}
                </h2>
                <div className="doc-meta-badge">
                  {previewDocModal.quotationNo || previewDocModal.orderNo || previewDocModal.enquiryNo}
                </div>
                <div>
                  <strong>Issue Date:</strong>{' '}
                  {previewDocModal.quotationDate ||
                    (previewDocModal.createdAt ? new Date(previewDocModal.createdAt).toLocaleDateString() : 'Today')}
                </div>
                {previewDocModal.validUntil && (
                  <div>
                    <strong>Valid Until:</strong> {previewDocModal.validUntil}
                  </div>
                )}
                <div>
                  <strong>Status:</strong> <Status>{previewDocModal.status || 'Draft'}</Status>
                </div>
              </div>
            </div>

            {/* If Sales Order, show stage stepper */}
            {previewDocModal.type === 'Sales Order' && (
              <div className="workflow-stepper">
                {ORDER_STAGES.map((stg, i) => {
                  const currentIdx = ORDER_STAGES.indexOf(previewDocModal.status);
                  const isPassed = i < currentIdx;
                  const isActive = i === currentIdx;
                  return (
                    <React.Fragment key={stg}>
                      <div className={`step-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`}>
                        <div className="step-circle">{isPassed ? '✓' : i + 1}</div>
                        <span className="step-label">{stg}</span>
                      </div>
                      {i < ORDER_STAGES.length - 1 && (
                        <div className={`step-divider ${isPassed ? 'passed' : ''}`} />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            <div className="doc-addresses">
              <div className="doc-address-block">
                <h4>BILLED / QUOTED TO:</h4>
                <strong>{previewDocModal.customer || previewDocModal.companyName}</strong>
                <br />
                {previewDocModal.address || previewDocModal.destination || 'Consignee Port / City'}
                <br />
                Attn: {previewDocModal.contactPerson || 'Purchasing Department'}
                <br />
                Email: {previewDocModal.email || 'purchasing@buyer.com'}
              </div>
              <div className="doc-address-block">
                <h4>COMMERCIAL & LOGISTICS TERMS:</h4>
                Currency: <strong>{previewDocModal.currency || 'INR'}</strong>
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
                    name: 'Premium Basmati Rice',
                    description: 'Standard export specification',
                    quantity: 50,
                    unit: 'MT',
                    unitPrice: 580,
                    lineTotal: 29000
                  }
                ]).map((it, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <strong>{it.name}</strong>
                      {it.description && <div style={{ fontSize: '11px', color: '#68848a' }}>{it.description}</div>}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {it.quantity} {it.unit || 'PCS'}
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
                      {resolveCurrencySymbol(previewDocModal.currency)}{Number(it.lineTotal || (it.quantity * it.unitPrice)).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="doc-summary">
              <div className="doc-totals">
                <div className="doc-totals-row">
                  <span>Subtotal:</span>
                  <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.subtotal || previewDocModal.grandTotal || previewDocModal.totalAmount || 0).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                {previewDocModal.totalDiscount > 0 && (
                  <div className="doc-totals-row">
                    <span>Discount:</span>
                    <span>-{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.totalDiscount).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {previewDocModal.taxTotal > 0 && (
                  <div className="doc-totals-row">
                    <span>Tax:</span>
                    <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.taxTotal).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                {(previewDocModal.shippingCharges > 0 || previewDocModal.freight > 0) && (
                  <div className="doc-totals-row">
                    <span>Freight ({previewDocModal.incoterm || 'CIF'}):</span>
                    <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.shippingCharges || previewDocModal.freight || 0).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="doc-totals-row grand-total">
                  <span>Grand Total:</span>
                  <span>{resolveCurrencySymbol(previewDocModal.currency)}{Number(previewDocModal.grandTotal || previewDocModal.totalAmount || 0).toLocaleString(previewDocModal.currency === 'INR' || !previewDocModal.currency ? 'en-IN' : undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="doc-footer-notes">
              <div>
                <strong>Notes & Specifications:</strong>
                <p style={{ margin: '4px 0 0' }}>{previewDocModal.notes || 'All items inspected according to export standards.'}</p>
                <div style={{ marginTop: '8px' }}>
                  <strong>Terms & Conditions:</strong>
                  <p style={{ margin: '4px 0 0' }}>{previewDocModal.termsAndConditions || 'Payment according to agreed terms.'}</p>
                </div>
              </div>
              <div className="doc-sign-block">
                <div className="doc-sign-line" />
                <strong>Master Export Pro Inc.</strong>
                <br />
                <span style={{ fontSize: '10px', color: '#7a9499' }}>Authorized Signatory</span>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* =========================================================
          CREATE ENQUIRY MODAL (Auto-saves customer to Customers page & supports Quote / Sales Order conversion)
          ========================================================= */}
      {enquiryModalOpen && (
        <Modal
          eyebrow="EXPORT PIPELINE — STEP 1"
          title="Create Customer & Enquiry"
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
                title="Save Customer & Enquiry, generate Commercial Quotation, and download preview"
                style={{ padding: '10px 24px', fontSize: '13px', fontWeight: 700 }}
              >
                <Plus size={16} /> Save Enquiry
              </button>
            </div>
          }
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: '#e8f5f1',
              border: '1px solid #c2e5dc',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#0c5a48',
              fontSize: '12.5px',
              fontWeight: 600
            }}
          >
            <Sparkles size={16} />
            <span>
              Saving creates the customer in <strong>Customer Module</strong> and saves the enquiry in <strong>Sales Module</strong>, then automatically opens the Quotation preview and triggers download.
            </span>
          </div>
          <form id="enquiry-form" onSubmit={(e) => { e.preventDefault(); handleSaveEnquiry(); }}>
            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e1e2d', fontWeight: 700, borderBottom: '1px solid #f0f2f5', paddingBottom: '6px' }}>
              1. Customer & Buyer Information (Saved to Customer Module)
            </h4>
            <div className="form-grid" style={{ marginBottom: '18px' }}>
              <div className="field">
                <label>Customer / Buyer Company *</label>
                <input
                  name="customer"
                  required
                  placeholder="e.g. ABC Trading LLC"
                  value={enquiryForm.customer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                />
                <span style={{ fontSize: '10.5px', color: '#6b7280' }}>
                  Enter buyer / company name (auto-saved to Customers module)
                </span>
              </div>

              <div className="field">
                <label>Contact Person</label>
                <input
                  name="contactPerson"
                  placeholder="e.g. Ahmed Ali"
                  value={enquiryForm.contactPerson}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, contactPerson: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Buyer Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="buyer@abctrading.ae"
                  value={enquiryForm.email}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Buyer Phone / WhatsApp</label>
                <input
                  name="phone"
                  placeholder="+971 50 123 4567"
                  value={enquiryForm.phone}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Country / Destination Port *</label>
                <input
                  name="destination"
                  required
                  placeholder="e.g. Dubai, UAE or Hamburg, Germany"
                  value={enquiryForm.destination}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, destination: e.target.value, country: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Billing Currency</label>
                <select
                  name="currency"
                  value={enquiryForm.currency}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, currency: e.target.value }))}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div className="field">
                <label>Payment Terms</label>
                <input
                  name="paymentTerms"
                  placeholder="e.g. Net 30, Advance, 30% Adv + 70% B/L"
                  value={enquiryForm.paymentTerms}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, paymentTerms: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Delivery / Office Address</label>
                <input
                  name="address"
                  placeholder="Office 402, Business Bay, Dubai"
                  value={enquiryForm.address}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>

            <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e1e2d', fontWeight: 700, borderBottom: '1px solid #f0f2f5', paddingBottom: '6px' }}>
              2. Enquiry Products & Commercial Terms (Saved to Sales Module)
            </h4>
            <div className="form-grid">
              <div className="field">
                <label>Product Requested *</label>
                <select
                  name="productName"
                  required
                  value={enquiryForm.productName}
                  onChange={(e) => handleProductChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #dcdfe4',
                    background: '#fff',
                    fontSize: '13px',
                    color: enquiryForm.productName ? '#1e1e2d' : '#6b7280'
                  }}
                >
                  <option value="">-- Choose Product from Product Catalog --</option>
                  {productsCatalog.map((p, idx) => (
                    <option key={p._id || p.sku || idx} value={p.name}>
                      {p.icon ? p.icon + ' ' : ''}{p.name} ({p.sku || p.unit || 'Export'}) — {resolveCurrencySymbol(enquiryForm.currency)}{p.price || 0}/{p.unit || 'MT'}
                    </option>
                  ))}
                  {enquiryForm.productName && !productsCatalog.some((p) => p.name === enquiryForm.productName) && (
                    <option value={enquiryForm.productName}>{enquiryForm.productName}</option>
                  )}
                </select>
              </div>

              <div className="field">
                <label>Item Description / Grade Specs</label>
                <input
                  name="description"
                  placeholder="e.g. Long grain, double polished, 25kg PP bags"
                  value={enquiryForm.description}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  required
                  min="1"
                  value={enquiryForm.quantity}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                />
              </div>

              <div className="field">
                <label>Unit of Measure</label>
                <select
                  name="unit"
                  value={enquiryForm.unit}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, unit: e.target.value }))}
                >
                  <option value="MT">MT (Metric Ton)</option>
                  <option value="KG">KG (Kilograms)</option>
                  <option value="PCS">PCS (Pieces)</option>
                  <option value="Bags">Bags (25kg / 50kg)</option>
                  <option value="Boxes">Boxes / Cartons</option>
                  <option value="Containers">20ft / 40ft Container</option>
                </select>
              </div>

              <div className="field">
                <label>Expected / Target Unit Price</label>
                <input
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  value={enquiryForm.unitPrice}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, unitPrice: Number(e.target.value) }))}
                />
              </div>

              <div className="field">
                <label>Estimated Total Value</label>
                <input
                  readOnly
                  style={{ background: '#f8fafc', fontWeight: 700, color: '#0c5a48' }}
                  value={`${resolveCurrencySymbol(enquiryForm.currency)}${(Number(enquiryForm.quantity || 0) * Number(enquiryForm.unitPrice || 0)).toLocaleString()}`}
                />
              </div>

              <div className="field full">
                <label>Buyer Requirements / Notes</label>
                <textarea
                  name="notes"
                  placeholder="Specify packaging specifications, inspection requirements, target delivery date..."
                  value={enquiryForm.notes}
                  onChange={(e) => setEnquiryForm((prev) => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================================================
          GENERIC EDIT SALES RECORD MODAL
          ========================================================= */}
      {editSalesModal && (
        <Modal
          title={`Edit ${editSalesModal.type} Record`}
          onClose={() => setEditSalesModal(null)}
          footer={
            <>
              <button className="secondary" onClick={() => setEditSalesModal(null)}>
                Cancel
              </button>
              <button className="primary" form="edit-sales-form">
                Save Changes
              </button>
            </>
          }
        >
          <form
            id="edit-sales-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              const payload = Object.fromEntries(fd.entries());
              payload.totalAmount = Number(payload.totalAmount || 0);
              payload.freight = Number(payload.freight || 0);

              try {
                if (editSalesModal._id && !editSalesModal._id.startsWith('so-local-')) {
                  await put(`/sales/${editSalesModal._id}`, payload);
                }
              } catch (err) {
                console.warn('Backend update failed, saving locally:', err);
              }

              try {
                const localSales = JSON.parse(localStorage.getItem('export_pro_sales') || '[]');
                const idx = localSales.findIndex(
                  (s) => s._id === editSalesModal._id || s.orderNo === editSalesModal.orderNo || s.enquiryNo === editSalesModal.enquiryNo
                );
                if (idx >= 0) {
                  localSales[idx] = { ...localSales[idx], ...payload };
                } else {
                  localSales.unshift({ ...editSalesModal, ...payload });
                }
                localStorage.setItem('export_pro_sales', JSON.stringify(localSales));
                window.dispatchEvent(new Event('storage'));
                window.dispatchEvent(new CustomEvent('sales-updated'));
              } catch (err) {}

              setData((prev) =>
                prev.map((s) =>
                  s._id === editSalesModal._id || s.orderNo === editSalesModal.orderNo || s.enquiryNo === editSalesModal.enquiryNo
                    ? { ...s, ...payload }
                    : s
                )
              );
              setEditSalesModal(null);
              loadAll();
            }}
          >
            <div className="form-grid">
              <div className="field">
                <label>Type</label>
                <select name="type" defaultValue={editSalesModal.type}>
                  <option>Enquiry</option>
                  <option>Quotation</option>
                  <option>Sales Order</option>
                </select>
              </div>

              <div className="field">
                <label>Status</label>
                <input name="status" defaultValue={editSalesModal.status} />
              </div>

              <div className="field">
                <label>Enquiry No.</label>
                <input name="enquiryNo" defaultValue={editSalesModal.enquiryNo || ''} />
              </div>

              <div className="field">
                <label>Quotation No.</label>
                <input name="quotationNo" defaultValue={editSalesModal.quotationNo || ''} />
              </div>

              <div className="field">
                <label>Order No.</label>
                <input name="orderNo" defaultValue={editSalesModal.orderNo || ''} />
              </div>

              <div className="field">
                <label>Customer</label>
                <input name="customer" defaultValue={editSalesModal.customer || ''} />
              </div>

              <div className="field">
                <label>Destination</label>
                <input name="destination" defaultValue={editSalesModal.destination || ''} />
              </div>

              <div className="field">
                <label>Currency</label>
                <select name="currency" defaultValue={editSalesModal.currency || 'INR'}>
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>

              <div className="field">
                <label>Incoterm</label>
                <input name="incoterm" defaultValue={editSalesModal.incoterm || 'FOB'} />
              </div>

              <div className="field">
                <label>Freight</label>
                <input name="freight" type="number" defaultValue={editSalesModal.freight || 0} />
              </div>

              <div className="field">
                <label>Payment Terms</label>
                <input name="paymentTerms" defaultValue={editSalesModal.paymentTerms || 'Net 30'} />
              </div>

              <div className="field">
                <label>Total Amount</label>
                <input name="totalAmount" type="number" defaultValue={editSalesModal.totalAmount || 0} />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
