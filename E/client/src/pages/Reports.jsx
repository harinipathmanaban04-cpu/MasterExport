import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import {
  Download,
  CalendarDays,
  FileBarChart,
  Users,
  Package,
  Truck,
  MoreHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { get } from '../api';
import { PageHeader, StatCard, Status } from '../components/Layout';

const CATEGORY_COLORS = ['#40b596', '#3ca994', '#4fa8df', '#7a66df', '#e5ad42', '#889e9d'];
const PAYMENT_COLORS = ['#107b5c', '#e5ad42', '#df5a5a'];

export default function Reports() {
  const [data, setData] = useState(null);

  useEffect(() => {
    get('/reports')
      .then(setData)
      .catch(() => {});
  }, []);

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [
        'Report Name,Type,Date Range,Status,Generated On',
        'Sales Report,Sales,Apr 1 2025 - Apr 30 2025,Completed,Apr 30 2025 10:45 AM',
        'Customer Report,Customers,Apr 1 2025 - Apr 30 2025,Completed,Apr 29 2025 04:12 PM',
        'Product Performance,Products,Apr 1 2025 - Apr 30 2025,Completed,Apr 28 2025 11:30 AM',
        'Invoice Summary,Invoices & Payments,Apr 1 2025 - Apr 30 2025,Completed,Apr 27 2025 02:18 PM',
        'Shipment Report,Shipments,Apr 1 2025 - Apr 30 2025,Completed,Apr 25 2025 09:30 AM'
      ].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Master_Export_Pro_Business_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const salesData = data?.salesByMonth || [
    { name: 'Jan', value: 32000 },
    { name: 'Feb', value: 42000 },
    { name: 'Mar', value: 51000 },
    { name: 'Apr', value: 59000 },
    { name: 'May', value: 65000 },
    { name: 'Jun', value: 72000 }
  ];

  const categoryData = data?.category || [
    { name: 'Agricultural Products', value: 28 },
    { name: 'Seafood', value: 22 },
    { name: 'Textiles', value: 18 },
    { name: 'Footwear', value: 15 },
    { name: 'Furniture', value: 10 },
    { name: 'Others', value: 7 }
  ];

  const paymentData = data?.payment || [
    { name: 'Paid', value: 78 },
    { name: 'Pending', value: 15 },
    { name: 'Overdue', value: 7 }
  ];

  return (
    <>
      <PageHeader
        eyebrow="REPORTS"
        title="Business Reports"
        description="Get insights into your sales, customers, products and overall business performance."
        date="Apr 1, 2025 - Apr 30, 2025"
        action={{
          label: 'Export Report',
          icon: <Download size={15} />,
          onClick: handleExportCSV
        }}
      />

      {/* Top 2-Column Analytics Grid matching PDF Page 8 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.4fr) minmax(320px, 1fr)', gap: '20px', marginBottom: '22px' }}>
        {/* Left Column: Sales Performance & Top Buyers Podium */}
        <div className="panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Sales Performance</h3>
                <span style={{ fontSize: '12.5px', color: '#6b7280' }}>YTD $920k · <strong style={{ color: '#059669' }}>▲ +8.4% this month</strong></span>
              </div>
              <span style={{ background: '#f5f3ff', color: '#6c5ce7', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                5-Month Trend
              </span>
            </div>

            <div style={{ height: '180px', marginTop: '10px' }}>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={[
                  { name: 'Dec', value: 140000 },
                  { name: 'Jan', value: 160000 },
                  { name: 'Feb', value: 175000 },
                  { name: 'Mar', value: 210000 },
                  { name: 'Apr', value: 235000 }
                ]} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <XAxis dataKey="name" fontSize={11} stroke="#9ca3af" />
                  <YAxis fontSize={10} stroke="#9ca3af" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Monthly Sales']}
                    contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="value" fill="#6c5ce7" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Buyers Podium */}
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '10px' }}>
              Top Buyers (Q1/Q2 Concentration)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🥇</div>
                <strong style={{ fontSize: '12px', color: '#92400e', display: 'block', marginTop: '2px' }}>ABC Trading</strong>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>$310,000</span>
              </div>
              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🥈</div>
                <strong style={{ fontSize: '12px', color: '#475569', display: 'block', marginTop: '2px' }}>EuroFoods BV</strong>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>$240,000</span>
              </div>
              <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px' }}>🥉</div>
                <strong style={{ fontSize: '12px', color: '#9a3412', display: 'block', marginTop: '2px' }}>Apex Imports</strong>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>$180,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Fulfillment & Payment Health */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Order Fulfillment */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Order Fulfillment</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>38 total export orders</span>
              </div>
              <span style={{ fontSize: '20px', fontWeight: 800, color: '#059669' }}>38</span>
            </div>

            {/* Visual multi-segment bar */}
            <div style={{ height: '10px', borderRadius: '6px', background: '#e5e7eb', overflow: 'hidden', display: 'flex', marginBottom: '14px' }}>
              <div style={{ width: '63%', background: '#10b981' }} title="Delivered: 24" />
              <div style={{ width: '16%', background: '#3b82f6' }} title="Shipped: 6" />
              <div style={{ width: '21%', background: '#f59e0b' }} title="Pending: 8" />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                <span>Delivered: <strong>24</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                <span>Shipped: <strong>6</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                <span>Pending: <strong>8</strong></span>
              </div>
            </div>
          </div>

          {/* Card 2: Payment Health */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Payment Health</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>$280,000 total invoiced</span>
              </div>
              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                75% Collected
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '14px' }}>
              <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', background: 'conic-gradient(#10b981 0% 75%, #f97316 75% 100%)', display: 'grid', placeItems: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#ffffff', display: 'grid', placeItems: 'center', fontSize: '14px', fontWeight: 800, color: '#111827' }}>
                  75%
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                  <span>Collected: <strong style={{ color: '#059669' }}>$210,000</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f97316' }} />
                  <span>Overdue / Dues: <strong style={{ color: '#ea580c' }}>$70,000</strong></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full-Width Profit Estimator Card (Page 8 of PDF) */}
      <div className="profit-estimator-card" style={{ marginBottom: '24px' }}>
        <div className="profit-estimator-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Profit Estimator (April 2025)</span>
          <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }}>
            Automated Margin Engine
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="profit-line">
            <span>Gross Sales Revenue (Confirmed Export Orders)</span>
            <strong>$920,000</strong>
          </div>
          <div className="profit-line">
            <span>Estimated Cost of Goods Sold (COGS - 70% average)</span>
            <strong style={{ color: '#fca5a5' }}>-$644,000</strong>
          </div>
          <div className="profit-line">
            <span>Shipping & Logistics (Ocean & Air Freight)</span>
            <strong style={{ color: '#fca5a5' }}>-$112,000</strong>
          </div>
          <div className="profit-line total">
            <span>Net Operating Profit</span>
            <span style={{ fontSize: '20px', color: '#a7f3d0' }}>
              $164,000 <small style={{ fontSize: '12px', opacity: 0.8 }}>(17.8% Net Margin)</small>
            </span>
          </div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.7)', marginTop: '12px' }}>
          * Profit calculated automatically based on vendor purchase contracts vs quotation FOB/CIF value.
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="panel recent-reports" style={{ overflow: 'hidden' }}>
        <div className="section-title">
          <h3>Recent Reports</h3>
          <a href="#" onClick={(e) => { e.preventDefault(); handleExportCSV(); }}>
            View All Reports →
          </a>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>REPORT NAME</th>
                <th>TYPE</th>
                <th>DATE RANGE</th>
                <th>GENERATED ON</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Sales Report', 'Sales', 'Apr 1, 2025 - Apr 30, 2025', 'Apr 30, 2025 10:45 AM'],
                ['Customer Report', 'Customers', 'Apr 1, 2025 - Apr 30, 2025', 'Apr 29, 2025 04:12 PM'],
                ['Product Performance', 'Products', 'Apr 1, 2025 - Apr 30, 2025', 'Apr 28, 2025 11:30 AM'],
                ['Invoice Summary', 'Invoices & Payments', 'Apr 1, 2025 - Apr 30, 2025', 'Apr 27, 2025 02:18 PM'],
                ['Shipment Report', 'Shipments', 'Apr 1, 2025 - Apr 30, 2025', 'Apr 25, 2025 09:30 AM']
              ].map((x, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileSpreadsheet size={16} color="#087a68" />
                      <strong>{x[0]}</strong>
                    </div>
                  </td>
                  <td>{x[1]}</td>
                  <td>{x[2]}</td>
                  <td>{x[3]}</td>
                  <td>
                    <Status>Completed</Status>
                  </td>
                  <td>
                    <div className="actions" style={{ justifyContent: 'flex-end' }}>
                      <button
                        className="small-btn"
                        title="Download CSV"
                        onClick={handleExportCSV}
                      >
                        <Download size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
