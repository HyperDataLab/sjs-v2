import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

function KeywordBars({ chartData, onKeywordClick, isFetching }) {
  const labels = chartData?.labels || [];
  const values = chartData?.datasets?.[0]?.data || [];
  const rows = labels.slice(0, 8).map((keyword, index) => ({
    keyword: String(keyword),
    value: Number(values[index]) || 0,
  }));
  const maximum = Math.max(1, ...rows.map(({ value }) => value));

  return (
    <ol aria-label="Trending keywords by publication count" className={`m-0 grid list-none gap-1 p-0 transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}>
      {rows.map(({ keyword, value }) => {
        const content = (
          <>
            <span className="min-w-0 flex-1 truncate text-left text-[11px] font-medium text-foreground" title={keyword}>
              {keyword}
            </span>
            <span aria-hidden="true" className="h-1.5 min-w-16 flex-[2] overflow-hidden rounded-full bg-surface-muted border border-border/40">
              <span
                className="block h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${Math.max(value > 0 ? 4 : 0, (value / maximum) * 100)}%` }}
              />
            </span>
            <span className="w-10 shrink-0 text-right text-[11px] font-mono tabular-nums text-muted-foreground">
              {value.toLocaleString()}
            </span>
          </>
        );

        return (
          <li key={keyword} className="min-w-0">
            {onKeywordClick ? (
              <button
                type="button"
                onClick={() => onKeywordClick(keyword)}
                aria-label={`${keyword}: ${value}`}
                className="flex min-h-6 w-full items-center gap-2.5 rounded-md border-0 bg-transparent px-1.5 py-0.5 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
              >
                {content}
              </button>
            ) : (
              <div className="flex min-h-6 items-center gap-2.5 px-1.5 py-0.5">{content}</div>
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

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <CardTitle className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
          <Icon icon="lucide:flame" width={16} className="text-primary" />
          <span>Trending Keywords</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          {isFetching && (
            <Icon icon="lucide:loader" className="animate-spin text-muted-foreground" width={12} aria-label={t('common.dangCapNhat', 'Loading')} />
          )}
          {onViewMore && (
            <Button variant="ghost" size="sm" className="text-[11px] text-primary font-semibold h-7 px-2" onClick={onViewMore}>
              {t('dashboard.xemThem')}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3.5 flex-1 flex flex-col justify-center">
        {loading && !hasData ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-2.5 py-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="h-3 w-20 animate-pulse rounded bg-surface-muted" />
                <span className="h-2 flex-1 animate-pulse rounded bg-surface-muted" />
              </div>
            ))}
          </div>
        ) : error && !hasData ? (
          <div className="py-6 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={22} className="mx-auto mb-1.5" />
            {error}
          </div>
        ) : !hasData ? (
          <div className="py-6 text-center flex flex-col items-center justify-center my-auto">
            <div className="size-9 rounded-full bg-surface-muted text-muted-foreground flex items-center justify-center mb-2">
              <Icon icon="lucide:tag" width={18} />
            </div>
            <p className="mb-0.5 text-xs font-semibold text-foreground">{t('dashboard.chuaCoKeywordNao')}</p>
            <p className="m-0 text-[11px] text-muted-foreground">{t('dashboard.themKeywordVaoProjectDeBatDauT')}</p>
          </div>
        ) : (
          <KeywordBars chartData={keywords} onKeywordClick={onKeywordClick} isFetching={isFetching} />
        )}
      </CardContent>
    </Card>
  );
}
