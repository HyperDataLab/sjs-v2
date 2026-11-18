import { cn } from '../../lib/utils';
import { Breadcrumbs } from './breadcrumb';

function PageContainer({ className = '', ...props }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] px-4 sm:px-6 lg:px-8 py-6 space-y-6', className)} {...props} />;
}

function PageHeader({
  title,
  description,
  actions,
  badge,
  breadcrumb,
  breadcrumbs,
  className = '',
  children,
}) {
  const activeBreadcrumb = breadcrumb || breadcrumbs;

  return (
    <header className={cn('flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0 flex-1">
        {activeBreadcrumb && (
          Array.isArray(activeBreadcrumb) ? (
            <Breadcrumbs items={activeBreadcrumb} className="mb-2" />
          ) : (
            <div className="mb-2">{activeBreadcrumb}</div>
          )
        )}
        {badge && <div className="mb-2">{badge}</div>}
        {title && (
          <h1 className="m-0 text-base sm:text-lg font-bold leading-snug tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="mb-0 mt-1.5 max-w-3xl text-xs sm:text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        )}
        {children}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </header>
  );
}

export { PageContainer, PageHeader, Breadcrumbs };
