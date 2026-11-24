import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import './CollaborationAnalytics.css';

const BIN_COUNT = 5;

const formatValue = value => Number(value.toFixed(value < 10 ? 1 : 0)).toLocaleString();

const AuthorImpactMatrix = ({ data }) => {
  const { t } = useTranslation();
  const points = Array.isArray(data) ? data : [];
  const maxOutput = Math.max(1, points.reduce((max, point) => Math.max(max, Number(point.yearlyOutput) || 0), 0));
  const maxHIndex = Math.max(1, points.reduce((max, point) => Math.max(max, Number(point.hIndex) || 0), 0));

  const { cells, maxCount } = useMemo(() => {
    const nextCells = Array.from({ length: BIN_COUNT }, () =>
      Array.from({ length: BIN_COUNT }, () => []));

    points.forEach(point => {
      const output = Math.max(0, Number(point.yearlyOutput) || 0);
      const hIndex = Math.max(0, Number(point.hIndex) || 0);
      const x = Math.min(BIN_COUNT - 1, Math.floor(output / maxOutput * BIN_COUNT));
      const y = Math.min(BIN_COUNT - 1, Math.floor(hIndex / maxHIndex * BIN_COUNT));
      nextCells[y][x].push(point);
    });

    return {
      cells: nextCells,
        maxCount: Math.max(1, nextCells.flat().reduce((max, cell) => Math.max(max, cell.length), 0)),
    };
  }, [points, maxOutput, maxHIndex]);

  if (!Array.isArray(data)) {
    return (
      <div className="ca-card">
        <div className="ca-card-header">
          <h3 className="ca-card-title">{t('volume.authorProductivityVsImpact', 'Author Productivity vs Impact Matrix')}</h3>
        </div>
        <div className="ca-matrix-empty">{t('volume.noData', 'No data available for this project.')}</div>
      </div>
    );
  }

  return (
    <div className="ca-card">
      <div className="ca-card-header">
        <h3 className="ca-card-title">{t('volume.authorProductivityVsImpact', 'Author Productivity vs Impact Matrix')}</h3>
      </div>

      <div className="ca-heatmap" role="img" aria-label={t('volume.authorProductivityVsImpact', 'Author Productivity vs Impact Matrix')}>
        <div className="ca-heatmap-y-title">{t('volume.hIndex', 'H-INDEX').toUpperCase()}</div>
        <div className="ca-heatmap-y-ticks" aria-hidden="true">
          {Array.from({ length: BIN_COUNT }, (_, row) => {
            const bin = BIN_COUNT - row - 1;
            return <span key={bin}>{formatValue(maxHIndex * bin / BIN_COUNT)}–{formatValue(maxHIndex * (bin + 1) / BIN_COUNT)}</span>;
          })}
        </div>
        <div className="ca-heatmap-main">
          <div className="ca-heatmap-grid">
            {Array.from({ length: BIN_COUNT }, (_, row) => {
              const bin = BIN_COUNT - row - 1;
              return cells[bin].map((authors, column) => {
                const xStart = maxOutput * column / BIN_COUNT;
                const xEnd = maxOutput * (column + 1) / BIN_COUNT;
                const yStart = maxHIndex * bin / BIN_COUNT;
                const yEnd = maxHIndex * (bin + 1) / BIN_COUNT;
                const authorNames = authors.map(author => author.authorName || author.authorId).filter(Boolean);
                const description = authors.length
                  ? `${authors.length} ${authors.length === 1 ? 'author' : 'authors'}\n${authorNames.slice(0, 8).join('\n')}${authorNames.length > 8 ? '\n…' : ''}`
                  : 'No authors';

                return (
                  <div
                    key={`${bin}-${column}`}
                    className={`ca-heatmap-cell${authors.length ? ' is-populated' : ''}`}
                    style={{
                      '--heat-intensity': authors.length ? 0.12 + (authors.length / maxCount) * 0.78 : 0,
                      color: authors.length / maxCount > 0.52 ? '#fff' : '#075985',
                    }}
                    title={`${description}\nYearly output: ${formatValue(xStart)}–${formatValue(xEnd)}\nH-index: ${formatValue(yStart)}–${formatValue(yEnd)}`}
                  >
                    {authors.length > 0 && <span>{authors.length}</span>}
                  </div>
                );
              });
            })}
          </div>
          <div className="ca-heatmap-x-ticks" aria-hidden="true">
            {Array.from({ length: BIN_COUNT + 1 }, (_, index) => (
              <span key={index}>{formatValue(maxOutput * index / BIN_COUNT)}</span>
            ))}
          </div>
          <div className="ca-heatmap-x-title">{t('volume.articleOutputYearlyUpper', 'ARTICLE OUTPUT (YEARLY)')}</div>
        </div>
      </div>

      <div className="ca-heatmap-legend" aria-hidden="true">
        <span>{t('volume.fewerAuthors', 'Fewer authors')}</span>
        <span className="ca-heatmap-legend-scale" />
        <span>{t('volume.moreAuthors', 'More authors')}</span>
        <span className="ca-heatmap-legend-note">{t('volume.heatmapHoverHint', 'Hover a cell to see authors and value ranges')}</span>
      </div>
      {points.length === 0 && (
        <div className="ca-matrix-empty">{t('volume.noData', 'No data available for this project.')}</div>
      )}
    </div>
  );
};

export default AuthorImpactMatrix;
