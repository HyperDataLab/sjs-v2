import { useTranslation } from "react-i18next";
import { useNavigate } from 'react-router-dom';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import AuthorAvatar from './AuthorAvatar';

export default function AuthorCard({ author }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  if (!author) return null;

  const id = author.author_id ?? author.id;
  const name = author.display_name ?? author.full_name ?? author.name ?? t("typeAuthor");
  const institution1 = author.institution_1 ?? author.affiliation ?? author.institution ?? '—';
  const institution2 = author.institution_2 ?? author.department ?? '';
  const hIndex = author.h_index ?? author.hindex ?? 0;
  const citations = author.citation_count ?? author.citations ?? 0;
  const articlesCount = author.article_count ?? author.papers ?? 0;
  const tags = Array.isArray(author.subject_areas) ? author.subject_areas : author.subject_area ? [author.subject_area] : [];
  const avatarUrl = author.url_image || author.avatar_url || '';
  const avatarColor = author.avatar_color ?? '#0071BC';

  const formatLocalNumber = (num) => {
    if (num == null) return '0';
    return Number(num).toLocaleString('vi-VN');
  };

  const handleCardClick = () => {
    if (id) navigate(`/authors/${id}`);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      className="group flex h-full flex-col justify-between p-4 cursor-pointer text-left transition-colors border border-border bg-surface hover:border-primary/50 hover:bg-surface-muted/30 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
    >
      <div>
        {/* Header row: avatar + info */}
        <div className="flex items-start gap-3 mb-3.5">
          <AuthorAvatar
            name={name}
            url={avatarUrl}
            size="md"
            bgColor={avatarColor}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="m-0 truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
              {name}
            </h3>
            <span className="block truncate text-xs text-muted-foreground mt-0.5" title={institution1}>
              {institution1}
            </span>
            {institution2 && (
              <span className="block truncate text-xs text-muted-foreground mt-0.5" title={institution2}>
                {institution2}
              </span>
            )}
          </div>
        </div>

        {/* Metrics row */}
        <div className="grid grid-cols-3 gap-2 py-2.5 px-3 rounded-control border border-border bg-surface-muted/50 mb-3.5">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              H-index
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground tabular-nums">
              {hIndex}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("author.trichDan")}
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground tabular-nums">
              {formatLocalNumber(citations)}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {t("articles")}
            </div>
            <div className="mt-0.5 text-sm font-bold text-foreground tabular-nums">
              {formatLocalNumber(articlesCount)}
            </div>
          </div>
        </div>
      </div>

      {/* Footer tags */}
      <div className="border-t border-border pt-3">
        <div className="flex flex-wrap gap-1.5 items-center">
          {tags.length === 0 ? (
            <span className="text-xs italic text-muted-foreground">
              {t("author.chuaCapNhatLinhVuc")}
            </span>
          ) : (
            tags.slice(0, 3).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs font-medium cursor-pointer hover:bg-primary-subtle hover:text-primary transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/catalog?search=${encodeURIComponent(tag)}`);
                }}
              >
                {tag}
              </Badge>
            ))
          )}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}
