import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

export default function RecentProjectsCard({ projects = [], loading, error, onViewAll, onProjectClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const labels = {
    active: t('admin.hoatDong', 'Active'),
    new: 'New',
    paused: t('dashboard.tamDung', 'Paused'),
    archived: t('dashboard.luuTru', 'Archived'),
    deleted: 'Deleted'
  };

  return (
    <Card className="h-full min-w-0 flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-2.5 border-b border-border px-4 py-2.5">
        <CardTitle className="flex min-w-0 flex-1 items-center gap-2 text-xs sm:text-sm font-semibold leading-snug text-foreground">
          <Icon icon="lucide:folder-open" width={16} className="shrink-0 text-primary" />
          <span>{t('dashboard.projectsGanDay')}</span>
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="shrink-0 text-[11px] text-primary font-semibold h-7 px-2">
            {t('dashboard.xemTatCa')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-3.5 flex-1 flex flex-col justify-between">
        {loading ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-11 animate-pulse rounded-md bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="py-6 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={22} className="mx-auto mb-1.5" />
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-6 text-center flex flex-col items-center justify-center my-auto">
            <div className="size-9 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-2">
              <Icon icon="lucide:folder-plus" width={18} />
            </div>
            <p className="mb-0.5 text-xs font-semibold text-foreground">
              {t('dashboard.chuaCoProjectNao')}
            </p>
            <p className="m-0 text-[11px] text-muted-foreground mb-3 max-w-xs">
              {t('dashboard.taoProjectDauTienDeBatDauTheoD')}
            </p>
            <Button size="sm" onClick={() => navigate('/projects/create')} className="gap-1.5 text-xs h-8">
              <Icon icon="lucide:plus" width={13} />
              <span>{t('dashboard.taoProject', 'Create Project')}</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="divide-y divide-border/50">
              {visibleProjects.map((project, i) => {
                const name = project.project_name ?? project.name ?? project.title ?? 'Untitled';
                const initials = name
                  .split(' ')
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((word) => word[0].toUpperCase())
                  .join('');
                const status = String(project.status ?? 'active').toLowerCase();

                return (
                  <button
                    key={project.project_id ?? project.id ?? i}
                    type="button"
                    onClick={() => onProjectClick?.(project)}
                    className="flex w-full min-w-0 items-center gap-2.5 rounded-md border-0 bg-transparent px-1.5 py-2 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary-subtle text-[11px] font-bold text-primary">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-foreground" title={name}>
                        {name}
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground mt-0.5">
                        {project.journal_count ?? project.journals?.length ?? 0} {t('project.tapChi')} · {project.article_count ?? 0} {t('author.baiBao')}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-muted border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {labels[status] ?? labels.active}
                    </span>
                  </button>
                );
              })}

              {visibleProjects.length < 3 && (
                <button
                  type="button"
                  onClick={() => navigate('/projects/create')}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border py-2 text-[11px] font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary-subtle transition-colors"
                >
                  <Icon icon="lucide:plus" width={13} />
                  <span>{t('dashboard.taoProjectMoi', 'Create New Project')}</span>
                </button>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-border mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-[11px] h-7 px-2"
                >
                  {t('dashboard.truoc')}
                </Button>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="text-[11px] h-7 px-2"
                >
                  {t('dashboard.sau')} →
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
