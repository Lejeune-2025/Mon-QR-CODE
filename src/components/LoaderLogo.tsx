
import React from 'react';

interface LoaderLogoProps {
  className?: string;
  size?: number;
}

export const LoaderLogo: React.FC<LoaderLogoProps> = ({ className = '', size = 48 }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      width={size} 
      height={size}
      className={`animate-spin-slow ${className}`}
    >
      <defs>
        <radialGradient id="glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: '#FF6B00', stopOpacity: 1 }} />
          <stop offset="50%" style={{ stopColor: '#FF1493', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#0A0E27', stopOpacity: 1 }} />
        </radialGradient>
        <filter id="neon">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Cercle gradient principal */}
      <circle cx="100" cy="100" r="95" fill="url(#glow)" filter="url(#neon)"/>
      
      {/* Cercles concentriques néon */}
      <circle cx="100" cy="100" r="85" fill="none" stroke="#00D9FF" strokeWidth="2" opacity="0.8" filter="url(#neon)"/>
      <circle cx="100" cy="100" r="70" fill="none" stroke="#FFB800" strokeWidth="2" opacity="0.6" filter="url(#neon)"/>
      
      {/* Texte C de COVANIX stylisé */}
      <text x="100" y="110" fontFamily="Arial, sans-serif" fontSize="72" fontWeight="bold" fill="white" textAnchor="middle" letterSpacing="1" filter="url(#neon)" opacity="0.95">C</text>
    </svg>
  );
};
