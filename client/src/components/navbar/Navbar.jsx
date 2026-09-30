import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';

export default function Navbar({ onOpen, currency, setCurrency, currencies }) {
  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onOpen} type="button" aria-label="Open menu">
        <Menu size={20} />
      </button>

      <div className="global-search">
        <Search size={16} />
        <input placeholder="Search order, customer, SKU..." />
      </div>

      <div className="top-actions">
        <div className="currency-selector-wrapper">
          <select
            className="currency-selector"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            title="Choose currency (Default: INR ₹)"
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

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
  );
}
