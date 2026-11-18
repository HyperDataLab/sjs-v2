import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Form } from 'react-bootstrap';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorTable from '../components/AuthorTable';
import AuthorCard from '../components/AuthorCard';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import AdminPagination from '../../../shared/components/Pagination';
import { Button } from '../../../shared/ui/button';
import { Card } from '../../../shared/ui/card';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Skeleton } from '../../../shared/ui/skeleton';
import { FilterCard } from '../../../shared/components/Card';
import { FilterSearch, FilterSelect } from '../../../shared/components/Input';
import './AuthorListPage.css';

export default function AuthorListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    authors,
    totalAuthors,
    totalPages,
    subjectAreas,
    loadingAuthors,
    errorAuthors,
    fetchAuthors,
    fetchSubjectAreas,
  } = useAuthors();
  const [viewMode] = useState('grid');
  const searchVal = searchParams.get('search') || '';
  const pageVal = parseInt(searchParams.get('page') || '1', 10);
  const limitVal = parseInt(searchParams.get('limit') || '10', 10);
  const sortVal = searchParams.get('sort') || 'impact';
  const subjectAreaVal = searchParams.get('subject_area') || '';
  const countryVal = searchParams.get('country') || '';
  const [searchInput, setSearchInput] = useState(searchVal);

  useEffect(() => {
    const params = {
      search: searchVal,
      page: pageVal,
      limit: limitVal,
      sort: sortVal,
      subject_area: subjectAreaVal,
      country: countryVal,
    };
    const filteredParams = Object.fromEntries(
      Object.entries(params).filter(([, value]) => value !== '')
    );
    fetchAuthors(filteredParams);
  }, [searchVal, pageVal, limitVal, sortVal, subjectAreaVal, countryVal, fetchAuthors]);

  useEffect(() => {
    if (!subjectAreas || subjectAreas.length === 0) {
      fetchSubjectAreas();
    }
  }, [subjectAreas, fetchSubjectAreas]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const nextParams = new URLSearchParams(searchParams);
    if (searchInput.trim()) nextParams.set('search', searchInput.trim());
    else nextParams.delete('search');
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handleFilterChange = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value) nextParams.set(key, value);
    else nextParams.delete(key);
    nextParams.set('page', '1');
    setSearchParams(nextParams);
  };

  const handlePageChange = (newPage) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('page', String(newPage));
    setSearchParams(nextParams);
  };

  const totalPagesCount = Math.max(1, totalPages);
  const startIndex = (pageVal - 1) * limitVal + 1;

  const formatLocalNumber = (value) => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) return '0';
    return Number(value).toLocaleString('vi-VN');
  };

  const visibleAuthorsCount = authors.length;
  const featuredAuthorsCount = authors.filter(
    (author) => Number(author.h_index ?? author.hindex ?? 0) >= 30
  ).length;
  const totalWorksCount = authors.reduce(
    (sum, author) => sum + (Number(author.works_count ?? author.article_count ?? 0) || 0),
    0
  );
  const totalCitationCount = authors.reduce(
    (sum, author) => sum + (Number(author.cited_by_count ?? author.citation_count ?? 0) || 0),
    0
  );

  const statCards = [
    {
      label: t("article.tongTacGia"),
      value: formatLocalNumber(totalAuthors),
      icon: 'lucide:users',
      desc: subjectAreaVal
        ? `${t("author.tacGiaTrongLinhVuc", "Tác giả trong lĩnh vực")} ${subjectAreaVal}`
        : t("author.tongTacGiaTrongHeThong"),
    },
    {
      label: t("author.tacGiaNoiBat"),
      value: formatLocalNumber(featuredAuthorsCount || visibleAuthorsCount),
      icon: 'lucide:award',
      desc:
        visibleAuthorsCount > 0
          ? `Trong ${formatLocalNumber(visibleAuthorsCount)} tác giả đang hiển thị`
          : t("author.hindexVuotTroi30"),
    },
    {
      label: t("article.tongBaiBao"),
      value: formatLocalNumber(totalWorksCount),
      icon: 'lucide:file-text',
      desc: t("author.tongBaiBaoTrenTrangHienTai"),
    },
    {
      label: t("author.tongCitations"),
      value: formatLocalNumber(totalCitationCount),
      icon: 'lucide:quote',
      desc: t("author.tongCitationsTrenTrangHienTai"),
    },
  ];

  return (
    <div className="author-list-page min-vh-100">
      <Header />

      <PageContainer className="author-list-shell">
        <PageHeader
          breadcrumbs={[
            { label: t("author.tongQuan"), to: "/" },
            { label: t("author.tacGiaNoiBat") }
          ]}
          badge={
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold">
              <Icon icon="lucide:users-round" width="14" />
              <span>Author registry</span>
            </div>
          }
          title={t("author.danhSachNhaKhoaHocTacGia")}
          description={t("author.traCuuThongTinChiSoHocThuatHin")}
        />

        <AuthorNavigationTabs activeTab="list" />

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((stat, idx) => (
            <Card key={idx} className="p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 text-xs font-medium text-muted-foreground">
                <span className="truncate">{stat.label}</span>
                <Icon icon={stat.icon} width="16" className="text-primary shrink-0" />
              </div>
              <div className="mt-2 text-base font-bold text-foreground tabular-nums">
                {stat.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground truncate" title={stat.desc}>
                {stat.desc}
              </div>
            </Card>
          ))}
        </div>

        {/* Filter bar */}
        <FilterCard className="mb-6">
          <Form onSubmit={handleSearchSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-6 lg:col-span-5">
                <FilterSearch
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={t("author.timTheoTenVienNghienCuuTuKhoa")}
                />
              </div>

              <div className="md:col-span-4 lg:col-span-5">
                <FilterSelect
                  value={subjectAreaVal}
                  onChange={(e) => handleFilterChange('subject_area', e.target.value)}
                  options={[
                    { value: '', label: t("admin.chonLinhVuc") },
                    ...(subjectAreas || []).map((area) => ({
                      value: area.display_name || area.name || '',
                      label: area.display_name || area.name || '',
                    })),
                  ]}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-2">
                <Button type="submit" size="sm" className="w-full">
                  <Icon icon="lucide:search" width="14" aria-hidden="true" />
                  <span>{t("searchBtn")}</span>
                </Button>
              </div>
            </div>
          </Form>
        </FilterCard>

        {/* Authors List */}
        <div className="mb-6">
          {viewMode === 'grid' ? (
            loadingAuthors ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: limitVal }).map((_, idx) => (
                  <Card key={idx} className="p-4 space-y-3">
                    <div className="flex gap-3 items-center">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/5 rounded" />
                        <Skeleton className="h-3 w-2/5 rounded" />
                      </div>
                    </div>
                    <Skeleton className="h-7 w-full rounded" />
                    <Skeleton className="h-4 w-1/3 rounded" />
                  </Card>
                ))}
              </div>
            ) : authors.length === 0 ? (
              <AuthorTable
                authors={[]}
                loading={false}
                error={errorAuthors}
                onRetry={() => fetchAuthors()}
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {authors.map((author) => (
                  <AuthorCard key={author.author_id ?? author.id} author={author} />
                ))}
              </div>
            )
          ) : (
            <AuthorTable
              authors={authors}
              loading={loadingAuthors}
              error={errorAuthors}
              onRetry={() => fetchAuthors()}
              startIndex={startIndex}
            />
          )}
        </div>

        {authors.length > 0 && totalPagesCount > 1 && (
          <div className="mt-6">
            <AdminPagination
              totalItems={totalAuthors}
              currentPage={pageVal}
              limit={limitVal}
              onPageChange={handlePageChange}
              entityName={t("author.tacGia")}
            />
          </div>
        )}
      </PageContainer>
    </div>
  );
}
