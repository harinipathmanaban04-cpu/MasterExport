import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, Eye, X, Building, Mail, Phone, MapPin, FileText, CheckCircle2 } from 'lucide-react';
import { get, post, put, del } from '../api';
import Modal from '../components/Modal';
import { useCurrency } from '../context/CurrencyContext';

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
  }
];

export default function Customers() {
  const { currency: globalCurrency, currencySymbol: globalSymbol } = useCurrency();

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
  const [statusFilter, setStatusFilter] = useState('Active');
  const [selectedCustomer, setSelectedCustomer] = useState(defaultCustomers[0]);
  const [drawerTab, setDrawerTab] = useState('Details'); // 'Details' | 'Orders' | 'Ledger'
  const [addModalOpen, setAddModalOpen] = useState(false);

  const load = async () => {
    try {
      const data = await get('/customers');
      if (data && data.length > 0) {
        const mapped = data.map((c, idx) => ({
          ...c,
          customerId: c.customerId || `CUST-${101 + idx}`,
          avatar: c.companyName?.slice(0, 2).toUpperCase() || 'CU',
          avatarColor: idx % 4 === 0 ? 'purple' : idx % 4 === 1 ? 'coral' : idx % 4 === 2 ? 'blue' : 'teal',
          country: c.country?.includes('🇦🇪') || c.country === 'UAE' ? 'UAE 🇦🇪' :
                   c.country?.includes('🇳🇱') || c.country === 'Netherlands' ? 'Netherlands 🇳🇱' :
                   c.country?.includes('🇺🇸') || c.country === 'USA' ? 'USA 🇺🇸' :
                   c.country?.includes('🇯🇵') || c.country === 'Japan' ? 'Japan 🇯🇵' : (c.country || 'International 🌐'),
          outstandingBalance: c.outstandingBalance !== undefined ? c.outstandingBalance : (idx === 0 ? 35000 : idx === 3 ? 12500 : 0)
        }));
        setCustomers(mapped);
        setSelectedCustomer(mapped[0]);
      }
    } catch (e) {
      console.warn('Failed to load customers from backend, using defaults:', e);
    }
  };

  useEffect(() => {
    load();
  }, []);

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

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const newCust = {
      customerId: `CUST-${101 + customers.length}`,
      companyName: fd.get('companyName'),
      contactPerson: fd.get('contactPerson'),
      country: fd.get('country'),
      email: fd.get('email'),
      phone: fd.get('phone'),
      address: fd.get('address'),
      taxNumber: fd.get('taxNumber') || 'TRN 100234567890003',
      currency: fd.get('currency') || globalCurrency || 'INR',
      paymentTerms: fd.get('paymentTerms') || 'Net 30',
      outstandingBalance: 0,
      status: 'Active'
    };

    try {
      await post('/customers', newCust);
      await load();
      setAddModalOpen(false);
    } catch (err) {
      // Offline fallback
      setCustomers((prev) => [
        ...prev,
        {
          ...newCust,
          _id: `cust-${Date.now()}`,
          avatar: newCust.companyName.slice(0, 2).toUpperCase(),
          avatarColor: 'purple'
        }
      ]);
      setAddModalOpen(false);
    }
  };

  return (
    <div className="customers-page">
      {/* Header matching PDF Page 2 */}
      <div className="dash-head">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 4px', color: '#1e1e2d' }}>
            Customers
          </h1>
          <p style={{ margin: 0, color: '#7e8299', fontSize: '13.5px' }}>
            Manage international buyers and credit terms
          </p>
        </div>
        <button
          className="btn-purple"
          onClick={() => setAddModalOpen(true)}
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {/* Filter Toolbar matching PDF Page 2 */}
      <div className="filter-toolbar">
        <div className="global-search filter-search" style={{ background: '#ffffff', border: '1px solid var(--border)' }}>
          <Search size={16} />
          <input
            placeholder="Search customer or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={countryFilter}
          onChange={(e) => setCountryFilter(e.target.value)}
          style={{
            height: '38px',
            padding: '0 32px 0 14px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: '#ffffff',
            color: '#374151',
            fontSize: '12.5px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">All Countries</option>
          <option value="UAE">UAE 🇦🇪</option>
          <option value="Netherlands">Netherlands 🇳🇱</option>
          <option value="USA">USA 🇺🇸</option>
          <option value="Japan">Japan 🇯🇵</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            height: '38px',
            padding: '0 32px 0 14px',
            borderRadius: '20px',
            border: '1px solid var(--border)',
            background: '#ffffff',
            color: '#374151',
            fontSize: '12.5px',
            fontWeight: 500,
            outline: 'none',
            cursor: 'pointer'
          }}
        >
          <option value="">All Statuses</option>
          <option value="Active">Status: Active</option>
          <option value="Inactive">Status: Inactive</option>
        </select>
      </div>

      {/* Split Screen Layout matching PDF Page 2 */}
      <div className="customer-page-layout">
        {/* Main Customers Table */}
        <div className="customer-main-table panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>CUSTOMER ID</th>
                  <th>COMPANY</th>
                  <th>COUNTRY</th>
                  <th>CONTACT</th>
                  <th>CURRENCY</th>
                  <th>PAY TERMS</th>
                  <th>OUTSTANDING</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => {
                  const isSelected = selectedCustomer?._id === c._id;
                  return (
                    <tr
                      key={c._id || c.customerId}
                      style={{ background: isSelected ? '#fbfbfe' : 'transparent', cursor: 'pointer' }}
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
                          <strong style={{ fontSize: '13px', color: '#1e1e2d' }}>{c.companyName}</strong>
                        </div>
                      </td>
                      <td>{c.country}</td>
                      <td>{c.contactPerson}</td>
                      <td>
                        <span style={{ fontWeight: 600, color: '#4b5563' }}>{c.currency || 'INR'}</span>
                      </td>
                      <td>{c.paymentTerms || 'Net 30'}</td>
                      <td>
                        <strong style={{ color: c.outstandingBalance > 0 ? '#ca8a04' : '#1e1e2d', fontSize: '13px' }}>
                          {resolveCurrencySymbol(c.currency)}{Number(c.outstandingBalance || 0).toLocaleString(c.currency === 'INR' || !c.currency ? 'en-IN' : undefined)}
                        </strong>
                      </td>
                      <td style={{ textAlign: 'right' }}>
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Customer Side Drawer matching PDF Page 2 */}
        {selectedCustomer && (
          <div className="customer-drawer">
            <div className="customer-drawer-head">
              <div className="customer-drawer-avatar">
                {selectedCustomer.avatar || selectedCustomer.companyName.slice(0, 2).toUpperCase()}
              </div>
              <div className="customer-drawer-title">
                <h3>{selectedCustomer.companyName}</h3>
                <div className="meta-sub">
                  <span>{selectedCustomer.customerId}</span>
                  <span>•</span>
                  <span>{selectedCustomer.country}</span>
                  <span>•</span>
                  <span style={{ color: '#10b981', fontWeight: 600 }}>🟢 Active</span>
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

            {/* Detail Tabs */}
            <div className="customer-drawer-tabs">
              <button
                className={`customer-drawer-tab ${drawerTab === 'Details' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Details')}
              >
                Details
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Orders' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Orders')}
              >
                Orders
              </button>
              <button
                className={`customer-drawer-tab ${drawerTab === 'Ledger' ? 'active' : ''}`}
                onClick={() => setDrawerTab('Ledger')}
              >
                Ledger
              </button>
            </div>

            {drawerTab === 'Details' && (
              <div className="customer-tab-content">
                <div className="customer-field-group">
                  <label>Contact person</label>
                  <div className="value">{selectedCustomer.contactPerson || 'Ahmed Ali'}</div>
                </div>

                <div className="customer-field-group">
                  <label>Email</label>
                  <div className="value">{selectedCustomer.email || 'ahmed@abctrading.ae'}</div>
                </div>

                <div className="customer-field-group">
                  <label>Full address</label>
                  <div className="value">{selectedCustomer.address || 'Office 402, Business Bay, Dubai, UAE'}</div>
                </div>

                <div className="customer-field-group">
                  <label>Tax number</label>
                  <div className="value">{selectedCustomer.taxNumber || 'TRN 100234567890003'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div className="customer-field-group">
                    <label>Currency</label>
                    <div className="value">{selectedCustomer.currency || 'INR'}</div>
                  </div>
                  <div className="customer-field-group">
                    <label>Pay terms</label>
                    <div className="value">{selectedCustomer.paymentTerms || 'Net 30'}</div>
                  </div>
                </div>

                <div className="customer-balance-box">
                  <span>Outstanding balance</span>
                  <strong>{resolveCurrencySymbol(selectedCustomer.currency)}{Number(selectedCustomer.outstandingBalance || 35000).toLocaleString(selectedCustomer.currency === 'INR' || !selectedCustomer.currency ? 'en-IN' : undefined)}</strong>
                </div>
              </div>
            )}

            {drawerTab === 'Orders' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>SO-1024</strong> • Basmati Rice 1121
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '3px' }}>
                    <span>{resolveCurrencySymbol(selectedCustomer.currency)}50,000</span>
                    <span style={{ color: '#0c5a48', fontWeight: 600 }}>Confirmed</span>
                  </div>
                </div>
                <div style={{ padding: '8px 0' }}>
                  <strong>SO-1018</strong> • Export Consignment
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '3px' }}>
                    <span>{resolveCurrencySymbol(selectedCustomer.currency)}22,500</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Completed</span>
                  </div>
                </div>
              </div>
            )}

            {drawerTab === 'Ledger' && (
              <div className="customer-tab-content" style={{ fontSize: '12px' }}>
                <div style={{ padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <strong>INV-301</strong> • Proforma
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', marginTop: '3px' }}>
                    <span>Total: {resolveCurrencySymbol(selectedCustomer.currency)}50,000</span>
                    <span style={{ color: '#ca8a04', fontWeight: 600 }}>Due: {resolveCurrencySymbol(selectedCustomer.currency)}35,000</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {addModalOpen && (
        <Modal
          eyebrow="CLIENT ONBOARDING"
          title="Add International Customer"
          onClose={() => setAddModalOpen(false)}
          footer={
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setAddModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" form="add-cust-form" className="btn-purple">
                Save Customer
              </button>
            </div>
          }
        >
          <form id="add-cust-form" onSubmit={handleCreateCustomer}>
            <div className="form-grid">
              <div className="field">
                <label>Company Name *</label>
                <input name="companyName" required placeholder="e.g. ABC Trading LLC" />
              </div>
              <div className="field">
                <label>Contact Person *</label>
                <input name="contactPerson" required placeholder="e.g. Ahmed Ali" />
              </div>
              <div className="field">
                <label>Country *</label>
                <input name="country" required placeholder="e.g. UAE 🇦🇪" />
              </div>
              <div className="field">
                <label>Email *</label>
                <input name="email" type="email" required placeholder="ahmed@abctrading.ae" />
              </div>
              <div className="field">
                <label>Phone *</label>
                <input name="phone" required placeholder="+971 50 123 4567" />
              </div>
              <div className="field">
                <label>Billing Currency</label>
                <select name="currency" defaultValue="INR">
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AED">AED (د.إ)</option>
                </select>
              </div>
              <div className="field">
                <label>Payment Terms</label>
                <input name="paymentTerms" defaultValue="Net 30" placeholder="e.g. Net 30, Advance" />
              </div>
              <div className="field">
                <label>Tax Number / TRN</label>
                <input name="taxNumber" placeholder="e.g. TRN 100234567890003" />
              </div>
              <div className="field full">
                <label>Full Delivery / Office Address</label>
                <textarea name="address" placeholder="Office 402, Business Bay, Dubai, UAE" />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
