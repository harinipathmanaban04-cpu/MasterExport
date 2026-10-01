import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  LineChart,
  Ship,
  Settings as SettingsIcon,
  Sparkles,
  X
} from 'lucide-react';
import Logo from '../Logo';

const nav = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/customers', 'Customers', Users],
  ['/products', 'Products', Package],
  ['/sales', 'Sales', LineChart],
  ['/shipments', 'Shipments', Ship],
  ['/settings', 'Settings', SettingsIcon]
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

      </aside>
    </>
  );
}
