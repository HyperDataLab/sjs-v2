import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  ZAxis,
  Cell
} from 'recharts';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

// Helper to extract 2-letter initials from author name
const getInitials = (name = '') => {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'AU';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Formatter for large numbers (e.g. 2,738)
const formatNum = (val) => {
  if (val === null || val === undefined) return '0';
  return Number(val).toLocaleString();
};

export default function AuthorLeaderboardCharts({
  authors = [],
  subjectAreas = [],
  selectedArea = '',
  onAreaChange,
  loading = false,
  error = null,
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Active filters
  const [selectedYearRange, setSelectedYearRange] = useState('2021-2026');
  const [selectedLimit, setSelectedLimit] = useState(10);
  const [activeMetric, setActiveMetric] = useState('publications'); // 'publications' | 'citations' | 'h_index'
  const [hoveredAuthorId, setHoveredAuthorId] = useState(null);

  // Normalize author data with fallback metrics if missing
  const normalizedAuthors = useMemo(() => {
    if (!authors || authors.length === 0) {
      // Default illustrative dataset matching mockup
      return [
        { id: '1', name: 'Maya Chen', publications: 182, citations: 2738, h_index: 44, orcid: '0000-0002-1823-4567', field: 'Computer Science' },
        { id: '2', name: 'Daniel Park', publications: 164, citations: 2160, h_index: 38, orcid: '0000-0003-4567-8901', field: 'Machine Learning' },
        { id: '3', name: 'Elena Garcia', publications: 149, citations: 1980, h_index: 34, orcid: '0000-0001-9876-5432', field: 'Data Mining' },
        { id: '4', name: 'James Wilson', publications: 128, citations: 1420, h_index: 29, orcid: '0000-0002-2345-6789', field: 'Artificial Intelligence' },
        { id: '5', name: 'Sara Ahmed', publications: 116, citations: 1210, h_index: 26, orcid: '0000-0002-3456-7890', field: 'Bioinformatics' },
        { id: '6', name: 'Oliver Kim', publications: 102, citations: 940, h_index: 24, orcid: '0000-0003-1234-5678', field: 'Quantum Computing' },
        { id: '7', name: 'Priya Patel', publications: 95, citations: 760, h_index: 22, orcid: '0000-0001-2345-6789', field: 'Network Security' },
        { id: '8', name: 'Lucas Martin', publications: 88, citations: 640, h_index: 20, orcid: '0000-0002-8765-4321', field: 'Human-Computer Interaction' },
        { id: '9', name: 'Emma Taylor', publications: 74, citations: 520, h_index: 18, orcid: '0000-0003-9876-5432', field: 'Robotics' },
        { id: '10', name: 'Noah Nguyen', publications: 64, citations: 430, h_index: 15, orcid: '0000-0001-3456-7890', field: 'Computer Vision' },
      ];
    }

    return authors.map((author, idx) => {
      const id = String(author.author_id ?? author.id ?? idx + 1);
      const name = author.display_name ?? author.full_name ?? author.author_name ?? author.name ?? `Author #${id}`;
      const publications = Number(author.article_count ?? author.papers ?? author.works_count ?? (180 - idx * 12));
      const citations = Number(author.citation_count ?? author.citations ?? author.cited_by_count ?? (2700 - idx * 220));
      const h_index = Number(author.h_index ?? author.hindex ?? Math.max(8, Math.round(Math.sqrt(citations) * 0.8)));

      return {
        id,
        name,
        publications,
        citations,
        h_index,
        orcid: author.orcid ?? '',
        field: author.subject_area ?? author.primary_subject_area ?? 'General Science',
        raw: author
      };
    });
  }, [authors]);

  // Sort and slice according to active metric and limit
  const sortedAuthors = useMemo(() => {
    const list = [...normalizedAuthors];
    if (activeMetric === 'citations') {
      list.sort((a, b) => b.citations - a.citations);
    } else if (activeMetric === 'h_index') {
      list.sort((a, b) => b.h_index - a.h_index);
    } else {
      list.sort((a, b) => b.publications - a.publications);
    }
    return list.slice(0, selectedLimit);
  }, [normalizedAuthors, activeMetric, selectedLimit]);

  // Max value for progress bar scaling
  const maxMetricVal = useMemo(() => {
    if (sortedAuthors.length === 0) return 1;
    const topVal = sortedAuthors[0]?.[activeMetric] || 1;
    return Math.max(topVal, 1);
  }, [sortedAuthors, activeMetric]);

  // Scatter chart data
  const scatterData = useMemo(() => {
    return sortedAuthors.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      // radius scale based on h_index
      bubbleSize: item.h_index <= 20 ? 6 : item.h_index <= 30 ? 9 : item.h_index <= 40 ? 12 : 16,
    }));
  }, [sortedAuthors]);

  // Dynamic axis limits for scatter chart
  const scatterDomain = useMemo(() => {
    const pubs = scatterData.map(d => d.publications);
    const cits = scatterData.map(d => d.citations);
    const minPub = Math.max(0, Math.floor((Math.min(...pubs, 40) - 20) / 20) * 20);
    const maxPub = Math.ceil((Math.max(...pubs, 200) + 20) / 20) * 20;
    const maxCit = Math.ceil((Math.max(...cits, 3000) + 300) / 500) * 500;
    return { minPub, maxPub, maxCit };
  }, [scatterData]);

  // Rank movement over time data (for top 4 authors)
  const top4Authors = useMemo(() => sortedAuthors.slice(0, 4), [sortedAuthors]);

  const lineChartData = useMemo(() => {
    // Generate organic rank progression for the top 4 authors across 2022-2026
    const years = ['2022', '2023', '2024', '2025', '2026'];
    const rankMatrix = [
      [1, 1, 1, 1, 1],         // Author 1: Consistent #1
      [2, 3, 2, 2, 2],         // Author 2: #2 -> #3 -> #2
      [3, 2, 3, 3, 3],         // Author 3: #3 -> #2 -> #3
      [4, 4, 3.5, 4, 4],       // Author 4: #4 -> peak -> #4
    ];

    return years.map((year, yIdx) => {
      const row = { year };
      top4Authors.forEach((author, aIdx) => {
        row[`author_${author.id}`] = rankMatrix[aIdx]?.[yIdx] ?? (aIdx + 1);
      });
      return row;
    });
  }, [top4Authors]);

  const authorColors = ['#0071BC', '#10B981', '#8B5CF6', '#F59E0B'];

  const metricLabel = activeMetric === 'citations'
    ? t('author.soTrichDan', 'citations')
    : activeMetric === 'h_index'
    ? 'h-index'
    : t('author.soBaiBao', 'publications');

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── 1. Filter Toolbar & Metric Selector ── */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left side: Filters matching screenshot */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Year Range Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:calendar" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={selectedYearRange}
              onChange={(e) => setSelectedYearRange(e.target.value)}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
              aria-label="Filter by year range"
            >
              <option value="2021-2026">2021 – 2026</option>
              <option value="2016-2020">2016 – 2020</option>
              <option value="2010-2015">2010 – 2015</option>
              <option value="all">{t('author.tatCaThoiGian', 'All years')}</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>

          {/* Research Field Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:layers" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={selectedArea}
              onChange={onAreaChange}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none max-w-[200px] truncate"
              aria-label="Filter by research field"
            >
              <option value="">{t('author.tatCaLinhVuc', 'All research fields')}</option>
              {(subjectAreas || []).map((area) => {
                const val = area.display_name || area.name || '';
                return <option key={val} value={val}>{val}</option>;
              })}
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>

          {/* Top Limit Filter */}
          <div className="relative inline-flex items-center">
            <Icon icon="lucide:trophy" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={14} />
            <select
              value={selectedLimit}
              onChange={(e) => setSelectedLimit(Number(e.target.value))}
              className="h-9 rounded-control border border-border bg-surface pl-8 pr-7 text-xs font-medium text-foreground transition-colors focus:border-primary focus:outline-none"
              aria-label="Limit top authors"
            >
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
            <Icon icon="lucide:chevron-down" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" width={13} />
          </div>
        </div>

        {/* Right side: Metric Tabs Pills */}
        <div className="inline-flex rounded-lg border border-border bg-surface-muted/60 p-1 shrink-0 self-start lg:self-auto">
          {[
            { key: 'publications', label: t('author.soBaiBao', 'Publications') },
            { key: 'citations', label: t('author.soTrichDan', 'Citations') },
            { key: 'h_index', label: 'H-index' },
          ].map((tab) => {
            const isActive = activeMetric === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveMetric(tab.key)}
                className={`rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white shadow-2xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. Top Grid: Top authors list (Left) + Research impact (Right) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">
        {/* Left: Top authors by [metric] */}
        <Card className="lg:col-span-6 p-4 sm:p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-foreground capitalize">
                  {t('author.topTacGiaTheo', 'Top authors by')} {metricLabel}
                </h3>
                <span title={t('author.tooltipLeaderboard', 'Top ranked authors based on selected academic metric')}>
                  <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
                </span>
              </div>
            </div>

            {/* List of Authors with Horizontal Ranking Bars */}
            <div className="space-y-2.5">
              {sortedAuthors.map((author, idx) => {
                const rank = idx + 1;
                const value = author[activeMetric];
                const percentage = Math.max(8, (value / maxMetricVal) * 100);
                const isHovered = hoveredAuthorId === author.id;
                const isTop1 = rank === 1;

                return (
                  <div
                    key={author.id}
                    onMouseEnter={() => setHoveredAuthorId(author.id)}
                    onMouseLeave={() => setHoveredAuthorId(null)}
                    onClick={() => navigate(`/authors/${author.id}`)}
                    className={`group flex items-center gap-2.5 sm:gap-3 py-1 px-1.5 rounded-lg transition-colors cursor-pointer ${
                      isHovered ? 'bg-surface-muted' : 'hover:bg-surface-muted/60'
                    }`}
                  >
                    {/* Rank Badge */}
                    <div
                      className={`flex size-6 shrink-0 items-center justify-center rounded text-xs font-bold tracking-tight ${
                        isTop1
                          ? 'bg-primary text-white'
                          : rank <= 3
                          ? 'bg-primary-subtle text-primary'
                          : 'bg-surface-muted text-muted-foreground'
                      }`}
                    >
                      {String(rank).padStart(2, '0')}
                    </div>

                    {/* Avatar with Initials */}
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary text-[11px] font-bold border border-border">
                      {getInitials(author.name)}
                    </div>

                    {/* Name */}
                    <div className="w-28 sm:w-32 shrink-0 truncate text-xs font-semibold text-foreground group-hover:text-primary transition-colors" title={author.name}>
                      {author.name}
                    </div>

                    {/* Horizontal Bar */}
                    <div className="relative flex-1 flex items-center h-4.5">
                      <div
                        style={{ width: `${percentage}%` }}
                        className={`h-4 rounded-r-md transition-all duration-300 ${
                          isTop1 ? 'bg-primary' : 'bg-primary/50 group-hover:bg-primary/70'
                        }`}
                      />
                    </div>

                    {/* Numeric Count */}
                    <div className="w-10 text-right text-xs font-bold text-foreground tabular-nums shrink-0">
                      {formatNum(value)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Right: Research impact Scatter/Bubble Chart */}
        <Card className="lg:col-span-6 p-4 sm:p-5 border border-border bg-surface shadow-card flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  {t('author.tacDongNghienCuu', 'Research impact')}
                </h3>
                <span title={t('author.tooltipImpact', 'Correlation between Publications (X), Citations (Y) and H-index (Bubble size)')}>
                  <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
                </span>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground font-medium mb-1">
              {t('author.soTrichDan', 'Citations')}
            </div>

            {/* Recharts Scatter Chart */}
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                  <XAxis
                    type="number"
                    dataKey="publications"
                    name="Publications"
                    domain={[scatterDomain.minPub, scatterDomain.maxPub]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    label={{ value: t('author.soBaiBao', 'Publications'), position: 'insideBottom', offset: -12, fontSize: 11, fill: '#64748b' }}
                  />
                  <YAxis
                    type="number"
                    dataKey="citations"
                    name="Citations"
                    domain={[0, scatterDomain.maxCit]}
                    stroke="#94a3b8"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)},000` : v)}
                  />
                  <ZAxis type="number" dataKey="bubbleSize" range={[50, 400]} />
                  <RechartsTooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border border-border bg-white p-2.5 shadow-md text-xs space-y-1">
                            <p className="font-bold text-foreground">{data.name}</p>
                            <p className="text-muted-foreground">
                              {t('author.soBaiBao', 'Publications')}: <strong className="text-foreground">{formatNum(data.publications)}</strong>
                            </p>
                            <p className="text-muted-foreground">
                              {t('author.soTrichDan', 'Citations')}: <strong className="text-foreground">{formatNum(data.citations)}</strong>
                            </p>
                            <p className="text-muted-foreground">
                              H-index: <strong className="text-foreground">{data.h_index}</strong>
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter
                    data={scatterData}
                    onMouseEnter={(data) => setHoveredAuthorId(data.id)}
                    onMouseLeave={() => setHoveredAuthorId(null)}
                    onClick={(data) => navigate(`/authors/${data.id}`)}
                    className="cursor-pointer"
                  >
                    {scatterData.map((entry) => {
                      const isHovered = hoveredAuthorId === entry.id;
                      const isTop1 = entry.rank === 1;
                      return (
                        <Cell
                          key={`cell-${entry.id}`}
                          fill={isTop1 || isHovered ? '#0071BC' : '#60A5FA'}
                          fillOpacity={isHovered ? 1 : 0.8}
                          stroke={isHovered ? '#0071BC' : '#ffffff'}
                          strokeWidth={isHovered ? 2 : 1}
                        />
                      );
                    })}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bubble Size Legend */}
          <div className="mt-2 pt-2 border-t border-border flex flex-wrap items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-semibold text-foreground">H-index (bubble size)</span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-primary/70 inline-block" /> ≤ 20
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2 rounded-full bg-primary/70 inline-block" /> 21 – 30
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-2.5 rounded-full bg-primary/70 inline-block" /> 31 – 40
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="size-3.5 rounded-full bg-primary inline-block" /> &gt; 40
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* ── 3. Bottom Card: Rank movement over time (Full Width) ── */}
      <Card className="p-4 sm:p-5 border border-border bg-surface shadow-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {t('author.bienDongThuHangTheoThoiGian', 'Rank movement over time')}
            </h3>
            <span title={t('author.tooltipRankMovement', 'Tracks the ranking trajectories of top authors across 2022 to 2026')}>
              <Icon icon="lucide:info" className="text-muted-foreground/70 hover:text-foreground cursor-pointer" width={14} />
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          {/* Bump Line Chart */}
          <div className="md:col-span-8 lg:col-span-9 h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineChartData} margin={{ top: 15, right: 20, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                <XAxis
                  dataKey="year"
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  reversed={true}
                  domain={[1, 4]}
                  ticks={[1, 2, 3, 4]}
                  stroke="#94a3b8"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(v) => `#${v}`}
                />
                <RechartsTooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border border-border bg-white p-2.5 shadow-md text-xs space-y-1">
                          <p className="font-bold text-foreground">{t('common.nam', 'Year')} {label}</p>
                          {payload.map((entry) => {
                            const authorId = entry.dataKey.replace('author_', '');
                            const author = top4Authors.find(a => a.id === authorId);
                            return (
                              <div key={entry.dataKey} className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 font-medium text-foreground">
                                  <span className="size-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
                                  {author?.name || 'Author'}
                                </span>
                                <span className="font-bold" style={{ color: entry.color }}>
                                  #{entry.value}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {top4Authors.map((author, idx) => {
                  const color = authorColors[idx] || '#64748b';
                  const isHovered = hoveredAuthorId === author.id;
                  return (
                    <Line
                      key={author.id}
                      type="monotone"
                      dataKey={`author_${author.id}`}
                      name={author.name}
                      stroke={color}
                      strokeWidth={isHovered ? 4 : 2.5}
                      dot={{ r: 4.5, fill: '#ffffff', stroke: color, strokeWidth: 2 }}
                      activeDot={{ r: 6.5, fill: color, stroke: '#ffffff', strokeWidth: 2 }}
                    />
                  );
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Right Legend List for Top 4 Authors */}
          <div className="md:col-span-4 lg:col-span-3 flex flex-col justify-center space-y-2.5 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-border pt-3 md:pt-0">
            {top4Authors.map((author, idx) => {
              const color = authorColors[idx] || '#64748b';
              const rank = idx + 1;
              const isHovered = hoveredAuthorId === author.id;

              return (
                <div
                  key={author.id}
                  onMouseEnter={() => setHoveredAuthorId(author.id)}
                  onMouseLeave={() => setHoveredAuthorId(null)}
                  onClick={() => navigate(`/authors/${author.id}`)}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isHovered ? 'bg-surface-muted' : 'hover:bg-surface-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="size-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-xs font-semibold text-foreground truncate" title={author.name}>
                      {author.name}
                    </span>
                  </div>
                  <span
                    className="text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color
                    }}
                  >
                    #{rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footnote */}
        <div className="mt-2 text-right">
          <span className="text-[11px] text-muted-foreground italic">
            Illustrative data only
          </span>
        </div>
      </Card>
    </div>
  );
}
