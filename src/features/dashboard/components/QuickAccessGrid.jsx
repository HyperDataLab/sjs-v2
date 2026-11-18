import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';

export default function QuickAccessGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { lang = 'en' } = useParams();

  const items = [
    {
      icon: 'lucide:search',
      label: t('search', 'Search & Discover'),
      desc: t('dashboard.khamPhaBaiBaoDeTai', 'Search papers & journals'),
      path: `/${lang}/search`,
      iconBg: 'bg-primary-subtle text-primary'
    },
    {
      icon: 'lucide:file-text',
      label: t('articles', 'Articles Directory'),
      desc: t('dashboard.xepHangQ1q4KhoaHoc', 'Browse indexed publications'),
      path: `/${lang}/articles`,
      iconBg: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400'
    },
    {
      icon: 'lucide:globe',
      label: t('geography', 'Geographic Distribution'),
      desc: t('dashboard.banDoPhanBoTacGia', 'Global research output map'),
      path: `/${lang}/geography`,
      iconBg: 'bg-success-subtle text-success'
    },
    {
      icon: 'lucide:trophy',
      label: 'Leaderboard',
      desc: t('dashboard.xepHangTacGiaNoiBat', 'Top contributing researchers'),
      path: `/${lang}/authors`,
      iconBg: 'bg-warning-subtle text-warning'
    },
  ];

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader className="border-b border-border px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
          <Icon icon="lucide:zap" width={18} className="text-primary" />
          <span>{t('dashboard.truyCapNhanh', 'Quick Access')}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <button
              key={item.icon}
              type="button"
              onClick={() => navigate(item.path)}
              className="flex min-w-0 items-center gap-3.5 rounded-xl border border-border bg-surface p-3.5 text-left transition-colors hover:border-primary/40 hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                <Icon icon={item.icon} width={20} />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground truncate">
                  {item.label}
                </span>
                <span className="block text-xs leading-relaxed text-muted-foreground line-clamp-1">
                  {item.desc}
                </span>
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
