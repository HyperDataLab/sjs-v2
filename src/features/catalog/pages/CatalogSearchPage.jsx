import { useTranslation } from "react-i18next";
import { Container, Dropdown } from 'react-bootstrap';
import { Icon } from '@iconify/react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalogSearch } from '../hooks/useCatalogSearch';
import FilterPanel from '../components/FilterPanel';
import JournalTable from '../components/JournalTable';
import LoadingSkeleton from '../../../shared/components/LoadingSkeleton';
import AuthRequiredModal from '../../../shared/components/AuthRequiredModal';
import Header from '../../landing/components/Header';
import useAuth from '../../auth/hooks/useAuth';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { StatePanel } from '../../../shared/ui/state-panel';
import '../components/CatalogSearch.css';

export default function CatalogSearchPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    searchInput,
    setSearchInput,
    subjectAreas,
    subjectCategories,
    loadingFilters,
    journals,
    total,
    loadingJournals,
    error,
    page,
    sort,
    selectedAreas,
    selectedCategories,
    selectedAccess,
    selectedQuartiles,
    selectedYear,
    selectedZone,
    zones,
    isOaDiamond,
    followedJournals,
    showAuthModal,
    setShowAuthModal,
    handleSearchSubmit,
    onAreaSelect,
    onCategorySelect,
    onAccessSelect,
    onQuartileSelect,
    onYearSelect,
    onZoneSelect,
    handleOaDiamondToggle,
    handleClearAll,
    handleSortChange,
    handlePageChange,
    handleFollowJournal,
    fetchJournals,
  } = useCatalogSearch(user);

  const pageLimit = 10;
  const totalPages = Math.ceil(total / pageLimit) || 1;

  return (
    <div className="min-vh-100 text-main catalog-search-page">
      {/* Navbar Header */}
      <Header />

      <Container className="catalog-shell">
        {/* Breadcrumbs */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
            <li>
              <Link to="/" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("home")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {t("search")}
            </li>
          </ol>
        </nav>

        {/* Page Title & Subtitle */}
        <section className="catalog-hero text-start mb-6">
          <h1 className="m-0 text-base sm:text-lg font-bold text-foreground leading-snug">
            {t("catalog.danhMucTimKiem")}
          </h1>
          <p className="mt-1 mb-0 text-xs text-muted-foreground max-w-2xl">
            {t("catalog.timKiemJournalLocTheoLinhVucXe")}
          </p>
        </section>

        {/* Catalog Main Layout */}
        <div className="w-100 space-y-4">
          {/* Toolbar Filter Panel */}
          <FilterPanel
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            subjectAreas={subjectAreas}
            subjectCategories={subjectCategories}
            selectedAreas={selectedAreas}
            selectedCategories={selectedCategories}
            selectedAccess={selectedAccess}
            selectedQuartiles={selectedQuartiles}
            onAreaSelect={onAreaSelect}
            onCategorySelect={onCategorySelect}
            onAccessSelect={onAccessSelect}
            onQuartileSelect={onQuartileSelect}
            selectedYear={selectedYear}
            selectedZone={selectedZone}
            zones={zones}
            onYearSelect={onYearSelect}
            onZoneSelect={onZoneSelect}
            isOaDiamond={isOaDiamond}
            onOaDiamondToggle={handleOaDiamondToggle}
            onClearAll={handleClearAll}
            loading={loadingFilters}
          />

          {/* Toolbar Panel */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-start py-2 border-b border-border">
            {/* Summary Counter text */}
            <div className="text-xs text-muted-foreground">
              {loadingJournals ? (
                <span>{t("catalog.dangTimKiemTapChi")}</span>
              ) : (
                <span>
                  {t("catalog.timThay", "Found ")}
                  <strong className="text-foreground">{total}</strong> {t("catalog.tapChiCount", "journals")} · {t("pagination.page", "Page")}{" "}
                  <span className="font-semibold text-foreground">{page}/{totalPages}</span>
                </span>
              )}
            </div>

            {/* Sort Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="outline"
                id="sort-dropdown"
                className="btn btn-sm border border-border bg-surface text-foreground text-xs d-flex items-center gap-1.5"
              >
                <Icon icon="lucide:arrow-up-down" width="14" />
                <span>
                  {sort === 'metric' && t("catalog.macDinh")}
                  {sort === 'name' && t("catalog.tenAz")}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="border border-border bg-surface shadow-popover rounded-card p-1 text-xs">
                <Dropdown.Item onClick={() => handleSortChange('metric')} className="rounded-control text-xs">
                  {t("catalog.macDinh")}
                </Dropdown.Item>
                <Dropdown.Item onClick={() => handleSortChange('name')} className="rounded-control text-xs">
                  {t("catalog.tenAz")}
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* Main Result Area */}
          {loadingJournals ? (
            <div className="space-y-3">
              {[1, 2, 3].map((s) => (
                <div key={s} className="p-4 rounded-card border border-border bg-surface space-y-2.5">
                  <LoadingSkeleton width="60%" height="20px" className="rounded-control" />
                  <LoadingSkeleton width="45%" height="14px" className="rounded-control" />
                  <div className="flex items-center gap-2 pt-1">
                    <LoadingSkeleton width="50px" height="20px" className="rounded-control" />
                    <LoadingSkeleton width="100px" height="20px" className="rounded-control" />
                    <LoadingSkeleton width="120px" height="20px" className="rounded-control" />
                  </div>
                </div>
              ))}
            </div>
          ) : error && journals.length === 0 ? (
            <StatePanel
              variant="error"
              icon={
                <Icon
                  icon={error?.includes(t("catalog.dangNhap")) ? 'lucide:lock' : 'lucide:alert-triangle'}
                  width="32"
                  className="text-danger"
                />
              }
              title={
                error?.includes(t("catalog.dangNhap"))
                  ? t("catalog.canDangNhapDeTimKiem")
                  : t("catalog.khongTheTaiDuLieuTimKiem")
              }
              description={error}
              actions={
                error?.includes(t("catalog.dangNhap")) ? (
                  <Button onClick={() => (window.location.href = '/login')}>
                    {t("signIn")}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={() => fetchJournals()}>
                    {t("article.thuLai")}
                  </Button>
                )
              }
            />
          ) : journals.length === 0 ? (
            <StatePanel
              variant="neutral"
              icon={<Icon icon="lucide:folder-search" width="32" className="text-muted-foreground" />}
              title={t("catalog.khongTimThayJournalPhuHop")}
              description={t("catalog.hayThuThayDoiTuKhoaTimKiemHoac")}
              actions={
                <Button variant="outline" onClick={handleClearAll}>
                  {t("article.xoaBoLoc")}
                </Button>
              }
            />
          ) : (
            <JournalTable
              journals={journals}
              followedJournals={followedJournals}
              onFollow={handleFollowJournal}
            />
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && !loadingJournals && (
            <div className="mt-5">
              <AdminPagination
                totalItems={total}
                currentPage={page}
                limit={pageLimit}
                onPageChange={handlePageChange}
                entityName="journals"
              />
            </div>
          )}
        </div>
      </Container>

      {/* Guest Authentication Interception Modal */}
      <AuthRequiredModal show={showAuthModal} onHide={() => setShowAuthModal(false)} />
    </div>
  );
}
