import React, { useEffect, useState } from 'react';
import officialLogoImg from '../assets_logo.png';

let cachedCleanLogo = null;
let cleanLogoPromise = null;

/**
 * Generates a trimmed, pure-transparent version of the official logo by removing
 * off-white/gray background pixels and trimming empty margins.
 * This ensures the logo aligns flush left and eliminates the gray background box in downloaded PDFs.
 */
export function getCleanLogoDataUrl() {
  if (cachedCleanLogo) return Promise.resolve(cachedCleanLogo);
  if (cleanLogoPromise) return cleanLogoPromise;

  cleanLogoPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        let minX = w, maxX = 0, minY = h, maxY = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];

            // In assets_logo.png, background is light grayish off-white (#f4f6f8 to #ffffff).
            // Foreground has dark teal (#0c5a48), gold (#d97706), grey globe lines, etc.
            // Check if pixel is background: bright pixels with low saturation
            const maxC = Math.max(r, g, b);
            const minC = Math.min(r, g, b);
            const isBrightOffWhite = (r >= 225 && g >= 225 && b >= 225);
            const isLightNeutral = (maxC >= 232 && (maxC - minC) <= 20);

            if (isBrightOffWhite || isLightNeutral) {
              data[idx + 3] = 0; // Transparent
            } else if (a > 20) {
              // Actual logo content pixel
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }

        ctx.putImageData(imgData, 0, 0);

        // Crop precisely to bounding box so logo aligns flush left with zero offset
        if (minX < maxX && minY < maxY) {
          const cropW = maxX - minX + 1;
          const cropH = maxY - minY + 1;
          const cropCanvas = document.createElement('canvas');
          cropCanvas.width = cropW;
          cropCanvas.height = cropH;
          const cropCtx = cropCanvas.getContext('2d');
          cropCtx.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
          cachedCleanLogo = cropCanvas.toDataURL('image/png');
        } else {
          cachedCleanLogo = canvas.toDataURL('image/png');
        }

        resolve(cachedCleanLogo);
      } catch (e) {
        console.warn('Logo clean processing fallback:', e);
        cachedCleanLogo = officialLogoImg;
        resolve(officialLogoImg);
      }
    };
    img.onerror = () => {
      cachedCleanLogo = officialLogoImg;
      resolve(officialLogoImg);
    };
    img.src = officialLogoImg;
  });

  return cleanLogoPromise;
}

export default function Logo({
  variant = 'sidebar', // 'sidebar' | 'horizontal' | 'document' | 'icon'
  className = '',
  width,
  height,
  style = {}
}) {
  const [logoSrc, setLogoSrc] = useState(cachedCleanLogo || officialLogoImg);

  useEffect(() => {
    if (!cachedCleanLogo) {
      getCleanLogoDataUrl().then((clean) => {
        if (clean) setLogoSrc(clean);
      });
    }
  }, []);

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
          src={logoSrc}
          alt="Master Export Pro"
          style={{
            width: '120px',
            maxWidth: 'none',
            height: 'auto',
            transform: 'scale(1.3) translateY(4px)'
          }}
        />
      </div>
    );
  }

  // Document preview header (Quotation, Sales Order, Invoices) - Large, crisp, flush left & transparent
  if (variant === 'document') {
    return (
      <div
        className={`brand-doc-wrapper ${className}`}
        style={{
          marginBottom: '6px',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-start',
          textAlign: 'left',
          ...style
        }}
      >
        <img
          src={logoSrc}
          alt="Master Export Pro"
          className="brand-doc-logo"
          style={{
            width: width || '255px',
            maxWidth: '100%',
            height: height || 'auto',
            maxHeight: '135px',
            display: 'block',
            objectFit: 'contain',
            margin: 0,
            padding: 0
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
          src={logoSrc}
          alt="Master Export Pro"
          className="brand-official-logo-horizontal"
          style={{
            height: height || 75,
            width: width || 'auto',
            maxHeight: '100px',
            objectFit: 'contain'
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
          src={logoSrc}
          alt="Master Export Pro"
          className="brand-official-logo"
          style={{
            width: width || '100%',
            maxWidth: '160px',
            height: height || 'auto',
            objectFit: 'contain',
            display: 'block'
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
