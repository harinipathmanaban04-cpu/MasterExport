# Master Export Pro — Simplified MVP Export ERP

Master Export Pro is an Export Business Management ERP built on the MERN stack with Vite, React, Express, and MongoDB.

The entire UI has been meticulously redesigned and aligned to match the 8-page reference PDF design specification and ChatGPT UI screenshots.

---

## 🚀 Core Export Workflow

```
CUSTOMER ➜ ENQUIRY ➜ QUOTATION ➜ SALES ORDER ➜ SHIPMENT ➜ INVOICE ➜ PAYMENT ➜ COMPLETED
```

### Key Product Principle
**Enter information once and reuse it everywhere.** Customer information flows seamlessly from the customer master into enquiries, quotations, sales orders, shipments, invoices, payments, and business reports. Products, quantities, unit prices, currency, Incoterms, and payment terms carry forward automatically.

---

## 💎 The Sales Module (Heart of the MVP)

All 3 phases are managed within the unified **Sales Management** area (`/sales`):

1. **Enquiry**:
   - Record customer enquiries with buyer, products requested, expected quantity & price, target currency, and buyer notes.
   - Status: `Open` ➜ `Quoted` ➜ `Cancelled`.
   - One-click **"Prepare Quotation"** button automatically transfers all customer and product details into a new quotation draft.

2. **Quotation**:
   - **Fields**: Customer, products (multi-product rows with SKU and HS code), quantity, unit price, currency (USD, EUR, GBP, AED), Incoterm (FOB, CIF, CFR, EXW, DDP, CIP), freight & insurance charges, payment terms, validity period, and auto-calculated total amount.
   - **Download / Print Quotation**: Preview official Proforma Export Quotation with company header, buyer details, itemized HS code table, Incoterms, bank details, and an authorized signature block. Supports one-click **"Print / Save PDF"** via standard browser print.
   - **One-Click Order Conversion**: Convert accepted quotations directly into Confirmed Sales Orders (`SO-102X`) preserving all items, pricing, and terms.
   - Status: `Draft` ➜ `Sent` ➜ `Pending` ➜ `Accepted` ➜ `Rejected`.

3. **Sales Order (Central Entity)**:
   - Tracks the full export shipment lifecycle:
     ```
     Confirmed ➜ Preparing ➜ Ready to Ship ➜ Shipped ➜ Delivered ➜ Completed
     ```
   - Visual 6-stage lifecycle stepper progress bar.
   - Direct shortcuts to create linked Shipments and Invoices.

---

## 📱 Modules & Screens Matched (8 Reference Pages)

1. **Dashboard** (`/`)
   - KPI metrics (Active Orders: 24, Pending Shipments: 8, Outstanding Payments: $45,000, Monthly Sales: $185,000)
   - Recent Sales Orders table with stage badges
   - Quick Actions (Create New Enquiry, Add Customer, Add Product, Create Sales Order)
   - Catalog & Operations stats (Total Customers: 12, Total Products: 35, Total Shipments: 6, Total Invoices: 18)
2. **Customer Management** (`/customers`)
   - Buyer CRM with country flags, initial badges, contact info, and status
   - Detail view with related export activity summary
   - Full CRUD modal
3. **Product Management** (`/products`)
   - Product catalog with SKU, HS codes, category tags, units, pricing, and stock status
   - Low stock warning badges
   - Full CRUD modal
4. **Sales Management** (`/sales`)
   - Unified table with tabs for All Records, Enquiries, Quotations, and Sales Orders
   - Full Enquiry ➜ Quotation ➜ Sales Order workflow
   - Printable / Downloadable Proforma Export Quotation view
   - Status progression buttons
5. **Shipment Management** (`/shipments`)
   - Consignment tracker with transport mode badges (Sea, Air, Truck)
   - Container numbers, ETD, ETA, carrier details, and tracking timeline
   - Full CRUD modal
6. **Invoices & Payments** (`/invoices`)
   - Commercial and Proforma Invoice management
   - Real-time balances: Total Invoiced, Paid Amount, and Balance Due
   - Printable Commercial Invoice document view
   - Full CRUD modal
7. **Business Reports** (`/reports`)
   - Recharts visualizations: Monthly Sales bar chart, Category breakdown donut chart, Payment status donut chart
   - Export Report: Generates and downloads clean CSV report
8. **Account Settings** (`/settings`)
   - Profile information with admin avatar
   - Business information (Company name, Tax ID, address, website)
   - System preferences (Language, Timezone, Date format, Currency)
   - One-click "Reset Demo Data" option

---

## 🛠️ How to Run

### Option 1: Quick start on Windows
Double-click `start.bat` or run:
```powershell
.\start.bat
```

### Option 2: Command Line
```powershell
npm install
npm run install:all
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **MongoDB Database**: `mongodb://127.0.0.1:27017/master_export_pro`
