import { useTranslation } from "react-i18next";
import { Container, Modal } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../landing/components/Header';
import useArticleList from '../hooks/useArticleList';
import ArticleStatsCards from '../components/ArticleStatsCards';
import ArticleFilterBar from '../components/ArticleFilterBar';
import ArticleTable from '../components/ArticleTable';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import '../Article.css';

export default function ArticleListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      <Header />

      <Container className="article-list-shell pt-4 pb-8">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
            <li>
              <Link to="/" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("home")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {t("articles")}
            </li>
          </ol>
        </nav>

        {/* Page Header */}
        <section className="article-list-hero mb-6" aria-labelledby="article-list-title">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold mb-2">
              <Icon icon="lucide:library-big" width="14" height="14" />
              <span>Trending System Articles</span>
            </div>
            <h1 id="article-list-title" className="m-0 text-base sm:text-lg font-bold text-foreground leading-snug">
              {t("article.khoLuuTruBaiBaoKhoaHoc")}
            </h1>
            <p className="mt-1 mb-0 text-xs text-muted-foreground max-w-2xl">
              {t("article.duyetQuaTimKiemVaLocHangNghinB")}
            </p>

            {filters.selectedVolume && (
              <div className="inline-flex items-center gap-1.5 mt-2 text-xs text-primary font-medium">
                <Icon icon="solar:folder-with-files-bold" width="14" />
                <span>{t("article.dangXemBaiBaoThuocVolume")}{filters.selectedVolume}</span>
              </div>
            )}
            {filters.selectedIssue && (
              <div className="inline-flex items-center gap-1.5 mt-2 ml-3 text-xs text-primary font-medium">
                <Icon icon="lucide:layers-3" width="14" />
                <span>{t("article.dangXemBaiBaoThuocIssue")}{filters.selectedIssue}</span>
              </div>
            )}
          </div>

          <aside className="article-list-summary" aria-label="Tổng kết bài báo">
            <div className="text-xs text-muted-foreground">{t("article.tongKetQua")}</div>
            <div className="text-base font-bold text-foreground mt-0.5">
              {new Intl.NumberFormat().format(total)}
            </div>
          </aside>
        </section>

        {/* Thẻ thống kê */}
        <ArticleStatsCards stats={stats} isLoading={isLoading} />

        {/* Thanh lọc & Sắp xếp */}
        <ArticleFilterBar filters={filters} updateFilters={updateFilters} clearFilters={clearFilters} />

        {/* Kết quả đếm */}
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2 text-xs text-muted-foreground">
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
      </Container>

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
