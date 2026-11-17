import { NavLink, Navigate, Outlet, useParams } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { DashboardProvider } from './features/dashboard/contexts/DashboardContext';
import trendingI18n from './i18n';
import './shared/styles/tokens.css';

const links = [
  ['dashboard', 'Global ecosystem & trends'],
  ['journals', 'Journal analytics'],
  ['volumes/journal-metrics', 'Collaboration analytics'],
  ['volumes/keywords-networks', 'Keyword networks'],
  ['analytics', 'Tracked journals'],
  ['analytics/curated-articles', 'Curated articles'],
];

export default function TrendingAnalyticsLayout() {
  const { lang = 'en', id } = useParams();

  if (!id || id === 'default-id') {
    return <Navigate to={`/${lang}/projects`} replace />;
  }

  return (
    <DashboardProvider projectId={id}>
      <section className="container-fluid py-4 trending-analytics-shell">
        <header className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <div className="text-muted small">Trending System · Project analytics</div>
            <h1 className="h3 mb-0">In-depth analysis</h1>
          </div>
          <nav className="d-flex flex-wrap gap-2" aria-label="Analytics pages">
            {links.map(([path, label]) => (
              <NavLink
                key={path}
                to={`/${lang}/project/${id}/${path}`}
                end={path === 'analytics'}
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                {label}
              </NavLink>
            ))}
          </nav>
        </header>
        <I18nextProvider i18n={trendingI18n}>
          <Outlet />
        </I18nextProvider>
      </section>
    </DashboardProvider>
  );
}
