import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Skeleton } from '../../../shared/ui/skeleton';

export default function ArticleStatsCards({
  stats,
  isLoading
}) {
  const { t } = useTranslation();

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num || 0);
  };

  const statItems = [
    {
      label: t("article.tongBaiBao"),
      value: stats?.totalArticles || 0,
      icon: 'lucide:file-text',
      color: 'text-primary'
    },
    {
      label: 'Open Access',
      value: stats?.openAccessCount || 0,
      icon: 'lucide:unlock',
      color: 'text-success'
    },
    {
      label: t("article.tongTacGia"),
      value: stats?.authorsCount || 0,
      icon: 'lucide:users',
      color: 'text-info'
    },
    {
      label: t("typeArea"),
      value: stats?.topicsCount || 0,
      icon: 'lucide:layers',
      color: 'text-warning'
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4 flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </div>
            <Skeleton className="h-6 w-16 rounded mt-1" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className="p-4 flex flex-col justify-between transition-shadow hover:shadow-md">
          <div className="flex items-center justify-between gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <span className="truncate">{item.label}</span>
            <Icon icon={item.icon} width="16" className={item.color || 'text-primary'} />
          </div>
          <div className="mt-2 text-base font-bold text-foreground tabular-nums">
            {formatNumber(item.value)}
          </div>
        </Card>
      ))}
    </div>
  );
}
