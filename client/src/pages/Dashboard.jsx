import React, { useEffect, useState } from 'react';
import {
  ShoppingCart,
  Users,
  Package,
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

const defaultQuotations = [
  { id: 'QUO-2026-0001', customer: 'Global Foods Ltd', destination: 'Hamburg, Germany 🇩🇪', amount: '€47,500', status: 'Sent' },
  { id: 'QUO-2026-0004', customer: 'Top Imports Ltd', destination: 'Tokyo, Japan 🇯🇵', amount: '$57,720', status: 'Sent' },
  { id: 'QUO-2026-0006', customer: 'Oceanic Trading', destination: 'Los Angeles, USA 🇺🇸', amount: '$76,000', status: 'Accepted' }
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    activeOrders: '24',
    ordersGrowth: '▲ 12% this month',
    customers: '12',
    customersNote: '4 active markets',
    products: '35',
    productsNote: 'Export catalog items',
    monthlySales: '$185,000',
    salesGrowth: '▲ 8.4% vs last month'
  });

  const [recentOrders, setRecentOrders] = useState(defaultOrders);
  const [recentQuotations, setRecentQuotations] = useState(defaultQuotations);

  useEffect(() => {
    Promise.all([
      get('/dashboard').catch(() => null),
      get('/sales').catch(() => []),
      get('/customers').catch(() => []),
      get('/products').catch(() => []),
      get('/quotations').catch(() => [])
    ]).then(([d, salesData, custList, prodList, quotList]) => {
      if (d) {
        setStats((prev) => ({
          ...prev,
          activeOrders: String(d.activeOrders || 24),
          customers: String(custList?.length || d.customers || 12),
          products: String(prodList?.length || d.products || 35),
          monthlySales: `$${Number(d.monthlySales || 185000).toLocaleString()}`
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
            amount: `$${Number(ord.totalAmount || 0).toLocaleString()}`,
            status: ord.status || 'Confirmed'
          }));
        if (orders.length > 0) setRecentOrders(orders);
      }

      if (Array.isArray(quotList) && quotList.length > 0) {
        const quotes = quotList.slice(0, 5).map((q) => ({
          id: q.quotationNo || q._id,
          customer: q.customer,
          destination: q.destination || 'Export Port',
          amount: `${q.currency === 'EUR' ? '€' : '$'}${Number(q.grandTotal || q.totalAmount || 0).toLocaleString()}`,
          status: q.status || 'Draft'
        }));
        if (quotes.length > 0) setRecentQuotations(quotes);
      }
    });
  }, []);

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dash-head">
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

      {/* Top 4 KPI Cards */}
      <div className="stats">
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

        {/* Total Customers */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon blue" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#e0f2fe', color: '#0284c7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Users size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Total Customers</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.customers}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 500, color: '#6b7280' }}>{stats.customersNote}</small>
          </div>
          <span className="stat-arrow" style={{ marginLeft: 'auto', color: '#cbd5e1', fontSize: '16px' }}>›</span>
        </div>

        {/* Total Products */}
        <div className="stat-card" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0 }}>
          <div className="stat-icon orange" style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fef3c7', color: '#d97706', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Package size={20} />
          </div>
          <div className="stat-copy" style={{ minWidth: 0, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#7e8299' }}>Total Products</span>
            <strong style={{ fontSize: '24px', fontWeight: 800, color: '#1e1e2d', lineHeight: 1.15, margin: '2px 0', whiteSpace: 'nowrap' }}>
              {stats.products}
            </strong>
            <small style={{ fontSize: '11px', fontWeight: 600, color: '#d97706' }}>{stats.productsNote}</small>
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

      {/* Export Workflow Stepper */}
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
          <div className="pipeline-connector passed" />

          <div className="pipeline-step">
            <div className="pipeline-circle">42</div>
            <span className="pipeline-label">Completed</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Recent Quotations */}
      <div className="dashboard-bottom-grid">
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

        {/* Recent Quotations */}
        <div className="panel" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid var(--border)', padding: '16px 18px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#1e1e2d' }}>Recent Quotations</h3>
            <Link to="/sales" style={{ fontSize: '12px', fontWeight: 600, color: '#6c5ce7', textDecoration: 'none' }}>
              View all →
            </Link>
          </div>
          <div className="table-wrap" style={{ width: '100%', overflowX: 'auto' }}>
            <table className="data-table dashboard-table">
              <thead>
                <tr>
                  <th style={{ padding: '8px 10px' }}>QUOTATION ID</th>
                  <th style={{ padding: '8px 10px' }}>CUSTOMER</th>
                  <th style={{ padding: '8px 10px' }}>AMOUNT</th>
                  <th style={{ padding: '8px 10px' }}>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {recentQuotations.map((quo) => (
                  <tr key={quo.id}>
                    <td style={{ padding: '9px 10px' }}>
                      <Link to="/sales" style={{ color: '#1e1e2d', fontWeight: 700, textDecoration: 'none', fontSize: '12px' }}>
                        {quo.id}
                      </Link>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>{quo.customer}</strong>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <strong style={{ color: '#1e1e2d', fontSize: '12.5px', whiteSpace: 'nowrap' }}>{quo.amount}</strong>
                    </td>
                    <td style={{ padding: '9px 10px' }}>
                      <Status>{quo.status}</Status>
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
