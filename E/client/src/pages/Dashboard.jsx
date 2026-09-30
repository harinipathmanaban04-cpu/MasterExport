import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Ship,
  Clock,
  DollarSign,
  Plus,
  Eye,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Status } from '../components/Layout';
import { get } from '../api';

const defaultOrders = [
  { id: 'SO-1024', customer: 'ABC Trading LLC', avatar: 'AT', avatarClass: 'purple', amount: '$50,000', status: 'Preparing' },
  { id: 'SO-1025', customer: 'Apex Imports', avatar: 'AI', avatarClass: 'blue', amount: '$28,000', status: 'Ready to Ship' },
  { id: 'SO-1026', customer: 'Tokyo Trading', avatar: 'TT', avatarClass: 'teal', amount: '$12,500', status: 'Confirmed' }
];

const defaultShipments = [
  { id: 'SHP-088', destination: 'Dubai, UAE 🇦🇪', etd: 'Oct 12, 2026', status: 'In Transit' },
  { id: 'SHP-101', destination: 'Jebel Ali, UAE 🇦🇪', etd: 'Oct 10, 2026', status: 'In Transit' },
  { id: 'SHP-102', destination: 'New York, USA 🇺🇸', etd: 'Oct 04, 2026', status: 'Customs' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeOrders: '24',
    ordersGrowth: '▲ 12% this month',
    pendingShipments: '8',
    shipmentsNote: '3 leaving this week',
    outstandingDues: '$45,000',
    duesNote: '5 invoices open',
    monthlySales: '$185,000',
    salesGrowth: '▲ 8.4% vs last month'
  });

  const [recentOrders, setRecentOrders] = useState(defaultOrders);
  const [activeShipments, setActiveShipments] = useState(defaultShipments);

  useEffect(() => {
    get('/dashboard')
      .then((d) => {
        if (d) {
          setStats((prev) => ({
            ...prev,
            activeOrders: String(d.activeOrders || 24),
            pendingShipments: String(d.pendingShipments || 8),
            outstandingDues: `$${Number(d.outstandingPayments || 45000).toLocaleString()}`,
            monthlySales: `$${Number(d.monthlySales || 185000).toLocaleString()}`
          }));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header matching PDF Page 1 */}
      <div className="dash-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div className="dash-copy">
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: '0 0 6px', color: '#1e1e2d' }}>
            Good morning, Admin 👋
          </h1>
          <p style={{ margin: 0, color: '#7e8299', fontSize: '13.5px' }}>
            Here's how your export business is doing today
          </p>
        </div>
        <button
          className="btn-purple"
          onClick={() => navigate('/sales')}
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          <Plus size={16} /> New Enquiry
        </button>
      </div>

      {/* Top 4 KPI Cards matching PDF Page 1 */}
      <div className="stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {/* Active Orders */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon purple" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0eefb', color: '#6c5ce7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <ShoppingCart size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Active Orders</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.activeOrders}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>{stats.ordersGrowth}</small>
          </div>
          <span className="stat-arrow" style={{ marginLeft: 'auto', color: '#cbd5e1', fontSize: '16px' }}>›</span>
        </div>

        {/* Pending Shipments */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon blue" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Ship size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Pending Shipments</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.pendingShipments}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>{stats.shipmentsNote}</small>
          </div>
          <span className="stat-arrow" style={{ marginLeft: 'auto', color: '#cbd5e1', fontSize: '16px' }}>›</span>
        </div>

        {/* Outstanding Dues */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon orange" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Clock size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Outstanding Dues</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.outstandingDues}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 600, color: '#d97706' }}>{stats.duesNote}</small>
          </div>
          <span className="stat-arrow" style={{ marginLeft: 'auto', color: '#cbd5e1', fontSize: '16px' }}>›</span>
        </div>

        {/* Monthly Sales */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon green" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dcfce7', color: '#15803d', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <DollarSign size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Monthly Sales</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.monthlySales}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 600, color: '#10b981' }}>{stats.salesGrowth}</small>
          </div>
          <span className="stat-arrow" style={{ marginLeft: 'auto', color: '#cbd5e1', fontSize: '16px' }}>›</span>
        </div>
      </div>

      {/* Export Workflow Stepper matching PDF Page 1 */}
      <div className="export-workflow-card">
        <div className="export-workflow-head">
          <h3>Export Workflow</h3>
          <Link to="/sales" className="live-link">
            Live pipeline
          </Link>
        </div>
        <div className="pipeline-stepper">
          <div className="pipeline-step green">
            <div className="pipeline-circle">7</div>
            <span className="pipeline-label">Enquiry</span>
          </div>
          <div className="pipeline-connector passed" />

          <div className="pipeline-step green">
            <div className="pipeline-circle">5</div>
            <span className="pipeline-label">Quotation</span>
          </div>
          <div className="pipeline-connector passed" />

          <div className="pipeline-step active">
            <div className="pipeline-circle">24</div>
            <span className="pipeline-label">Sales Order</span>
          </div>
          <div className="pipeline-connector" />

          <div className="pipeline-step">
            <div className="pipeline-circle">8</div>
            <span className="pipeline-label">Shipment</span>
          </div>
          <div className="pipeline-connector" />

          <div className="pipeline-step">
            <div className="pipeline-circle">11</div>
            <span className="pipeline-label">Invoice</span>
          </div>
          <div className="pipeline-connector" />

          <div className="pipeline-step">
            <div className="pipeline-circle">6</div>
            <span className="pipeline-label">Payment</span>
          </div>
          <div className="pipeline-connector" />

          <div className="pipeline-step">
            <div className="pipeline-circle">42</div>
            <span className="pipeline-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Active Shipments matching PDF Page 1 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '16px', alignItems: 'flex-start' }}>
        {/* Recent Orders */}
        <div className="panel" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>Recent Orders</h3>
            <Link to="/sales" style={{ fontSize: '12px', fontWeight: 600, color: '#6c5ce7', textDecoration: 'none' }}>
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
                    <td style={{ padding: '9px 10px' }}>
                      <Link to="/sales" style={{ color: '#1e1e2d', fontWeight: 700, textDecoration: 'none', fontSize: '12px' }}>
                        {ord.id}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className={`avatar-tag ${ord.avatarClass}`} style={{ width: '22px', height: '22px', fontSize: '10px' }}>{ord.avatar}</span>
                        <strong style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>{ord.customer}</strong>
                      </div>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ color: '#1e1e2d', fontSize: '12.5px', whiteSpace: 'nowrap' }}>{ord.amount}</strong>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <Status>{ord.status}</Status>
                    </td>
                    <td style={{ textAlign: 'right', padding: '9px 4px' }}>
                      <button
                        className="small-btn"
                        onClick={() => navigate('/sales')}
                        title="View Order"
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

        {/* Active Shipments */}
        <div className="panel" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>Active Shipments</h3>
            <Link to="/shipments" style={{ fontSize: '12px', fontWeight: 600, color: '#6c5ce7', textDecoration: 'none' }}>
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
                    <td style={{ padding: '9px 10px' }}>
                      <Link to="/shipments" style={{ color: '#1e1e2d', fontWeight: 700, textDecoration: 'none', fontSize: '12px' }}>
                        {shp.id}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{shp.destination}</strong>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <span style={{ color: '#64748b', fontSize: '11.5px', whiteSpace: 'nowrap' }}>{shp.etd}</span>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <Status>{shp.status}</Status>
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
