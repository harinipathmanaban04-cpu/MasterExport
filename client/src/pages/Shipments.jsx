import React, { useEffect, useMemo, useState } from 'react';
import {
  Ship,
  Plane,
  Truck,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  RotateCcw,
  FileText,
  Anchor,
  Box,
  ChevronRight,
  ArrowRight,
  X
} from 'lucide-react';
import { get, post, put, del } from '../api';
import Modal from '../components/Modal';
import Logo from '../components/Logo';
import { PageHeader, StatCard, Status } from '../components/Layout';

// Standard 5-stage export shipment lifecycle
const SHIPMENT_STAGES = ['Preparing', 'Customs', 'Shipped', 'In Transit', 'Delivered'];

// Default clean export shipments
const defaultShipments = [
  {
    _id: 'shp-101',
    shipmentNo: 'SHP-101',
    orderNo: 'SO-1024',
    customer: 'ABC Trading LLC',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: 'Jebel Ali, Dubai, UAE',
    transportMode: 'Sea',
    containerNo: 'MSKU-782190',
    carrier: 'Maersk Line',
    etd: '2026-10-10',
    eta: '2026-10-18',
    trackingNo: 'MSK-782190',
    docs: ['Bill of Lading (B/L)', 'Certificate of Origin (COO)', 'Commercial Invoice', 'Packing List'],
    status: 'In Transit'
  },
  {
    _id: 'shp-102',
    shipmentNo: 'SHP-102',
    orderNo: 'SO-1025',
    customer: 'Apex Imports',
    origin: 'Mumbai Air Cargo Terminal (BOM)',
    destination: 'JFK Airport, New York, USA',
    transportMode: 'Air',
    containerNo: 'AWB-8421904',
    carrier: 'Emirates SkyCargo',
    etd: '2026-10-04',
    eta: '2026-10-06',
    trackingNo: 'EK-842190',
    docs: ['Airway Bill (AWB)', 'Commercial Invoice', 'Packing List'],
    status: 'Customs'
  },
  {
    _id: 'shp-103',
    shipmentNo: 'SHP-103',
    orderNo: 'SO-1026',
    customer: 'Tokyo Trading',
    origin: 'Chennai Port, India',
    destination: 'Yokohama Port, Japan',
    transportMode: 'Sea',
    containerNo: 'MAEU-410552',
    carrier: 'ONE Ocean Network',
    etd: '2026-10-22',
    eta: '2026-11-06',
    trackingNo: 'ONE-410552',
    docs: ['Bill of Lading (B/L)', 'Packing List', 'Phytosanitary Certificate'],
    status: 'Preparing'
  },
  {
    _id: 'shp-104',
    shipmentNo: 'SHP-104',
    orderNo: 'SO-1027',
    customer: 'EuroFoods BV',
    origin: 'Mundra Port, Gujarat, India',
    destination: 'Rotterdam Port, Netherlands',
    transportMode: 'Sea',
    containerNo: 'MSCU-902411',
    carrier: 'MSC Mediterranean',
    etd: '2026-10-14',
    eta: '2026-10-28',
    trackingNo: 'MSC-902411',
    docs: ['Bill of Lading (B/L)', 'Certificate of Origin (COO)', 'Marine Insurance'],
    status: 'In Transit'
  },
  {
    _id: 'shp-105',
    shipmentNo: 'SHP-105',
    orderNo: 'SO-1028',
    customer: 'Oceanic Trading',
    origin: 'Mundra Port, Gujarat, India',
    destination: 'Long Beach, California, USA',
    transportMode: 'Sea',
    containerNo: 'HLXU-631892',
    carrier: 'Hapag-Lloyd',
    etd: '2026-10-16',
    eta: '2026-11-02',
    trackingNo: 'HAPAG-631892',
    docs: ['Bill of Lading (B/L)', 'Certificate of Origin (COO)', 'Packing List'],
    status: 'Shipped'
  },
  {
    _id: 'shp-100',
    shipmentNo: 'SHP-100',
    orderNo: 'SO-1020',
    customer: 'ABC Trading LLC',
    origin: 'Nhava Sheva, Mumbai, India',
    destination: 'Hamburg Port, Germany',
    transportMode: 'Sea',
    containerNo: 'CMAU-552140',
    carrier: 'CMA CGM',
    etd: '2026-09-12',
    eta: '2026-09-28',
    trackingNo: 'CMA-552140',
    docs: ['Bill of Lading (B/L)', 'Certificate of Origin (COO)', 'Customs Clearance'],
    status: 'Delivered'
  },
  {
    _id: 'shp-106',
    shipmentNo: 'SHP-106',
    orderNo: 'SO-1029',
    customer: 'Singapore Global Logistics',
    origin: 'Chennai Port, India',
    destination: 'Singapore Port, Singapore',
    transportMode: 'Sea',
    containerNo: 'PILU-338901',
    carrier: 'PIL Pacific Line',
    etd: '2026-10-25',
    eta: '2026-11-02',
    trackingNo: 'PIL-338901',
    docs: ['Bill of Lading (B/L)', 'Commercial Invoice', 'Packing List'],
    status: 'Preparing'
  }
];

