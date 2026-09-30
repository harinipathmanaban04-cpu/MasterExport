import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerId: String,
  companyName: { type: String, required: true },
  contactPerson: String,
  country: String,
  email: String,
  phone: String,
  address: String,
  taxNumber: String,
  currency: { type: String, default: 'INR' },
  paymentTerms: { type: String, default: 'Net 30' },
  outstandingBalance: { type: Number, default: 0 },
  status: { type: String, default: 'Active' }
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  icon: String,
  sku: String,
  description: String,
  hsCode: String,
  unit: { type: String, default: 'PCS' },
  price: { type: Number, default: 0 },
  purchasePrice: { type: Number, default: 0 },
  countryOfOrigin: { type: String, default: 'India' },
  stock: { type: Number, default: 0 },
  availableStock: String,
  minStock: { type: Number, default: 0 },
  status: { type: String, default: 'Active' },
  category: { type: String, default: 'General' }
}, { timestamps: true });

const salesSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Enquiry', 'Quotation', 'Sales Order'],
    default: 'Enquiry',
    required: true
  },
  enquiryNo: String,
  quotationNo: String,
  orderNo: String,
  customer: { type: String, required: true },
  customerId: String,
  contactPerson: String,
  email: String,
  phone: String,
  origin: { type: String, default: 'Nhava Sheva, Mumbai, India' },
  destination: String,
  products: [{
    name: String,
    sku: String,
    hsCode: String,
    unit: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  }],
  currency: { type: String, default: 'INR' },
  incoterm: { type: String, default: 'FOB' },
  freight: { type: Number, default: 0 },
  paymentTerms: { type: String, default: 'Net 30' },
  validity: { type: String, default: '30 Days' },
  notes: String,
  totalAmount: { type: Number, default: 0 },
  advanceReceived: { type: Number, default: 0 },
  balanceDue: { type: Number, default: 0 },
  status: { type: String, default: 'Open' },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

const quotationItemSchema = new mongoose.Schema({
  productId: String,
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true, default: 1, min: 1 },
  unit: { type: String, default: 'PCS' },
  unitPrice: { type: Number, required: true, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  discountType: { type: String, default: 'percent' },
  taxRate: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0 },
  lineTotal: { type: Number, required: true, default: 0 }
}, { _id: false });

const quotationSchema = new mongoose.Schema({
  quotationNo: { type: String, required: true, unique: true },
  quotationDate: { type: String, required: true },
  validUntil: { type: String, required: true },
  customerId: String,
  customer: { type: String, required: true },
  companyName: String,
  contactPerson: String,
  email: String,
  phone: String,
  address: String,
  destination: String,
  origin: { type: String, default: 'Nhava Sheva, Mumbai, India' },
  items: [quotationItemSchema],
  currency: { type: String, default: 'INR' },
  subtotal: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  taxableAmount: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  shippingCharges: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true, default: 0 },
  paymentTerms: { type: String, default: 'Net 30' },
  deliveryTerms: { type: String, default: 'CIF Destination Port' },
  incoterm: { type: String, default: 'CIF' },
  notes: { type: String, default: 'All items inspected according to international export grade standards. Standard seaworthy export packaging.' },
  termsAndConditions: { type: String, default: '1. Prices valid until expiry date.\n2. Payment terms as agreed.\n3. Goods dispatch within 14 business days from order confirmation.' },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
    default: 'Draft'
  },
  enquiryNo: String,
  orderNo: String
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema);
export const Product = mongoose.model('Product', productSchema);
export const Sale = mongoose.model('Sale', salesSchema);
export const Quotation = mongoose.model('Quotation', quotationSchema);
