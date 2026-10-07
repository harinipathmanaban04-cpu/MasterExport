import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Menu, Search, X, Package, Users, FileText, Globe, ChevronDown, LogOut, Settings as SettingsIcon, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { get, getQuotations } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Navbar({ onOpen, currency, setCurrency, currencies }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [data, setData] = useState({
    products: [],
    customers: [],
    sales: [],
    quotations: []
  });
  const [hasLoaded, setHasLoaded] = useState(false);
  const containerRef = useRef(null);
  const userDropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    toast.info('You have safely signed out of Master Export Pro.', 'Session Ended');
    navigate('/login', { replace: true });
  };

  const loadSearchData = async () => {
    if (hasLoaded) return;
    try {
      const [prods, custs, salesData, quots] = await Promise.all([
        get('/products').catch(() => []),
        get('/customers').catch(() => []),
        get('/sales').catch(() => []),
        getQuotations().catch(() => [])
      ]);
      setData({
        products: Array.isArray(prods) ? prods : [],
        customers: Array.isArray(custs) ? custs : [],
        sales: Array.isArray(salesData) ? salesData : [],
        quotations: Array.isArray(quots) ? quots : []
      });
      setHasLoaded(true);
    } catch (e) {
      console.warn('Search data load failed:', e);
    }
  };

  // Filter results across modules
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { products: [], customers: [], orders: [], quotations: [], total: 0 };

    const matchedProducts = data.products
      .filter((p) => (p.name || '').toLowerCase().includes(q) || (p.sku || '').toLowerCase().includes(q) || (p.hsCode || '').toLowerCase().includes(q))
      .slice(0, 3);

    const matchedCustomers = data.customers
      .filter((c) => (c.companyName || '').toLowerCase().includes(q) || (c.contactPerson || '').toLowerCase().includes(q) || (c.country || '').toLowerCase().includes(q))
      .slice(0, 3);

    const matchedOrders = data.sales
      .filter((s) => s.type === 'Sales Order' || s.orderNo)
      .filter((s) => (s.orderNo || '').toLowerCase().includes(q) || (s.customer || '').toLowerCase().includes(q) || (s.destination || '').toLowerCase().includes(q))
      .slice(0, 3);

    const matchedQuotations = (data.quotations.length > 0 ? data.quotations : data.sales.filter((s) => s.type === 'Quotation'))
      .filter((quo) => (quo.quotationNo || '').toLowerCase().includes(q) || (quo.customer || '').toLowerCase().includes(q) || (quo.enquiryNo || '').toLowerCase().includes(q))
      .slice(0, 3);

    const total = matchedProducts.length + matchedCustomers.length + matchedOrders.length + matchedQuotations.length;
    return {
      products: matchedProducts,
      customers: matchedCustomers,
      orders: matchedOrders,
      quotations: matchedQuotations,
      total
    };
  }, [searchQuery, data]);

  const handleSelectResult = (path) => {
    setIsOpen(false);
    setSearchQuery('');
    navigate(path);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setIsOpen(false);
      if (searchResults.products.length > 0 && searchResults.customers.length === 0 && searchResults.orders.length === 0) {
        navigate('/products');
      } else if (searchResults.customers.length > 0 && searchResults.products.length === 0 && searchResults.orders.length === 0) {
        navigate('/customers');
      } else {
        navigate('/sales');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <header className="topbar">
      <button className="mobile-menu" onClick={onOpen} type="button" aria-label="Open menu">
        <Menu size={20} />
      </button>

      {/* Global Search with Live Results Dropdown */}
      <div className="global-search-container" ref={containerRef} style={{ position: 'relative' }}>
        <div className="global-search">
          <Search size={16} />
          <input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              loadSearchData();
            }}
            onKeyDown={handleKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                padding: '2px',
                cursor: 'pointer',
                color: '#8fa4a8',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Live Search Results Popup */}
        {isOpen && searchQuery.trim().length > 0 && (
          <div
            className="search-results-dropdown"
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              width: '100%',
              minWidth: '340px',
              maxWidth: '480px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.12)',
              zIndex: 100,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '8px'
            }}
          >
            {searchResults.total === 0 ? (
              <div style={{ padding: '16px 12px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No matching orders, customers or products found for "<strong>{searchQuery}</strong>".
              </div>
            ) : (
              <>
                {/* Orders */}
                {searchResults.orders.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0c5a48', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={12} /> Sales Orders
                    </div>
                    {searchResults.orders.map((ord) => (
                      <div
                        key={ord._id || ord.orderNo}
                        onClick={() => handleSelectResult('/sales')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{ord.orderNo}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{ord.customer}</span>
                        </div>
                        <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {ord.status || 'Confirmed'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Quotations */}
                {searchResults.quotations.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FileText size={12} /> Quotations
                    </div>
                    {searchResults.quotations.map((q) => (
                      <div
                        key={q._id || q.quotationNo}
                        onClick={() => handleSelectResult('/sales')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{q.quotationNo}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{q.customer}</span>
                        </div>
                        <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {q.status || 'Draft'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Customers */}
                {searchResults.customers.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Users size={12} /> Customers
                    </div>
                    {searchResults.customers.map((c) => (
                      <div
                        key={c._id || c.companyName}
                        onClick={() => handleSelectResult('/customers')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{c.companyName}</strong>
                          <span style={{ fontSize: '12px', color: '#64748b', marginLeft: '8px' }}>{c.country}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{c.contactPerson}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products */}
                {searchResults.products.length > 0 && (
                  <div>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Package size={12} /> Products
                    </div>
                    {searchResults.products.map((p) => (
                      <div
                        key={p._id || p.sku}
                        onClick={() => handleSelectResult('/products')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <div>
                          <span style={{ marginRight: '6px' }}>{p.icon || '📦'}</span>
                          <strong style={{ fontSize: '12.5px', color: '#1e293b' }}>{p.name}</strong>
                          <span style={{ fontSize: '11px', color: '#94a3b8', marginLeft: '8px' }}>{p.sku}</span>
                        </div>
                        <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>{p.unit}</span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="top-actions">
        {/* Language Pill matching picture */}
        <div className="topbar-pill lang-pill" title="Current Language">
          <Globe size={15} style={{ color: '#0c5a48' }} />
          <span>English</span>
        </div>

        {/* Currency Selector Pill matching picture */}
        <div className="currency-pill" title="Choose Currency (Default: INR ₹)">
          <select
            className="currency-select"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.symbol} {c.code}
              </option>
            ))}
          </select>
          <ChevronDown size={13} style={{ color: '#64748b', pointerEvents: 'none' }} />
        </div>

        {/* Admin User Profile Pill with Interactive Dropdown */}
        <div style={{ position: 'relative' }} ref={userDropdownRef}>
          <div
            className="user-pill"
            title="User Profile & Settings"
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            style={{ cursor: 'pointer', userSelect: 'none' }}
          >
            <div className="user-avatar-circle">A</div>
            <span className="user-name">{user?.name ? 'Admin' : 'Admin'}</span>
            <ChevronDown
              size={13}
              style={{
                color: '#64748b',
                transition: 'transform 0.15s ease',
                transform: userDropdownOpen ? 'rotate(180deg)' : 'rotate(0)'
              }}
            />
          </div>

          {/* Professional Admin Dropdown */}
          {userDropdownOpen && (
            <div
              className="user-profile-dropdown"
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '280px',
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 16px 36px -8px rgba(0, 0, 0, 0.12), 0 6px 12px -4px rgba(0, 0, 0, 0.06)',
                zIndex: 1000,
                padding: '12px',
                animation: 'modalFadeIn 0.18s ease-out forwards'
              }}
            >
              {/* Profile Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 10px 14px',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0c5a48 0%, #084335 100%)',
                      color: '#ffffff',
                      border: '1.5px solid #d97706',
                      display: 'grid',
                      placeItems: 'center',
                      fontWeight: 800,
                      fontSize: '15px'
                    }}
                  >
                    A
                  </div>
                  {/* Online indicator dot */}
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: '#10b981',
                      border: '2px solid #ffffff'
                    }}
                  />
                </div>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong style={{ fontSize: '13.5px', color: '#0f172a' }}>Administrator</strong>
                    <span style={{ fontSize: '10px', background: '#ecfdf5', color: '#065f46', fontWeight: 700, padding: '1px 6px', borderRadius: '4px' }}>
                      SUPER
                    </span>
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '1px' }}>
                    admin@masterexport.com
                  </div>
                </div>
              </div>

              {/* Quick Menu Links */}
              <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/settings');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <SettingsIcon size={15} style={{ color: '#64748b' }} />
                  <span>ERP System Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setUserDropdownOpen(false);
                    navigate('/reports');
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '12.5px',
                    fontWeight: 500,
                    color: '#334155',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <ShieldCheck size={15} style={{ color: '#0c5a48' }} />
                  <span>Audit & Reports</span>
                </button>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#f1f5f9', margin: '4px 0 6px' }} />

              {/* Professional Logout Option */}
              <button
                type="button"
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#fef2f2',
                  color: '#dc2626',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fee2e2';
                  e.currentTarget.style.color = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                  e.currentTarget.style.color = '#dc2626';
                }}
              >
                <LogOut size={15} />
                <span>Sign Out of Portal</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
