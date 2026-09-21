import { useEffect, useState } from 'react';

interface AvatarProps {
  name: string;
  src?: string | null;
  sizeClassName?: string;
  className?: string;
}

export function Avatar({ name, src, sizeClassName = 'h-8 w-8', className = '' }: AvatarProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => setImageFailed(false), [src]);

  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || '?';
  const classes = `inline-flex ${sizeClassName} shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[10px] font-bold text-slate-700 ${className}`;

  if (src && !imageFailed) {
    return <img src={src} alt={name} onError={() => setImageFailed(true)} className={`${classes} object-cover`} />;
  }

  return <span role="img" aria-label={name} className={classes}>{initials}</span>;
}
