import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  LineChart,
  Bell,
  Search,
  Menu,
  X,
  Plus,
  CalendarDays,
  RotateCcw,
  Globe,
  Sparkles
} from 'lucide-react';
import Logo from './Logo';
import AmbientBackground from './AmbientBackground';

const nav = [
  ['/', 'Dashboard', LayoutDashboard],
  ['/customers', 'Customers', Users],
  ['/products', 'Products', Package],
  ['/sales', 'Sales', LineChart]
];

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="app-shell">
      <AmbientBackground />
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="side-brand">
          <Logo />
          <button className="mobile-close" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav>
          {nav.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? 'active' : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Persistent Tip Card matching PDF */}
        <div className="sidebar-tip-card">
          <div className="tip-header">
            <Sparkles size={15} className="tip-sparkle" />
            <strong>Enter once, reuse everywhere</strong>
          </div>
          <p>We auto-fill customer, product and price details for you.</p>
        </div>
      </aside>

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <main className="main">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setOpen(true)}>
            <Menu size={20} />
          </button>
          <div className="global-search">
            <Search size={16} />
            <input placeholder="Search order, customer, SKU..." />
          </div>
          <div className="top-actions">
            <button className="topbar-pill" type="button">
              <Globe size={14} />
              <span>English</span>
            </button>
            <div className="currency-selector">$ USD ▾</div>
            <button className="icon-btn" title="Notifications" type="button">
              <Bell size={18} />
              <span className="dot-badge" />
            </button>
            <div className="user-pill">
              <div className="user-avatar-circle">A</div>
              <span className="user-name">Admin</span>
            </div>
          </div>
        </header>
        <div className="content">{children}</div>
      </main>
    </div>
  );
}

export const PageHeader = ({ eyebrow, title, description, action, actions, date }) => (
  <div className="page-header">
    <div>
      {eyebrow && <div className="eyebrow">{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    <div className="header-actions">
      {date && (
        <button className="date-control">
          <CalendarDays size={15} />
          <span>{date}</span>
          <b>⌄</b>
        </button>
      )}
      {actions}
      {action && (
        <button className="primary" onClick={action.onClick}>
          {action.icon || <Plus size={16} />}
          {action.label}
        </button>
      )}
    </div>
  </div>
);

export const StatCard = ({ icon: Icon = LayoutDashboard, label, value, note, tone = 'green' }) => (
  <div className="stat-card">
    <div className={`stat-icon ${tone}`}>
      <Icon size={20} />
    </div>
    <div className="stat-copy">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
    <span className="stat-arrow">›</span>
  </div>
);

export const Status = ({ children }) => {
  const text = String(children || '').trim();
  const cls = text.toLowerCase().replace(/\s+/g, '-');
  return <span className={`status ${cls}`}>{text}</span>;
};

export const Toolbar = ({ search, children, onReset }) => (
  <div className="toolbar">
    {search && (
      <div className="search-box">
        <Search size={15} />
        <input {...search} />
      </div>
    )}
    {children}
    {onReset && (
      <button className="reset" onClick={onReset} type="button">
        <RotateCcw size={14} /> Reset
      </button>
    )}
  </div>
);

export const IconCell = ({ children, tone = 'blue' }) => (
  <span className={`row-icon ${tone}`}>{children}</span>
);
