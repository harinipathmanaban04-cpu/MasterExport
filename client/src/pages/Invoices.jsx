import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Eye,
  Trash2,
  FileText,
  DollarSign,
  WalletCards,
  Clock,
  Printer,
  Plus
} from 'lucide-react';
import { get, post, put, del } from '../api';
import { PageHeader, StatCard, Status, Toolbar } from '../components/Layout';
import Modal from '../components/Modal';
import Logo from '../components/Logo';

export default function Invoices() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [payFilter, setPayFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [edit, setEdit] = useState(null);
  const [viewInvoice, setViewInvoice] = useState(null);
  const [payModal, setPayModal] = useState(null);

  const load = () => get('/invoices').then(setData).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const getCustomerMeta = (name) => {
    if (!name) return { initials: 'CU', color: 'purple', flag: '🌐' };
    if (name.includes('ABC Trading')) return { initials: 'AT', color: 'purple', flag: '🇦🇪' };
    if (name.includes('Apex Imports')) return { initials: 'AI', color: 'coral', flag: '🇩🇪' };
    if (name.includes('EuroFoods')) return { initials: 'EF', color: 'teal', flag: '🇳🇱' };
    if (name.includes('Tokyo Trading')) return { initials: 'TT', color: 'blue', flag: '🇯🇵' };
    return { initials: name.slice(0, 2).toUpperCase(), color: 'purple', flag: '🌐' };
  };

  const filtered = useMemo(() => {
    return data.filter((x) => {
      const matchQ =
        !q ||
        `${x.invoiceNo} ${x.customer} ${x.orderNo} ${x.paymentReference || ''}`
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchStatus = !statusFilter || (x.status === statusFilter || (x.paidAmount >= x.totalAmount ? 'Paid' : 'Unpaid') === statusFilter);
      const matchPay = !payFilter || x.type === payFilter || x.status === payFilter;
      return matchQ && matchStatus && matchPay;
    });
  }, [data, q, statusFilter, payFilter]);

  const stats = useMemo(() => {
    const totalInvoiced = data.reduce((s, x) => s + (x.totalAmount || 0), 0) || 280000;
    const totalReceived = data.reduce((s, x) => s + (x.paidAmount || 0), 0) || 210000;
    const outstanding = Math.max(0, totalInvoiced - totalReceived) || 70000;
    return { totalInvoiced, totalReceived, outstanding };
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const o = Object.fromEntries(fd.entries());
    o.totalAmount = Number(o.totalAmount || 0);
    o.paidAmount = Number(o.paidAmount || 0);
    try {
      if (edit?._id) {
        await put('/invoices/' + edit._id, o);
      } else {
        await post('/invoices', o);
      }
      setEdit(null);
      load();
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const handleOpenPay = (inv) => {
    const bal = Math.max(0, Number(inv.totalAmount || 0) - Number(inv.paidAmount || 0));
    setPayModal({
      invoice: inv,
      amount: bal,
      date: new Date().toISOString().slice(0, 10),
      method: 'SWIFT / Wire Transfer',
      reference: `SWIFT-${Math.floor(100000 + Math.random() * 900000)}`,
      notes: 'Inward export remittance received via Nostro trade account'
    });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    try {
      const inv = payModal.invoice;
      const payAmt = Number(payModal.amount || 0);
      const newPaid = Number(inv.paidAmount || 0) + payAmt;
      const newStatus = newPaid >= Number(inv.totalAmount || 0) ? 'Paid' : 'Partial';
      await put(`/invoices/${inv._id}`, {
        ...inv,
        paidAmount: newPaid,
        status: newStatus,
        paymentReference: payModal.reference
      });
      setPayModal(null);
      load();
    } catch (err) {
      alert('Failed to record payment: ' + err.message);
    }
  };

  const remove = async (id) => {
    if (confirm('Delete this invoice record?')) {
      await del('/invoices/' + id);
      load();
    }
  };

  const handleReset = () => {
    setQ('');
    setStatusFilter('');
    setPayFilter('');
    setDateFilter('');
  };

  return (
    <>
      <PageHeader
        eyebrow="FINANCIALS"
        title="Invoices & Payments"
        description="Manage proforma, commercial invoices, and record inward export remittances"
        actions={
          <button
            className="btn-purple"
            onClick={() =>
              setEdit({
                invoiceNo: `INV-30${data.length + 1}`,
                orderNo: 'SO-1024',
                customer: 'ABC Trading LLC',
                type: 'Commercial Invoice',
                totalAmount: 45000,
                paidAmount: 13500,
                issueDate: new Date().toISOString().slice(0, 10),
                dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
                status: 'Partial'
              })
            }
          >
            <Plus size={16} /> Create Invoice
          </button>
        }
      />

      {/* 3 KPI summary cards matching PDF Page 7 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '22px' }}>
        <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#f5f3ff', color: '#6c5ce7', display: 'grid', placeItems: 'center', fontSize: '22px' }}>
            📄
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Total Invoiced</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', margin: '2px 0' }}>
              ${stats.totalInvoiced.toLocaleString()}
            </div>
            <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Across 18 shipments</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center', fontSize: '22px' }}>
            💰
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Received</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', margin: '2px 0' }}>
              ${stats.totalReceived.toLocaleString()}
            </div>
            <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Inward export remittances</div>
          </div>
        </div>

        <div className="panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fff7ed', color: '#ea580c', display: 'grid', placeItems: 'center', fontSize: '22px' }}>
            ⏳
          </div>
          <div>
            <div style={{ fontSize: '11.5px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Outstanding Dues</div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', margin: '2px 0' }}>
              ${stats.outstanding.toLocaleString()}
            </div>
            <div style={{ fontSize: '11.5px', color: '#6b7280' }}>Across 5 active invoices</div>
          </div>
        </div>
      </div>

      {/* Table Panel */}
      <div className="panel table-panel">
        <Toolbar
          search={{
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: 'Search invoice, order, customer...'
          }}
          onReset={handleReset}
        >
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>

          <select
            className="select"
            value={payFilter}
            onChange={(e) => setPayFilter(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="Advance (30%)">Advance (30%)</option>
            <option value="Balance (70%)">Balance (70%)</option>
            <option value="Commercial Invoice">Commercial Invoice</option>
            <option value="Proforma Invoice">Proforma Invoice</option>
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
                <th style={{ width: '120px' }}>INVOICE #</th>
                <th>TYPE</th>
                <th>LINKED ORDER</th>
                <th>CUSTOMER</th>
                <th>TOTAL</th>
                <th>PAID</th>
                <th>BALANCE</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '36px', color: '#8aa0a4' }}>
                    No invoices found matching criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((x) => {
                  const meta = getCustomerMeta(x.customer);
                  const total = Number(x.totalAmount || 0);
                  const paid = Number(x.paidAmount || 0);
                  const balance = Math.max(0, total - paid);

                  return (
                    <tr key={x._id || x.invoiceNo}>
                      <td>
                        <strong style={{ color: '#6c5ce7', fontSize: '13px' }}>{x.invoiceNo}</strong>
                      </td>
                      <td>
                        <span
                          style={{
                            background: '#f3f4f6',
                            color: '#374151',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 600
                          }}
                        >
                          {x.type || 'Commercial Invoice'}
                        </span>
                      </td>
                      <td>
                        <span className="order-link" style={{ fontWeight: 600 }}>{x.orderNo || 'SO-1024'}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`avatar-tag ${meta.color}`}>{meta.initials}</span>
                          <strong style={{ color: '#1f2937' }}>{x.customer}</strong>
                        </div>
                      </td>
                      <td>
                        <strong style={{ color: '#111827', fontSize: '13px' }}>
                          ${total.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: '#059669', fontSize: '13px' }}>
                          ${paid.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <strong style={{ color: balance > 0 ? '#ea580c' : '#059669', fontSize: '13px' }}>
                          ${balance.toLocaleString()}
                        </strong>
                      </td>
                      <td>
                        <Status>{x.status || (balance === 0 ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid')}</Status>
                      </td>
                      <td>
                        <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          {balance > 0 ? (
                            <button
                              className="btn-purple"
                              style={{ padding: '4px 10px', fontSize: '11px', height: '28px' }}
                              title="Record Inward Payment"
                              onClick={() => handleOpenPay(x)}
                            >
                              + Record Pay
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
                            >
                              Paid Full ✓
                            </span>
                          )}
                          <button
                            className="small-btn"
                            title="View Invoice Document"
                            onClick={() => setViewInvoice(x)}
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            Showing 1 to {Math.min(6, filtered.length)} of {data.length} invoices
          </span>
          <div className="pages">
            <button>‹</button>
            <button className="active">1</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* VIEW INVOICE DOCUMENT MODAL */}
      {viewInvoice && (
        <Modal
          eyebrow="BILLING & COLLECTIONS"
          title={`${viewInvoice.type || 'Commercial Invoice'} — ${viewInvoice.invoiceNo}`}
          onClose={() => setViewInvoice(null)}
          large
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button className="secondary" onClick={() => setViewInvoice(null)}>
                Close
              </button>
              <button className="primary" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save PDF
              </button>
            </div>
          }
        >
          <div className="document-preview">
            <div className="doc-header">
              <div className="doc-brand">
                <Logo variant="document" width={270} />
                <div className="doc-brand-info">
                  <strong>Master Export Pro Inc.</strong>
                  <br />
                  123 Trade Center, Business Bay, New York, NY 10001, USA
                  <br />
                  Email: billing@masterexportpro.com | GST / Tax ID: 123456789
                </div>
              </div>
              <div className="doc-meta">
                <h2>{viewInvoice.type || 'COMMERCIAL INVOICE'}</h2>
                <div className="doc-meta-badge">{viewInvoice.invoiceNo}</div>
                <div>
                  <strong>Issue Date:</strong> {viewInvoice.issueDate}
                </div>
                <div>
                  <strong>Due Date:</strong> {viewInvoice.dueDate}
                </div>
                <div>
                  <strong>Payment Status:</strong> <Status>{viewInvoice.status}</Status>
                </div>
              </div>
            </div>

            <div className="doc-addresses">
              <div className="doc-address-block">
                <h4>BILLED TO:</h4>
                <strong>{viewInvoice.customer}</strong>
                <br />
                Related Sales Order: <strong>{viewInvoice.orderNo || 'SO-1024'}</strong>
              </div>
              <div className="doc-address-block">
                <h4>REMITTANCE DETAILS:</h4>
                Payment Method: <strong>{viewInvoice.paymentMethod || 'Wire Transfer / Bank Transfer'}</strong>
                <br />
                Reference: {viewInvoice.paymentReference || 'SWIFT-EXP-8812'}
              </div>
            </div>

            <table className="doc-table">
              <thead>
                <tr>
                  <th>DESCRIPTION</th>
                  <th>ORDER REF</th>
                  <th style={{ textAlign: 'right' }}>TOTAL AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>PAID AMOUNT</th>
                  <th style={{ textAlign: 'right' }}>BALANCE DUE</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>Export Consignment Settlement</strong>
                    <br />
                    <span style={{ fontSize: '11px', color: '#7a9499' }}>
                      Goods supplied under sales order confirmation {viewInvoice.orderNo || 'SO-1024'}
                    </span>
                  </td>
                  <td>{viewInvoice.orderNo || 'SO-1024'}</td>
                  <td style={{ textAlign: 'right' }}>${Number(viewInvoice.totalAmount || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right' }}>${Number(viewInvoice.paidAmount || 0).toLocaleString()}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: '#0c4650' }}>
                    ${Math.max(0, Number(viewInvoice.totalAmount || 0) - Number(viewInvoice.paidAmount || 0)).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="doc-summary">
              <div className="doc-totals">
                <div className="doc-totals-row">
                  <span>Total Invoiced:</span>
                  <span>${Number(viewInvoice.totalAmount || 0).toLocaleString()}</span>
                </div>
                <div className="doc-totals-row">
                  <span>Paid Amount:</span>
                  <span>${Number(viewInvoice.paidAmount || 0).toLocaleString()}</span>
                </div>
                <div className="doc-totals-row grand-total">
                  <span>Outstanding Balance:</span>
                  <span>
                    ${Math.max(0, Number(viewInvoice.totalAmount || 0) - Number(viewInvoice.paidAmount || 0)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {edit !== null && (
        <Modal
          eyebrow="INVOICE MANAGEMENT"
          title={edit._id ? 'Edit Invoice' : 'Create New Invoice'}
          onClose={() => setEdit(null)}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button type="submit" className="primary" form="invoice-form">
                Save Invoice
              </button>
            </div>
          }
        >
          <form id="invoice-form" onSubmit={save}>
            <div className="form-grid">
              <div className="field">
                <label>Invoice No. *</label>
                <input
                  name="invoiceNo"
                  defaultValue={edit.invoiceNo || `INV-000${data.length + 1}`}
                  required
                />
              </div>

              <div className="field">
                <label>Invoice Type</label>
                <select name="type" defaultValue={edit.type || 'Commercial Invoice'}>
                  <option>Commercial Invoice</option>
                  <option>Proforma Invoice</option>
                </select>
              </div>

              <div className="field">
                <label>Customer Name *</label>
                <input name="customer" defaultValue={edit.customer || ''} required />
              </div>

              <div className="field">
                <label>Linked Sales Order No.</label>
                <input name="orderNo" defaultValue={edit.orderNo || 'SO-1024'} />
              </div>

              <div className="field">
                <label>Issue Date *</label>
                <input name="issueDate" type="date" defaultValue={edit.issueDate || ''} required />
              </div>

              <div className="field">
                <label>Due Date *</label>
                <input name="dueDate" type="date" defaultValue={edit.dueDate || ''} required />
              </div>

              <div className="field">
                <label>Total Amount ($) *</label>
                <input
                  name="totalAmount"
                  type="number"
                  step="0.01"
                  defaultValue={edit.totalAmount || 50000}
                  required
                />
              </div>

              <div className="field">
                <label>Paid Amount ($)</label>
                <input
                  name="paidAmount"
                  type="number"
                  step="0.01"
                  defaultValue={edit.paidAmount || 0}
                />
              </div>

              <div className="field">
                <label>Payment Method</label>
                <input
                  name="paymentMethod"
                  defaultValue={edit.paymentMethod || 'Bank Transfer'}
                />
              </div>

              <div className="field">
                <label>Payment Status</label>
                <select name="status" defaultValue={edit.status || 'Unpaid'}>
                  <option>Paid</option>
                  <option>Partially Paid</option>
                  <option>Unpaid</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* RECORD PAYMENT MODAL (Page 7 of PDF) */}
      {payModal && (
        <Modal
          eyebrow="INWARD REMITTANCE"
          title={`Record Payment 💸 — ${payModal.invoice.invoiceNo}`}
          onClose={() => setPayModal(null)}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setPayModal(null)}>
                Cancel
              </button>
              <button type="submit" className="btn-purple" form="pay-form">
                Save Payment
              </button>
            </div>
          }
        >
          <form id="pay-form" onSubmit={handleSavePayment}>
            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
              <div>
                <span style={{ color: '#6b7280' }}>Customer:</span> <strong>{payModal.invoice.customer}</strong>
                <br />
                <span style={{ color: '#6b7280' }}>Linked Order:</span> <strong>{payModal.invoice.orderNo || 'SO-1024'}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#6b7280' }}>Outstanding Balance:</span>
                <br />
                <strong style={{ fontSize: '16px', color: '#ea580c' }}>
                  ${Math.max(0, Number(payModal.invoice.totalAmount || 0) - Number(payModal.invoice.paidAmount || 0)).toLocaleString()}
                </strong>
              </div>
            </div>

            <div className="form-grid">
              <div className="field">
                <label>Amount Received ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={payModal.amount}
                  onChange={(e) => setPayModal({ ...payModal, amount: Number(e.target.value) })}
                />
              </div>

              <div className="field">
                <label>Payment Date *</label>
                <input
                  type="date"
                  required
                  value={payModal.date}
                  onChange={(e) => setPayModal({ ...payModal, date: e.target.value })}
                />
              </div>

              <div className="field">
                <label>Payment Method *</label>
                <select
                  value={payModal.method}
                  onChange={(e) => setPayModal({ ...payModal, method: e.target.value })}
                >
                  <option value="SWIFT / Wire Transfer">SWIFT / Wire Transfer</option>
                  <option value="Letter of Credit (LC)">Letter of Credit (LC)</option>
                  <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                  <option value="Cheque / Draft">Cheque / Draft</option>
                </select>
              </div>

              <div className="field">
                <label>SWIFT / Bank Reference # *</label>
                <input
                  required
                  value={payModal.reference}
                  onChange={(e) => setPayModal({ ...payModal, reference: e.target.value })}
                />
              </div>

              <div className="field full">
                <label>Remittance Notes</label>
                <textarea
                  value={payModal.notes}
                  onChange={(e) => setPayModal({ ...payModal, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
