import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount, truncate } from '../../../shared/utils/formatNumber';

function RankBadge({ rank }) {
  const colors = ['bg-amber-100 text-amber-700', 'bg-slate-200 text-slate-600', 'bg-orange-100 text-orange-700'];
  return <span className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${colors[rank - 1] ?? 'text-slate-500'}`}>
    {rank === 1 ? <Icon icon="lucide:crown" width={12} /> : rank}
  </span>;
}

export default function TopAuthorsTable({ authors = [], loading, error, onAuthorClick, onViewAll }) {
  const { t } = useTranslation();
  return <Card className="min-w-0 overflow-hidden">
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle>{t('dashboard.topAuthorsTuanNay')}</CardTitle>
      {onViewAll && <Button variant="ghost" size="sm" className="text-[#0071BC]" onClick={onViewAll}>{t('dashboard.bangXepHang')}</Button>}
    </CardHeader>
    <CardContent>
      {loading ? <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
        : error ? <div className="py-10 text-center text-sm text-red-600"><Icon icon="lucide:alert-circle" width={32} className="mx-auto mb-2" />{error}</div>
        : authors.length === 0 ? <div className="py-10 text-center"><Icon icon="lucide:users" width={36} className="mx-auto text-slate-400" /><p className="mb-1 mt-3 text-sm font-semibold text-slate-900">{t('dashboard.chuaCoDuLieuTacGia')}</p><p className="m-0 text-xs text-slate-500">{t('dashboard.duLieuLeaderboardSeHienThiODay')}</p></div>
        : <div className="overflow-x-auto"><table className="w-full min-w-[620px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr>
            <th scope="col" className="rounded-l-lg px-3 py-3">#</th><th scope="col" className="px-3 py-3">{t('typeAuthor')}</th>
            <th scope="col" className="px-3 py-3">{t('author.linhVuc')}</th><th scope="col" className="px-3 py-3">{t('articles')}</th>
            <th scope="col" className="rounded-r-lg px-3 py-3">Citations</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">{authors.map((author, i) => {
            const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown';
            const field = author.subject_area ?? author.primary_subject_area ?? author.field ?? author.area ?? '—';
            const articles = author.article_count ?? author.papers ?? author.works_count ?? 0;
            const citations = author.citation_count ?? author.citations ?? author.cited_by_count ?? 0;
            const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
            return <tr key={author.author_id ?? author.id ?? i} className="transition-colors hover:bg-slate-50">
              <td className="px-3 py-3"><RankBadge rank={i + 1} /></td>
              <td className="px-3 py-3"><button type="button" onClick={() => onAuthorClick?.(author)} className="flex max-w-64 items-center gap-2 rounded border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0071BC]">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{initials}</span>
                <span className="min-w-0"><span className="block truncate font-semibold text-slate-900" title={name}>{truncate(name, 24)}</span>{author.orcid && <span className="block truncate text-xs text-slate-500">{truncate(author.orcid, 32)}</span>}</span>
              </button></td>
              <td className="px-3 py-3 text-slate-500"><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{field || '—'}</span></td>
              <td className="px-3 py-3 text-slate-600">{formatCount(articles)}</td><td className="px-3 py-3 font-semibold text-slate-900">↑ {formatCount(citations)}</td>
            </tr>;
          })}</tbody>
        </table></div>}
    </CardContent>
  </Card>;
}
