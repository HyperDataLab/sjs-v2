import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

function KeywordAxisTick({ x, y, payload }) {
  const keyword = String(payload?.value ?? '');
  const label = keyword.length > 22 ? `${keyword.slice(0, 21)}…` : keyword;
  return <g><title>{keyword}</title><text x={x - 8} y={y} textAnchor="end" dominantBaseline="central" fill="#64748b" fontSize={11}>{label}</text></g>;
}

function KeywordTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-md">
    <div className="font-semibold">{label}</div>
    <div className="mt-1">{payload[0].name}: {payload[0].value}</div>
  </div>;
}

function KeywordsRechart({ chartData, onKeywordClick }) {
  const { t } = useTranslation();
  const labels = chartData?.labels || [];
  const dataset = chartData?.datasets?.[0] || { data: [] };
  const mappedData = labels.map((keyword, index) => ({ keyword, value: dataset.data[index] ?? 0 }));
  return <ResponsiveContainer width="100%" height={260}>
    <BarChart data={mappedData} layout="vertical" margin={{ left: 5, right: 10, top: 5, bottom: 5 }}>
      <XAxis type="number" hide />
      <YAxis dataKey="keyword" type="category" width={150} tick={<KeywordAxisTick />} interval={0} axisLine={false} tickLine={false} />
      <Tooltip cursor={{ fill: '#f1f5f9', opacity: 0.5 }} content={<KeywordTooltip />} />
      <Bar dataKey="value" fill="#0071BC" name={dataset.label || t('publications')} radius={[0, 4, 4, 0]} barSize={14}
        isAnimationActive animationDuration={400} className="cursor-pointer" onClick={(data) => { if (data?.keyword) onKeywordClick?.(data.keyword); }} />
    </BarChart>
  </ResponsiveContainer>;
}

export default function TrendingKeywordsCard({ keywords, loading, isFetching, error, onKeywordClick, onViewMore }) {
  const { t } = useTranslation();
  const labels = keywords?.labels || [];
  const dataset = keywords?.datasets?.[0] || { data: [] };
  const hasData = labels.length > 0 && dataset.data?.length > 0;

  return <Card className="h-full min-w-0">
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle className="flex items-center gap-2"><Icon icon="lucide:flame" width={16} className="text-[#0071BC]" />Trending Keywords</CardTitle>
      <div className="flex items-center gap-2">
        {isFetching && <Icon icon="lucide:loader" className="animate-spin text-slate-400" width={14} aria-label={t('common.dangCapNhat', 'Loading')} />}
        {onViewMore && <Button variant="ghost" size="sm" className="text-[#0071BC]" onClick={onViewMore}>{t('dashboard.xemThem')}</Button>}
      </div>
    </CardHeader>
    <CardContent>
      {loading && !hasData ? <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3 py-2">
        {[1, 2, 3, 4, 5].map((i) => <div key={i} className="flex items-center gap-3"><span className="h-4 w-20 animate-pulse rounded bg-slate-100" /><span className="h-4 flex-1 animate-pulse rounded bg-slate-100" /></div>)}
      </div> : error && !hasData ? <div className="py-8 text-center text-sm text-red-600"><Icon icon="lucide:alert-circle" width={28} className="mx-auto mb-2" />{error}</div>
      : !hasData ? <div className="py-8 text-center"><Icon icon="lucide:tag" width={32} className="mx-auto text-slate-400" /><p className="mb-1 mt-3 text-sm font-semibold text-slate-900">{t('dashboard.chuaCoKeywordNao')}</p><p className="m-0 text-xs text-slate-500">{t('dashboard.themKeywordVaoProjectDeBatDauT')}</p></div>
      : <div className={`w-full transition-opacity ${isFetching ? 'opacity-60' : 'opacity-100'}`}><KeywordsRechart chartData={keywords} onKeywordClick={onKeywordClick} /></div>}
    </CardContent>
  </Card>;
}
