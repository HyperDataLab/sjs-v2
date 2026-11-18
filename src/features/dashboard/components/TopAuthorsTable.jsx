import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { formatCount, truncate } from '../../../shared/utils/formatNumber';

function RankBadge({ rank }) {
  const colors = [
    'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
  ];
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
        colors[rank - 1] ?? 'text-muted-foreground'
      }`}
    >
      {rank === 1 ? <Icon icon="lucide:crown" width={14} /> : rank}
    </span>
  );
}

export default function TopAuthorsTable({ authors = [], loading, error, onAuthorClick, onViewAll }) {
  const { t } = useTranslation();

  return (
    <Card className="min-w-0 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
        <CardTitle className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
          <Icon icon="lucide:users" width={18} className="text-primary" />
          <span>{t('dashboard.topAuthorsTuanNay', 'Top Contributing Authors')}</span>
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" className="text-xs text-primary font-semibold" onClick={onViewAll}>
            {t('dashboard.bangXepHang', 'View Leaderboard')} →
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="p-5 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>
        ) : error ? (
          <div className="py-10 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={32} className="mx-auto mb-2" />
            {error}
          </div>
        ) : authors.length === 0 ? (
          <div className="py-12 text-center">
            <div className="size-12 rounded-full bg-surface-muted text-muted-foreground flex items-center justify-center mx-auto mb-3">
              <Icon icon="lucide:users" width={24} />
            </div>
            <p className="mb-1 text-sm font-semibold text-foreground">
              {t('dashboard.chuaCoDuLieuTacGia')}
            </p>
            <p className="m-0 text-xs text-muted-foreground">
              {t('dashboard.duLieuLeaderboardSeHienThiODay')}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead className="bg-surface-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th scope="col" className="px-5 py-3 w-16">#</th>
                  <th scope="col" className="px-4 py-3">{t('typeAuthor', 'Author')}</th>
                  <th scope="col" className="px-4 py-3">{t('author.linhVuc', 'Research Field')}</th>
                  <th scope="col" className="px-4 py-3 text-right">{t('articles', 'Articles')}</th>
                  <th scope="col" className="px-5 py-3 text-right">Citations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {authors.map((author, i) => {
                  const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? 'Unknown';
                  const field = author.subject_area ?? author.primary_subject_area ?? author.field ?? author.area ?? '—';
                  const articles = author.article_count ?? author.papers ?? author.works_count ?? 0;
                  const citations = author.citation_count ?? author.citations ?? author.cited_by_count ?? 0;
                  const initials = name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0].toUpperCase())
                    .join('');

                  return (
                    <tr key={author.author_id ?? author.id ?? i} className="transition-colors hover:bg-surface-muted/50">
                      <td className="px-5 py-3.5">
                        <RankBadge rank={i + 1} />
                      </td>
                      <td className="px-4 py-3.5">
                        <button
                          type="button"
                          onClick={() => onAuthorClick?.(author)}
                          className="flex max-w-sm items-center gap-3 rounded border-0 bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary group"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                            {initials}
                          </span>
                          <span className="min-w-0">
                            <span className="block truncate font-semibold text-foreground group-hover:text-primary transition-colors" title={name}>
                              {truncate(name, 28)}
                            </span>
                            {author.orcid && (
                              <span className="block truncate text-xs font-mono text-muted-foreground">
                                {truncate(author.orcid, 32)}
                              </span>
                            )}
                          </span>
                        </button>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-xs text-muted-foreground">
                          {field || '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-muted-foreground tabular-nums">
                        {formatCount(articles)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-primary tabular-nums">
                        ↑ {formatCount(citations)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
