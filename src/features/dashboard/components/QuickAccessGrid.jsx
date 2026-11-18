import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';

export default function QuickAccessGrid() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = [
    { icon: 'lucide:search', label: t('search'), desc: t('dashboard.khamPhaBaiBaoDeTai'), path: '/catalog' },
    { icon: 'lucide:book-open', label: t('typeJournal'), desc: t('dashboard.xepHangQ1q4KhoaHoc'), path: '/catalog' },
    { icon: 'lucide:globe', label: t('geography'), desc: t('dashboard.banDoPhanBoTacGia'), path: '/geography' },
    { icon: 'lucide:trophy', label: 'Leaderboard', desc: t('dashboard.xepHangTacGiaNoiBat'), path: '/authors' },
  ];
  return <Card className="h-full">
    <CardHeader><CardTitle className="flex items-center gap-2"><Icon icon="lucide:zap" width={16} className="text-[#0071BC]" />{t('dashboard.truyCapNhanh')}</CardTitle></CardHeader>
    <CardContent><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => <button key={item.icon} type="button" onClick={() => navigate(item.path)}
        className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition-colors hover:border-sky-200 hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071BC]">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-[#0071BC]"><Icon icon={item.icon} width={20} /></span>
        <span className="min-w-0"><span className="block text-sm font-semibold text-slate-900">{item.label}</span><span className="block text-xs leading-5 text-slate-500">{item.desc}</span></span>
      </button>)}
    </div></CardContent>
  </Card>;
}
