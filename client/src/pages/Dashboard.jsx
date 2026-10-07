import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  Eye,
  Plus,
  Ship,
  Clock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Status } from '../components/Layout';
import { get } from '../api';
import { useCurrency } from '../context/CurrencyContext';

const defaultOrders = [
  { id: 'SO-1024', customer: 'ABC Trading LLC', avatar: 'AT', avatarClass: 'purple', amount: 50000, status: 'Preparing' },
  { id: 'SO-1025', customer: 'Apex Imports', avatar: 'AI', avatarClass: 'blue', amount: 28000, status: 'Ready to Ship' },
  { id: 'SO-1026', customer: 'Tokyo Trading', avatar: 'TT', avatarClass: 'teal', amount: 12500, status: 'Confirmed' }
];

const defaultShipments = [
  { id: 'SHP-088', destination: 'Dubai, UAE 🇦🇪', etd: 'Oct 12, 2026', status: 'In Transit', statusType: 'blue' },
  { id: 'SHP-089', destination: 'Hamburg, DE 🇩🇪', etd: 'Oct 18, 2026', status: 'Customs Hold', statusType: 'amber' },
  { id: 'SHP-090', destination: 'Tokyo, JP 🇯🇵', etd: 'Oct 22, 2026', status: 'Dispatched', statusType: 'green' },
  { id: 'SHP-091', destination: 'Rotterdam, NL 🇳🇱', etd: 'Oct 25, 2026', status: 'In Transit', statusType: 'blue' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { currency, currencySymbol, formatAmount } = useCurrency();

  const [stats, setStats] = useState({
    activeOrders: '24',
    ordersGrowth: '▲ 12% this month',
    pendingShipments: '8',
    shipmentsNote: '3 leaving this week',
    outstandingDues: 45000,
    duesNote: '5 invoices open',
    monthlySalesRaw: 185000,
    salesGrowth: '▲ 8.4% vs last month'
  });

  const [recentOrders, setRecentOrders] = useState(defaultOrders);
  const [activeShipments, setActiveShipments] = useState(defaultShipments);

  useEffect(() => {
    Promise.all([
      get('/dashboard').catch(() => null),
      get('/sales').catch(() => []),
      get('/customers').catch(() => []),
      get('/products').catch(() => [])
    ]).then(([d, salesData]) => {
      if (d) {
        setStats((prev) => ({
          ...prev,
          activeOrders: String(d.activeOrders || 24),
          monthlySalesRaw: Number(d.monthlySales || 185000)
        }));
      }

      if (Array.isArray(salesData) && salesData.length > 0) {
        const orders = salesData
          .filter((x) => x.type === 'Sales Order' || x.orderNo)
          .slice(0, 5)
          .map((ord) => ({
            id: ord.orderNo || ord._id,
            customer: ord.customer,
            avatar: ord.customer ? ord.customer.slice(0, 2).toUpperCase() : 'CU',
            avatarClass: 'purple',
            amount: Number(ord.totalAmount || 0),
            currency: ord.currency,
            status: ord.status || 'Confirmed'
          }));
        if (orders.length > 0) setRecentOrders(orders);
      }
    });
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header matching Image 2 */}
      <div className="dash-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div className="dash-copy">
          <h1 style={{ fontSize: '26px', fontWeight: 800, margin: '0 0 6px', color: '#1e1e2d' }}>
            Good morning, Admin 👋
          </h1>
          <p style={{ margin: 0, color: '#7e8299', fontSize: '13.5px' }}>
            Here's how your export business is doing today
          </p>
        </div>
        <button
          className="btn-new-enquiry"
          onClick={() => navigate('/sales?tab=Enquiries&new=true')}
          type="button"
          title="Create Customer & Enquiry"
        >
          <Plus size={16} /> New Enquiry
        </button>
      </div>

      {/* Top 4 KPI Cards matching Image 2 */}
      <div className="stats">
        {/* Active Orders */}
        <div className="stat-card tone-purple">
          <div className="stat-decor-disc" />
          <div className="stat-icon purple">
            <ShoppingCart size={20} />
          </div>
          <div className="stat-copy">
            <span>Active Orders</span>
            <strong>{stats.activeOrders}</strong>
            <small style={{ color: '#10b981' }}>{stats.ordersGrowth}</small>
          </div>
        </div>

        {/* Pending Shipments */}
        <div className="stat-card tone-blue">
          <div className="stat-decor-disc" />
          <div className="stat-icon blue">
            <Ship size={20} />
          </div>
          <div className="stat-copy">
            <span>Pending Shipments</span>
            <strong>{stats.pendingShipments}</strong>
            <small style={{ color: '#64748b' }}>{stats.shipmentsNote}</small>
          </div>
        </div>

        {/* Outstanding Dues */}
        <div className="stat-card tone-orange">
          <div className="stat-decor-disc" />
          <div className="stat-icon orange">
            <Clock size={20} />
          </div>
          <div className="stat-copy">
            <span>Outstanding Dues</span>
            <strong>{formatAmount(stats.outstandingDues)}</strong>
            <small style={{ color: '#ef4444' }}>{stats.duesNote}</small>
          </div>
        </div>

        {/* Monthly Sales */}
        <div className="stat-card tone-green">
          <div className="stat-decor-disc" />
          <div className="stat-icon green">
            <DollarSign size={20} />
          </div>
          <div className="stat-copy">
            <span>Monthly Sales</span>
            <strong>{formatAmount(stats.monthlySalesRaw)}</strong>
            <small style={{ color: '#10b981' }}>{stats.salesGrowth}</small>
          </div>
        </div>
      </div>

      {/* Export Workflow Stepper matching Image 2 */}
      <div className="export-workflow-card">
        <div className="export-workflow-head">
          <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e1e2d', margin: 0 }}>Export Workflow</h3>
          <Link to="/sales" className="live-link" style={{ color: '#0c5a48', fontWeight: 600, fontSize: '12.5px', textDecoration: 'none' }}>
            Live pipeline
          </Link>
        </div>
        <div className="pipeline-stepper">
          {/* 1. Enquiry */}
          <div className="pipeline-step green" onClick={() => navigate('/sales?tab=Enquiries')} style={{ cursor: 'pointer' }} title="View Enquiries">
            <div className="pipeline-circle">7</div>
            <span className="pipeline-label">Enquiry</span>
          </div>
          <div className="pipeline-connector passed" />

          {/* 2. Quotation */}
          <div className="pipeline-step green" onClick={() => navigate('/sales?tab=Quotations')} style={{ cursor: 'pointer' }} title="View Quotations">
            <div className="pipeline-circle">5</div>
            <span className="pipeline-label">Quotation</span>
          </div>
          <div className="pipeline-connector passed" />

          {/* 3. Sales Order (Active) */}
          <div className="pipeline-step active" onClick={() => navigate('/sales?tab=Sales Orders')} style={{ cursor: 'pointer' }} title="View Sales Orders">
            <div className="pipeline-circle">24</div>
            <span className="pipeline-label" style={{ color: '#0c5a48', fontWeight: 700 }}>Sales Order</span>
          </div>
          <div className="pipeline-connector" />

          {/* 4. Shipment */}
          <div className="pipeline-step" onClick={() => navigate('/shipments')} style={{ cursor: 'pointer' }} title="View Shipments">
            <div className="pipeline-circle">8</div>
            <span className="pipeline-label">Shipment</span>
          </div>
          <div className="pipeline-connector" />

          {/* 5. Invoice */}
          <div className="pipeline-step">
            <div className="pipeline-circle">11</div>
            <span className="pipeline-label">Invoice</span>
          </div>
          <div className="pipeline-connector" />

          {/* 6. Payment */}
          <div className="pipeline-step">
            <div className="pipeline-circle">6</div>
            <span className="pipeline-label">Payment</span>
          </div>
          <div className="pipeline-connector" />

          {/* 7. Completed */}
          <div className="pipeline-step">
            <div className="pipeline-circle">42</div>
            <span className="pipeline-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Active Shipments matching Image 2 */}
      <div className="dashboard-bottom-grid">
        {/* Recent Orders */}
        <div className="panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', minWidth: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>Recent Orders</h3>
            <Link to="/sales" style={{ fontSize: '12.5px', fontWeight: 600, color: '#0c5a48', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div className="table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px' }}>ORDER ID</th>
                  <th style={{ padding: '8px 10px' }}>CUSTOMER</th>
                  <th style={{ padding: '8px 10px' }}>AMOUNT</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                  <th style={{ width: '32px', padding: '8px 4px' }} />
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((ord) => (
                  <tr key={ord.id}>
                    <td style={{ padding: '10px 10px' }}>
                      <Link to="/sales" style={{ color: '#1e1e2d', fontWeight: 700, textDecoration: 'none', fontSize: '12.5px' }}>
                        {ord.id}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className={`avatar-tag ${ord.avatarClass}`} style={{ width: '24px', height: '24px', fontSize: '10.5px' }}>{ord.avatar}</span>
                        <strong style={{ fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>{ord.customer}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <strong style={{ color: '#1e1e2d', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {formatAmount(ord.amount, ord.currency)}
                      </strong>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: ord.status === 'Confirmed' ? '#dcfce7' : ord.status === 'Ready to Ship' ? '#e0f2fe' : '#fef3c7',
                          color: ord.status === 'Confirmed' ? '#15803d' : ord.status === 'Ready to Ship' ? '#0284c7' : '#d97706'
                        }}
                      >
                        <span style={{ fontSize: '9px' }}>●</span> {ord.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', padding: '10px 4px' }}>
                      <button
                        className="small-btn"
                        onClick={() => navigate('/sales')}
                        title="View Order"
                        style={{ background: '#edf7f4', color: '#0c5a48', border: 'none', borderRadius: '8px', width: '28px', height: '28px', display: 'inline-grid', placeItems: 'center' }}
                      >
                        <Eye size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Shipments matching Image 2 */}
        <div className="panel" style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(226, 232, 240, 0.85)', padding: '22px 24px', minWidth: 0, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>Active Shipments</h3>
            <Link to="/sales" style={{ fontSize: '12.5px', fontWeight: 600, color: '#0c5a48', textDecoration: 'none' }}>
              Track all →
            </Link>
          </div>
          <div className="table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px' }}>SHIPMENT ID</th>
                  <th style={{ padding: '8px 10px' }}>DESTINATION</th>
                  <th style={{ padding: '8px 10px' }}>ETD</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {activeShipments.map((shp) => (
                  <tr key={shp.id}>
                    <td style={{ padding: '10px 10px' }}>
                      <Link to="/sales" style={{ color: '#1e1e2d', fontWeight: 700, textDecoration: 'none', fontSize: '12.5px' }}>
                        {shp.id}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <strong style={{ fontSize: '12.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px', color: '#334155' }}>
                        {shp.destination}
                      </strong>
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {shp.etd}
                    </td>
                    <td style={{ padding: '10px 10px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          background: shp.statusType === 'green' ? '#dcfce7' : shp.statusType === 'amber' ? '#fef3c7' : '#e0f2fe',
                          color: shp.statusType === 'green' ? '#15803d' : shp.statusType === 'amber' ? '#d97706' : '#0284c7'
                        }}
                      >
                        <span style={{ fontSize: '9px' }}>●</span> {shp.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
   