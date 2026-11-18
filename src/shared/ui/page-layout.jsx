import { cn } from '../../lib/utils';

function PageContainer({ className = '', ...props }) {
  return <div className={cn('mx-auto w-full max-w-[1440px] space-y-6', className)} {...props} />;
}

function PageHeader({ title, description, actions, className = '' }) {
  return (
    <header className={cn('flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="m-0 text-base font-bold leading-snug tracking-tight text-foreground">{title}</h1>
        {description && <p className="mb-0 mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export { PageContainer, PageHeader };
