import { cn } from '../../lib/utils';
import { Breadcrumbs } from './breadcrumb';

function PageContainer({ className = '', ...props }) {
  return <div className={cn('w-full max-w-7xl mx-auto py-5 space-y-6', className)} {...props} />;
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
    <header className={cn('flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between', className)}>
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
          <h1 className="m-0 text-xl sm:text-2xl font-bold leading-snug tracking-tight text-foreground">
            {title}
          </h1>
        )}
        {description && (
          <p className="mb-0 mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
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
