import React from 'react';

interface QuillLogoProps {
  size?: number | string;
  className?: string;
  variant?: 'badge' | 'glyph-only';
  alt?: string;
}

export const QuillLogo: React.FC<QuillLogoProps> = ({
  size = 36,
  className = '',
  variant = 'badge',
  alt = 'Quill Labs Logo',
}) => {
  if (variant === 'glyph-only') {
    return (
      <svg
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: size, height: size }}
        className={`shrink-0 ${className}`}
        aria-label={alt}
      >
        <circle cx="250" cy="250" r="250" fill="#050505" />
        <g id="glyph">
          {/* Main Upper Blade / Nib */}
          <path
            d="M 326 140
               L 326 186
               L 272 238
               L 226 284
               L 204 326
               L 186 326
               L 204 250
               L 262 194
               Z"
            fill="#FFFFFF"
          />
          {/* Right Faceted Wing */}
          <path
            d="M 272 244
               L 296 268
               L 296 316
               L 266 346
               L 266 288
               Z"
            fill="#FFFFFF"
          />
          {/* Bottom Left Foot */}
          <path
            d="M 182 332
               L 208 332
               L 198 356
               L 182 356
               Z"
            fill="#FFFFFF"
          />
          {/* Bottom Wedge / Anchor */}
          <path
            d="M 220 322
               L 274 344
               L 242 344
               Z"
            fill="#FFFFFF"
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: size, height: size }}
      className={`shrink-0 select-none ${className}`}
      aria-label={alt}
    >
      <defs>
        {/* Arc for Top Text: QUILL LABS */}
        <path id="qlTopTextArc" d="M 68 250 A 182 182 0 1 1 432 250" fill="none" />
        {/* Arc for Bottom Text: IDEAS • SYSTEMS • EXPERIENCES • FUTURE */}
        <path id="qlBottomTextArc" d="M 444 250 A 194 194 0 0 1 56 250" fill="none" />

        {/* 4-Point Sparkle Star */}
        <g id="qlSparkleStar">
          <path
            d="M 0 -13 C 0.8 -4 3.5 -0.8 11 0 C 3.5 0.8 0.8 4 0 13 C -0.8 4 -3.5 0.8 -11 0 C -3.5 -0.8 -0.8 -4 0 -13 Z"
            fill="#FFFFFF"
          />
        </g>
      </defs>

      {/* Solid Black Circular Base */}
      <circle cx="250" cy="250" r="250" fill="#000000" />

      {/* Outer Double Ring */}
      <circle cx="250" cy="250" r="236" fill="none" stroke="#FFFFFF" strokeWidth="5" />
      <circle cx="250" cy="250" r="226" fill="none" stroke="#FFFFFF" strokeWidth="2.5" />

      {/* Inner Emblem Ring */}
      <circle cx="250" cy="250" r="162" fill="none" stroke="#FFFFFF" strokeWidth="4.5" />

      {/* Top Curved Text: QUILL LABS */}
      <text
        fill="#FFFFFF"
        fontFamily="'Orbitron', 'Space Grotesk', -apple-system, sans-serif"
        fontSize="36"
        fontWeight="900"
        letterSpacing="5"
      >
        <textPath href="#qlTopTextArc" startOffset="50%" textAnchor="middle">
          QUILL LABS
        </textPath>
      </text>

      {/* Left Star */}
      <use href="#qlSparkleStar" x="72" y="202" transform="rotate(-12 72 202)" />

      {/* Right Star */}
      <use href="#qlSparkleStar" x="428" y="202" transform="rotate(12 428 202)" />

      {/* Bottom Curved Text: IDEAS • SYSTEMS • EXPERIENCES • FUTURE */}
      <text
        fill="#FFFFFF"
        fontFamily="'Space Grotesk', 'Inter', -apple-system, sans-serif"
        fontSize="14.5"
        fontWeight="700"
        letterSpacing="3.5"
      >
        <textPath href="#qlBottomTextArc" startOffset="50%" textAnchor="middle">
          IDEAS  •  SYSTEMS  •  EXPERIENCES  •  FUTURE
        </textPath>
      </text>

      {/* Central Emblem */}
      <g id="qlCenterEmblem">
        {/* Main Upper Blade / Nib */}
        <path
          d="M 326 140
             L 326 186
             L 272 238
             L 226 284
             L 204 326
             L 186 326
             L 204 250
             L 262 194
             Z"
          fill="#FFFFFF"
        />

        {/* Right Faceted Wing */}
        <path
          d="M 272 244
             L 296 268
             L 296 316
             L 266 346
             L 266 288
             Z"
          fill="#FFFFFF"
        />

        {/* Bottom Left Foot */}
        <path
          d="M 182 332
             L 208 332
             L 198 356
             L 182 356
             Z"
          fill="#FFFFFF"
        />

        {/* Bottom Wedge / Anchor */}
        <path
          d="M 220 322
             L 274 344
             L 242 344
             Z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
};
