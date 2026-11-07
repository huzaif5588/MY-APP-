import React from 'react';

interface AcademyLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'shield' | 'horizontal';
  showTagline?: boolean;
  className?: string;
}

export const AcademyLogo: React.FC<AcademyLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = true,
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
  };

  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <img 
          src="/indus-logo.svg" 
          alt="Indus Academy Kalabagh" 
          className="w-10 h-10 object-contain shrink-0 drop-shadow-sm" 
        />
        <div className="flex flex-col text-left">
          <div className="font-extrabold tracking-wider text-slate-900 leading-tight text-sm font-display">
            INDUS ACADEMY
          </div>
          <div className="text-[10px] tracking-widest font-semibold text-amber-600 uppercase">
            KALABAGH • PAKISTAN
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center text-center ${className}`}>
      <div className={`${sizeMap[size]} relative shrink-0 transition-transform duration-300 hover:scale-105`}>
        <img 
          src="/indus-logo.svg" 
          alt="Indus Academy Kalabagh Official Logo" 
          className="w-full h-full object-contain filter drop-shadow-md" 
        />
      </div>
      {variant === 'full' && (
        <div className="mt-2 flex flex-col items-center">
          <span className="font-extrabold text-base tracking-wider text-slate-900 font-display">
            INDUS ACADEMY
          </span>
          <span className="text-[11px] font-bold text-amber-600 tracking-widest">
            KALABAGH
          </span>
          {showTagline && (
            <span className="text-[9px] font-semibold text-slate-500 tracking-wider mt-0.5">
              LEARN • GROW • SUCCEED
            </span>
          )}
        </div>
      )}
    </div>
  );
};
