import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card, CardHeader, CardContent } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

const ProjectCard = ({
  project,
  onDelete,
  onRestore,
  isRecent = false,
  currentUser = null,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const projectId = project.project_id || project.id;
  const title = project.title || 'Untitled Project';
  const areaName = project.subject_area?.name || project.subject_area || t('project.chuaXacDinhLinhVuc');
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  const keywordCount = project.keywords_count || project.watch_keywords?.length || 0;
  const isDeleted = project.status === 'DELETED';

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(projectId);
  };

  const handleRestore = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRestore) onRestore(projectId);
  };

  const handleCardClick = () => {
    try {
      const storageKey = 'recently_viewed_projects';
      const raw = localStorage.getItem(storageKey);
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter((id) => id !== projectId);
      list.unshift(projectId);
      list = list.slice(0, 3);
      localStorage.setItem(storageKey, JSON.stringify(list));
    } catch (e) {
      console.error(t('project.loiLuuDuAnXemGanDay'), e);
    }
  };

  const getInitials = (first, last, email) => {
    if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
    if (email) return email.substring(0, 2).toUpperCase();
    return 'U';
  };

  const renderAvatarGroup = () => {
    const owner = project.owner;
    const members = project.members || [];
    const allUsers = [];
    if (owner) allUsers.push({ ...owner, isOwner: true });
    members.forEach((m) => allUsers.push(m));

    if (allUsers.length === 0) return null;

    const maxDisplay = 3;
    const displayUsers = allUsers.slice(0, maxDisplay);
    const extraCount = allUsers.length - maxDisplay;

    const handleMembersClick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleCardClick();
      navigate(`/projects/${projectId}?tab=members`);
    };

    return (
      <button
        type="button"
        className="inline-flex items-center border-0 bg-transparent p-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-primary rounded-full"
        onClick={handleMembersClick}
        title={t('project.quanLyThanhVien', 'Quản lý thành viên')}
        aria-label={t('project.quanLyThanhVien', 'Quản lý thành viên')}
      >
        <span className="flex items-center -space-x-2">
          {displayUsers.map((u, idx) => (
            <span
              key={idx}
              className={`inline-flex size-6.5 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-surface text-white shadow-xs ${
                u.isOwner ? 'bg-primary' : 'bg-muted-foreground'
              }`}
              title={`${u.first_name || ''} ${u.last_name || ''} ${u.isOwner ? '(Owner)' : ''}`}
            >
              {getInitials(u.first_name, u.last_name, u.email)}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex size-6.5 items-center justify-center rounded-full bg-surface-muted text-xs font-medium text-muted-foreground ring-2 ring-surface shadow-xs">
              +{extraCount}
            </span>
          )}
        </span>
      </button>
    );
  };

  // Compact recent project card
  if (isRecent) {
    return (
      <Link
        to={`/projects/${projectId}`}
        className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
        onClick={handleCardClick}
      >
        <Card className="flex h-full items-center gap-3.5 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-subtle/30 hover:shadow-card">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Icon icon="lucide:folder-open" width="20" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 truncate text-base font-semibold text-foreground transition-colors group-hover:text-primary">
              {title}
            </h3>
            <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="truncate rounded-sm bg-surface-muted px-1.5 py-0.5 font-medium text-foreground">
                {areaName}
              </span>
              <span className="shrink-0">• {createdAt}</span>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary">
            <Icon icon="lucide:chevron-right" width="18" aria-hidden="true" />
          </div>
        </Card>
      </Link>
    );
  }

  // Check ownership
  const currentUserId = currentUser?.user_id || currentUser?.id;
  const isOwner =
    project.user_role === 'OWNER' ||
    (currentUser &&
      ((project.user_id && project.user_id === currentUserId) ||
        (project.owner && project.owner.user_id === currentUserId) ||
        (project.owner_id && project.owner_id === currentUserId)));

  return (
    <Link
      to={`/projects/${projectId}`}
      className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
      onClick={handleCardClick}
    >
      <Card className="flex h-full flex-col justify-between p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card">
        <div>
          {/* Header row: badge and actions */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Badge variant="secondary" className="font-medium text-xs">
                {areaName}
              </Badge>
              {isDeleted && (
                <Badge variant="destructive" className="font-medium text-xs">
                  {t('project.daXoa', 'Đã xóa')}
                </Badge>
              )}
            </div>

            {isOwner && (
              <div className="flex items-center gap-1 shrink-0 -mr-1.5 -mt-1.5">
                {isDeleted ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-success hover:bg-success-subtle hover:text-success"
                    onClick={handleRestore}
                    title={t('project.khoiPhucDuAn', 'Khôi phục dự án')}
                    aria-label={t('project.khoiPhucDuAn', 'Khôi phục dự án')}
                  >
                    <Icon icon="lucide:refresh-cw" width="16" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-danger-subtle hover:text-danger"
                    onClick={handleDelete}
                    title={t('project.xoaDuAn', 'Xóa dự án')}
                    aria-label={t('project.xoaDuAn', 'Xóa dự án')}
                  >
                    <Icon icon="lucide:trash-2" width="16" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Title */}
          <h3 className="m-0 mb-3 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
            {title}
          </h3>

          {/* Keywords */}
          {keywordCount > 0 && (
            <div className="mb-4">
              <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {t('project.tuKhoaTheoDoi')} ({keywordCount}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {project.watch_keywords?.slice(0, 3).map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-control border border-border bg-surface-muted px-2 py-0.5 text-xs text-foreground"
                  >
                    {kw.keyword || kw}
                  </span>
                ))}
                {keywordCount > 3 && (
                  <span className="inline-flex items-center rounded-control border border-border bg-surface-muted px-2 py-0.5 text-xs text-muted-foreground">
                    +{keywordCount - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {renderAvatarGroup()}
            <div className="min-w-0 flex flex-col justify-center leading-tight">
              <span className="truncate text-xs text-muted-foreground">
                Tạo bởi <strong className="font-medium text-foreground">{project.owner?.last_name || 'Admin'}</strong>
              </span>
              <span className="text-xs text-muted-foreground">{createdAt}</span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 shrink-0 text-xs font-medium text-primary group-hover:underline">
            {t('article.chiTiet1')}
            <Icon icon="lucide:arrow-right" width="14" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;
