import React, { useState, useEffect } from 'react';
import {
  Building2,
  Bell,
  Save,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { PageHeader } from '../components/Layout';
import { useCurrency } from '../context/CurrencyContext';
import { get, put } from '../api';

const defaultSettings = {
  companyName: 'Master Export Pro India Pvt Ltd',
  iecCode: '0518902144',
  gstin: '27AABCM8291Q1Z0',
  pan: 'AABCM8291Q',
  rcmcNo: 'RCMC/TEX/2024/9912',
  authorizedPort: 'Nhava Sheva (JNPT), Mumbai, India',
  email: 'operations@masterexport.com',
  phone: '+91 22 6123 4567',
  website: 'https://masterexportpro.com',
  address: 'Express Towers, 14th Floor, Nariman Point, Mumbai, MH 400021, India',
  defaultCurrency: 'USD',
  defaultIncoterm: 'CIF',
  defaultTransportMode: 'Sea',
  defaultCarrier: 'Maersk Line',
  defaultOrigin: 'Nhava Sheva, Mumbai, India',
  defaultDestination: 'Jebel Ali, Dubai, UAE',
  shipmentPrefix: 'SHP-',
  orderPrefix: 'SO-',
  invoicePrefix: 'EXP-INV-',
  authorizedSignatory: 'Divine Mathew',
  designation: 'Director of Export Operations',
  notifyOnStageChange: true,
  notifyCustomsHold: true,
  emailAlerts: true,
  autoPackingList: true
};

export default function Settings() {
  const { currency, setCurrency, currencies } = useCurrency();
  const [activeTab, setActiveTab] = useState('company');
  const [formData, setFormData] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  // Load settings from backend API or localStorage fallback
  useEffect(() => {
    get('/settings')
      .then((data) => {
        if (data && typeof data === 'object') {
          setFormData((prev) => ({ ...prev, ...data }));
          if (data.defaultCurrency && data.defaultCurrency !== currency) {
            setCurrency(data.defaultCurrency);
          }
        }
      })
      .catch(() => {
        const saved = localStorage.getItem('master_export_settings');
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (e) {}
        }
      });
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));

    if (name === 'defaultCurrency') {
      setCurrency(val);
    }
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSavedNotice(false);

    try {
      await put('/settings', formData);
    } catch (err) {
      console.warn('Backend /api/settings update failed, using local fallback:', err);
    }

    localStorage.setItem('master_export_settings', JSON.stringify(formData));
    setSaving(false);
    setSavedNotice(true);

    setTimeout(() => {
      setSavedNotice(false);
    }, 3500);
  };

  const handleReset = () => {
    if (window.confirm('Reset all enterprise settings to default values?')) {
      setFormData(defaultSettings);
      localStorage.setItem('master_export_settings', JSON.stringify(defaultSettings));
      setCurrency(defaultSettings.defaultCurrency);
      put('/settings', defaultSettings).catch(() => {});
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 3000);
    }
  };

  return (
    <div className="settings-page" style={{ maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
      {/* Page Header */}
      <PageHeader
        eyebrow="SYSTEM CONFIGURATION"
        title="Settings & Export Profile"
        description="Configure enterprise company credentials, export compliance, shipping defaults, and system preferences."
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {savedNotice && (
              <div className="success-toast">
                <CheckCircle2 size={16} />
                <span>Settings Saved Successfully!</span>
              </div>
            )}
            <button
              type="button"
              className="secondary"
              onClick={handleReset}
              title="Reset to Factory Defaults"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RotateCcw size={14} />
              <span>Reset Defaults</span>
            </button>
            <button
              type="button"
              className="primary"
              onClick={handleSave}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Save size={15} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        }
      />

      {/* Tabbed Navigation Pills (Matching Shipments Toolbar style) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '18px', scrollbarWidth: 'none' }}>
        {[
          { id: 'company', label: 'Company Profile & Compliance', icon: Building2 },
          { id: 'notifications', label: 'Notifications & Automation', icon: Bell }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`status-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSave}>
        {/* TAB 1: Company Profile & Compliance */}
        {activeTab === 'company' && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>Enterprise Export Profile</h3>
                <p>Official legal credentials appearing on export invoices, customs declarations, and shipping bills.</p>
              </div>
            </div>

            <div className="form-grid">
              <div className="field full">
                <label>Company Legal Name *</label>
                <input
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Import Export Code (IEC) *</label>
                <input
                  name="iecCode"
                  value={formData.iecCode}
                  onChange={handleChange}
                  placeholder="e.g. 0518902144"
                  required
                />
              </div>

              <div className="field">
                <label>GSTIN / Tax ID *</label>
                <input
                  name="gstin"
                  value={formData.gstin}
                  onChange={handleChange}
                  placeholder="e.g. 27AABCM8291Q1Z0"
                  required
                />
              </div>

              <div className="field">
                <label>Permanent Account Number (PAN)</label>
                <input
                  name="pan"
                  value={formData.pan}
                  onChange={handleChange}
                  placeholder="e.g. AABCM8291Q"
                />
              </div>

              <div className="field">
                <label>RCMC Registration Number</label>
                <input
                  name="rcmcNo"
                  value={formData.rcmcNo}
                  onChange={handleChange}
                  placeholder="e.g. RCMC/TEX/2024/9912"
                />
              </div>

              <div className="field">
                <label>Official Operations Email *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field">
                <label>Contact Phone Number *</label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="field full">
                <label>Company Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <div className="field">
                <label>Default Operating Currency</label>
                <select
                  name="defaultCurrency"
                  value={formData.defaultCurrency}
                  onChange={handleChange}
                  className="pro-select"
                >
                  {Object.keys(currencies || {}).map((c) => (
                    <option key={c} value={c}>
                      {c} — {currencies[c].symbol} ({currencies[c].name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="field full">
                <label>Registered Office Address *</label>
                <textarea
                  name="address"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Notifications & Automation */}
        {activeTab === 'notifications' && (
          <div className="settings-card">
            <div className="settings-card-header">
              <div>
                <h3>Alerts & Workflow Automation</h3>
                <p>Manage real-time notifications for milestone stage transitions and customs holds.</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Toggle 1 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e1e2d', display: 'block' }}>
                    Milestone Stage Progression Alerts
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#627b75' }}>
                    Notify stakeholders automatically when a consignment progresses (Preparing → Customs → Shipped → In Transit → Delivered).
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    className="switch-input"
                    name="notifyOnStageChange"
                    checked={formData.notifyOnStageChange}
                    onChange={handleChange}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Toggle 2 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e1e2d', display: 'block' }}>
                    Customs Hold Urgent Alerts
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#627b75' }}>
                    Trigger high-priority alerts immediately if customs inspection or document deficiency holds arise.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    className="switch-input"
                    name="notifyCustomsHold"
                    checked={formData.notifyCustomsHold}
                    onChange={handleChange}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Toggle 3 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e1e2d', display: 'block' }}>
                    Email Dispatch Notifications
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#627b75' }}>
                    Send shipping advice and tracking links directly to consignee buyer contacts.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    className="switch-input"
                    name="emailAlerts"
                    checked={formData.emailAlerts}
                    onChange={handleChange}
                  />
                  <span className="switch-slider" />
                </label>
              </div>

              {/* Toggle 4 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e1e2d', display: 'block' }}>
                    Automatic Packing List Generation
                  </strong>
                  <span style={{ fontSize: '12.5px', color: '#627b75' }}>
                    Generate pre-formatted export packing lists automatically when a sales order is converted to shipment.
                  </span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    className="switch-input"
                    name="autoPackingList"
                    checked={formData.autoPackingList}
                    onChange={handleChange}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Action Bar Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button
            type="button"
            className="secondary"
            onClick={handleReset}
          >
            Reset Defaults
          </button>
          <button
            type="submit"
            className="primary"
            disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', minWidth: '130px', justifyContent: 'center' }}
          >
            <Save size={15} />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
