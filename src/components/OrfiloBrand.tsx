import React from 'react';

interface OrfiloBrandProps {
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  showTagline?: boolean;
  className?: string;
}

export const OrfiloIcon: React.FC<{ size?: number; className?: string; theme?: 'light' | 'dark' | 'black' | 'white' }> = ({
  size = 32,
  className = '',
  theme = 'light',
}) => {
  const [imgError, setImgError] = React.useState(false);
  const iconSrc = theme === 'black' || theme === 'dark' ? '/brand/orfilo-icon-dark.png' : '/brand/orfilo-icon.png';

  if (!imgError) {
    return (
      <img
        src={iconSrc}
        width={size}
        height={size}
        alt="Orfilo"
        onError={() => setImgError(true)}
        className={`shrink-0 object-contain select-none ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
        loading="eager"
      />
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
      aria-label="Orfilo Logo Icon"
    >
      <defs>
        {/* Main outer ribbon gradient */}
        <linearGradient id="orfilo-ribbon-grad" x1="20" y1="20" x2="105" y2="105" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8EF7D0" />
          <stop offset="28%" stopColor="#2CD59B" />
          <stop offset="65%" stopColor="#19A974" />
          <stop offset="100%" stopColor="#0B533A" />
        </linearGradient>

        {/* 3D Inner fold shadow */}
        <linearGradient id="orfilo-fold-shade" x1="90" y1="50" x2="50" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0B533A" stopOpacity="0.85" />
          <stop offset="50%" stopColor="#19A974" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#E8F7F0" stopOpacity="0" />
        </linearGradient>

        {/* Speed bars horizontal gradient */}
        <linearGradient id="orfilo-bar-top" x1="10" y1="0" x2="65" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#63E6B1" stopOpacity="0.2" />
          <stop offset="40%" stopColor="#43D8A2" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#19A974" />
        </linearGradient>

        <linearGradient id="orfilo-bar-mid" x1="5" y1="0" x2="72" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#63E6B1" stopOpacity="0.15" />
          <stop offset="30%" stopColor="#2CD59B" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#19A974" />
        </linearGradient>

        <linearGradient id="orfilo-bar-bot" x1="15" y1="0" x2="62" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#63E6B1" stopOpacity="0.2" />
          <stop offset="45%" stopColor="#35D79E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#19A974" />
        </linearGradient>

        {/* Soft glow */}
        <filter id="orfilo-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#19A974" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Speed bars entering from left */}
      <rect x="25" y="40" width="36" height="8.5" rx="4.25" fill={theme === 'white' ? '#FFFFFF' : theme === 'black' ? '#111111' : 'url(#orfilo-bar-top)'} />
      <rect x="15" y="55" width="54" height="9.5" rx="4.75" fill={theme === 'white' ? '#FFFFFF' : theme === 'black' ? '#111111' : 'url(#orfilo-bar-mid)'} />
      <rect x="26" y="71" width="34" height="8.5" rx="4.25" fill={theme === 'white' ? '#FFFFFF' : theme === 'black' ? '#111111' : 'url(#orfilo-bar-bot)'} />

      {/* Main outer dynamic loop / crescent */}
      <path
        d="M 68 18 C 91 18 107 35 107 60 C 107 86 89 103 64 103 C 44 103 35 91 35 83 C 35 77 40 73 46 73 C 51 73 54 76 60 79 C 67 82 74 81 81 76 C 88 71 91 63 89 53 C 86 42 77 34 65 34 C 54 34 46 40 43 45 C 40 49 35 48 34 44 C 33 39 42 26 58 20 C 61 19 65 18 68 18 Z"
        fill={theme === 'white' ? '#FFFFFF' : theme === 'black' ? '#111111' : 'url(#orfilo-ribbon-grad)'}
        filter={theme === 'light' ? 'url(#orfilo-glow)' : undefined}
      />

      {/* 3D inner fold ribbon accent */}
      {theme !== 'black' && theme !== 'white' && (
        <path
          d="M 89 53 C 92 63 88 73 80 78 C 72 83 63 81 54 75 C 64 88 80 94 92 86 C 103 78 106 63 98 48 C 95 43 91 40 86 37 C 88 42 89 47 89 53 Z"
          fill="url(#orfilo-fold-shade)"
        />
      )}
    </svg>
  );
};

export const OrfiloBrand: React.FC<OrfiloBrandProps> = ({
  variant = 'horizontal',
  size = 'md',
  theme = 'light',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 24,
    md: 32,
    lg: 44,
    xl: 64,
  };

  const titleSizes = {
    sm: 'text-lg font-bold tracking-tight',
    md: 'text-2xl font-bold tracking-tight',
    lg: 'text-3xl font-bold tracking-tight',
    xl: 'text-5xl font-extrabold tracking-tight',
  };

  const taglineSizes = {
    sm: 'text-[10px] tracking-normal',
    md: 'text-xs tracking-normal',
    lg: 'text-sm tracking-normal',
    xl: 'text-base tracking-normal',
  };

  const textColor = theme === 'dark' ? 'text-white' : 'text-[#0B1320]';
  const tagColor = theme === 'dark' ? 'text-neutral-400' : 'text-[#6B7280]';

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <OrfiloIcon size={iconSizes[size]} theme={theme} />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <OrfiloIcon size={iconSizes[size]} theme={theme} className="mb-2" />
        <span className={`${titleSizes[size]} ${textColor} font-sans`}>Orfilo</span>
        {showTagline && (
          <span className={`mt-1 font-sans ${taglineSizes[size]} ${tagColor}`}>
            Everything your AI creates. Organized.
          </span>
        )}
      </div>
    );
  }

  // Horizontal variant
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <OrfiloIcon size={iconSizes[size]} theme={theme} />
      <div className="flex flex-col justify-center">
        <span className={`${titleSizes[size]} ${textColor} leading-none font-sans`}>Orfilo</span>
        {showTagline && (
          <span className={`mt-1 font-sans ${taglineSizes[size]} ${tagColor} leading-tight`}>
            Everything your AI creates. Organized.
          </span>
        )}
      </div>
    </div>
  );
};
