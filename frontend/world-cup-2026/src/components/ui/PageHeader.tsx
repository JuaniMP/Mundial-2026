interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  className?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, badge, className = '', children }: PageHeaderProps) {
  return (
    <header className={`flex flex-col gap-3 ${className}`}>
      {badge && (
        <span className="badge badge-primary self-start">{badge}</span>
      )}
      <h1 className="font-headline text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1]">
        {title}
      </h1>
      {subtitle && (
        <p className="text-text-secondary text-base md:text-lg max-w-2xl leading-relaxed">
          {subtitle}
        </p>
      )}
      {children}
    </header>
  );
}
