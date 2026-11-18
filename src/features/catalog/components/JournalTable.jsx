import { useTranslation } from "react-i18next";
import { Table } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../../shared/ui/badge';

export default function JournalTable({
  journals = [],
  followedJournals = {},
  onFollow
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const renderAccessBadge = (journal) => {
    if (journal.is_open_access) {
      return (
        <Badge variant="success" className="text-xs font-medium">
          Open Access
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs font-medium text-muted-foreground">
        Subscription
      </Badge>
    );
  };

  const renderQuartileBadge = (quartile = '') => {
    if (!quartile) return '—';
    if (quartile === 'Q1') {
      return (
        <Badge variant="success" className="text-xs font-bold px-2 py-0.5">
          Q1
        </Badge>
      );
    }
    if (quartile === 'Q2') {
      return (
        <Badge variant="info" className="text-xs font-bold px-2 py-0.5">
          Q2
        </Badge>
      );
    }
    if (quartile === 'Q3') {
      return (
        <Badge variant="warning" className="text-xs font-bold px-2 py-0.5">
          Q3
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
        {quartile}
      </Badge>
    );
  };

  return (
    <section className="catalog-surface catalog-table-card rounded-card border border-border bg-surface shadow-sm">
      <div className="table-responsive">
        <Table hover className="catalog-table align-middle mb-0 text-start">
          <thead>
            <tr className="border-b border-border text-xs text-muted-foreground uppercase font-semibold">
              <th className="px-4 py-3">Journal</th>
              <th className="px-3 py-3">ISSN</th>
              <th className="px-3 py-3">Publisher</th>
              <th className="px-3 py-3">Country</th>
              <th className="px-3 py-3">Quartile</th>
              <th className="px-3 py-3">Metric</th>
              <th className="px-3 py-3">Year</th>
              <th className="px-3 py-3">Access</th>
              <th className="px-4 py-3 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((journal) => {
              const id = journal.id || journal.journal_id;
              const isFollowed = !!followedJournals[id];
              return (
                <tr
                  key={id}
                  onClick={() => navigate(`/journals/${id}`)}
                  className="cursor-pointer transition-colors hover:bg-surface-muted/50"
                >
                  <td className="px-4 py-3">
                    <div className="catalog-journal-name font-semibold text-foreground hover:text-primary transition-colors text-sm">
                      {journal.display_name}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-muted-custom catalog-mono text-xs">
                    {journal.issn || '—'}
                  </td>
                  <td className="px-3 py-3 text-main text-xs">
                    {journal.publisher || '—'}
                  </td>
                  <td className="px-3 py-3 text-main text-xs">
                    {journal.country || '—'}
                  </td>
                  <td className="px-3 py-3">
                    {renderQuartileBadge(journal.quartile)}
                  </td>
                  <td className="px-3 py-3 font-semibold text-main catalog-mono text-xs">
                    {journal.metric_value ?? '—'}
                  </td>
                  <td className="px-3 py-3 text-main text-xs">
                    {journal.metric_year || '—'}
                  </td>
                  <td className="px-3 py-3">
                    {renderAccessBadge(journal)}
                  </td>
                  <td className="px-4 py-3 text-end">
                    <div className="d-inline-flex align-items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onFollow(id);
                        }}
                        className={`catalog-follow-btn ${isFollowed ? 'is-followed' : ''}`}
                      >
                        <Icon icon={isFollowed ? 'lucide:check' : 'lucide:plus'} width="13" />
                        <span>{isFollowed ? t("catalog.daTheoDoi") : t("catalog.theoDoi")}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </section>
  );
}
