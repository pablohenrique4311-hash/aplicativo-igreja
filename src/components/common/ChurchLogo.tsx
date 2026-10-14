import React from 'react';
import { useChurch } from '../../context/ChurchContext';
import { ChurchOfficialEmblem } from './ChurchOfficialEmblem';
import { Heart } from 'lucide-react';

interface ChurchLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSlogan?: boolean;
  showHeartBadge?: boolean;
  variant?: 'full' | 'emblem_only' | 'horizontal';
  theme?: 'dark' | 'light' | 'auto';
}

export const ChurchLogo: React.FC<ChurchLogoProps> = ({
  className = '',
  size = 'md',
  showSlogan = true,
  showHeartBadge = false,
  variant = 'full',
  theme = 'auto'
}) => {
  const { churchSettings } = useChurch();

  // Emblem pixel sizing
  const emblemPixelSize =
    size === 'sm' ? 36 : size === 'md' ? 50 : size === 'lg' ? 68 : 88;

  // Title typography sizing
  const titleSizeClass =
    size === 'sm'
      ? 'text-lg leading-tight'
      : size === 'md'
      ? 'text-2xl sm:text-3xl leading-tight'
      : size === 'lg'
      ? 'text-3xl sm:text-4xl leading-tight'
      : 'text-4xl sm:text-5xl leading-tight';

  // Slogan typography sizing
  const sloganSizeClass =
    size === 'sm'
      ? 'text-[9px] tracking-tight'
      : size === 'md'
      ? 'text-[11px] sm:text-xs'
      : size === 'lg'
      ? 'text-xs sm:text-sm'
      : 'text-sm sm:text-base';

  const textColor =
    theme === 'light' ? 'text-slate-900' : 'text-white';
  const sloganColor =
    theme === 'light' ? 'text-slate-800' : 'text-slate-200';
  const emblemColor =
    theme === 'light' ? '#0f172a' : '#ffffff';

  const [customLogoError, setCustomLogoError] = React.useState(false);

  // If a custom external uploaded image is configured (different from default SVG)
  const hasCustomLogo =
    Boolean(churchSettings.logoUrl) &&
    churchSettings.logoUrl !== '/logo-igead.svg' &&
    !churchSettings.logoUrl?.includes('logo-igead') &&
    !customLogoError;

  if (hasCustomLogo && churchSettings.logoUrl) {
    return (
      <div className={`flex items-center gap-3 select-none ${className}`}>
        <img
          src={churchSettings.logoUrl}
          alt={`Logomarca Oficial - ${churchSettings.name}`}
          onError={() => setCustomLogoError(true)}
          className={`${
            size === 'sm'
              ? 'h-9 w-auto max-w-[130px]'
              : size === 'md'
              ? 'h-12 w-auto max-w-[180px]'
              : size === 'lg'
              ? 'h-16 w-auto max-w-[240px]'
              : 'h-24 w-auto max-w-[320px]'
          } object-contain rounded-lg drop-shadow-md`}
        />

        {variant !== 'emblem_only' && (
          <div className="flex flex-col text-left">
            <span
              className={`font-['Caveat',cursive] font-bold ${textColor} tracking-wide ${titleSizeClass}`}
            >
              Geração Eleita
            </span>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase font-sans">
                {churchSettings.acronym}
              </span>
            </div>

            {showSlogan && (
              <span className={`font-sans font-extrabold italic ${sloganColor} mt-0.5 line-clamp-1 ${sloganSizeClass}`}>
                {churchSettings.slogan}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Official Vector Representation of the Church Logo
  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* 1. Official Church Emblem (Circle + Brazil Map Contour + Holy Spirit Fire + Laurel Foliage) */}
      <ChurchOfficialEmblem
        size={emblemPixelSize}
        color={emblemColor}
        className="transition-transform hover:scale-105 duration-300 drop-shadow-sm shrink-0"
      />

      {/* 2. Typographic Lockup */}
      {variant !== 'emblem_only' && (
        <div className="flex flex-col text-left justify-center min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className={`font-['Caveat',cursive] font-bold ${textColor} tracking-wide drop-shadow-xs ${titleSizeClass}`}
            >
              Geração Eleita
            </span>
            <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20 uppercase tracking-wider shrink-0 hidden sm:inline">
              {churchSettings.acronym}
            </span>
          </div>

          {/* Official Slogan */}
          {showSlogan && (
            <span
              className={`font-sans font-extrabold italic ${sloganColor} tracking-tight mt-0.5 line-clamp-1 opacity-95 ${sloganSizeClass}`}
            >
              Conectado com o Céu , firme na terra
            </span>
          )}

          {/* Optional Heart Signature: Jesus Cristo é o Centro */}
          {showHeartBadge && (
            <div className="flex items-center gap-1.5 pt-1.5 text-xs text-amber-400">
              <Heart className="w-3.5 h-3.5 fill-current text-rose-500" />
              <span className="font-extrabold italic tracking-tight font-sans text-[11px] text-slate-200">
                Jesus Cristo é o Centro
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
