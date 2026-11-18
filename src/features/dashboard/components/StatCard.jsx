import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount, formatGrowth } from '../../../shared/utils/formatNumber';

export default function StatCard({ label, value, icon, iconBg = 'bg-primary-subtle text-primary', growth, growthLabel, loading }) {
  const { t } = useTranslation();
  const neutral = growth == null || growth === 0;

  return (
    <Card className="min-w-0 p-4 sm:p-5 transition-colors hover:border-primary/40">
      {loading ? (
        <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ) : (
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
              {label}
            </span>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground tabular-nums">
              {typeof value === 'number' ? formatCount(value) : value ?? '0'}
            </div>
            <div className={`flex items-center gap-1 text-xs pt-0.5 ${neutral ? 'text-muted-foreground' : growth > 0 ? 'text-success' : 'text-danger'}`}>
              <Icon icon={neutral ? 'lucide:minus' : growth > 0 ? 'lucide:trending-up' : 'lucide:trending-down'} width="13" aria-hidden="true" />
              <span>{neutral ? t('common.khongDoi') : `${formatGrowth(growth)} ${growthLabel || t('common.tuanNay')}`}</span>
            </div>
          </div>
          {icon && (
            <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>
              <Icon icon={icon} width="18" height="18" aria-hidden="true" />
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
