import React from 'react';
import officialLogoImg from '../assets_logo.png';

/**
 * Master Export Pro - Official Logo Component
 * Uses the exact official high-resolution logo image provided by the user.
 * Seamlessly blends with the sidebar, documents, and navigation.
 */
export default function Logo({
  variant = 'sidebar', // 'sidebar' | 'horizontal' | 'document' | 'icon'
  className = '',
  width,
  height,
  style = {}
}) {
  if (variant === 'icon') {
    return (
      <div
        className={`brand-icon-wrapper ${className}`}
        style={{
          width: width || 44,
          height: height || 44,
          overflow: 'hidden',
          display: 'grid',
          placeItems: 'center',
          ...style
        }}
      >
        <img
          src={officialLogoImg}
          alt="Master Export Pro"
          style={{
            width: '120px',
            maxWidth: 'none',
            height: 'auto',
            transform: 'scale(1.3) translateY(4px)',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
    );
  }

  // Document preview header (Quotation, Sales Order, Invoices) - Large, prominent & crisp
  if (variant === 'document') {
    return (
      <div
        className={`brand-doc-wrapper ${className}`}
        style={{ marginBottom: '8px', ...style }}
      >
        <img
          src={officialLogoImg}
          alt="Master Export Pro"
          className="brand-doc-logo"
          style={{
            width: width || '270px',
            maxWidth: '100%',
            height: height || 'auto',
            maxHeight: '145px',
            display: 'block',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
            filter: 'contrast(1.03) brightness(1.01)'
          }}
        />
      </div>
    );
  }

  if (variant === 'horizontal') {
    return (
      <div
        className={`brand-horizontal-wrapper ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          ...style
        }}
      >
        <img
          src={officialLogoImg}
          alt="Master Export Pro"
          className="brand-official-logo-horizontal"
          style={{
            height: height || 75,
            width: width || 'auto',
            maxHeight: '100px',
            objectFit: 'contain',
            mixBlendMode: 'multiply',
            filter: 'contrast(1.02) brightness(1.01)'
          }}
        />
      </div>
    );
  }

  // Default: Sidebar full logo
  return (
    <div className={`brand ${className}`} style={style}>
      <div className="brand-inner">
        <img
          src={officialLogoImg}
          alt="Master Export Pro"
          className="brand-official-logo"
          style={{
            width: width || '100%',
            maxWidth: '200px',
            height: height || 'auto',
            objectFit: 'contain',
            display: 'block',
            mixBlendMode: 'multiply',
            filter: 'contrast(1.03) brightness(1.01)'
          }}
        />
        <div className="brand-tagline" style={{ fontSize: '11px', color: '#7e8299', marginTop: '2px', fontWeight: 500, letterSpacing: '0.02em', textAlign: 'center' }}>
          Export made easy
        </div>
      </div>
    </div>
  );
}

export { officialLogoImg };
