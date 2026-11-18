import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount, formatGrowth } from '../../../shared/utils/formatNumber';

export default function StatCard({ label, value, icon, growth, growthLabel, loading }) {
  const { t } = useTranslation();
  const neutral = growth == null || growth === 0;

  return (
    <Card className="min-w-0 p-4">
      {loading ? (
        <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3">
          <Skeleton className="h-3.5 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ) : (
        <>
          <div className="flex items-start justify-between gap-2 text-xs font-medium text-muted-foreground">
            <span className="truncate">{label}</span>
            {icon && <Icon icon={icon} width="16" className="shrink-0 text-primary" aria-hidden="true" />}
          </div>
          <div className="mt-2 text-base font-bold tracking-tight text-foreground tabular-nums">
            {typeof value === 'number' ? formatCount(value) : value ?? '—'}
          </div>
          <div className={`mt-2 flex items-center gap-1 text-xs ${neutral ? 'text-muted-foreground' : growth > 0 ? 'text-success' : 'text-danger'}`}>
            <Icon icon={neutral ? 'lucide:minus' : growth > 0 ? 'lucide:trending-up' : 'lucide:trending-down'} width="13" aria-hidden="true" />
            <span>{neutral ? t('common.khongDoi') : `${formatGrowth(growth)} ${growthLabel || t('common.tuanNay')}`}</span>
          </div>
        </>
      )}
    </Card>
  );
}
