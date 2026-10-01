import React from 'react';

/**
 * AmbientBackground Component
 * Renders the signature executive green & golden-orange ambient waves and swooshes
 * matching the official Master Export Pro logo theme seen in the reference screenshot.
 */
export default function AmbientBackground() {
  return (
    <div className="ambient-background" aria-hidden="true">
      {/* Top-Right Signature Logo Waves (Emerald Green & Golden Orange) */}
      <svg
        className="ambient-svg-top"
        viewBox="0 0 750 440"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveLogoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c5a48" stopOpacity="0.45" />
            <stop offset="60%" stopColor="#087a68" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
          </linearGradient>

          <linearGradient id="waveLogoGold" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.06" />
          </linearGradient>

          <linearGradient id="ribbonFillGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.04" />
          </linearGradient>

          <linearGradient id="ribbonFillGreen" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0c5a48" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#087a68" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Soft Golden Ambient Ribbon */}
        <path
          d="M 280 -60 C 420 110, 600 200, 780 150 C 650 260, 490 210, 310 -20 Z"
          fill="url(#ribbonFillGold)"
        />

        {/* Soft Green Ambient Ribbon */}
        <path
          d="M 140 -30 C 280 140, 480 260, 760 230 C 600 310, 380 280, 190 70 Z"
          fill="url(#ribbonFillGreen)"
        />

        {/* Fine Dash-Dotted Gold Orbit Line */}
        <path
          d="M 120 -40 C 300 90, 520 200, 760 130"
          stroke="url(#waveLogoGold)"
          strokeWidth="1.5"
          strokeDasharray="5 3"
          opacity="0.55"
        />

        {/* Prominent Sweeping Emerald Green Curve (from Logo) */}
        <path
          d="M 90 10 C 260 170, 470 290, 780 260"
          stroke="url(#waveLogoGreen)"
          strokeWidth="2.5"
        />

        {/* Prominent Sweeping Golden Orange Curve (from Logo) */}
        <path
          d="M 170 -30 C 330 110, 550 220, 800 190"
          stroke="url(#waveLogoGold)"
          strokeWidth="2.2"
        />
      </svg>

      {/* Bottom Ambient Golden & Green Waves */}
      <svg
        className="ambient-svg-bottom"
        viewBox="0 0 600 320"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="waveBtmGreen" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0c5a48" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="waveBtmGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {/* Subtle Green Flow */}
        <path
          d="M -50 260 C 140 150, 320 210, 540 110 C 440 250, 230 300, -50 330 Z"
          fill="url(#waveBtmGreen)"
        />

        {/* Subtle Gold Curve Line */}
        <path
          d="M -70 300 C 120 170, 290 220, 500 140"
          stroke="url(#waveBtmGold)"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}
