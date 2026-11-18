import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

function KeywordBars({ chartData, onKeywordClick, isFetching }) {
  const labels = chartData?.labels || [];
  const values = chartData?.datasets?.[0]?.data || [];
  const rows = labels.slice(0, 10).map((keyword, index) => ({
    keyword: String(keyword),
    value: Number(values[index]) || 0,
  }));
  const maximum = Math.max(1, ...rows.map(({ value }) => value));

  return (
    <ol aria-label="Trending keywords by publication count" className={`m-0 grid list-none gap-2 p-0 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      {rows.map(({ keyword, value }) => {
        const content = (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-xs font-medium text-muted-foreground" title={keyword}>{keyword}</span>
            <span aria-hidden="true" className="h-2.5 min-w-12 flex-[2] overflow-hidden rounded-full bg-surface-muted">
              <span className="block h-full rounded-full bg-primary" style={{ width: `${Math.max(value > 0 ? 3 : 0, (value / maximum) * 100)}%` }} />
            </span>
            <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{value.toLocaleString()}</span>
          </>
        );

        return (
          <li key={keyword} className="min-w-0">
            {onKeywordClick ? (
              <button type="button" onClick={() => onKeywordClick(keyword)} aria-label={`${keyword}: ${value}`} className="flex min-h-7 w-full items-center gap-3 rounded-control border-0 bg-transparent p-1 text-left hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary">
                {content}
              </button>
            ) : (
              <div className="flex min-h-7 items-center gap-3 p-1">{content}</div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function TrendingKeywordsCard({ keywords, loading, isFetching, error, onKeywordClick, onViewMore }) {
  const { t } = useTranslation();
  const labels = keywords?.labels || [];
  const dataset = keywords?.datasets?.[0] || { data: [] };
  const hasData = labels.length > 0 && dataset.data?.length > 0;

  return <Card className="h-full min-w-0">
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle className="flex items-center gap-2"><Icon icon="lucide:flame" width={16} className="text-primary" />Trending Keywords</CardTitle>
      <div className="flex items-center gap-2">
        {isFetching && <Icon icon="lucide:loader" className="animate-spin text-subtle-foreground" width={14} aria-label={t('common.dangCapNhat', 'Loading')} />}
        {onViewMore && <Button variant="ghost" size="sm" className="text-primary" onClick={onViewMore}>{t('dashboard.xemThem')}</Button>}
      </div>
    </CardHeader>
    <CardContent>
      {loading && !hasData ? <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3 py-2">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="flex items-center gap-3"><span className="h-4 w-20 animate-pulse rounded bg-surface-muted" /><span className="h-4 flex-1 animate-pulse rounded bg-surface-muted" /></div>)}
      </div> : error && !hasData ? <div className="py-8 text-center text-sm text-danger"><Icon icon="lucide:alert-circle" width={28} className="mx-auto mb-2" />{error}</div>
      : !hasData ? <div className="py-8 text-center"><Icon icon="lucide:tag" width={32} className="mx-auto text-subtle-foreground" /><p className="mb-1 mt-3 text-sm font-semibold text-foreground">{t('dashboard.chuaCoKeywordNao')}</p><p className="m-0 text-xs text-muted-foreground">{t('dashboard.themKeywordVaoProjectDeBatDauT')}</p></div>
      : <KeywordBars chartData={keywords} onKeywordClick={onKeywordClick} isFetching={isFetching} />}
    </CardContent>
  </Card>;
}
