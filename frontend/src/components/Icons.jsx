import React from 'react';

export function Logo({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 203 58" className={className} aria-label="Logo SADA">
      <g transform="translate(0 0) scale(0.43)">
        <path d="M50 4 C50 4 8 58 8 84 A42 42 0 0 0 92 84 C92 58 50 4 50 4 Z" fill="#D42B2B" />
        <path d="M63 74 C60 66 38 64 38 76 C38 88 62 86 62 99 C62 112 40 110 37 101" fill="none" stroke="#fff" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <path d="M58.184 35.08H67.648Q67.856 37.108 69.052 38.174Q70.248 39.24 72.172 39.24Q74.148 39.24 75.292 38.33Q76.436 37.42 76.436 35.808Q76.436 34.456 75.526 33.572Q74.616 32.688 73.29 32.116Q71.964 31.544 69.52 30.816Q65.984 29.724 63.748 28.632Q61.512 27.54 59.9 25.408Q58.288 23.276 58.288 19.844Q58.288 14.748 61.98 11.862Q65.672 8.976 71.6 8.976Q77.632 8.976 81.324 11.862Q85.016 14.748 85.276 19.896H75.656Q75.552 18.128 74.356 17.114Q73.16 16.1 71.288 16.1Q69.676 16.1 68.688 16.958Q67.7 17.816 67.7 19.428Q67.7 21.196 69.364 22.184Q71.028 23.172 74.564 24.316Q78.1 25.512 80.31 26.604Q82.52 27.696 84.132 29.776Q85.744 31.856 85.744 35.132Q85.744 38.252 84.158 40.8Q82.572 43.348 79.556 44.856Q76.54 46.364 72.432 46.364Q68.428 46.364 65.256 45.064Q62.084 43.764 60.186 41.216Q58.288 38.668 58.184 35.08ZM112.928 39.552H99.304L97.12 46.0H87.812L101.02 9.496H111.316L124.524 46.0H115.112ZM110.64 32.688 106.116 19.324 101.644 32.688ZM160.34 27.748Q160.34 33.104 157.974 37.264Q155.608 41.424 151.266 43.712Q146.924 46.0 141.204 46.0H127.528V9.496H141.204Q146.976 9.496 151.292 11.784Q155.608 14.072 157.974 18.206Q160.34 22.34 160.34 27.748ZM151.292 27.748Q151.292 22.704 148.484 19.896Q145.676 17.088 140.632 17.088H136.42V38.304H140.632Q145.676 38.304 148.484 35.548Q151.292 32.792 151.292 27.748ZM187.056 39.552H173.432L171.248 46.0H161.94L175.148 9.496H185.444L198.652 46.0H189.24ZM184.768 32.688 180.244 19.324 175.772 32.688Z" fill="#14181F" />
    </svg>
  );
}

export function IconHeart({ width = 20, height = 20, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M19 14c1.5-1.5 3-3.200 3-5.500A5.500 5.500 0 0 0 16.500 3c-1.800 0-3 .5-4.500 2-1.500-1.500-2.700-2-4.500-2A5.500 5.500 0 0 0 2 8.500c0 2.300 1.500 4 3 5.500l7 7z" />
      <path d="M3.500 12h5l1.500-2 2.500 4 1.500-2h3" />
    </svg>
  );
}

export function IconSearch({ width = 18, height = 18, className = '' }) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className={className}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.500-3.500" />
    </svg>
  );
}

export function IconDrop({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12 2.5S5 10.2 5 15a7 7 0 0 0 14 0c0-4.800-7-12.500-7-12.500z" />
    </svg>
  );
}

export function IconCheck({ className = '' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d="M5 12.500l4.500 4.500L19 7.500" />
    </svg>
  );
}

export function Mascot({ className = '' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 470" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="mbadan" cx="38%" cy="55%" r="70%">
          <stop offset="0" stopColor="#E5393A" />
          <stop offset="1" stopColor="#B91C1C" />
        </radialGradient>
        <clipPath id="mbentuk">
          <path id="mtetes" d="M200 40 C200 40 70 200 70 300 A130 130 0 0 0 330 300 C330 200 200 40 200 40 Z" />
        </clipPath>
      </defs>

      {/* bayangan lantai */}
      <ellipse cx="200" cy="445" rx="95" ry="10" fill="#14181F" opacity=".12" />

      {/* badan */}
      <use href="#mtetes" fill="url(#mbadan)" />

      {/* kilau */}
      <path d="M108 285 Q102 235 142 190" fill="none" stroke="#fff" strokeWidth="10" strokeLinecap="round" opacity=".3" />

      {/* ikat kepala ulos */}
      <g clipPath="url(#mbentuk)">
        <rect x="60" y="212" width="280" height="40" fill="#14181F" />
        <rect x="60" y="212" width="280" height="4" fill="#fff" opacity=".9" />
        <rect x="60" y="248" width="280" height="4" fill="#fff" opacity=".9" />
        <g>
          <polygon points="92,244 102,222 112,244" fill="#E5393A" />
          <polygon points="122,244 132,222 142,244" fill="#fff" />
          <polygon points="152,244 162,222 172,244" fill="#E5393A" />
          <polygon points="182,244 192,222 202,244" fill="#fff" />
          <polygon points="212,244 222,222 232,244" fill="#E5393A" />
          <polygon points="242,244 252,222 262,244" fill="#fff" />
          <polygon points="272,244 282,222 292,244" fill="#E5393A" />
        </g>
      </g>

      <g className="eyes">
        <circle cx="158" cy="295" r="17" fill="#fff" />
        <circle cx="242" cy="295" r="17" fill="#fff" />
        <circle cx="161" cy="297" r="10" fill="#14181F" />
        <circle cx="245" cy="297" r="10" fill="#14181F" />
        <circle cx="165" cy="292" r="3.5" fill="#fff" />
        <circle cx="249" cy="292" r="3.5" fill="#fff" />
      </g>
      <circle cx="122" cy="332" r="14" fill="#FF9A9A" opacity=".45" />
      <circle cx="278" cy="332" r="14" fill="#FF9A9A" opacity=".45" />

      {/* senyum lebar */}
      <path d="M164 333 Q200 392 236 333 Z" fill="#14181F" stroke="#14181F" strokeWidth="4" strokeLinejoin="round" />
      <ellipse cx="200" cy="364" rx="14" ry="7" fill="#F26B6B" />

      <g className="arm">
        <path d="M322 335 Q360 320 366 262" fill="none" stroke="#C62828" strokeWidth="16" strokeLinecap="round" />
        <circle cx="367" cy="250" r="15" fill="#C62828" />
        <path d="M385 232 Q392 222 388 214 M376 226 Q380 214 374 208" fill="none" stroke="#14181F" strokeWidth="4" strokeLinecap="round" opacity=".5" />
      </g>

      {/* plester */}
      <g transform="rotate(28 262 172)">
        <rect x="240" y="162" width="44" height="20" rx="10" fill="#F6D7C3" />
        <rect x="254" y="162" width="16" height="20" fill="#E8B99C" />
        <circle cx="262" cy="172" r="1.6" fill="#C98F6E" />
      </g>
    </svg>
  );
}
