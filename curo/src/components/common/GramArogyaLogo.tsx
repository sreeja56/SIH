import React from 'react';

interface GramArogyaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  textSize?: string;
  textColor?: string;
}

export const GramArogyaLogo: React.FC<GramArogyaLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  textSize = 'text-lg',
  textColor = 'text-slate-900',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
    '2xl': 'w-28 h-28',
  };

  const dim = sizeMap[size] || 'w-10 h-10';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Precision SVG matching the uploaded user logo */}
      <div className={`relative ${dim} shrink-0 aspect-square flex items-center justify-center`}>
        <svg
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-xs"
        >
          <defs>
            {/* Blue Gradient for top & right cross arms */}
            <linearGradient id="logoBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0080ff" />
              <stop offset="100%" stopColor="#0066cc" />
            </linearGradient>

            {/* Green Gradient for bottom & left cross arms */}
            <linearGradient id="logoGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00b050" />
              <stop offset="100%" stopColor="#008a3e" />
            </linearGradient>

            {/* Orbit Stethoscope Blue-Cyan Gradient */}
            <linearGradient id="orbitSwoosh" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00a651" />
              <stop offset="40%" stopColor="#0099e6" />
              <stop offset="100%" stopColor="#0077e6" />
            </linearGradient>

            {/* Red Heart Gradient */}
            <linearGradient id="logoHeartRed" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e51b24" />
              <stop offset="100%" stopColor="#c70014" />
            </linearGradient>
          </defs>

          {/* Cross Background Arms */}
          {/* Top Arm (Blue) */}
          <rect x="77" y="20" width="46" height="50" rx="14" fill="url(#logoBlue)" />
          {/* Right Arm (Blue) */}
          <rect x="130" y="77" width="50" height="46" rx="14" fill="url(#logoBlue)" />
          
          {/* Left Arm (Green) */}
          <rect x="20" y="77" width="50" height="46" rx="14" fill="url(#logoGreen)" />
          {/* Bottom Arm (Green) */}
          <rect x="77" y="130" width="46" height="50" rx="14" fill="url(#logoGreen)" />

          {/* Central Intersection Connector */}
          <rect x="70" y="70" width="60" height="60" rx="12" fill="#0077e6" />
          <rect x="70" y="90" width="60" height="40" rx="4" fill="#00a651" />

          {/* Orbiting Stethoscope Swoosh with Nodes */}
          {/* Top-left node */}
          <circle cx="48" cy="42" r="9" fill="#00a651" />
          {/* Connecting line to cross */}
          <path
            d="M54 48 C 65 60, 72 65, 78 72"
            stroke="#00a651"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Bottom-left node */}
          <circle cx="45" cy="142" r="8" fill="#00a651" />

          {/* Big Outer Sweeping Orbit Swoosh around bottom and right */}
          <path
            d="M48 142 C 70 168, 140 170, 172 125 C 185 106, 182 85, 172 84 C 160 83, 175 110, 148 138 C 120 162, 70 156, 52 142"
            fill="url(#orbitSwoosh)"
          />

          {/* Center Heart Container with White Outline */}
          {/* White Outer Border Heart */}
          <path
            d="M100 152 C 96 148, 52 118, 52 82 C 52 62, 68 49, 86 49 C 94 49, 98 52, 100 56 C 102 52, 106 49, 114 49 C 132 49, 148 62, 148 82 C 148 118, 104 148, 100 152 Z"
            fill="#ffffff"
          />

          {/* Red Heart */}
          <path
            d="M100 144 C 97 140, 58 113, 58 83 C 58 67, 71 55, 86 55 C 93 55, 97 58, 100 62 C 103 58, 107 55, 114 55 C 129 55, 142 67, 142 83 C 142 113, 103 140, 100 144 Z"
            fill="url(#logoHeartRed)"
          />

          {/* Crisp White ECG Heartbeat Rhythm Line */}
          <path
            d="M58 98 L 78 98 L 86 78 L 94 120 L 104 84 L 112 106 L 118 98 L 142 98"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className={`font-black tracking-tight ${textSize} ${textColor}`}>
            <span className="text-[#007ceb]">cu</span><span className="text-[#00a651]">ro</span>
          </span>
          <span className="text-[10px] font-bold text-[#00a651] tracking-wider uppercase">
            క్యూరో • Healthcare
          </span>
        </div>
      )}
    </div>
  );
};
