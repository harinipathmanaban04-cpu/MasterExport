import React from 'react';

/**
 * AmbientBackground Component
 * Renders the clean, neat, professional executive ERP background:
 * - Fluid SVG flowing silk waves in Emerald Teal and Warm Gold at the top-right
 * - Soft secondary waves at the bottom-left matching the ChatGPT reference PDF
 * - Soft ambient gradients and micro-grid texture for enterprise depth
 */
export default function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      {/* Top-Right Flowing Silk Waves matching reference design */}
      <svg
        className="ambient-svg-top"
        viewBox="0 0 620 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Official Emerald Gradient matching logo */}
          <linearGradient id="waveEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d4d42" stopOpacity="0.18" />
            <stop offset="50%" stopColor="#107b68" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#062b24" stopOpacity="0.02" />
          </linearGradient>

          {/* Official Gold Gradient matching logo */}
          <linearGradient id="waveGold" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#c59239" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#dda74a" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#b17b2b" stopOpacity="0.03" />
          </linearGradient>

          {/* Accent Glow Filter */}
          <filter id="softBlur" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* Ambient Warm Back Glow */}
        <circle cx="480" cy="90" r="160" fill="url(#waveGold)" opacity="0.3" filter="url(#softBlur)" />
        <circle cx="340" cy="60" r="140" fill="url(#waveEmerald)" opacity="0.35" filter="url(#softBlur)" />

        {/* Outer Emerald Ribbon Curve */}
        <path
          d="M 120 0 C 260 40, 420 120, 520 260 C 560 315, 595 365, 620 380 L 620 0 Z"
          fill="url(#waveEmerald)"
        />

        {/* Smooth Emerald Contour Stroke */}
        <path
          d="M 120 0 C 260 40, 420 120, 520 260 C 560 315, 595 365, 620 380"
          stroke="#0d4d42"
          strokeWidth="3"
          strokeOpacity="0.25"
          strokeLinecap="round"
        />

        {/* Flowing Gold Ribbon Curve */}
        <path
          d="M 240 0 C 350 50, 470 140, 550 250 C 590 305, 610 345, 620 360 L 620 0 Z"
          fill="url(#waveGold)"
        />

        {/* Smooth Gold Contour Stroke */}
        <path
          d="M 240 0 C 350 50, 470 140, 550 250 C 590 305, 610 345, 620 360"
          stroke="#c59239"
          strokeWidth="2.5"
          strokeOpacity="0.35"
          strokeLinecap="round"
        />

        {/* Subtle Fine Accent Rings */}
        <ellipse
          cx="490"
          cy="110"
          rx="180"
          ry="75"
          stroke="#0d4d42"
          strokeWidth="1.5"
          strokeOpacity="0.12"
          strokeDasharray="4 6"
          transform="rotate(-22 490 110)"
        />
        <ellipse
          cx="460"
          cy="95"
          rx="140"
          ry="55"
          stroke="#c59239"
          strokeWidth="1.5"
          strokeOpacity="0.16"
          transform="rotate(-18 460 95)"
        />
      </svg>

      {/* Bottom-Left Flowing Silk Ribbon (as seen in PDF pages 2, 4, 5, 8) */}
      <svg
        className="ambient-svg-bottom"
        viewBox="0 0 480 280"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveEmeraldBtm" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d4d42" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#107b68" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="waveGoldBtm" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#c59239" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#dda74a" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Emerald Arc at Bottom Left */}
        <path
          d="M 0 280 C 80 230, 200 180, 360 210 C 420 220, 460 245, 480 260 L 0 280 Z"
          fill="url(#waveEmeraldBtm)"
        />
        <path
          d="M 0 280 C 80 230, 200 180, 360 210 C 420 220, 460 245, 480 260"
          stroke="#0d4d42"
          strokeWidth="2"
          strokeOpacity="0.2"
        />

        {/* Gold Accent Arc */}
        <path
          d="M 0 280 C 60 250, 150 210, 290 235 C 340 245, 380 265, 400 280 L 0 280 Z"
          fill="url(#waveGoldBtm)"
        />
        <path
          d="M 0 280 C 60 250, 150 210, 290 235 C 340 245, 380 265, 400 280"
          stroke="#c59239"
          strokeWidth="1.8"
          strokeOpacity="0.25"
        />
      </svg>
    </div>
  );
}
