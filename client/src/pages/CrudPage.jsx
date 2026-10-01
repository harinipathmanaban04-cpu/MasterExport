import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Eye,
  Trash2,
  Users,
  Package,
  Boxes,
  Tag,
  ListFilter,
  FileText,
  Ship,
  Plus
} from 'lucide-react';
import { get, post, put, del } from '../api';
import { PageHeader, StatCard, Status, Toolbar, IconCell } from '../components/Layout';
import Modal from '../components/Modal';

const flag = {
  UAE: '🇦🇪',
  Germany: '🇩🇪',
  Singapore: '🇸🇬',
  USA: '🇺🇸',
  Netherlands: '🇳🇱',
  China: '🇨🇳'
};

const configs = {
  customers: {
    eyebrow: 'CUSTOMERS',
    title: 'Customer Management',
    desc: 'Manage your buyers and keep track of their orders, invoices and payments.',
    add: 'Add Customer',
    search: 'Search by company, contact, country...',
    filters: ['country', 'status'],
    stats: [
      ['Total Customers', '12', 'Active customers'],
      ['Total Orders', '35', 'In catalog'],
      ['Total Shipments', '6', 'In transit'],
      ['Total Invoices', '18', '$32,500 issued']
    ],
    cols: ['CUSTOMER NAME', 'CONTACT PERSON', 'COUNTRY', 'EMAIL', 'PHONE', 'STATUS'],
    fields: [
      ['companyName', 'Company Name *', 'text', true],
      ['contactPerson', 'Contact Person *', 'text', true],
      ['country', 'Country *', 'text', true],
      ['email', 'Email Address *', 'email', true],
      ['phone', 'Phone Number *', 'text', true],
      ['address', 'Office / Delivery Address', 'textarea', false],
      ['currency', 'Billing Currency', 'select', false, ['USD', 'EUR', 'GBP', 'AED', 'INR']],
      ['paymentTerms', 'Payment Terms', 'text', false],
      ['status', 'Account Status', 'select', false, ['Active', 'Pending', 'Inactive']]
    ]
  },
  products: {
    eyebrow: 'PRODUCTS',
    title: 'Product Management',
    desc: 'Manage your product catalog, pricing and stock information.',
    add: 'Add Product',
    search: 'Search by product name, SKU, HS Code...',
    filters: ['category', 'status'],
    stats: [
      ['Total Products', '35', 'In catalog'],
      ['Total Stock Value', '$245,000', 'Across all products'],
      ['Low Stock Items', '3', 'Need attention'],
      ['Categories', '8', 'Product categories']
    ],
    cols: ['PRODUCT NAME', 'SKU', 'HS CODE', 'CATEGORY', 'UNIT', 'PRICE', 'STOCK', 'STATUS'],
    fields: [
      ['name', 'Product Name *', 'text', true],
      ['sku', 'SKU (Stock Keeping Unit) *', 'text', true],
      ['description', 'Product Description', 'textarea', false],
      ['hsCode', 'HS Code (Harmonized System)', 'text', false],
      ['category', 'Category', 'select', false, ['Agricultural Products', 'Seafood', 'Textiles', 'Footwear', 'Furniture', 'Food & Beverages', 'General']],
      ['unit', 'Unit of Measure', 'select', false, ['MT', 'KG', 'ROLL', 'PAIR', 'PC', 'BAG', 'CARTON']],
      ['price', 'Selling Price ($) *', 'number', true],
      ['purchasePrice', 'Purchase Price ($)', 'number', false],
      ['countryOfOrigin', 'Country of Origin', 'text', false],
      ['stock', 'Current Stock Quantity', 'number', false],
      ['minStock', 'Minimum Stock Alert Level', 'number', false],
      ['status', 'Status', 'select', false, ['Active', 'Draft', 'Archived']]
    ]
  }
};

const statIcons = {
  customers: [Users, Boxes, Ship, FileText],
  products: [Package, Boxes, Tag, ListFilter]
};

