import React, { useState, useEffect } from 'react';
import { User as UserIcon } from 'lucide-react';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  rounded?: 'full' | 'lg' | 'xl' | '2xl';
  alt?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
  rounded = 'xl',
  alt
}) => {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  // Size styling maps
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl'
  };

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10'
  };

  const roundedClasses = {
    full: 'rounded-full',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl'
  };

  // Extract initials from name (e.g., "Carlos Rocha" -> "CR")
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const cleanName = fullName.replace(/\(.*?\)/g, '').trim();
    const parts = cleanName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(name);
  const containerSize = sizeClasses[size] || sizeClasses.md;
  const roundedClass = roundedClasses[rounded] || roundedClasses.xl;

  if (src && !hasError && src.trim() !== '') {
    return (
      <img
        src={src}
        alt={alt || name}
        referrerPolicy="no-referrer"
        onError={() => setHasError(true)}
        className={`${containerSize} ${roundedClass} object-cover border border-amber-400/40 shadow-sm shrink-0 ${className}`}
      />
    );
  }

  // Elegant default avatar fallback with Church branding
  return (
    <div
      title={name}
      aria-label={`Avatar padrão de ${name}`}
      className={`${containerSize} ${roundedClass} bg-gradient-to-br from-slate-800 via-slate-900 to-amber-950/80 border border-amber-500/40 text-amber-300 font-bold flex items-center justify-center select-none shadow-sm shrink-0 ${className}`}
    >
      {initials && initials.length > 0 && initials !== '?' ? (
        <span className="font-mono tracking-wider">{initials}</span>
      ) : (
        <UserIcon className={`${iconSizes[size]} text-amber-400/90`} />
      )}
    </div>
  );
};
