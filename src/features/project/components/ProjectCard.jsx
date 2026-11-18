import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { Card } from '../../../shared/ui/card';
import { Badge } from '../../../shared/ui/badge';
import { Button } from '../../../shared/ui/button';

const ProjectCard = ({
  project,
  onDelete,
  onRestore,
  isRecent = false,
  currentUser = null,
  areas = [],
  viewMode = 'grid',
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const projectId = project.project_id || project.id;
  const title = project.title || 'Untitled Project';
  const createdAt = project.created_at ? new Date(project.created_at).toLocaleDateString('vi-VN') : 'N/A';
  const keywordCount = project.keywords_count || project.watch_keywords?.length || 0;
  const isDeleted = project.status === 'DELETED';
  const isActive = project.status === 'ACTIVE' || (!isDeleted && project.status !== 'INACTIVE');

  // Helper: Format subject area name properly (handles numeric ID and object)
  const resolveAreaName = () => {
    if (project.subject_area && typeof project.subject_area === 'object') {
      return project.subject_area.name || project.subject_area.display_name || t('project.chuaXacDinhLinhVuc', 'General Science');
    }
    const rawVal = project.subject_area || project.subject_area_id;
    if (!rawVal) return t('project.chuaXacDinhLinhVuc', 'General Science');
    if (areas?.length) {
      const found = areas.find((a) => String(a.id || a.subject_area_id) === String(rawVal));
      if (found) return found.name || found.display_name;
    }
    if (!isNaN(rawVal)) return `${t('project.linhVuc', 'Field')} #${rawVal}`;
    return String(rawVal);
  };

  const areaName = resolveAreaName();

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

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/projects/${projectId}/edit`);
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
        title={t('project.quanLyThanhVien', 'Manage Members')}
        aria-label={t('project.quanLyThanhVien', 'Manage Members')}
      >
        <span className="flex items-center -space-x-1.5">
          {displayUsers.map((u, idx) => (
            <span
              key={idx}
              className={`inline-flex size-6 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-surface text-white shadow-xs ${
                u.isOwner ? 'bg-primary' : 'bg-muted-foreground'
              }`}
              title={`${u.first_name || ''} ${u.last_name || ''} ${u.isOwner ? '(Owner)' : ''}`}
            >
              {getInitials(u.first_name, u.last_name, u.email)}
            </span>
          ))}
          {extraCount > 0 && (
            <span className="inline-flex size-6 items-center justify-center rounded-full bg-surface-muted text-[10px] font-medium text-muted-foreground ring-2 ring-surface shadow-xs">
              +{extraCount}
            </span>
          )}
        </span>
      </button>
    );
  };

  // Check ownership
  const currentUserId = currentUser?.user_id || currentUser?.id;
  const isOwner =
    project.user_role === 'OWNER' ||
    (currentUser &&
      ((project.user_id && project.user_id === currentUserId) ||
        (project.owner && project.owner.user_id === currentUserId) ||
        (project.owner_id && project.owner_id === currentUserId)));

  const ownerName = project.owner?.first_name || project.owner?.last_name || project.owner?.email?.split('@')[0] || 'Admin';

  // 1. COMPACT RECENT CARD
  if (isRecent) {
    return (
      <Link
        to={`/projects/${projectId}`}
        className="group block h-full no-underline !text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
        onClick={handleCardClick}
      >
        <Card className="flex h-full items-center justify-between p-3.5 transition-all duration-200 border-l-4 border-l-primary hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary-subtle/10 hover:shadow-card">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary">
              <Icon icon="lucide:folder-git-2" width="20" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h4 className="m-0 truncate text-sm font-bold !text-foreground transition-colors group-hover:!text-primary">
                {title}
              </h4>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="truncate rounded-sm bg-surface-muted px-1.5 py-0.5 font-medium text-foreground text-[11px]">
                  {areaName}
                </span>
                <span className="shrink-0 text-[11px]">• {createdAt}</span>
              </div>
            </div>
          </div>
          <div className="shrink-0 pl-2 text-muted-foreground transition-transform duration-200 group-hover:translate-x-1 group-hover:text-primary">
            <Icon icon="lucide:arrow-right" width="16" aria-hidden="true" />
          </div>
        </Card>
      </Link>
    );
  }

  // 2. HORIZONTAL LIST VIEW CARD
  if (viewMode === 'list') {
    return (
      <Link
        to={`/projects/${projectId}`}
        className="group block no-underline !text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
        onClick={handleCardClick}
      >
        <Card className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-4 transition-all duration-200 hover:border-primary/50 hover:bg-surface-muted/20 hover:shadow-card">
          <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-control bg-primary-subtle text-primary mt-0.5 sm:mt-0">
              <Icon icon="lucide:folder-kanban" width="22" aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="m-0 truncate text-sm font-bold !text-foreground transition-colors group-hover:!text-primary">
                  {title}
                </h3>
                <Badge variant="outline" className="text-[11px] font-medium px-2 py-0 border-border text-foreground">
                  {areaName}
                </Badge>
                {isDeleted ? (
                  <Badge variant="destructive" className="text-[11px] py-0">
                    {t('project.daXoa', 'Deleted')}
                  </Badge>
                ) : isActive ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                    <span className="size-1.5 rounded-full bg-success" />
                    {t('project.dangHoatDong', 'Active')}
                  </span>
                ) : (
                  <Badge variant="secondary" className="text-[11px] py-0">
                    {t('project.chuaKichHoat', 'Inactive')}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>
                  {t('project.taoBoi', 'By')} <strong className="font-semibold text-foreground">{ownerName}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:calendar" width="12" /> {createdAt}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Icon icon="lucide:hash" width="12" className="text-primary" />
                  {keywordCount} {t('project.tuKhoa', 'keywords')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
            {renderAvatarGroup()}
            <div className="flex items-center gap-1">
              {isOwner && (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                    onClick={handleEdit}
                    title={t('common.edit', 'Edit Project')}
                  >
                    <Icon icon="lucide:edit-3" width="15" />
                  </Button>
                  {isDeleted ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-success hover:bg-success-subtle hover:text-success"
                      onClick={handleRestore}
                      title={t('project.khoiPhucDuAn', 'Restore Project')}
                    >
                      <Icon icon="lucide:refresh-cw" width="15" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:bg-danger-subtle hover:!text-danger"
                      onClick={handleDelete}
                      title={t('project.xoaDuAn', 'Delete Project')}
                    >
                      <Icon icon="lucide:trash-2" width="15" />
                    </Button>
                  )}
                </>
              )}
              <span className="inline-flex items-center gap-1 text-xs font-semibold !text-primary pl-2 group-hover:translate-x-1 transition-transform">
                {t('common.details', 'Open')} <Icon icon="lucide:arrow-right" width="14" />
              </span>
            </div>
          </div>
        </Card>
      </Link>
    );
  }

  // 3. STANDARD GRID CARD
  return (
    <Link
      to={`/projects/${projectId}`}
      className="group block h-full no-underline !text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-card"
      onClick={handleCardClick}
    >
      <Card className="flex h-full flex-col justify-between p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/50 hover:shadow-card">
        <div className="space-y-3">
          {/* Top metadata strip: Area Tag + Status Badge + Quick Actions */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <Badge variant="outline" className="gap-1 font-medium text-xs bg-surface-muted/60 border-border text-foreground truncate max-w-[170px]">
                <Icon icon="lucide:book-open" width="12" className="text-primary shrink-0" />
                <span className="truncate">{areaName}</span>
              </Badge>
              {isDeleted ? (
                <Badge variant="destructive" className="font-medium text-[11px] py-0">
                  {t('project.daXoa', 'Deleted')}
                </Badge>
              ) : isActive ? (
                <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium bg-success-subtle text-success border border-success/20">
                  <span className="size-1.5 rounded-full bg-success" />
                  {t('project.dangHoatDong', 'Active')}
                </span>
              ) : null}
            </div>

            {/* Owner Actions */}
            {isOwner && (
              <div className="flex items-center gap-1 shrink-0 -mr-1.5 -mt-1.5">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7 text-muted-foreground hover:bg-surface-muted hover:text-foreground"
                  onClick={handleEdit}
                  title={t('common.edit', 'Edit Project')}
                  aria-label={t('common.edit', 'Edit Project')}
                >
                  <Icon icon="lucide:edit-3" width="14" />
                </Button>
                {isDeleted ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-success hover:bg-success-subtle hover:text-success"
                    onClick={handleRestore}
                    title={t('project.khoiPhucDuAn', 'Restore Project')}
                    aria-label={t('project.khoiPhucDuAn', 'Restore Project')}
                  >
                    <Icon icon="lucide:refresh-cw" width="14" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-muted-foreground hover:bg-danger-subtle hover:!text-danger"
                    onClick={handleDelete}
                    title={t('project.xoaDuAn', 'Delete Project')}
                    aria-label={t('project.xoaDuAn', 'Delete Project')}
                  >
                    <Icon icon="lucide:trash-2" width="14" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div>
            <h3 className="m-0 text-base font-bold leading-snug tracking-tight !text-foreground transition-colors group-hover:!text-primary line-clamp-2">
              {title}
            </h3>
            {project.description ? (
              <p className="m-0 mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            ) : (
              <p className="m-0 mt-1.5 text-xs italic text-muted-foreground/60">
                {t('project.chuaCoMoTaChoDuAnNay', 'No description provided')}
              </p>
            )}
          </div>

          {/* Watchlist Keywords block */}
          <div className="rounded-control bg-surface-muted/50 border border-border/50 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Icon icon="lucide:hash" width="13" className="text-primary" />
                {t('project.tuKhoaTheoDoi', 'Keywords')}
              </span>
              <span className="font-semibold text-foreground">{keywordCount}</span>
            </div>

            {keywordCount > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {project.watch_keywords?.slice(0, 3).map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center rounded-sm border border-border/60 bg-surface px-1.5 py-0.5 text-[11px] text-foreground font-medium"
                  >
                    {kw.keyword || kw}
                  </span>
                ))}
                {keywordCount > 3 && (
                  <span className="inline-flex items-center rounded-sm border border-border/60 bg-surface px-1.5 py-0.5 text-[11px] text-muted-foreground font-medium">
                    +{keywordCount - 3}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground/75 italic flex items-center gap-1">
                <Icon icon="lucide:plus-circle" width="12" />
                {t('project.chuaCoTuKhoa', 'No keywords configured')}
              </span>
            )}
          </div>
        </div>

        {/* Footer: Avatars + Creator & Date + Arrow CTA */}
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
          <div className="flex items-center gap-2.5 min-w-0">
            {renderAvatarGroup()}
            <div className="min-w-0 flex flex-col justify-center leading-tight">
              <span className="truncate text-xs text-muted-foreground">
                {t('project.taoBoi', 'By')} <strong className="font-semibold text-foreground">{ownerName}</strong>
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <Icon icon="lucide:calendar" width="11" /> {createdAt}
              </span>
            </div>
          </div>

          <span className="inline-flex items-center gap-1 shrink-0 text-xs font-semibold !text-primary group-hover:translate-x-1 transition-transform">
            {t('common.details', 'Open')}
            <Icon icon="lucide:arrow-right" width="14" aria-hidden="true" />
          </span>
        </div>
      </Card>
    </Link>
  );
};

export default ProjectCard;