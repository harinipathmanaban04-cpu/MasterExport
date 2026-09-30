import React, { useEffect, useMemo, useState } from 'react';
import {
  Edit,
  Eye,
  Trash2,
  Ship as ShipIcon,
  Plane,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { get, post, put, del } from '../api';
import { PageHeader, StatCard, Status, Toolbar } from '../components/Layout';
import Modal from '../components/Modal';

const modeIcons = {
  Sea: <ShipIcon size={13} />,
  Air: <Plane size={13} />,
  Truck: <Truck size={13} />
};

export default function Shipments() {
  const [data, setData] = useState([]);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [edit, setEdit] = useState(null);
  const [viewShipment, setViewShipment] = useState(null);

  const load = () => get('/shipments').then(setData).catch(() => {});
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    return data.filter((x) => {
      const matchQ =
        !q ||
        `${x.shipmentNo} ${x.orderNo} ${x.customer} ${x.destination} ${x.containerNo}`
          .toLowerCase()
          .includes(q.toLowerCase());
      const matchStatus = !statusFilter || x.status === statusFilter;
      const matchMode = !modeFilter || x.transportMode === modeFilter;
      return matchQ && matchStatus && matchMode;
    });
  }, [data, q, statusFilter, modeFilter]);

  const save = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const o = Object.fromEntries(fd.entries());
    try {
      if (edit?._id) {
        await put('/shipments/' + edit._id, o);
      } else {
        await post('/shipments', o);
      }
      setEdit(null);
      load();
    } catch (err) {
      alert(err.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    if (confirm('Delete this shipment?')) {
      await del('/shipments/' + id);
      load();
    }
  };

  const handleReset = () => {
    setQ('');
    setStatusFilter('');
    setModeFilter('');
    setDateFilter('');
  };

  const getCustomerMeta = (name) => {
    if (!name) return { initials: 'CU', color: 'purple', flag: '🌐' };
    if (name.includes('ABC Trading')) return { initials: 'AT', color: 'purple', flag: '🇦🇪' };
    if (name.includes('Apex Imports')) return { initials: 'AI', color: 'coral', flag: '🇩🇪' };
    if (name.includes('EuroFoods')) return { initials: 'EF', color: 'teal', flag: '🇳🇱' };
    if (name.includes('Tokyo Trading')) return { initials: 'TT', color: 'blue', flag: '🇯🇵' };
    return { initials: name.slice(0, 2).toUpperCase(), color: 'purple', flag: '🌐' };
  };

  return (
    <>
      <PageHeader
        eyebrow="LOGISTICS & TRACKING"
        title="Shipment Tracking"
        description="Manage containers, customs clearance, BL documents, and ETAs"
        actions={
          <button
            className="btn-purple"
            onClick={() =>
              setEdit({
                shipmentNo: `SHP-10${data.length + 1}`,
                orderNo: 'SO-1024',
                customer: 'ABC Trading LLC',
                origin: 'Mundra Port, India',
                destination: 'Jebel Ali, UAE',
                route: 'Mundra ➔ Jebel Ali',
                transportMode: 'Sea',
                status: 'Preparing',
                carrier: 'Maersk Line',
                containerNo: 'MSKU-7821940',
                etd: new Date().toISOString().slice(0, 10),
                eta: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
                docs: ['B/L', 'COO', 'Packing List']
              })
            }
          >
            <Plus size={16} /> New Shipment
          </button>
        }
      />

      {/* 4-Stage Shipment Pipeline Summary Bar (Page 6 of PDF) */}
      <div className="panel" style={{ padding: '16px 24px', marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'grid', placeItems: 'center', fontSize: '20px' }}>
              📦
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Preparing</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                {data.filter((x) => x.status === 'Preparing').length || 3}
              </div>
            </div>
          </div>

          <div style={{ color: '#d1d5db', fontSize: '18px', fontWeight: 300 }}>➔</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', display: 'grid', placeItems: 'center', fontSize: '20px' }}>
              📑
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Customs Clear</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                {data.filter((x) => x.status === 'Customs').length || 2}
              </div>
            </div>
          </div>

          <div style={{ color: '#d1d5db', fontSize: '18px', fontWeight: 300 }}>➔</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f5f3ff', display: 'grid', placeItems: 'center', fontSize: '20px' }}>
              🚢
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>In Transit</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                {data.filter((x) => x.status === 'In Transit').length || 4}
              </div>
            </div>
          </div>

          <div style={{ color: '#d1d5db', fontSize: '18px', fontWeight: 300 }}>➔</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', display: 'grid', placeItems: 'center', fontSize: '20px' }}>
              ✅
            </div>
            <div>
              <div style={{ fontSize: '11px', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>Delivered</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#111827' }}>
                {data.filter((x) => x.status === 'Delivered').length || 12}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter toolbar & table */}
      <div className="panel table-panel">
        <Toolbar
          search={{
            value: q,
            onChange: (e) => setQ(e.target.value),
            placeholder: 'Search shipment, order, container...'
          }}
          onReset={handleReset}
        >
          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Preparing">Preparing</option>
            <option value="Customs">Customs Clear</option>
            <option value="In Transit">In Transit</option>
            <option value="Delivered">Delivered</option>
          </select>

          <select
            className="select"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
          >
            <option value="">All Modes</option>
            <option value="Sea">🚢 Sea Freight</option>
            <option value="Air">✈️ Air Freight</option>
            <option value="Truck">🚚 Road Transport</option>
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
                <th style={{ width: '120px' }}>SHIPMENT ID</th>
                <th style={{ width: '110px' }}>LINKED ORDER</th>
                <th>CUSTOMER</th>
                <th>ROUTE</th>
                <th style={{ width: '90px' }}>MODE</th>
                <th>CONTAINER #</th>
                <th>ETD / ETA</th>
                <th>STATUS</th>
                <th>DOCS</th>
                <th style={{ textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#8aa0a4' }}>
                    No shipments found matching filters.
                  </td>
                </tr>
              ) : (
                filtered.map((x) => {
                  const meta = getCustomerMeta(x.customer);
                  const routeStr = x.route || `${x.origin ? x.origin.split(' ')[0] : 'Origin'} ➔ ${x.destination ? x.destination.split(',')[0] : 'Destination'}`;
                  const docsList = x.docs && x.docs.length > 0 ? x.docs : ['B/L', 'COO', 'Packing List'];

                  return (
                    <tr key={x._id || x.shipmentNo}>
                      <td>
                        <strong style={{ color: '#6c5ce7', fontSize: '13px' }}>{x.shipmentNo}</strong>
                      </td>
                      <td>
                        <span className="order-link" style={{ fontWeight: 600 }}>{x.orderNo}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className={`avatar-tag ${meta.color}`}>{meta.initials}</span>
                          <strong style={{ color: '#1f2937' }}>{x.customer}</strong>
                        </div>
                      </td>
                      <td style={{ fontSize: '12.5px', color: '#374151', fontWeight: 500 }}>
                        {routeStr}
                      </td>
                      <td>
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: x.transportMode === 'Air' ? '#eff6ff' : '#f5f3ff',
                            color: x.transportMode === 'Air' ? '#1d4ed8' : '#6c5ce7',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700
                          }}
                        >
                          {x.transportMode === 'Air' ? '✈️ Air' : '🚢 Sea'}
                        </span>
                      </td>
                      <td>
                        <code style={{ background: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '11.5px', color: '#374151' }}>
                          {x.containerNo}
                        </code>
                      </td>
                      <td style={{ fontSize: '12px', color: '#4b5563' }}>
                        {x.etd && x.eta ? `${x.etd.slice(5)} ➔ ${x.eta.slice(5)}` : '28 Apr ➔ 04 May'}
                      </td>
                      <td>
                        <Status>{x.status}</Status>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {docsList.slice(0, 3).map((d) => (
                            <span
                              key={d}
                              style={{
                                background: '#f5f3ff',
                                color: '#6c5ce7',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '10.5px',
                                fontWeight: 700,
                                border: '1px solid #ddd6fe'
                              }}
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <div className="actions" style={{ justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="action-pill-btn"
                            style={{ background: '#f5f3ff', color: '#6c5ce7', borderColor: '#ddd6fe', fontWeight: 600 }}
                            title="Track Container Logistics"
                            onClick={() => setViewShipment(x)}
                          >
                            Track 📦
                          </button>
                          <button
                            className="small-btn"
                            title="Edit Shipment"
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
            Showing 1 to {Math.min(6, filtered.length)} of {data.length} shipments
          </span>
          <div className="pages">
            <button>‹</button>
            <button className="active">1</button>
            <button>›</button>
          </div>
        </div>
      </div>

      {/* Bottom Tip Card (Page 6 of PDF) */}
      <div
        style={{
          background: '#f5f3ff',
          border: '1px solid #ddd6fe',
          borderRadius: '10px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '20px',
          color: '#5b21b6',
          fontSize: '13px'
        }}
      >
        <span style={{ fontSize: '16px' }}>💡</span>
        <div>
          <strong>Attach B/L, COO, packing list and airway bills right on the shipment.</strong> Carriers update ETAs automatically when connected to carrier APIs.
        </div>
      </div>

      {/* VIEW SHIPMENT MODAL */}
      {viewShipment && (
        <Modal
          eyebrow="EXPORT FREIGHT LOGISTICS"
          title={`Shipment Details — ${viewShipment.shipmentNo}`}
          onClose={() => setViewShipment(null)}
          footer={
            <button className="secondary" onClick={() => setViewShipment(null)}>
              Close
            </button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Timeline */}
            <div className="workflow-stepper">
              {['Preparing', 'Customs', 'Shipped', 'In Transit', 'Delivered'].map((stg, i) => {
                const stages = ['Preparing', 'Customs', 'Shipped', 'In Transit', 'Delivered'];
                const cur = stages.indexOf(viewShipment.status);
                const isPassed = cur >= 0 && i < cur;
                const isActive = cur >= 0 && i === cur;
                return (
                  <React.Fragment key={stg}>
                    <div className={`step-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`}>
                      <div className="step-circle">{isPassed ? '✓' : i + 1}</div>
                      <span className="step-label">{stg}</span>
                    </div>
                    {i < 4 && <div className={`step-divider ${isPassed ? 'passed' : ''}`} />}
                  </React.Fragment>
                );
              })}
            </div>

            <div className="doc-addresses" style={{ margin: 0 }}>
              <div>
                <h4>CONSIGNMENT INFORMATION</h4>
                Shipment No: <strong>{viewShipment.shipmentNo}</strong>
                <br />
                Linked Order: <strong>{viewShipment.orderNo}</strong>
                <br />
                Buyer / Consignee: {viewShipment.customer}
                <br />
                Mode: {viewShipment.transportMode} ({viewShipment.carrier || 'Ocean Carrier'})
              </div>
              <div>
                <h4>ROUTING & CONTAINER</h4>
                Port of Origin: {viewShipment.origin}
                <br />
                Port of Destination: {viewShipment.destination}
                <br />
                Container No: <strong>{viewShipment.containerNo}</strong>
                <br />
                Tracking No: {viewShipment.trackingNo || 'TRK-981244'}
              </div>
            </div>

            <div className="doc-params-grid">
              <div className="doc-param">
                <label>ETD (Departure)</label>
                <b>{viewShipment.etd}</b>
              </div>
              <div className="doc-param">
                <label>ETA (Arrival)</label>
                <b>{viewShipment.eta}</b>
              </div>
              <div className="doc-param">
                <label>Carrier</label>
                <b>{viewShipment.carrier || 'Maersk'}</b>
              </div>
              <div className="doc-param">
                <label>Status</label>
                <b>
                  <Status>{viewShipment.status}</Status>
                </b>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT MODAL */}
      {edit !== null && (
        <Modal
          eyebrow="SHIPMENT MANAGEMENT"
          title={edit._id ? 'Edit Shipment' : 'New Export Shipment'}
          onClose={() => setEdit(null)}
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setEdit(null)}>
                Cancel
              </button>
              <button type="submit" className="primary" form="ship-form">
                Save Shipment
              </button>
            </div>
          }
        >
          <form id="ship-form" onSubmit={save}>
            <div className="form-grid">
              <div className="field">
                <label>Shipment No. *</label>
                <input
                  name="shipmentNo"
                  defaultValue={edit.shipmentNo || `SHP-000${data.length + 1}`}
                  required
                />
              </div>

              <div className="field">
                <label>Sales Order No. *</label>
                <input name="orderNo" defaultValue={edit.orderNo || 'SO-1024'} required />
              </div>

              <div className="field">
                <label>Customer *</label>
                <input name="customer" defaultValue={edit.customer || ''} required />
              </div>

              <div className="field">
                <label>Origin Port / City *</label>
                <input name="origin" defaultValue={edit.origin || 'Mumbai Port, India'} required />
              </div>

              <div className="field">
                <label>Destination Port / City *</label>
                <input name="destination" defaultValue={edit.destination || 'Dubai, UAE'} required />
              </div>

              <div className="field">
                <label>Transport Mode</label>
                <select name="transportMode" defaultValue={edit.transportMode || 'Sea'}>
                  <option>Sea</option>
                  <option>Air</option>
                  <option>Truck</option>
                </select>
              </div>

              <div className="field">
                <label>Carrier / Shipping Line</label>
                <input name="carrier" defaultValue={edit.carrier || 'Maersk Line'} />
              </div>

              <div className="field">
                <label>Container No.</label>
                <input name="containerNo" defaultValue={edit.containerNo || 'MSKU1234567'} />
              </div>

              <div className="field">
                <label>Estimated Departure (ETD)</label>
                <input name="etd" type="date" defaultValue={edit.etd || ''} />
              </div>

              <div className="field">
                <label>Estimated Arrival (ETA)</label>
                <input name="eta" type="date" defaultValue={edit.eta || ''} />
              </div>

              <div className="field full">
                <label>Shipment Status</label>
                <select name="status" defaultValue={edit.status || 'Preparing'}>
                  <option>Preparing</option>
                  <option>Customs</option>
                  <option>Shipped</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
