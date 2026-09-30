import React, { useState } from 'react';
import {
  LayoutDashboard,
  Search,
  Plus,
  CalendarDays,
  RotateCcw
} from 'lucide-react';
import AmbientBackground from './AmbientBackground';
import Sidebar from './sidebar/Sidebar';
import Navbar from './navbar/Navbar';
import { useCurrency } from '../context/CurrencyContext';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { currency, setCurrency, currencies } = useCurrency();

  return (
    <div className="app-shell">
      <AmbientBackground />
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {open && <div className="overlay" onClick={() => setOpen(false)} />}

      <main className="main">
        <Navbar
          onOpen={() => setOpen(true)}
          currency={currency}
          setCurrency={setCurrency}
          currencies={currencies}
        />
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