export default function CrudPage({ type }) {
  const c = configs[type];
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [filter1, setFilter1] = useState('');
  const [filter2, setFilter2] = useState('');
  const [edit, setEdit] = useState(null); // object to add or edit
  const [viewItem, setViewItem] = useState(null); // detail modal

  const load = () => get('/' + type).then(setData).catch(() => {});
  useEffect(() => {
    load();
  }, [type]);

  const filtered = useMemo(() => {
    return data.filter((x) => {
      const matchQ = !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase());
      const f1 = c.filters[0];
      const f2 = c.filters[1];
      const matchF1 = !filter1 || x[f1] === filter1;
      const matchF2 = !filter2 || x[f2] === filter2;
      return matchQ && matchF1 && matchF2;
    });
  }, [data, q, filter1, filter2, c]);

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const o = Object.fromEntries(fd.entries());
    for (const k of ['price', 'purchasePrice', 'stock', 'minStock']) {
      if (k in o) o[k] = Number(o[k] || 0);
    }
    try {
      if (edit?._id) {
        await put('/' + type + '/' + edit._id, o);
      } else {
        await post('/' + type, o);
      }
      setEdit(null);
      load();
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (confirm('Are you sure you want to delete this record?')) {
      await del('/' + type + '/' + id);
      load();
    }
  };

  const handleReset = () => {
    setQ('');
    setFilter1('');
    setFilter2('');
  };

  return (
    <>
      <PageHeader
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.desc}
        action={{
          label: c.add,
          onClick: () =>
            setEdit(
              type === 'customers'
                ? { status: 'Active', currency: 'USD', paymentTerms: 'Net 30' }
                : { status: 'Active', unit: 'MT', countryOfOrigin: 'India', stock: 100, minStock: 20 }
            )
        }}
      />

      {/* 4 Stat KPI cards */}
      <div className="stats module-stats">
        {c.stats.map((s, i) => {
          const IconComp = statIcons[type][i];
          const tone = i === 1 ? 'blue' : i === 2 ? 'orange' : i === 3 ? 'green' : 'green';
          return (
            <StatCard
              key={s[0]}
              icon={IconComp}
              label={s[0]}
              value={s[1]}
              note={s[2]}
              tone={tone}
            />
          );
        })}
      </div>

      {/* Filters & Table */}
      <div className="panel table-panel">
        <Toolbar
          search={{
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: c.search
          }}
          onReset={handleReset}
        >
          {/* Filter 1 */}
          <select
            className="select"
            value={filter1}
            onChange={(e) => setFilter1(e.target.value)}
          >
            <option value="">
              {c.filters[0] === 'category' ? 'All Categories' : 'All Countries'}
            </option>
            {[...new Set(data.map((x) => x[c.filters[0]]).filter(Boolean))].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>

          {/* Filter 2 */}
          <select
            className="select"
            value={filter2}
            onChange={(e) => setFilter2(e.target.value)}
          >
            <option value="">All Status</option>
            {[...new Set(data.map((x) => x[c.filters[1]]).filter(Boolean))].map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </Toolbar>

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input type="checkbox" className="row-check" />
                </th>
                {c.cols.map((col) => (
                  <th key={col}>{col}</th>
                ))}
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={c.cols.length + 2} style={{ textAlign: 'center', padding: '30px', color: '#8aa0a4' }}>
                    No {type} found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((x, i) => (
                  <tr key={x._id || i}>
                    <td>
                      <input className="row-check" type="checkbox" />
                    </td>

                    {type === 'customers' ? (
                      <>
                        <td>
                          <div className="name-cell">
                            <span className="initial">{x.companyName?.[0] || 'C'}</span>
                            <strong>{x.companyName}</strong>
                          </div>
                        </td>
                        <td>{x.contactPerson}</td>
                        <td>
                          <span className="country">
                            <span className="country-flag">{flag[x.country] || '🌐'}</span>
                            {x.country}
                          </span>
                        </td>
                        <td>{x.email}</td>
                        <td>{x.phone}</td>
                        <td>
                          <Status>{x.status}</Status>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>
                          <div className="name-cell">
                            <IconCell tone={i % 2 ? 'orange' : 'green'}>
                              <Package size={15} />
                            </IconCell>
                            <div>
                              <strong>{x.name}</strong>
                              <span className="sub">{x.description}</span>
                            </div>
                          </div>
                        </td>
                        <td>{x.sku}</td>
                        <td>{x.hsCode}</td>
                        <td>
                          <Status>{x.category}</Status>
                        </td>
                        <td>{x.unit}</td>
                        <td>
                          <strong>${Number(x.price || 0).toFixed(2)}</strong>
                        </td>
                        <td>{x.stock}</td>
                        <td>
                          <Status>{Number(x.stock) <= Number(x.minStock) ? 'Low Stock' : 'In Stock'}</Status>
                        </td>
                      </>
                    )}

                    <td>
                      <div className="actions" style={{ justifyContent: 'flex-end' }}>
                        <button
                          className="small-btn"
                          title="View Details"
                          onClick={() => setViewItem(x)}
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          className="small-btn"
                          title="Edit"
                          onClick={() => setEdit(x)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="small-btn"
                          title="Delete"
                          onClick={() => remove(x._id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching reference screenshot */}
        <div className="pagination">
          <span>
            Showing 1 to {Math.min(6, filtered.length)} of {data.length} {type}
          </span>
          <div className="pages">
            <button>‹</button>
            <button className="active">1</button>
            <button>2</button>
            {type === 'products' && (
              <>
                <button>3</button>
                <button>4</button>
                <button>5</button>
              </>
            )}
            <button>›</button>
          </div>
        </div>
      </div>

      {/* VIEW ITEM MODAL */}
      {viewItem && (
        <Modal
          eyebrow={type === 'customers' ? 'BUYER PROFILE' : 'PRODUCT SPECIFICATION'}
          title={viewItem.companyName || viewItem.name}
          onClose={() => setViewItem(null)}
          footer={
            <button className="secondary" onClick={() => setViewItem(null)}>
              Close
            </button>
          }
        >
          {type === 'customers' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="doc-addresses" style={{ margin: 0 }}>
                <div>
                  <h4>BUYER INFORMATION</h4>
                  <strong>{viewItem.companyName}</strong>
                  <br />
                  Contact: {viewItem.contactPerson}
                  <br />
                  Country: {flag[viewItem.country] || ''} {viewItem.country}
                  <br />
                  Address: {viewItem.address || 'Business Bay'}
                </div>
                <div>
                  <h4>CONTACT & TERMS</h4>
                  Email: {viewItem.email}
                  <br />
                  Phone: {viewItem.phone}
                  <br />
                  Preferred Currency: <strong>{viewItem.currency || 'USD'}</strong>
                  <br />
                  Payment Terms: <strong>{viewItem.paymentTerms || 'Net 30'}</strong>
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fcfa', borderRadius: '8px', border: '1px solid #e1eceb' }}>
                <strong style={{ fontSize: '12px', color: '#0c4650' }}>Export Activity Summary:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#668086' }}>
                  Customer has 4 Active Sales Orders, 2 Shipments in Transit, and total invoiced value of $78,400.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="doc-addresses" style={{ margin: 0 }}>
                <div>
                  <h4>PRODUCT DETAILS</h4>
                  <strong>{viewItem.name}</strong>
                  <br />
                  SKU: {viewItem.sku} | HS Code: {viewItem.hsCode}
                  <br />
                  Category: {viewItem.category}
                  <br />
                  Country of Origin: {viewItem.countryOfOrigin || 'India'}
                </div>
                <div>
                  <h4>PRICING & STOCK</h4>
                  Selling Price: <strong>${Number(viewItem.price || 0).toFixed(2)}</strong> / {viewItem.unit}
                  <br />
                  Purchase Cost: ${Number(viewItem.purchasePrice || 0).toFixed(2)}
                  <br />
                  Current Inventory: <strong>{viewItem.stock} {viewItem.unit}</strong>
                  <br />
                  Minimum Stock Alert: {viewItem.minStock} {viewItem.unit}
                </div>
              </div>
              <div style={{ padding: '12px', background: '#f8fcfa', borderRadius: '8px', border: '1px solid #e1eceb' }}>
                <strong style={{ fontSize: '12px', color: '#0c4650' }}>Description & Packaging:</strong>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#668086' }}>
                  {viewItem.description || 'Standard international export packaging suitable for multimodal transport.'}
                </p>
              </div>
            </div>
          )}
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {edit !== null && (
        <Modal
          eyebrow={type === 'customers' ? 'CUSTOMER MANAGEMENT' : 'CATALOG MANAGEMENT'}
          title={edit._id ? `Edit ${type === 'customers' ? 'Customer' : 'Product'}` : c.add}
          onClose={() => setEdit(null)}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button type="submit" className="primary" form="crud-form">
                Save Record
              </button>
            </div>
          }
        >
          <form id="crud-form" onSubmit={save}>
            <div className="form-grid">
              {c.fields.map(([key, label, inputType, required, options]) => (
                <div className={`field ${inputType === 'textarea' ? 'full' : ''}`} key={key}>
                  <label>{label}</label>
                  {inputType === 'textarea' ? (
                    <textarea name={key} defaultValue={edit[key] || ''} />
                  ) : inputType === 'select' ? (
                    <select name={key} defaultValue={edit[key] || options[0]}>
                      {options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      name={key}
                      defaultValue={edit[key] ?? ''}
                      type={inputType}
                      required={required}
                      step={inputType === 'number' ? '0.01' : undefined}
                    />
                  )}
                </div>
              ))}
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
