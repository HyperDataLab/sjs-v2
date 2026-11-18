import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount, formatGrowth } from '../../../shared/utils/formatNumber';

export default function StatCard({ label, value, icon, growth, growthLabel, loading }) {
  const { t } = useTranslation();
  const neutral = growth == null || growth === 0;
  return <Card className="min-w-0 p-5">
    {loading ? <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-3 w-1/2" />
    </div> : <>
      <div className="flex items-start justify-between gap-3 text-sm font-medium text-slate-600">
        <span>{label}</span>{icon && <Icon icon={icon} width={18} className="shrink-0 text-[#0071BC]" aria-hidden="true" />}
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{typeof value === 'number' ? formatCount(value) : value ?? '—'}</div>
      <div className={`mt-3 flex items-center gap-1 text-xs ${neutral ? 'text-slate-500' : growth > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        <Icon icon={neutral ? 'lucide:minus' : growth > 0 ? 'lucide:trending-up' : 'lucide:trending-down'} width={13} />
        {neutral ? t('common.khongDoi') : `${formatGrowth(growth)} ${growthLabel || t('common.tuanNay')}`}
      </div>
    </>}
  </Card>;
}
