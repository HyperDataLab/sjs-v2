import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

export default function RecentProjectsCard({ projects = [], loading, error, onViewAll, onProjectClick }) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const pageSize = 4;
  const totalPages = Math.max(1, Math.ceil(projects.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleProjects = projects.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const labels = { active: t('admin.hoatDong'), new: 'New', paused: t('dashboard.tamDung'), archived: t('dashboard.luuTru'), deleted: 'Deleted' };

  return <Card className="h-full min-w-0">
    <CardHeader className="flex flex-row items-center justify-between gap-3">
      <CardTitle className="flex min-w-0 flex-1 items-center gap-2 leading-snug"><Icon icon="lucide:folder-open" width={16} className="shrink-0 text-primary" /><span>{t('dashboard.projectsGanDay')}</span></CardTitle>
      {onViewAll && <Button variant="ghost" size="sm" onClick={onViewAll} className="shrink-0 text-primary">{t('dashboard.xemTatCa')}</Button>}
    </CardHeader>
    <CardContent>
      {loading ? <div role="status" aria-label={t('common.dangCapNhat', 'Loading')} className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-14 animate-pulse rounded-lg bg-slate-100" />)}</div>
        : error ? <div className="py-10 text-center text-sm text-red-600"><Icon icon="lucide:alert-circle" width={28} className="mx-auto mb-2" />{error}</div>
        : projects.length === 0 ? <div className="py-10 text-center"><Icon icon="lucide:folder-plus" width={32} className="mx-auto text-slate-400" /><p className="mb-1 mt-3 text-sm font-semibold text-slate-900">{t('dashboard.chuaCoProjectNao')}</p><p className="m-0 text-xs text-slate-500">{t('dashboard.taoProjectDauTienDeBatDauTheoD')}</p></div>
        : <>
          <div className="divide-y divide-slate-100">{visibleProjects.map((project, i) => {
            const name = project.project_name ?? project.name ?? project.title ?? 'Untitled';
            const initials = name.split(' ').filter(Boolean).slice(0, 3).map((word) => word[0].toUpperCase()).join('');
            const status = String(project.status ?? 'active').toLowerCase();
            return <button key={project.project_id ?? project.id ?? i} type="button" onClick={() => onProjectClick?.(project)}
              className="flex w-full min-w-0 items-center gap-3 rounded-lg border-0 bg-transparent px-2 py-3 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-[#0071BC]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">{initials}</span>
              <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-slate-900" title={name}>{name}</span>
                <span className="block truncate text-xs text-slate-500">{project.journal_count ?? project.journals?.length ?? 0} {t('project.tapChi')} · {project.article_count ?? 0} {t('author.baiBao')}</span></span>
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{labels[status] ?? labels.active}</span>
            </button>;
          })}</div>
          {totalPages > 1 && <div className="flex items-center justify-between gap-2 pt-4"><Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>{t('dashboard.truoc')}</Button><span className="text-xs text-slate-500">{t('dashboard.trang')} {currentPage}/{totalPages}</span><Button variant="outline" size="sm" disabled={currentPage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>{t('dashboard.sau')} →</Button></div>}
        </>}
    </CardContent>
  </Card>;
}
