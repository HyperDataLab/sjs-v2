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
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-5 py-4">
        <CardTitle className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:text-base font-semibold leading-snug text-foreground">
          <Icon icon="lucide:folder-open" width={18} className="shrink-0 text-primary" />
          <span>{t('dashboard.projectsGanDay')}</span>
        </CardTitle>
        {onViewAll && (
          <Button variant="ghost" size="sm" onClick={onViewAll} className="shrink-0 text-xs text-primary font-semibold">
            {t('dashboard.xemTatCa')}
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        {loading ? (
          <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : error ? (
          <div className="py-8 text-center text-xs text-danger">
            <Icon icon="lucide:alert-circle" width={28} className="mx-auto mb-2" />
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center justify-center my-auto">
            <div className="size-12 rounded-full bg-primary-subtle text-primary flex items-center justify-center mb-3">
              <Icon icon="lucide:folder-plus" width={24} />
            </div>
            <p className="mb-1 text-sm font-semibold text-foreground">
              {t('dashboard.chuaCoProjectNao')}
            </p>
            <p className="m-0 text-xs text-muted-foreground mb-4 max-w-xs">
              {t('dashboard.taoProjectDauTienDeBatDauTheoD')}
            </p>
            <Button size="sm" onClick={() => navigate('/projects/create')} className="gap-1.5">
              <Icon icon="lucide:plus" width={14} />
              <span>{t('dashboard.taoProject', 'Create Project')}</span>
            </Button>
          </div>
        ) : (
          <div className="flex-1 flex flex-col justify-between">
            <div className="divide-y divide-border/60">
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
                    className="flex w-full min-w-0 items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-3 text-left transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-primary"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-xs font-bold text-primary">
                      {initials}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-foreground" title={name}>
                        {name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground mt-0.5">
                        {project.journal_count ?? project.journals?.length ?? 0} {t('project.tapChi')} · {project.article_count ?? 0} {t('author.baiBao')}
                      </span>
                    </span>
                    <span className="shrink-0 rounded-full bg-surface-muted border border-border px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {labels[status] ?? labels.active}
                    </span>
                  </button>
                );
              })}

              {visibleProjects.length < 3 && (
                <button
                  type="button"
                  onClick={() => navigate('/projects/create')}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-xs font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary-subtle transition-colors"
                >
                  <Icon icon="lucide:plus" width={15} />
                  <span>{t('dashboard.taoProjectMoi', 'Create New Project')}</span>
                </button>
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs"
                >
                  {t('dashboard.truoc')}
                </Button>
                <span className="text-xs text-muted-foreground font-mono">
                  {t('dashboard.trang')} {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="text-xs"
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
