import { useTranslation } from "react-i18next";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import useAuth from '../../auth/hooks/useAuth';
import { useJournalDetail } from '../hooks/useJournalDetail';
import JournalHero from '../components/JournalHero';
import JournalMetadataGrid from '../components/JournalMetadataGrid';
import JournalTabs from '../components/JournalTabs';
import RankingTabContent from '../components/RankingTabContent';
import VolumesTabContent from '../components/VolumesTabContent';
import ArticlesTabContent from '../components/ArticlesTabContent';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import AddToProjectModal from '../components/AddToProjectModal';
import { Button } from '../../../shared/ui/button';
import { StatePanel } from '../../../shared/ui/state-panel';
import '../components/JournalDetail.css';

export default function JournalDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const currentUser = auth?.user;
  const {
    journal,
    rankingHistory,
    volumes,
    issuesByVolume,
    issueErrors,
    volumePagination,
    issuePaginationByVolume,
    recentArticles,
    activeTab,
    setActiveTab,
    loadingJournal,
    loadingRanking,
    loadingVolumes,
    loadingArticles,
    volumesError,
    notFound,
    showAuthModal,
    setShowAuthModal,
    showProjectModal,
    setShowProjectModal,
    isFollowing,
    isAddingToProject,
    handleFollow,
    handleAddToProject,
    fetchIssuesForVolume,
    handleVolumePageChange,
    handleIssuePageChange,
  } = useJournalDetail(id, currentUser);

  // Fallback for not found or empty ID
  if (notFound) {
    return (
      <div className="grid-bg min-vh-100 flex flex-col text-main">
        <Header />
        <Container className="flex-1 flex flex-col justify-center items-center py-12 max-w-lg">
          <StatePanel
            variant="error"
            icon={<Icon icon="lucide:alert-circle" width="32" className="text-danger" />}
            title={t("journal.khongTimThayTapChi")}
            description={t("journal.tapChiBanDangTimKiemKhongTonTa")}
            className="w-full"
            actions={
              <Button onClick={() => navigate('/')}>
                {t("journal.quayLaiTrangChu")}
              </Button>
            }
          />
        </Container>
      </div>
    );
  }

  return (
    <div className="grid-bg min-vh-100 text-main pb-8 journal-detail-page">
      {/* Top Navbar */}
      <Header />

      {/* Main Container */}
      <Container className="pt-6 journal-detail-shell">
        {/* Custom Breadcrumb Nav */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
            <li>
              <Link to="/" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("home")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li>
              <Link to="/search" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("search")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="font-medium text-foreground truncate max-w-xs" aria-current="page">
              {loadingJournal ? t("common.dangTai") : journal?.display_name}
            </li>
          </ol>
        </nav>

        {/* Hero Section */}
        <JournalHero
          journal={journal}
          isFollowing={isFollowing}
          isAddingToProject={isAddingToProject}
          onFollow={handleFollow}
          onAddToProject={() => handleAddToProject()}
          loading={loadingJournal}
        />

        {/* Grid Metadata metrics */}
        <JournalMetadataGrid journal={journal} loading={loadingJournal} />

        {/* Tab Controls */}
        <JournalTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Tab Contents */}
        <div className="journal-tab-panel mt-4">
          {activeTab === 'ranking' && (
            <RankingTabContent
              rankingHistory={rankingHistory}
              metricName={journal?.metric_name || 'Impact Factor'}
              loading={loadingRanking}
            />
          )}

          {activeTab === 'volumes' && (
            <VolumesTabContent
              volumes={volumes}
              issuesByVolume={issuesByVolume}
              issueErrors={issueErrors}
              journalId={id}
              onVolumeExpand={fetchIssuesForVolume}
              loading={loadingVolumes}
              error={volumesError}
              volumePagination={volumePagination}
              issuePaginationByVolume={issuePaginationByVolume}
              onVolumePageChange={handleVolumePageChange}
              onIssuePageChange={handleIssuePageChange}
            />
          )}

          {activeTab === 'articles' && (
            <ArticlesTabContent
              recentArticles={recentArticles}
              loading={loadingArticles}
              onArticleClick={(artId) => navigate(`/articles/${artId}/visual`)}
            />
          )}
        </div>
      </Container>

      {/* Guest warning auth modal */}
      <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />

      {/* Project selection modal */}
      <AddToProjectModal
        show={showProjectModal}
        onHide={() => setShowProjectModal(false)}
        journalId={id}
        onConfirm={handleAddToProject}
      />
    </div>
  );
}
