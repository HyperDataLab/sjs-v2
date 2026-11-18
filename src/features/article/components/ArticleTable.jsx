import { useTranslation } from "react-i18next";
import { Table, Card } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import ArticleTableRow from './ArticleTableRow';
import LatexText from '../../../shared/components/LatexText/LatexText';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { Badge } from '../../../shared/ui/badge';

export default function ArticleTable({
  articles = [],
  isLoading = false,
  onDetailClick,
  onClearFilters
}) {
  const { t } = useTranslation();

  // Renders a loader with multiple shimmer rows using Design System Skeleton
  const renderSkeletons = () => (
    <tbody>
      {[1, 2, 3, 4, 5].map((i) => (
        <tr key={i} className="border-b border-border">
          <td className="ps-3 py-3 w-10">
            <Skeleton className="h-3.5 w-4 rounded" />
          </td>
          <td className="py-3">
            <Skeleton className="h-4.5 w-4/5 rounded mb-2" />
            <Skeleton className="h-3 w-1/2 rounded" />
          </td>
          <td className="py-3">
            <Skeleton className="h-3.5 w-24 rounded" />
          </td>
          <td className="py-3 text-center">
            <Skeleton className="h-3.5 w-10 rounded mx-auto" />
          </td>
          <td className="py-3">
            <Skeleton className="h-3 w-28 rounded" />
          </td>
          <td className="py-3">
            <Skeleton className="h-5 w-20 rounded" />
          </td>
          <td className="py-3 text-center">
            <Skeleton className="h-5 w-8 rounded mx-auto" />
          </td>
          <td className="pe-3 text-end py-3">
            <Skeleton className="h-4 w-12 rounded ms-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );

  // Helper for topic colors
  const getTopicClassName = (topic) => {
    if (!topic) return '';
    const name = String(topic).toLowerCase();
    if (name.includes('machine learning') || name.includes('ml')) {
      return 'article-topic-badge--ml';
    }
    if (name.includes('computer science') || name.includes('cs')) {
      return 'article-topic-badge--cs';
    }
    if (name.includes('medicine') || name.includes('bio')) {
      return 'article-topic-badge--medicine';
    }
    if (name.includes('physic')) {
      return 'article-topic-badge--physics';
    }
    return 'article-topic-badge--other';
  };

  // If loading and there are no items
  if (isLoading && articles.length === 0) {
    return (
      <div className="article-table-card w-100 rounded-card border border-border bg-surface shadow-sm overflow-hidden">
        <Table responsive hover className="article-table m-0 border-0">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <th className="px-3 py-3 w-10">#</th>
              <th className="px-3 py-3">{t("article.tenBaiBao")}</th>
              <th className="px-3 py-3">JOURNAL</th>
              <th className="px-3 py-3 text-center">{t("article.nam1")}</th>
              <th className="px-3 py-3">DOI</th>
              <th className="px-3 py-3">TOPIC</th>
              <th className="px-3 py-3 text-center">OA</th>
              <th className="px-3 py-3 text-end">{t("article.chiTiet")}</th>
            </tr>
          </thead>
          {renderSkeletons()}
        </Table>
      </div>
    );
  }

  // If search matches nothing
  if (articles.length === 0) {
    return (
      <StatePanel
        variant="neutral"
        icon={<Icon icon="lucide:search-code" width="32" className="text-muted-foreground" />}
        title={t("article.khongTimThayBaiBaoPhuHop")}
        description={t("article.hayThuThayDoiTuKhoaHoacXoaCacB")}
        actions={
          onClearFilters && (
            <Button variant="outline" onClick={onClearFilters}>
              <Icon icon="lucide:rotate-ccw" width="14" className="mr-1.5" />
              <span>{t("article.xoaBoLoc")}</span>
            </Button>
          )
        }
      />
    );
  }

  return (
    <>
      {/* 1. TABLE LAYOUT (Desktop & Tablet) */}
      <div className="article-table-card w-100 d-none d-md-block rounded-card border border-border bg-surface shadow-sm overflow-hidden">
        <Table responsive hover className="article-table m-0 border-0">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <th className="px-3 py-3 w-10">#</th>
              <th className="px-3 py-3">{t("article.tenBaiBao")}</th>
              <th className="px-3 py-3">JOURNAL</th>
              <th className="px-3 py-3 text-center">{t("article.nam1")}</th>
              <th className="px-3 py-3">DOI</th>
              <th className="px-3 py-3">TOPIC</th>
              <th className="px-3 py-3 text-center">OA</th>
              <th className="px-3 py-3 text-end">{t("article.chiTiet")}</th>
            </tr>
          </thead>
          <tbody>
            {articles.map((article, index) => (
              <ArticleTableRow
                key={article.article_id}
                article={article}
                index={index}
                onDetailClick={onDetailClick}
              />
            ))}
          </tbody>
        </Table>
      </div>

      {/* 2. CARD LAYOUT (Mobile) */}
      <div className="d-block d-md-none">
        <div className="d-flex flex-column gap-3">
          {articles.map((article, index) => {
            const topicClassName = getTopicClassName(article.primary_topic);
            return (
              <Card
                key={article.article_id}
                onClick={() => onDetailClick(article.article_id)}
                className="article-mobile-card border border-border rounded-card bg-surface transition-shadow hover:shadow-sm"
              >
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="text-muted-foreground text-xs font-mono">#{index + 1}</span>
                    <div className="d-flex gap-1.5 align-items-center">
                      <span className={`article-topic-badge ${topicClassName}`}>
                        {article.primary_topic || t("article.chuaPhanLoai")}
                      </span>
                      {article.is_open_access && (
                        <Badge variant="success" className="text-[11px] font-bold px-1.5 py-0.5">
                          OA
                        </Badge>
                      )}
                    </div>
                  </div>

                  <h6
                    className="text-foreground font-semibold mb-2"
                    style={{ lineHeight: '1.4', fontSize: '14px' }}
                  >
                    <LatexText text={article.title} />
                  </h6>

                  {article.abstract && (
                    <p
                      className="text-muted-foreground text-xs mb-3 text-truncate-2"
                      style={{ fontSize: '13px', lineHeight: '1.4' }}
                    >
                      <LatexText text={article.abstract} />
                    </p>
                  )}

                  <div className="pt-2 border-t border-border flex items-center justify-between flex-wrap gap-2">
                    <div>
                      {article.journal && (
                        <div
                          className="text-primary text-xs font-semibold"
                          style={{ fontSize: '13px' }}
                        >
                          {article.journal.display_name}
                        </div>
                      )}
                      <div
                        className="text-muted-foreground text-xs font-mono mt-0.5"
                        style={{ fontSize: '13px' }}
                      >
                        {t("article.nam2")}{article.publication_year} {article.doi ? `· DOI: ${article.doi}` : ''}
                      </div>
                    </div>
                    <span className="article-action-link flex items-center gap-0.5 text-xs font-medium text-primary">
                      {t("article.chiTiet1")}
                      <Icon icon="lucide:arrow-right" width="12" />
                    </span>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
