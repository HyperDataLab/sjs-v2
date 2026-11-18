import { useTranslation } from "react-i18next";
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../../shared/components/Icon';
import Header from '../../landing/components/Header';
import useAuthors from '../hooks/useAuthors';
import AuthorLeaderboardTable from '../components/AuthorLeaderboardTable';
import AuthorNavigationTabs from '../components/AuthorNavigationTabs';
import { Button } from '../../../shared/ui/button';
import { FilterCard } from '../../../shared/components/Card';
import { FilterSelect } from '../../../shared/components/Input';
import AdminPagination from '../../../shared/components/Pagination';
import './AuthorLeaderboardPage.css';

export default function AuthorLeaderboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    leaderboard,
    loadingLeaderboard,
    errorLeaderboard,
    fetchLeaderboard,
    totalLeaderboard,
    leaderboardTotalPages,
    subjectAreas,
    fetchSubjectAreas,
  } = useAuthors();
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!subjectAreas || subjectAreas.length === 0) {
      fetchSubjectAreas();
    }
  }, [subjectAreas, fetchSubjectAreas]);

  useEffect(() => {
    fetchLeaderboard({
      subject_area: selectedArea,
      period: selectedPeriod,
      page: currentPage,
      limit: limit,
    });
  }, [selectedArea, selectedPeriod, currentPage, fetchLeaderboard]);

  const handleAreaChange = (e) => {
    setSelectedArea(e.target.value);
    setCurrentPage(1);
  };

  const handlePeriodChange = (e) => {
    setSelectedPeriod(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="author-leaderboard-page min-vh-100">
      <Header />

      <Container className="pt-4 pb-8">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="flex items-center gap-2 p-0 m-0 list-none text-xs text-muted-foreground">
            <li>
              <Link to="/" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("author.tongQuan")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li>
              <Link to="/authors" className="no-underline text-muted-foreground hover:text-primary transition-colors">
                {t("author.tacGiaNoiBat")}
              </Link>
            </li>
            <li aria-hidden="true" className="select-none">/</li>
            <li className="font-medium text-foreground" aria-current="page">
              {t("author.bangXepHang")}
            </li>
          </ol>
        </nav>

        <section className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary-subtle text-primary text-xs font-semibold mb-2">
              <Icon icon="lucide:trophy" width="14" />
              <span>Author leaderboard</span>
            </div>
            <h1 className="m-0 text-base sm:text-lg font-bold text-foreground leading-snug">
              {t("author.bangXepHangTacGia")}
            </h1>
            <p className="mt-1 mb-0 text-xs text-muted-foreground max-w-2xl">
              {t("author.cacTacGiaNoiBatNhatHeThongDuoc")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/authors')}
            className="self-start sm:self-auto shrink-0"
          >
            <Icon icon="lucide:arrow-left" width="14" />
            <span>{t("author.quayLaiDanhSachTacGia")}</span>
          </Button>
        </section>

        <AuthorNavigationTabs activeTab="leaderboard" />

        <FilterCard className="mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                {t("author.linhVuc1")}
              </span>
              <FilterSelect
                value={selectedArea}
                onChange={handleAreaChange}
                options={[
                  { value: '', label: t("author.tatCaLinhVuc") },
                  ...(subjectAreas || []).map((area) => ({
                    value: area.display_name || area.name || '',
                    label: area.display_name || area.name || '',
                  })),
                ]}
              />
            </div>

            <div>
              <span className="block text-xs font-medium text-muted-foreground mb-1.5">
                {t("author.thoiGian")}
              </span>
              <FilterSelect
                value={selectedPeriod}
                onChange={handlePeriodChange}
                options={[
                  { value: 'all', label: t("author.tatCaThoiGian") },
                  { value: 'month', label: t("author.thangNay") },
                  { value: 'year', label: t("author.namNay") },
                ]}
              />
            </div>
          </div>
        </FilterCard>

        <AuthorLeaderboardTable
          authors={leaderboard}
          loading={loadingLeaderboard}
          error={errorLeaderboard}
          onRetry={() =>
            fetchLeaderboard({
              subject_area: selectedArea,
              period: selectedPeriod,
              page: currentPage,
              limit: limit,
            })
          }
        />

        {leaderboard.length > 0 && leaderboardTotalPages > 1 && (
          <div className="mt-6">
            <AdminPagination
              totalItems={totalLeaderboard}
              currentPage={currentPage}
              limit={limit}
              onPageChange={setCurrentPage}
              entityName={t("author.tacGia")}
            />
          </div>
        )}
      </Container>
    </div>
  );
}
