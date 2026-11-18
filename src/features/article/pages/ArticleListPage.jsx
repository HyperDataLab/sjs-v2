import { useTranslation } from "react-i18next";
import { Modal } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import Header from '../../landing/components/Header';
import useArticleList from '../hooks/useArticleList';
import ArticleStatsCards from '../components/ArticleStatsCards';
import ArticleFilterBar from '../components/ArticleFilterBar';
import ArticleTable from '../components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import '../Article.css';

export default function ArticleListPage() {
  const { t } = useTranslation();
  const {
    articles,
    total,
    currentPage,
    totalPages,
    isLoading,
    stats,
    filters,
    updateFilters,
    clearFilters,
    handlePageChange,
    handleDetailClick,
    showAuthModal,
    setShowAuthModal,
    handleAuthRedirect,
  } = useArticleList();

  return (
    <div className="article-list-page grid-bg min-vh-100">
      {/* Header (rendered null inside DashboardShell) */}
      <Header />

      <PageContainer className="article-list-shell">
        {/* Unified Design System PageHeader */}
        <PageHeader
          breadcrumbs={[
            { label: t("home"), to: "/" },
            { label: t("articles") }
          ]}
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold">
              <Icon icon="lucide:library-big" width="14" height="14" />
              <span>Trending System Articles</span>
            </div>
          }
          title={t("article.khoLuuTruBaiBaoKhoaHoc")}
          description={t("article.duyetQuaTimKiemVaLocHangNghinB")}
          actions={
            <aside className="article-list-summary text-end" aria-label="Tổng kết bài báo">
              <div className="text-xs text-muted-foreground">{t("article.tongKetQua")}</div>
              <div className="text-base font-bold text-foreground mt-0.5">
                {new Intl.NumberFormat().format(total)}
              </div>
            </aside>
          }
        >
          {(filters.selectedVolume || filters.selectedIssue) && (
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {filters.selectedVolume && (
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Icon icon="solar:folder-with-files-bold" width="14" />
                  <span>{t("article.dangXemBaiBaoThuocVolume")}{filters.selectedVolume}</span>
                </div>
              )}
              {filters.selectedIssue && (
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Icon icon="lucide:layers-3" width="14" />
                  <span>{t("article.dangXemBaiBaoThuocIssue")}{filters.selectedIssue}</span>
                </div>
              )}
            </div>
          )}
        </PageHeader>

        {/* Thẻ thống kê chuẩn hóa */}
        <ArticleStatsCards stats={stats} isLoading={isLoading} />

        {/* Thanh lọc & Sắp xếp */}
        <ArticleFilterBar filters={filters} updateFilters={updateFilters} clearFilters={clearFilters} />

        {/* Kết quả đếm */}
        <div className="flex items-center justify-between flex-wrap gap-2 text-xs text-muted-foreground">
          <div>
            {t("pagination.showing", "Showing")}{" "}
            <span className="font-bold text-foreground">{articles.length}</span>{" "}
            {t("pagination.of", "of")}{" "}
            <span className="font-bold text-foreground">{total ? total.toLocaleString() : 0}</span>{" "}
            {t("article.baiBaoKhoaHoc", "scientific papers")}
          </div>
        </div>

        {/* Bảng dữ liệu */}
        <ArticleTable
          articles={articles}
          isLoading={isLoading}
          onDetailClick={handleDetailClick}
          onClearFilters={clearFilters}
        />

        {/* Phân trang */}
        {total > 0 && totalPages > 1 && (
          <div className="mt-5">
            <AdminPagination
              totalItems={total}
              currentPage={currentPage}
              limit={10}
              onPageChange={handlePageChange}
              entityName="bài báo"
            />
          </div>
        )}
      </PageContainer>

      {/* Warning Auth Modal */}
      <Modal
        show={showAuthModal}
        onHide={() => setShowAuthModal(false)}
        centered
        contentClassName="border-0 rounded-card shadow-popover"
      >
        <Modal.Body className="p-6 text-center space-y-4">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary-subtle text-primary">
            <Icon icon="lucide:lock" width="24" height="24" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-foreground mb-1.5">
              {t("article.yeuCauDangNhap")}
            </h4>
            <p className="text-xs text-muted-foreground m-0 leading-relaxed">
              {t("article.deXemToanBoNoiDungChiTietBaiBa")}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setShowAuthModal(false)}>
              {t("article.dong")}
            </Button>
            <Button size="sm" onClick={handleAuthRedirect}>
              {t("article.dangNhapNgay")}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
