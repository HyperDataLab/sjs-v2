import { cn } from '../../lib/utils';

function Skeleton({ className = '', ...props }) {
  return <div aria-hidden="true" className={cn('animate-pulse rounded-md bg-surface-muted', className)} {...props} />;
}

function SkeletonStatus({ label = 'Loading content', className = '', children }) {
  return <div role="status" aria-live="polite" className={className}>
    <span className="sr-only">{label}</span>
    {children}
  </div>;
}

export { Skeleton, SkeletonStatus };
