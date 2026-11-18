import { useState } from 'react';
import { useTranslation } from "react-i18next";
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import ChartRangeDropdown from './ChartRangeDropdown';

/**
 * PublicationTrendChart — line chart xu hướng publication theo năm.
 * Dùng SVG thuần với non-scaling-stroke và nhãn HTML để không bị vỡ font/scale trên màn hình rộng.
 */

const LINE_COLORS = ['var(--primary)', '#3b82f6', '#10b981', '#a855f7'];

function SimpleSvgChart({ years, series }) {
  const { t } = useTranslation();
  const [hoveredPoint, setHoveredPoint] = useState(null);
  if (!years?.length || !series?.length) return null;

  const W = 1000;
  const H = 200;
  const PAD = { top: 20, right: 28, bottom: 20, left: 28 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  // flatten all values to get global min/max
  const allVals = series.flatMap(s => s.data ?? []).filter(Number.isFinite);
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(1, ...allVals);
  const xScale = i => PAD.left + (i / (years.length - 1 || 1)) * chartW;
  const yScale = v => PAD.top + chartH - ((v - minVal) / (maxVal - minVal || 1)) * chartH;

  return (
    <div className="relative w-full">
      <div className="h-[210px] w-full relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full overflow-visible">
          {/* Subtle Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
            const y = PAD.top + (1 - tick) * chartH;
            return (
              <line
                key={tick}
                x1={PAD.left}
                x2={PAD.left + chartW}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth={1}
                strokeDasharray="4 4"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          {/* Series lines */}
          {series.map((s, si) => {
            if (!s.data?.length) return null;
            const color = LINE_COLORS[si % LINE_COLORS.length];
            const pts = s.data.map((v, i) => `${xScale(i)},${yScale(v ?? 0)}`).join(' ');
            const pts0 = `${xScale(0)},${yScale(0)}`;
            const ptsN = `${xScale(s.data.length - 1)},${yScale(0)}`;

            return (
              <g key={si}>
                {/* Area fill */}
                <polygon
                  points={`${pts0} ${pts} ${ptsN}`}
                  fill={color}
                  fillOpacity={0.08}
                />
                {/* Line with non-scaling-stroke */}
                <polyline
                  points={pts}
                  fill="none"
                  stroke={color}
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                {/* Dots */}
                {s.data.map((v, i) => (
                  <circle
                    key={i}
                    cx={xScale(i)}
                    cy={yScale(v ?? 0)}
                    r={4}
                    fill={color}
                    stroke="var(--surface)"
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                {/* Transparent larger hover targets */}
                {s.data.map((v, i) => (
                  <circle
                    key={`hover-${i}`}
                    cx={xScale(i)}
                    cy={yScale(v ?? 0)}
                    r={18}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        year: years[i],
                        value: v ?? 0,
                        xPercent: (xScale(i) / W) * 100,
                        yPercent: (yScale(v ?? 0) / H) * 100,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Tooltip Overlay */}
        {hoveredPoint && (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-control border border-border bg-surface px-2.5 py-1.5 shadow-popover text-xs"
            style={{
              left: `${hoveredPoint.xPercent}%`,
              top: `${hoveredPoint.yPercent}%`,
              marginTop: '-8px',
            }}
          >
            <div className="font-semibold text-muted-foreground">
              {t("article.nam", "Year")} {hoveredPoint.year}
            </div>
            <div className="font-bold text-primary tabular-nums">
              {hoveredPoint.value.toLocaleString()} {t("author.baiBao", "articles")}
            </div>
          </div>
        )}
      </div>

      {/* HTML X-Axis Labels: ALWAYS crisp, un-scaled, professional font */}
      <div className="flex justify-between items-center px-6 pt-2.5 border-t border-border/60 text-xs font-mono text-muted-foreground select-none">
        {years.map((yr) => (
          <span key={yr} className="hover:text-foreground transition-colors">
            {yr}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PublicationTrendChart({
  analytics,
  loading,
  isFetching,
  error,
  onRetry,
  selectedRange,
  onRangeChange
}) {
  const { t } = useTranslation();

  // Normalise BE response shape
  const years = analytics?.years ?? analytics?.year_range ?? [];
  const series = analytics?.series ?? (analytics?.data ? [{
    label: t("articles"),
    data: analytics.data
  }] : []);

  const legend = series.length > 0 ? (
    <div className="flex flex-wrap items-center gap-3">
      {series.map((s, i) => (
        <div key={i} className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div
            className="h-1.5 w-3 rounded-sm"
            style={{ backgroundColor: LINE_COLORS[i % LINE_COLORS.length] }}
          />
          <span>{s.label ? t(s.label, s.label) : `Series ${i + 1}`}</span>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
        <div className="flex items-center gap-2 text-sm sm:text-base font-semibold text-foreground">
          <Icon icon="lucide:trending-up" width={18} className="text-primary" />
          <span>{t("dashboard.xuHuongPublication")}</span>
        </div>
        <div className="flex items-center gap-3">
          {legend}
          {onRangeChange && <ChartRangeDropdown value={selectedRange} onChange={onRangeChange} />}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-3 text-xs text-muted-foreground">
          <p className="m-0">{t("dashboard.soBaiBaoTheoNamTrongProjectsCu")}</p>
          {isFetching && (
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Icon icon="lucide:loader" className="animate-spin" width={12} />
              <span>{t("common.dangCapNhat", "Đang cập nhật...")}</span>
            </span>
          )}
        </div>

        <div className="min-h-[240px] flex items-center justify-center">
          {loading && years.length === 0 ? (
            <div className="h-[240px] w-full animate-pulse rounded-lg bg-surface-muted" />
          ) : error && years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Icon icon="lucide:alert-triangle" width={28} className="text-danger" />
              <p className="text-xs text-muted-foreground m-0">{error}</p>
              {onRetry && (
                <button
                  type="button"
                  className="mt-2 text-xs font-semibold text-primary hover:underline"
                  onClick={onRetry}
                >
                  {t("article.thuLai")}
                </button>
              )}
            </div>
          ) : years.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
              <Icon icon="lucide:bar-chart-2" width={36} className="text-muted-foreground" />
              <p className="text-sm font-semibold text-foreground mb-0">
                {t("dashboard.chuaCoDuLieuXuHuongPublication")}
              </p>
              <p className="text-xs text-muted-foreground m-0">
                {t("dashboard.taoProjectDauTienDeBatDauTheoD")}
              </p>
            </div>
          ) : (
            <div
              className="w-full transition-opacity duration-200"
              style={{ opacity: isFetching ? 0.6 : 1 }}
            >
              <SimpleSvgChart years={years} series={series} />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
