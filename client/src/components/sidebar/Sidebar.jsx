import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  LineChart,
  Sparkles,
  X
} from 'lucide-react';
import Logo from '../Logo';

const nav = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/customers', 'Customers', Users],
  ['/products', 'Products', Package],
  ['/sales', 'Sales', LineChart]
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="side-brand">
          <Logo />
          <button className="mobile-close" onClick={onClose} type="button" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-tip-card">
          <div className="tip-header">
            <Sparkles size={15} className="tip-sparkle" />
            <strong>Enter once, reuse everywhere</strong>
          </div>
          <p>We auto-fill customer, product and price details for you.</p>
        </div>
      </aside>
    </>
  );
}
