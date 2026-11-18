import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import { Icon } from '@iconify/react';
import { Modal } from 'react-bootstrap';
import { Button } from '../../../shared/ui/button';
import { Skeleton } from '../../../shared/ui/skeleton';
import { StatePanel } from '../../../shared/ui/state-panel';
import { Card } from '../../../shared/ui/card';
import useAuth from '../../auth/hooks/useAuth';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { getSubjectAreasApi } from '../../catalog/api/catalogApi';

const ProjectListPage = () => {
  const navigate = useNavigate();
  const {
    projects,
    isLoading,
    error,
    deleteProject,
    restoreProject,
    refetch,
  } = useProjects();
  const [areas, setAreas] = useState([]);
  const [recentIds, setRecentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'DELETED'
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'oldest' | 'title' | 'keywords'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [confirmModal, setConfirmModal] = useState({ show: false, projectId: null, action: null });
  const { t } = useTranslation();
  const auth = useAuth();
  const currentUser = auth?.user;

  // Preload subject areas catalogue for clean label mapping
  useEffect(() => {
    let isMounted = true;
    getSubjectAreasApi({ limit: 100 })
      .then((res) => {
        if (!isMounted) return;
        const list = res?.data?.data?.items || res?.data?.data || res?.data || [];
        if (Array.isArray(list)) setAreas(list);
      })
      .catch((err) => {
        console.warn('Could not preload subject areas catalogue:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Read recently viewed project IDs from local storage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('recently_viewed_projects');
      if (raw) {
        setRecentIds(JSON.parse(raw));
      }
    } catch (e) {
      console.error(t("project.loiDocDuAnXemGanDay"), e);
    }
  }, [t]);

  const handleDelete = (id) => {
    setConfirmModal({ show: true, projectId: id, action: 'delete' });
  };

  const executeDelete = async () => {
    if (!confirmModal.projectId) return;
    const id = confirmModal.projectId;
    setConfirmModal({ show: false, projectId: null, action: null });
    try {
      await deleteProject(id);
      const storageKey = 'recently_viewed_projects';
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const list = JSON.parse(raw).filter((recentId) => String(recentId) !== String(id));
        localStorage.setItem(storageKey, JSON.stringify(list));
        setRecentIds(list);
      }
    } catch (err) {
      alert(err.message || t("project.khongTheXoaDuAn"));
    }
  };

  const handleRestore = (id) => {
    setConfirmModal({ show: true, projectId: id, action: 'restore' });
  };

  const executeRestore = async () => {
    if (!confirmModal.projectId) return;
    const id = confirmModal.projectId;
    setConfirmModal({ show: false, projectId: null, action: null });
    try {
      await restoreProject(id);
    } catch (err) {
      alert(err.message || "Không thể khôi phục dự án");
    }
  };

  // KPI Calculations
  const nonDeletedProjects = useMemo(() => projects.filter((p) => p.status !== 'DELETED'), [projects]);
  const deletedProjects = useMemo(() => projects.filter((p) => p.status === 'DELETED'), [projects]);
  const activeProjectsCount = useMemo(
    () => nonDeletedProjects.filter((p) => p.status === 'ACTIVE' || (!p.status && p.status !== 'INACTIVE')).length,
    [nonDeletedProjects]
  );
  const totalKeywordsMonitored = useMemo(() => {
    return nonDeletedProjects.reduce((sum, p) => {
      const count = p.keywords_count || p.watch_keywords?.length || 0;
      return sum + count;
    }, 0);
  }, [nonDeletedProjects]);

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    return projects
      .filter((p) => {
        if (statusFilter === 'ACTIVE') {
          return p.status === 'ACTIVE' || (p.status !== 'DELETED' && p.status !== 'INACTIVE');
        }
        if (statusFilter === 'DELETED') {
          return p.status === 'DELETED';
        }
        return p.status !== 'DELETED';
      })
      .filter((p) => {
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase();
        const titleMatch = (p.title || '').toLowerCase().includes(term);
        const areaStr =
          (typeof p.subject_area === 'object' ? p.subject_area?.name || p.subject_area?.display_name : p.subject_area) || '';
        const areaMatch = String(areaStr).toLowerCase().includes(term);
        const keywordMatch = (p.watch_keywords || []).some((kw) => (kw.keyword || kw || '').toLowerCase().includes(term));
        return titleMatch || areaMatch || keywordMatch;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
        if (sortBy === 'keywords') {
          const countA = a.keywords_count || a.watch_keywords?.length || 0;
          const countB = b.keywords_count || b.watch_keywords?.length || 0;
          return countB - countA;
        }
        return 0;
      });
  }, [projects, statusFilter, searchTerm, sortBy]);

  // Recent projects
  const recentProjects = useMemo(() => {
    return recentIds
      .map((id) => nonDeletedProjects.find((p) => String(p.project_id || p.id) === String(id)))
      .filter(Boolean);
  }, [recentIds, nonDeletedProjects]);

  return (
    <PageContainer className="py-6 space-y-6">
      {/* 1. Header with Breadcrumb & Primary Action */}
      <PageHeader
        breadcrumbs={[
          { label: t("navigation.workspace", "Workspace"), to: ROUTES.DASHBOARD },
          { label: t("navigation.projects", "Research Projects") }
        ]}
        title={t("project.duAnNghienCuuCuaToi", "My Research Projects")}
        description={t("project.quanLyCacKeywordWatchlistsPhan", "Manage keyword watchlists, monitor scientific publication trends and collaborate with research peers.")}
        actions={
          <Button onClick={() => navigate(ROUTES.PROJECT_CREATE)} className="flex items-center gap-2 shadow-xs">
            <Icon icon="lucide:plus" width="16" aria-hidden="true" />
            <span>{t("common.newProject", "+ New Project")}</span>
          </Button>
        }
      />

      {/* 2. KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Projects */}
        <Card className="p-4 flex items-center justify-between border-border bg-surface transition-all hover:border-primary/40 hover:shadow-card">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground m-0">
              {t("project.tongSoDuAnNgan", "Total Projects")}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground m-0 leading-tight">
              {nonDeletedProjects.length}
            </p>
            <p className="text-xs text-muted-foreground m-0">
              {t("project.trongKhongGian", "In your workspace")}
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-control bg-primary-subtle text-primary shrink-0">
            <Icon icon="lucide:folder-kanban" width="24" aria-hidden="true" />
          </div>
        </Card>

        {/* Active Monitoring */}
        <Card className="p-4 flex items-center justify-between border-border bg-surface transition-all hover:border-success/40 hover:shadow-card">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground m-0">
              {t("project.dangHoatDongNgan", "Active Projects")}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-success m-0 leading-tight">
              {activeProjectsCount}
            </p>
            <p className="text-xs text-muted-foreground m-0">
              {t("project.dangDongBoDuLieu", "Live feeds enabled")}
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-control bg-success-subtle text-success shrink-0">
            <Icon icon="lucide:activity" width="24" aria-hidden="true" />
          </div>
        </Card>

        {/* Monitored Keywords */}
        <Card className="p-4 flex items-center justify-between border-border bg-surface transition-all hover:border-primary/40 hover:shadow-card">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground m-0">
              {t("project.tuKhoaTheoDoiNgan", "Monitored Keywords")}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground m-0 leading-tight">
              {totalKeywordsMonitored}
            </p>
            <p className="text-xs text-muted-foreground m-0">
              {t("project.trenMoiWatchlist", "Across all watchlists")}
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-control bg-primary-subtle text-primary shrink-0">
            <Icon icon="lucide:hash" width="24" aria-hidden="true" />
          </div>
        </Card>

        {/* Collaborations */}
        <Card className="p-4 flex items-center justify-between border-border bg-surface transition-all hover:border-primary/40 hover:shadow-card">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground m-0">
              {t("project.thanhVienCongTac", "Collaborations")}
            </p>
            <p className="text-3xl font-extrabold tracking-tight text-foreground m-0 leading-tight">
              {nonDeletedProjects.filter((p) => (p.members?.length || 0) > 0).length}
            </p>
            <p className="text-xs text-muted-foreground m-0">
              {t("project.duAnChiaSe", "Shared with peers")}
            </p>
          </div>
          <div className="flex size-12 items-center justify-center rounded-control bg-surface-muted text-muted-foreground shrink-0">
            <Icon icon="lucide:users" width="24" aria-hidden="true" />
          </div>
        </Card>
      </div>

      {/* 3. Toolbar: Search Bar + Status Filter Tabs + Sort Dropdown + View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-border">
        {/* Left: Search input & Status Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 min-w-0">
          {/* Search Box */}
          <div className="relative w-full sm:max-w-xs">
            <Icon
              icon="lucide:search"
              width="16"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              aria-hidden="true"
            />
            <input
              type="text"
              className="w-full h-9 pl-9 pr-8 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
              placeholder={t("project.timKiemDuAn", "Search projects, fields, keywords...")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <Icon icon="lucide:x" width="14" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center rounded-control bg-surface-muted p-0.5 border border-border/60 self-start sm:self-auto text-xs">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-control font-medium transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-surface text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('common.all', 'All')} ({nonDeletedProjects.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-control font-medium transition-all ${
                statusFilter === 'ACTIVE'
                  ? 'bg-surface text-foreground shadow-xs font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('project.dangHoatDong', 'Active')} ({activeProjectsCount})
            </button>
            {deletedProjects.length > 0 && (
              <button
                type="button"
                onClick={() => setStatusFilter('DELETED')}
                className={`px-3 py-1.5 rounded-control font-medium transition-all ${
                  statusFilter === 'DELETED'
                    ? 'bg-surface text-danger shadow-xs font-semibold'
                    : 'text-muted-foreground hover:text-danger'
                }`}
              >
                {t('project.daXoa', 'Deleted')} ({deletedProjects.length})
              </button>
            )}
          </div>
        </div>

        {/* Right: Sort Dropdown & View Mode Switcher */}
        <div className="flex items-center gap-2.5 self-end lg:self-auto">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Icon icon="lucide:arrow-up-down" width="14" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-2.5 rounded-control border border-border bg-surface text-xs font-medium text-foreground focus-visible:outline-none focus-visible:border-primary cursor-pointer"
            >
              <option value="newest">{t('common.newestFirst', 'Newest first')}</option>
              <option value="oldest">{t('common.oldestFirst', 'Oldest first')}</option>
              <option value="title">{t('common.titleAZ', 'Name (A - Z)')}</option>
              <option value="keywords">{t('common.mostKeywords', 'Most keywords')}</option>
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center rounded-control bg-surface-muted p-0.5 border border-border/60">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-control transition-all ${
                viewMode === 'grid'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={t('common.gridView', 'Grid view')}
              aria-label={t('common.gridView', 'Grid view')}
            >
              <Icon icon="lucide:layout-grid" width="16" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-control transition-all ${
                viewMode === 'list'
                  ? 'bg-surface text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title={t('common.listView', 'List view')}
              aria-label={t('common.listView', 'List view')}
            >
              <Icon icon="lucide:list" width="16" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Content Area */}
      {error ? (
        <StatePanel
          variant="error"
          title={t("article.loiTaiDuLieu", "Error Loading Projects")}
          description={error}
          action={{
            label: t("article.thuLai", "Try again"),
            onClick: () => refetch(),
          }}
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <Skeleton className="h-5 w-28 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-6 w-3/4" />
              <div className="space-y-2">
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-border">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <StatePanel
          variant="neutral"
          icon={<Icon icon="lucide:folder-open" width="40" className="text-muted-foreground" />}
          title={t("project.banChuaCoDuAnNao", "No Projects Yet")}
          description={t("project.taoDuAnDauTienDeBatDauTheoDoiT", "Create your first project to start monitoring keywords and tracking scientific journals.")}
          action={{
            label: t("journal.taoDuAnMoi", "+ Create New Project"),
            onClick: () => navigate(ROUTES.PROJECT_CREATE),
          }}
        />
      ) : (
        <div className="space-y-8">
          {/* Section: Recently Accessed Projects (only display when there are multiple projects to avoid duplication) */}
          {recentProjects.length > 0 && !searchTerm && statusFilter === 'ALL' && nonDeletedProjects.length > 3 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="m-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <Icon icon="lucide:history" width="16" className="text-primary" aria-hidden="true" />
                  <span>{t("project.duAnXemGanDay", "Recent Projects")}</span>
                </h3>
                <span className="text-xs text-muted-foreground">
                  {recentProjects.length} {t("common.projects", "projects")}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={`recent-${project.project_id || project.id}`}
                    project={project}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    isRecent={true}
                    currentUser={currentUser}
                    areas={areas}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Filtered / All Projects */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="m-0 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <Icon icon="lucide:folder-kanban" width="16" className="text-primary" aria-hidden="true" />
                <span>
                  {statusFilter === 'DELETED'
                    ? t("project.duAnDaXoa", "Deleted Projects")
                    : t("project.tatCaDuAn", "All Projects")}
                </span>
                <span className="rounded-full bg-surface-muted px-2 py-0.5 text-xs font-semibold text-foreground border border-border">
                  {filteredAndSortedProjects.length}
                </span>
              </h3>
            </div>

            {filteredAndSortedProjects.length === 0 ? (
              <StatePanel
                variant="neutral"
                icon={<Icon icon="lucide:search-x" width="36" className="text-muted-foreground" />}
                title={t("common.khongTimThayKetQuaPhuHop", "No matching projects found")}
                description={t("project.thuTimKiemVoiTuKhoaKhac", "Try adjusting your search terms or filters.")}
                action={
                  searchTerm
                    ? {
                        label: t("common.clearSearch", "Clear search"),
                        onClick: () => setSearchTerm(''),
                      }
                    : undefined
                }
              />
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.project_id || project.id}
                    project={project}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    currentUser={currentUser}
                    areas={areas}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filteredAndSortedProjects.map((project) => (
                  <ProjectCard
                    key={project.project_id || project.id}
                    project={project}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    currentUser={currentUser}
                    areas={areas}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        show={confirmModal.show}
        onHide={() => setConfirmModal({ show: false, projectId: null, action: null })}
        centered
      >
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="text-base font-semibold text-foreground">
            {confirmModal.action === 'delete'
              ? t("project.xacNhanXoaDuAn", "Confirm Project Deletion")
              : t("project.xacNhanKhoiPhuc", "Confirm Project Restoration")}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-sm text-muted-foreground m-0">
            {confirmModal.action === 'delete'
              ? (t("project.banCoChacMuonXoaDuAnNayHanhDon") || "Are you sure you want to delete this project? You can restore it later from the deleted filter.")
              : t("project.banCoChacMuonKhoiPhuc", "Are you sure you want to restore this project?")}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModal({ show: false, projectId: null, action: null })}
          >
            {t("admin.huy", "Cancel")}
          </Button>
          <Button
            variant={confirmModal.action === 'delete' ? 'destructive' : 'default'}
            onClick={confirmModal.action === 'delete' ? executeDelete : executeRestore}
          >
            {confirmModal.action === 'delete' ? t("project.xoaDuAn", "Delete Project") : t("project.khoiPhucDuAn", "Restore Project")}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
};

export default ProjectListPage;