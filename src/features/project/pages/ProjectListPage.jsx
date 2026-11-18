import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import ProjectCard from '../components/ProjectCard';
import EmptyState from '../../../shared/components/EmptyState';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import { Icon } from '@iconify/react';
import { Modal } from 'react-bootstrap';
import { Button } from '../../../shared/ui/button';
import { Alert } from '../../../shared/ui/alert';
import useAuth from '../../auth/hooks/useAuth';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';

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
  const [recentIds, setRecentIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmModal, setConfirmModal] = useState({ show: false, projectId: null, action: null });
  const { t } = useTranslation();
  const auth = useAuth();
  const currentUser = auth?.user;

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

  const handleDelete = async (id) => {
    setConfirmModal({ show: true, projectId: id, action: 'delete' });
  };

  const executeDelete = async () => {
    if (!confirmModal.projectId) return;
    const id = confirmModal.projectId;
    setConfirmModal({ show: false, projectId: null, action: null });
    try {
      await deleteProject(id);

      // Xóa khỏi danh sách xem gần đây
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

  const handleRestore = async (id) => {
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

  const activeProjects = projects.filter((p) => p.status !== 'DELETED');
  
  // Lọc theo từ khóa tìm kiếm nếu có
  const filteredProjects = activeProjects.filter((p) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = (p.title || '').toLowerCase().includes(term);
    const areaMatch = (p.subject_area?.name || p.subject_area || '').toLowerCase().includes(term);
    const keywordMatch = (p.watch_keywords || []).some((kw) => (kw.keyword || kw || '').toLowerCase().includes(term));
    return titleMatch || areaMatch || keywordMatch;
  });

  // Lọc các dự án xem gần đây từ danh sách active projects
  const recentProjects = recentIds
    .map((id) => activeProjects.find((p) => (p.project_id || p.id) === id))
    .filter(Boolean);

  return (
    <PageContainer className="py-6">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="flex items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
          <li>
            <Link to={ROUTES.DASHBOARD} className="no-underline text-muted-foreground hover:text-primary transition-colors">
              {t("author.tongQuan")}
            </Link>
          </li>
          <li aria-hidden="true" className="select-none">/</li>
          <li className="font-medium text-foreground" aria-current="page">
            {t("project.duAnTheoDoi")}
          </li>
        </ol>
      </nav>

      {/* Page Header */}
      <PageHeader
        className="mb-6 border-0 pb-0"
        title={t("project.duAnNghienCuuCuaToi")}
        description={t("project.quanLyCacKeywordWatchlistsPhan")}
        actions={
          <Button onClick={() => navigate(ROUTES.PROJECT_CREATE)}>
            <Icon icon="lucide:plus" width="16" aria-hidden="true" />
            <span>{t("journal.taoDuAnMoi")}</span>
          </Button>
        }
      />

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-border">
        <div className="relative w-full sm:max-w-xs">
          <Icon
            icon="lucide:search"
            width="16"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            className="w-full h-10 pl-9 pr-4 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
            placeholder={t("project.timKiemDuAn")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {t("project.tongSoDuAn")}{" "}
            <strong className="font-semibold text-foreground">{activeProjects.length}</strong>
          </span>
          <span>
            {t("project.dangHoatDong")}{" "}
            <strong className="font-semibold text-success">
              {activeProjects.filter((p) => p.status === 'ACTIVE').length}
            </strong>
          </span>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <Alert variant="destructive" className="mb-6 items-center">
          <Icon icon="lucide:alert-triangle" width="20" className="shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <h4 className="font-semibold text-base mb-1">{t("article.loiTaiDuLieu")}</h4>
            <p className="text-xs text-muted-foreground m-0">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            {t("article.thuLai")}
          </Button>
        </Alert>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-card border border-border bg-surface p-4">
              <LoadingSkeleton height="20px" width="40%" className="mb-3 rounded-control" />
              <LoadingSkeleton height="24px" width="80%" className="mb-4 rounded-control" />
              <LoadingSkeleton height="14px" width="60%" className="mb-2 rounded-control" />
              <LoadingSkeleton height="14px" width="50%" className="mb-4 rounded-control" />
              <LoadingSkeleton height="1px" width="100%" className="mb-3 rounded-control" />
              <div className="flex justify-between items-center mt-auto pt-2">
                <LoadingSkeleton height="14px" width="40%" className="rounded-control" />
                <LoadingSkeleton height="14px" width="20%" className="rounded-control" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          title={t("project.banChuaCoDuAnNao")}
          description={t("project.taoDuAnDauTienDeBatDauTheoDoiT")}
          icon="lucide:folder-open"
          actionLabel="+ Tạo dự án mới"
          onAction={() => navigate(ROUTES.PROJECT_CREATE)}
          className="mt-4"
        />
      ) : (
        <div className="flex flex-col gap-8">
          {/* Section: Dự án xem gần đây */}
          {recentProjects.length > 0 && !searchTerm && (
            <div>
              <h3 className="m-0 mb-3.5 flex items-center gap-2 text-base font-semibold text-foreground">
                <Icon icon="lucide:clock" width="18" className="text-primary" aria-hidden="true" />
                <span>{t("project.duAnXemGanDay")}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {recentProjects.map((project) => (
                  <ProjectCard
                    key={`recent-${project.project_id || project.id}`}
                    project={project}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    isRecent={true}
                    currentUser={currentUser}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section: Tất cả dự án */}
          <div>
            <h3 className="m-0 mb-3.5 flex items-center gap-2 text-base font-semibold text-foreground">
              <Icon icon="lucide:folder" width="18" className="text-primary" aria-hidden="true" />
              <span>
                {t("project.tatCaDuAn")} ({filteredProjects.length})
              </span>
            </h3>
            {filteredProjects.length === 0 ? (
              <EmptyState
                title={t("common.khongTimThayKetQuaPhuHop", "Không tìm thấy kết quả phù hợp")}
                description={t("project.thuTimKiemVoiTuKhoaKhac", "Thử tìm kiếm với từ khóa khác")}
                icon="lucide:search-x"
                className="mt-2"
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.project_id || project.id}
                    project={project}
                    onDelete={handleDelete}
                    onRestore={handleRestore}
                    currentUser={currentUser}
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
              ? t("project.xacNhanXoaDuAn", "Xác nhận xóa dự án")
              : "Xác nhận khôi phục dự án"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-3">
          <p className="text-sm text-muted-foreground m-0">
            {confirmModal.action === 'delete'
              ? (t("project.banCoChacMuonXoaDuAnNayHanhDon") || "Bạn có chắc muốn xóa dự án này? Hành động này không thể hoàn tác.")
              : "Bạn có chắc muốn khôi phục dự án này?"}
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 gap-2">
          <Button
            variant="outline"
            onClick={() => setConfirmModal({ show: false, projectId: null, action: null })}
          >
            {t("admin.huy", "Hủy bỏ")}
          </Button>
          <Button
            variant={confirmModal.action === 'delete' ? 'destructive' : 'default'}
            onClick={confirmModal.action === 'delete' ? executeDelete : executeRestore}
          >
            {confirmModal.action === 'delete' ? t("project.xoaDuAn") : "Khôi phục"}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageContainer>
  );
};

export default ProjectListPage;
