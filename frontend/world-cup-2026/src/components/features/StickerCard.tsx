import type { LucideIcon } from 'lucide-react';

interface StickerCardProps {
  name: string;
  subtitle: string;
  imageUrl?: string;
  isLarge?: boolean;
  labelBadge?: string;
  isIcon?: boolean;
  icon?: LucideIcon;
  className?: string;
}

export function StickerCard({
  name,
  subtitle,
  imageUrl,
  isLarge = false,
  labelBadge,
  isIcon = false,
  icon: Icon,
  className = '',
}: StickerCardProps) {
  if (isIcon) {
    return (
      <div className={`card-base p-4 flex flex-col items-center justify-center ${className}`}>
        <div className="w-20 h-20 rounded-full bg-bg-elevated flex items-center justify-center mb-4 border border-border">
          {Icon && <Icon className="w-10 h-10 text-primary" />}
        </div>
        <h3 className="font-headline text-sm font-bold text-text-primary text-center">{name}</h3>
        <p className="text-[0.65rem] text-text-muted uppercase tracking-wider mt-1 text-center">
          {subtitle}
        </p>
      </div>
    );
  }

  if (isLarge) {
    return (
      <div
        className={`card-base col-span-2 row-span-2 p-4 flex flex-col overflow-hidden group shine-effect ${className}`}
      >
        <div className="w-full h-48 md:h-64 rounded-xl overflow-hidden mb-4 relative">
          {imageUrl && (
            <img
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              alt={name}
              src={imageUrl}
            />
          )}
          {labelBadge && (
            <div className="absolute top-3 right-3 glass px-3 py-1 rounded-full">
              <span className="text-[0.65rem] uppercase font-bold text-primary tracking-widest">
                {labelBadge}
              </span>
            </div>
          )}
        </div>
        <div className="mt-auto">
          <h3 className="font-headline text-lg font-bold text-text-primary">{name}</h3>
          <p className="text-xs text-text-muted uppercase tracking-wider mt-1">{subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card-base p-3 flex flex-col ${className}`}>
      <div className="w-full aspect-[3/4] rounded-lg overflow-hidden mb-3">
        {imageUrl && <img className="w-full h-full object-cover" alt={name} src={imageUrl} />}
      </div>
      <div className="px-1">
        <h3 className="font-headline text-sm font-bold text-text-primary truncate">{name}</h3>
        <p className="text-[0.65rem] text-text-muted uppercase tracking-wider mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}
