import React, { useEffect, useState } from 'react';
import {
  Building2,
  Users,
  Coins,
  FileText,
  Save,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { get, put, resetAllData } from '../api';
import { PageHeader } from '../components/Layout';

export default function Settings() {
  const [data, setData] = useState({
    companyName: 'Master Exports Pvt Ltd',
    iecCode: '0512 345 678',
    gst: '33AAAAA0000A1Z5',
    address: '42 Textile Valley, Coimbatore, TN 641001, India',
    signatory: 'R. Sundararajan (Director)',
    email: 'director@masterexports.in',
    phone: '+91 98422 11000',
    bankName: 'HDFC Bank - International Trade Branch',
    swiftCode: 'HDFCINBBXXX',
    currency: 'USD ($)',
    baseCurrency: 'INR (₹)',
    usdRate: '83.20',
    eurRate: '90.15',
    gbpRate: '105.40',
    aedRate: '22.65',
    paymentTerms: '30% Advance, 70% against B/L copy'
  });

  const [activeTab, setActiveTab] = useState('Company Profile');
  const [savedNotice, setSavedNotice] = useState(false);

  const load = () => {
    get('/settings')
      .then((res) => {
        if (res) setData((prev) => ({ ...prev, ...res }));
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
  }, []);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData(e.currentTarget);
      const o = Object.fromEntries(fd.entries());
      const updated = await put('/settings', { ...data, ...o });
      setData((prev) => ({ ...prev, ...updated }));
      setSavedNotice(true);
      setTimeout(() => setSavedNotice(false), 2800);
    } catch (err) {
      alert('Save failed: ' + err.message);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('Reset entire system database to the default reference demo data?')) {
      await resetAllData();
      alert('System successfully reset to default reference data.');
      window.location.reload();
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="SYSTEM CONFIGURATION"
        title="Settings & Masters"
        description="Manage company profile, tax identifiers, currencies, terms, and user permissions"
        actions={
          <button
            className="secondary"
            title="Reset system data to sample reference data"
            onClick={handleResetDatabase}
          >
            <RotateCcw size={14} /> Reset Demo Data
          </button>
        }
      />

      {savedNotice && (
        <div
          style={{
            background: '#dff5eb',
            color: '#107b5c',
            padding: '10px 16px',
            borderRadius: '8px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '12.5px',
            border: '1px solid #b2e2cd'
          }}
        >
          <Check size={16} /> Changes saved successfully!
        </div>
      )}

      {/* Horizontal Tabs matching PDF Page 9 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['Company Profile', 'Currencies', 'Standard Terms', 'Users'].map((tab) => (
          <button
            key={tab}
            className={`tab-pill ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2-Column Grid Layout matching PDF Page 9 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1.25fr) minmax(320px, 1fr)', gap: '22px' }}>
        {/* Left Column: Company Profile Form */}
        <div className="panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#f5f3ff', color: '#6c5ce7', display: 'grid', placeItems: 'center' }}>
              <Building2 size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>Company Profile</h3>
              <span style={{ fontSize: '12px', color: '#6b7280' }}>Export establishment and trade licenses</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-grid">
              <div className="field full">
                <label>Company Legal Name *</label>
                <input
                  name="companyName"
                  defaultValue={data.companyName || 'Master Exports Pvt Ltd'}
                  required
                />
              </div>

              <div className="field">
                <label>IEC Code (DGFT) *</label>
                <input
                  name="iecCode"
                  defaultValue={data.iecCode || '0512 345 678'}
                  required
                />
              </div>

              <div className="field">
                <label>GST / Tax ID *</label>
                <input
                  name="gst"
                  defaultValue={data.gst || '33AAAAA0000A1Z5'}
                  required
                />
              </div>

              <div className="field full">
                <label>Registered Address *</label>
                <textarea
                  name="address"
                  defaultValue={data.address || '42 Textile Valley, Coimbatore, TN 641001, India'}
                  rows={2}
                  required
                />
              </div>

              <div className="field">
                <label>Authorized Signatory</label>
                <input
                  name="signatory"
                  defaultValue={data.signatory || 'R. Sundararajan (Director)'}
                />
              </div>

              <div className="field">
                <label>Contact Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={data.email || 'director@masterexports.in'}
                  required
                />
              </div>

              <div className="field">
                <label>Official Phone Number</label>
                <input
                  name="phone"
                  defaultValue={data.phone || '+91 98422 11000'}
                  required
                />
              </div>

              <div className="field">
                <label>Primary Trade Bank</label>
                <input
                  name="bankName"
                  defaultValue={data.bankName || 'HDFC Bank - International Trade Branch'}
                />
              </div>

              <div className="field full">
                <label>Bank SWIFT Code</label>
                <input
                  name="swiftCode"
                  defaultValue={data.swiftCode || 'HDFCINBBXXX'}
                />
              </div>
            </div>

            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn-purple">
                <Save size={15} /> Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Currencies, Terms & Users */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Currencies & Conversion Rates */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#059669', display: 'grid', placeItems: 'center' }}>
                <Coins size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Currencies & Base Rates</h3>
                <span style={{ fontSize: '11.5px', color: '#6b7280' }}>Base accounting currency: INR (₹)</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>USD / INR</div>
                <strong style={{ fontSize: '15px', color: '#111827' }}>83.20</strong>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>EUR / INR</div>
                <strong style={{ fontSize: '15px', color: '#111827' }}>90.15</strong>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>GBP / INR</div>
                <strong style={{ fontSize: '15px', color: '#111827' }}>105.40</strong>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '11px', color: '#6b7280' }}>AED / INR</div>
                <strong style={{ fontSize: '15px', color: '#111827' }}>22.65</strong>
              </div>
            </div>
          </div>

          {/* Card 2: Standard Payment Terms & Incoterms */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', display: 'grid', placeItems: 'center' }}>
                <FileText size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Standard Payment Terms & Incoterms</h3>
                <span style={{ fontSize: '11.5px', color: '#6b7280' }}>Default commercial conditions</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div>
                <span style={{ color: '#6b7280', fontSize: '11.5px' }}>Default Payment Terms:</span>
                <div style={{ fontWeight: 600, color: '#111827', marginTop: '2px' }}>
                  30% Advance, 70% against B/L copy
                </div>
              </div>

              <div>
                <span style={{ color: '#6b7280', fontSize: '11.5px' }}>Supported Incoterms:</span>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span style={{ background: '#f3e8ff', color: '#7e22ce', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    FOB (Free on Board)
                  </span>
                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    CIF (Cost, Insurance & Freight)
                  </span>
                  <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    CFR (Cost & Freight)
                  </span>
                  <span style={{ background: '#f3f4f6', color: '#374151', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 700 }}>
                    EXW (Ex Works)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Users & Access Control */}
          <div className="panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fff7ed', color: '#ea580c', display: 'grid', placeItems: 'center' }}>
                <Users size={16} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#111827' }}>Users & Permissions</h3>
                <span style={{ fontSize: '11.5px', color: '#6b7280' }}>Active team members with system access</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="avatar-tag purple">AD</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', color: '#111827', display: 'block' }}>Admin User</strong>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>admin@masterexports.in</span>
                  </div>
                </div>
                <span style={{ background: '#f5f3ff', color: '#6c5ce7', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                  Super Admin
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="avatar-tag blue">LM</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', color: '#111827', display: 'block' }}>Lisa Meyer</strong>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>lisa@masterexports.in</span>
                  </div>
                </div>
                <span style={{ background: '#eff6ff', color: '#2563eb', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                  Sales Manager
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', background: '#f9fafb', borderRadius: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="avatar-tag coral">AA</span>
                  <div>
                    <strong style={{ fontSize: '12.5px', color: '#111827', display: 'block' }}>Ahmed Ali</strong>
                    <span style={{ fontSize: '11px', color: '#6b7280' }}>ahmed@masterexports.in</span>
                  </div>
                </div>
                <span style={{ background: '#fff7ed', color: '#ea580c', fontSize: '11px', fontWeight: 700, padding: '2px 7px', borderRadius: '4px' }}>
                  Logistics Exec
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