export default function Shipments() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem('export_pro_shipments');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return defaultShipments;
  });
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  const [carrierFilter, setCarrierFilter] = useState('');

  // Modals state
  const [viewShipment, setViewShipment] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load shipments from backend API
  const loadShipments = async () => {
    try {
      setLoading(true);
      const rows = await get('/shipments');
      if (Array.isArray(rows) && rows.length > 0) {
        setData(rows);
        localStorage.setItem('export_pro_shipments', JSON.stringify(rows));
      }
    } catch (e) {
      console.warn('Backend /api/shipments not responding or empty, using saved/default shipments:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShipments();
  }, []);

  // Filtered shipments
  const filtered = useMemo(() => {
    return data.filter((item) => {
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        (item.shipmentNo && item.shipmentNo.toLowerCase().includes(q)) ||
        (item.orderNo && item.orderNo.toLowerCase().includes(q)) ||
        (item.customer && item.customer.toLowerCase().includes(q)) ||
        (item.destination && item.destination.toLowerCase().includes(q)) ||
        (item.origin && item.origin.toLowerCase().includes(q)) ||
        (item.containerNo && item.containerNo.toLowerCase().includes(q)) ||
        (item.carrier && item.carrier.toLowerCase().includes(q)) ||
        (item.trackingNo && item.trackingNo.toLowerCase().includes(q));

      const matchStatus = !statusFilter || item.status === statusFilter;
      const matchMode = !modeFilter || item.transportMode === modeFilter;
      const matchCarrier = !carrierFilter || item.carrier === carrierFilter;

      return matchSearch && matchStatus && matchMode && matchCarrier;
    });
  }, [data, search, statusFilter, modeFilter, carrierFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = data.length;
    const preparingAndCustoms = data.filter((s) => s.status === 'Preparing' || s.status === 'Customs').length;
    const shippedAndTransit = data.filter((s) => s.status === 'Shipped' || s.status === 'In Transit').length;
    const delivered = data.filter((s) => s.status === 'Delivered').length;
    return { total, preparingAndCustoms, shippedAndTransit, delivered };
  }, [data]);

  // Unique carriers list for filter
  const carriersList = useMemo(() => {
    const set = new Set();
    data.forEach((s) => {
      if (s.carrier) set.add(s.carrier);
    });
    return Array.from(set);
  }, [data]);

  // Advance stage helper
  const handleAdvanceStage = async (shipment, e) => {
    if (e) e.stopPropagation();
    const curIdx = SHIPMENT_STAGES.indexOf(shipment.status);
    if (curIdx < 0 || curIdx >= SHIPMENT_STAGES.length - 1) return;
    const nextStatus = SHIPMENT_STAGES[curIdx + 1];

    const updated = { ...shipment, status: nextStatus };
    setData((prev) => prev.map((s) => (s._id === shipment._id ? updated : s)));
    if (viewShipment && viewShipment._id === shipment._id) {
      setViewShipment(updated);
    }

    try {
      if (shipment._id && !shipment._id.startsWith('shp-')) {
        await put(`/shipments/${shipment._id}`, { status: nextStatus });
      }
    } catch (err) {
      console.error('Failed to advance stage on backend:', err);
    }
  };

  // Quick set status
  const handleSetStatus = async (shipment, newStatus) => {
    const updated = { ...shipment, status: newStatus };
    setData((prev) => prev.map((s) => (s._id === shipment._id ? updated : s)));
    if (viewShipment && viewShipment._id === shipment._id) {
      setViewShipment(updated);
    }

    try {
      if (shipment._id && !shipment._id.startsWith('shp-')) {
        await put(`/shipments/${shipment._id}`, { status: newStatus });
      }
    } catch (err) {
      console.error('Failed to update shipment status:', err);
    }
  };

  // Save (Create or Edit)
  const handleSaveShipment = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);

    const docValues = [];
    ['Bill of Lading (B/L)', 'Certificate of Origin (COO)', 'Commercial Invoice', 'Packing List', 'Marine Insurance', 'Phytosanitary Certificate', 'Customs Clearance'].forEach((d) => {
      if (fd.get(`doc_${d}`) === 'on') {
        docValues.push(d);
      }
    });

    const payload = {
      shipmentNo: fd.get('shipmentNo'),
      orderNo: fd.get('orderNo'),
      customer: fd.get('customer'),
      origin: fd.get('origin'),
      destination: fd.get('destination'),
      transportMode: fd.get('transportMode') || 'Sea',
      containerNo: fd.get('containerNo'),
      carrier: fd.get('carrier'),
      etd: fd.get('etd'),
      eta: fd.get('eta'),
      trackingNo: fd.get('trackingNo'),
      status: fd.get('status') || 'Preparing',
      docs: docValues
    };

    let updatedList;
    if (editModal && editModal._id) {
      try {
        const res = await put(`/shipments/${editModal._id}`, payload);
        updatedList = data.map((item) => (item._id === editModal._id ? (res || { ...payload, _id: editModal._id }) : item));
      } catch (err) {
        console.warn('Backend update failed, updating local state:', err);
        updatedList = data.map((item) => (item._id === editModal._id ? { ...payload, _id: editModal._id } : item));
      }
    } else {
      const newId = `shp-${Date.now()}`;
      try {
        const res = await post('/shipments', payload);
        updatedList = [res || { ...payload, _id: newId }, ...data];
      } catch (err) {
        console.warn('Backend create failed, creating in local state:', err);
        updatedList = [{ ...payload, _id: newId }, ...data];
      }
    }

    setData(updatedList);
    localStorage.setItem('export_pro_shipments', JSON.stringify(updatedList));
    setEditModal(null);
  };

  // Delete shipment
  const handleDelete = async (shipment) => {
    const remaining = data.filter((s) => s._id !== shipment._id);
    setData(remaining);
    localStorage.setItem('export_pro_shipments', JSON.stringify(remaining));

    if (viewShipment && viewShipment._id === shipment._id) {
      setViewShipment(null);
    }
    setDeleteConfirm(null);

    try {
      if (shipment._id) {
        await del(`/shipments/${shipment._id}`);
      }
    } catch (err) {
      console.warn('Failed to delete on server:', err);
    }
  };

  // Helper for mode icons
  const renderModeIcon = (mode, size = 14) => {
    switch (mode?.toLowerCase()) {
      case 'air':
        return <Plane size={size} />;
      case 'truck':
      case 'road':
        return <Truck size={size} />;
      case 'sea':
      default:
        return <Ship size={size} />;
    }
  };

  return (
    <div className="shipments-page" style={{ width: '100%' }}>
      {/* Header with Exact Objective */}
      <PageHeader
        eyebrow="EXPORT DELIVERY MANAGEMENT"
        title="Shipment Management"
        description="The Shipment module manages the physical export delivery for a Sales Order."
        action={{
          label: 'New Shipment',
          icon: <Plus size={16} />,
          onClick: () =>
            setEditModal({
              shipmentNo: `SHP-000${data.length + 1}`,
              orderNo: 'SO-1029',
              customer: '',
              origin: 'Nhava Sheva, Mumbai, India',
              destination: 'Jebel Ali, Dubai, UAE',
              transportMode: 'Sea',
              carrier: 'Maersk Line',
              containerNo: `MSKU-${Math.floor(100000 + Math.random() * 900000)}`,
              trackingNo: `MSK-${Math.floor(100000 + Math.random() * 900000)}`,
              status: 'Preparing',
              etd: new Date().toISOString().slice(0, 10),
              eta: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
              docs: ['Bill of Lading (B/L)', 'Packing List']
            })
        }}
      />

      {/* KPI Stat Cards (Matching Dashboard exactly) */}
      <div className="stats" style={{ marginBottom: '22px' }}>
        <StatCard
          icon={Anchor}
          label="Total Shipments"
          value={stats.total}
          note="Export deliveries recorded"
          tone="teal"
        />
        <StatCard
          icon={Clock}
          label="Preparing & Customs"
          value={stats.preparingAndCustoms}
          note="Pre-departure & clearance"
          tone="orange"
        />
        <StatCard
          icon={Ship}
          label="Shipped & In Transit"
          value={stats.shippedAndTransit}
          note="Active delivery routes"
          tone="blue"
        />
        <StatCard
          icon={CheckCircle2}
          label="Delivered"
          value={stats.delivered}
          note="Completed export arrivals"
          tone="green"
        />
      </div>

      {/* Professional Segmented Status Filter Bar (Strict 5-stage lifecycle) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px', scrollbarWidth: 'none' }}>
        {[
          { label: 'All Shipments', value: '', count: data.length, dot: '#64748b' },
          { label: 'Preparing', value: 'Preparing', count: data.filter((s) => s.status === 'Preparing').length, dot: '#7e22ce' },
          { label: 'Customs', value: 'Customs', count: data.filter((s) => s.status === 'Customs').length, dot: '#b45309' },
          { label: 'Shipped', value: 'Shipped', count: data.filter((s) => s.status === 'Shipped').length, dot: '#0369a1' },
          { label: 'In Transit', value: 'In Transit', count: data.filter((s) => s.status === 'In Transit').length, dot: '#1d4ed8' },
          { label: 'Delivered', value: 'Delivered', count: data.filter((s) => s.status === 'Delivered').length, dot: '#15803d' }
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

      {/* Professional Toolbar Controls */}
      <div className="pro-toolbar">
        <div className="pro-search-box">
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search by Shipment No, Order No, Customer, Origin, Destination, Container, Carrier, Tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <div className="pro-filter-group">
          <select
            className="pro-select"
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            aria-label="Filter by Transport Mode"
          >
            <option value="">All Transport Modes</option>
            <option value="Sea">🚢 Sea Freight</option>
            <option value="Air">✈️ Air Freight</option>
            <option value="Truck">🚛 Road Freight</option>
          </select>

          <select
            className="pro-select"
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            aria-label="Filter by Shipping Carrier"
          >
            <option value="">All Carriers</option>
            {carriersList.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="pro-btn-reset"
            onClick={() => {
              setSearch('');
              setStatusFilter('');
              setModeFilter('');
              setCarrierFilter('');
            }}
            title="Reset All Filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Main Table Card (Dedicated Clean Columns for Required Fields) */}
      <div className="panel" style={{ marginTop: '16px', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
        <div style={{ paddingBottom: '16px', marginBottom: '14px', borderBottom: '1px solid #edf4f2', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>
              Physical Export Deliveries
            </h3>
            <span style={{ fontSize: '12px', color: '#627b75' }}>
              Showing {filtered.length} of {data.length} deliveries for sales orders
            </span>
          </div>
        </div>

        <div className="table-wrap" style={{ overflowX: 'auto', width: '100%' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '1150px', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>SHIPMENT NO.</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>ORDER</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>CUSTOMER</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>ORIGIN</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>DESTINATION</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>MODE</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>CONTAINER NO.</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>CARRIER</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>ETD</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>ETA</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>TRACKING NO.</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>DOCUMENTS</th>
                <th style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '12px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={14} style={{ padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f5f1', display: 'grid', placeItems: 'center', color: '#0c5a48' }}>
                        <Ship size={24} />
                      </div>
                      <h4 style={{ margin: 0, fontSize: '15px', color: '#1e1e2d' }}>No deliveries found</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#627b75' }}>
                        No export delivery matches your current search or filter criteria.
                      </p>
                      <button
                        className="secondary"
                        onClick={() => {
                          setSearch('');
                          setStatusFilter('');
                          setModeFilter('');
                          setCarrierFilter('');
                        }}
                        style={{ marginTop: '8px' }}
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((row) => (
                  <tr
                    key={row._id}
                    onClick={() => setViewShipment(row)}
                    style={{ cursor: 'pointer', transition: 'background 0.15s ease' }}
                  >
                    {/* 1. Shipment Number */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="shipment-id-badge">{row.shipmentNo}</span>
                    </td>

                    {/* 2. Order */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="order-badge">{row.orderNo || 'SO-1024'}</span>
                    </td>

                    {/* 3. Customer */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="customer-cell-name">{row.customer || 'Consignee Client'}</span>
                    </td>

                    {/* 4. Origin */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                      <span className="port-cell" title={row.origin}>{row.origin || 'Origin Port'}</span>
                    </td>

                    {/* 5. Destination */}
                    <td style={{ padding: '13px 16px', verticalAlign: 'middle' }}>
                      <span className="port-cell" title={row.destination}>{row.destination || 'Destination Port'}</span>
                    </td>

                    {/* 6. Transport Mode */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className={`mode-badge ${(row.transportMode || 'sea').toLowerCase()}`}>
                        {renderModeIcon(row.transportMode, 13)}
                        <span>{row.transportMode || 'Sea'}</span>
                      </span>
                    </td>

                    {/* 7. Container Number */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <code className="mono-code">{row.containerNo || 'N/A'}</code>
                    </td>

                    {/* 8. Carrier */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="carrier-name">{row.carrier || 'Carrier'}</span>
                    </td>

                    {/* 9. ETD */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="date-cell">{row.etd || 'TBD'}</span>
                    </td>

                    {/* 10. ETA */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <span className="date-cell eta-highlight">{row.eta || 'TBD'}</span>
                    </td>

                    {/* 11. Tracking Number */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <code className="mono-code">{row.trackingNo || 'N/A'}</code>
                    </td>

                    {/* 12. Documents */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={(e) => { e.stopPropagation(); setViewShipment(row); }}>
                      <span className="doc-badge" title={row.docs?.join(', ') || 'View Documents'}>
                        <FileText size={12} />
                        <span>{row.docs?.length || 0} Docs</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '13px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      <Status>{row.status}</Status>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '13px 16px', textAlign: 'right', whiteSpace: 'nowrap', verticalAlign: 'middle' }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                        {/* Track / Details Button */}
                        <button
                          type="button"
                          className="pro-track-btn"
                          title="Track & View Full Details"
                          onClick={() => setViewShipment(row)}
                        >
                          <Eye size={12} />
                          <span>Track</span>
                        </button>

                        {/* Quick Advance Button (if not yet delivered) or Done indicator */}
                        {row.status !== 'Delivered' ? (
                          <button
                            type="button"
                            className="pro-next-btn"
                            title={`Advance to ${SHIPMENT_STAGES[SHIPMENT_STAGES.indexOf(row.status) + 1] || 'Next Stage'}`}
                            onClick={(e) => handleAdvanceStage(row, e)}
                          >
                            <span>Next</span>
                            <ArrowRight size={11} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="pro-next-btn"
                            disabled
                            style={{
                              background: '#f8fafc',
                              color: '#059669',
                              borderColor: '#e2e8f0',
                              cursor: 'default',
                              opacity: 0.85
                            }}
                            title="Shipment Delivered & Concluded"
                          >
                            <span>Done</span>
                            <CheckCircle2 size={11} />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          type="button"
                          className="pro-icon-btn"
                          title="Edit Shipment"
                          onClick={() => setEditModal(row)}
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          className="pro-icon-btn danger"
                          title="Delete Shipment"
                          onClick={() => setDeleteConfirm(row)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW SHIPMENT DETAILS MODAL */}
      {viewShipment && (
        <Modal
          eyebrow="EXPORT SHIPMENT TRACKING"
          title={`Delivery ${viewShipment.shipmentNo} — ${viewShipment.orderNo}`}
          onClose={() => setViewShipment(null)}
          maxWidth="780px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', color: '#627b75', fontWeight: 600 }}>Update Status:</span>
                <select
                  value={viewShipment.status}
                  onChange={(e) => handleSetStatus(viewShipment, e.target.value)}
                  style={{ fontSize: '12.5px', padding: '5px 10px', borderRadius: '7px', border: '1px solid #cbd5e1', fontWeight: 600 }}
                >
                  {SHIPMENT_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    const s = viewShipment;
                    setViewShipment(null);
                    setEditModal(s);
                  }}
                >
                  <Edit2 size={13} style={{ marginRight: '5px' }} />
                  Edit Shipment
                </button>
                <button type="button" className="primary" onClick={() => setViewShipment(null)}>
                  Close
                </button>
              </div>
            </div>
          }
        >
          <div className="document-preview" style={{ padding: '0', background: 'transparent' }}>
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
                <h2 style={{ margin: '0 0 4px', fontSize: '18px', color: '#0c5a48', fontWeight: 800 }}>
                  EXPORT SHIPMENT DISPATCH
                </h2>
                <div className="doc-meta-badge" style={{ display: 'inline-block', padding: '4px 10px', background: '#e6f4f0', color: '#0c5a48', borderRadius: '6px', fontWeight: 700, fontSize: '13px' }}>
                  {viewShipment.shipmentNo}
                </div>
                <div style={{ fontSize: '12px', marginTop: '6px' }}>
                  <strong>Sales Order:</strong> {viewShipment.orderNo}
                </div>
                <div style={{ fontSize: '12px', marginTop: '3px' }}>
                  <strong>Carrier:</strong> {viewShipment.carrier || 'Carrier'} ({viewShipment.transportMode} Freight)
                </div>
                <div style={{ fontSize: '12px', marginTop: '3px' }}>
                  <strong>Status:</strong> <Status>{viewShipment.status}</Status>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Visual Tracking Stepper: Preparing -> Customs -> Shipped -> In Transit -> Delivered */}
              <div>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#627b75', fontWeight: 700, marginBottom: '8px' }}>
                  DELIVERY STATUS PIPELINE
                </div>
                <div className="workflow-stepper" style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
                  {SHIPMENT_STAGES.map((stg, i) => {
                    const cur = SHIPMENT_STAGES.indexOf(viewShipment.status);
                    const isPassed = cur >= 0 && i < cur;
                    const isActive = cur >= 0 && i === cur;
                    return (
                      <React.Fragment key={stg}>
                        <div className={`step-item ${isActive ? 'active' : isPassed ? 'passed' : ''}`} style={{ flex: 1, justifyContent: 'center' }}>
                          <div
                            className="step-circle"
                            style={{
                              width: '30px',
                              height: '30px',
                              fontSize: '12px',
                              fontWeight: 700,
                              borderRadius: '50%',
                              display: 'grid',
                              placeItems: 'center',
                              background: isPassed ? '#10b981' : isActive ? '#0c5a48' : '#e2e8f0',
                              color: isPassed || isActive ? '#ffffff' : '#64748b'
                            }}
                          >
                            {isPassed ? '✓' : i + 1}
                          </div>
                          <span className="step-label" style={{ fontSize: '11.5px', marginTop: '4px', fontWeight: isActive ? 700 : 500 }}>
                            {stg}
                          </span>
                        </div>
                        {i < SHIPMENT_STAGES.length - 1 && (
                          <div
                            className={`step-divider ${isPassed ? 'passed' : ''}`}
                            style={{ height: '2px', background: isPassed ? '#10b981' : '#e2e8f0', flex: 1, margin: '0 4px' }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* Information Grid: Strictly Required Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                {/* Card 1: Order & Customer Information */}
                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
                    Delivery & Order Details
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Shipment Number:</span>
                    <strong style={{ color: '#0c5a48' }}>{viewShipment.shipmentNo}</strong>

                    <span style={{ color: '#64748b' }}>Sales Order:</span>
                    <strong>{viewShipment.orderNo}</strong>

                    <span style={{ color: '#64748b' }}>Customer:</span>
                    <strong>{viewShipment.customer}</strong>

                    <span style={{ color: '#64748b' }}>Transport Mode:</span>
                    <span>{viewShipment.transportMode} Freight</span>

                    <span style={{ color: '#64748b' }}>Carrier:</span>
                    <strong>{viewShipment.carrier || 'Carrier'}</strong>

                    <span style={{ color: '#64748b' }}>Current Status:</span>
                    <Status>{viewShipment.status}</Status>
                  </div>
                </div>

                {/* Card 2: Routing, Container & Tracking */}
                <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '10px' }}>
                    Logistics & Tracking
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: '8px', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Origin:</span>
                    <span>{viewShipment.origin}</span>

                    <span style={{ color: '#64748b' }}>Destination:</span>
                    <strong>{viewShipment.destination}</strong>

                    <span style={{ color: '#64748b' }}>Container Number:</span>
                    <code className="mono-code">{viewShipment.containerNo || 'N/A'}</code>

                    <span style={{ color: '#64748b' }}>Tracking Number:</span>
                    <code className="mono-code">{viewShipment.trackingNo || 'N/A'}</code>

                    <span style={{ color: '#64748b' }}>Departure (ETD):</span>
                    <span>{viewShipment.etd || 'TBD'}</span>

                    <span style={{ color: '#64748b' }}>Arrival (ETA):</span>
                    <strong style={{ color: '#0c5a48' }}>{viewShipment.eta || 'TBD'}</strong>
                  </div>
                </div>
              </div>

              {/* Documents Section */}
              <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '14px 16px' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748b', fontWeight: 700, marginBottom: '8px' }}>
                  Attached Export Documents ({viewShipment.docs?.length || 0})
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {viewShipment.docs && viewShipment.docs.length > 0 ? (
                    viewShipment.docs.map((d) => (
                      <span
                        key={d}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 600,
                          background: '#e8f5f1',
                          color: '#0c5a48',
                          border: '1px solid #d0ebe4'
                        }}
                      >
                        <CheckCircle2 size={13} />
                        {d}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748b' }}>No documents attached.</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* CREATE / EDIT SHIPMENT MODAL (Strictly Required Fields) */}
      {editModal !== null && (
        <Modal
          eyebrow="EXPORT DELIVERY"
          title={editModal._id && !editModal._id.startsWith('shp-') ? `Edit Delivery — ${editModal.shipmentNo}` : 'New Export Delivery'}
          onClose={() => setEditModal(null)}
          maxWidth="680px"
          footer={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
              <button type="button" className="secondary" onClick={() => setEditModal(null)}>
                Cancel
              </button>
              <button type="submit" className="primary" form="shipment-form">
                Save Shipment Record
              </button>
            </div>
          }
        >
          <form id="shipment-form" onSubmit={handleSaveShipment}>
            <div className="form-grid">
              {/* 1. Shipment Number */}
              <div className="field">
                <label>Shipment Number *</label>
                <input
                  name="shipmentNo"
                  defaultValue={editModal.shipmentNo || `SHP-000${data.length + 1}`}
                  required
                />
              </div>

              {/* 2. Order */}
              <div className="field">
                <label>Sales Order *</label>
                <input
                  name="orderNo"
                  defaultValue={editModal.orderNo || 'SO-1024'}
                  placeholder="e.g. SO-1024"
                  required
                />
              </div>

              {/* 3. Customer */}
              <div className="field full">
                <label>Customer *</label>
                <input
                  name="customer"
                  defaultValue={editModal.customer || ''}
                  placeholder="e.g. ABC Trading LLC"
                  required
                />
              </div>

              {/* 4. Origin */}
              <div className="field">
                <label>Origin *</label>
                <input
                  name="origin"
                  defaultValue={editModal.origin || 'Nhava Sheva, Mumbai, India'}
                  required
                />
              </div>

              {/* 5. Destination */}
              <div className="field">
                <label>Destination *</label>
                <input
                  name="destination"
                  defaultValue={editModal.destination || 'Jebel Ali, Dubai, UAE'}
                  required
                />
              </div>

              {/* 6. Transport Mode */}
              <div className="field">
                <label>Transport Mode</label>
                <select name="transportMode" defaultValue={editModal.transportMode || 'Sea'}>
                  <option value="Sea">🚢 Sea Freight</option>
                  <option value="Air">✈️ Air Freight</option>
                  <option value="Truck">🚛 Road Freight</option>
                </select>
              </div>

              {/* 7. Container Number */}
              <div className="field">
                <label>Container Number</label>
                <input
                  name="containerNo"
                  defaultValue={editModal.containerNo || ''}
                  placeholder="e.g. MSKU-782190"
                />
              </div>

              {/* 8. Carrier */}
              <div className="field">
                <label>Carrier</label>
                <input
                  name="carrier"
                  defaultValue={editModal.carrier || 'Maersk Line'}
                  placeholder="e.g. Maersk, MSC, Emirates SkyCargo"
                />
              </div>

              {/* 9. ETD */}
              <div className="field">
                <label>Estimated Departure (ETD)</label>
                <input name="etd" type="date" defaultValue={editModal.etd || ''} />
              </div>

              {/* 10. ETA */}
              <div className="field">
                <label>Estimated Arrival (ETA)</label>
                <input name="eta" type="date" defaultValue={editModal.eta || ''} />
              </div>

              {/* 11. Tracking Number */}
              <div className="field">
                <label>Tracking Number</label>
                <input
                  name="trackingNo"
                  defaultValue={editModal.trackingNo || ''}
                  placeholder="e.g. MSK-782190"
                />
              </div>

              {/* Status: Preparing -> Customs -> Shipped -> In Transit -> Delivered */}
              <div className="field full">
                <label>Status</label>
                <select name="status" defaultValue={editModal.status || 'Preparing'}>
                  {SHIPMENT_STAGES.map((stg) => (
                    <option key={stg} value={stg}>
                      {stg}
                    </option>
                  ))}
                </select>
              </div>

              {/* 12. Documents */}
              <div className="field full">
                <label>Documents</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginTop: '6px' }}>
                  {[
                    'Bill of Lading (B/L)',
                    'Certificate of Origin (COO)',
                    'Commercial Invoice',
                    'Packing List',
                    'Marine Insurance',
                    'Phytosanitary Certificate',
                    'Customs Clearance'
                  ].map((docName) => {
                    const isChecked = editModal.docs?.includes(docName);
                    return (
                      <label key={docName} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer' }}>
                        <input type="checkbox" name={`doc_${docName}`} defaultChecked={isChecked} />
                        <span>{docName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm && (
        <Modal
          eyebrow="CONFIRMATION REQUIRED"
          title="Delete Shipment Record?"
          onClose={() => setDeleteConfirm(null)}
          maxWidth="460px"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', width: '100%' }}>
              <button type="button" className="secondary" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </button>
              <button
                type="button"
                style={{ background: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
                onClick={() => handleDelete(deleteConfirm)}
              >
                Yes, Delete
              </button>
            </div>
          }
        >
          <div style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
            Are you sure you want to delete shipment <strong>{deleteConfirm.shipmentNo}</strong> linked to order <strong>{deleteConfirm.orderNo}</strong>? This action cannot be undone.
          </div>
        </Modal>
      )}
    </div>
  );
}
