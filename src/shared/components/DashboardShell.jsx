import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { NavLink, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiFolder, FiGlobe, FiMenu, FiSearch, FiUsers, FiX, FiLogOut } from 'react-icons/fi';
import { Icon } from '@iconify/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createContext } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { Button } from '../ui/button';
import useAuth from '../../features/auth/hooks/useAuth';
import { searchSystemApi } from '../../features/search/api/searchApi';

const items = [
  { label: 'Overview', path: 'dashboard', icon: FiBarChart2 },
  { label: 'Projects', path: 'projects', icon: FiFolder },
  { label: 'Search', path: 'search', icon: FiSearch },
  { label: 'Articles', path: 'articles', icon: FiFileText },
  { label: 'Authors', path: 'authors', icon: FiUsers },
  { label: 'Geography', path: 'geography', icon: FiGlobe },
];

function getHeaderBreadcrumbs(pathname, lang, t) {
  const cleanPath = pathname.replace(new RegExp(`^/${lang}`), '').replace(/\/$/, '') || '';
  const segments = cleanPath.split('/').filter(Boolean);

  const breadcrumbs = [
    { label: t('navigation.workspace', 'Workspace'), to: `/${lang}/dashboard` }
  ];

  if (segments.length === 0 || segments[0] === 'dashboard') {
    breadcrumbs.push({ label: t('navigation.overview', 'Overview') });
    return breadcrumbs;
  }

  const section = segments[0];

  switch (section) {
    case 'projects':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects') });
      } else if (segments[1] === 'create') {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.taoProject', 'Create Project') });
      } else if (segments[2] === 'edit') {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.chinhSua', 'Edit') });
      } else {
        breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
        breadcrumbs.push({ label: t('project.chiTiet', 'Details') });
      }
      break;

    case 'project':
      breadcrumbs.push({ label: t('navigation.projects', 'Projects'), to: `/${lang}/projects` });
      breadcrumbs.push({ label: t('project.phanTich', 'Analytics') });
      break;

    case 'search':
    case 'catalog':
      breadcrumbs.push({ label: t('navigation.search', 'Search') });
      break;

    case 'articles':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles') });
      } else if (segments[2] === 'visual') {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles'), to: `/${lang}/articles` });
        breadcrumbs.push({ label: t('article.trucQuan', 'Visual Details') });
      } else {
        breadcrumbs.push({ label: t('navigation.articles', 'Articles'), to: `/${lang}/articles` });
        breadcrumbs.push({ label: t('navigation.details', 'Details') });
      }
      break;

    case 'authors':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors') });
      } else if (segments[1] === 'leaderboard') {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors'), to: `/${lang}/authors` });
        breadcrumbs.push({ label: t('author.bangXepHang', 'Leaderboard') });
      } else {
        breadcrumbs.push({ label: t('navigation.authors', 'Authors'), to: `/${lang}/authors` });
        breadcrumbs.push({ label: t('author.chiTiet', 'Profile') });
      }
      break;

    case 'geography':
      breadcrumbs.push({ label: t('navigation.geography', 'Geography') });
      break;

    case 'keywords':
      if (segments.length === 1) {
        breadcrumbs.push({ label: t('navigation.keywords', 'Keywords') });
      } else {
        breadcrumbs.push({ label: t('navigation.keywords', 'Keywords'), to: `/${lang}/keywords` });
        breadcrumbs.push({ label: t('keywords.baiBaoTheoTuKhoa', 'Keyword Articles') });
      }
      break;

    case 'profile':
      breadcrumbs.push({ label: t('navigation.account', 'Profile') });
      break;

    case 'journals':
      breadcrumbs.push({ label: t('navigation.search', 'Search'), to: `/${lang}/search` });
      breadcrumbs.push({ label: t('journal.chiTiet', 'Details') });
      break;

    case 'topics':
      breadcrumbs.push({ label: t('topic.chuDe', 'Topics') });
      break;

    case 'wallet':
      breadcrumbs.push({ label: t('navigation.wallet', 'Wallet') });
      break;

    default:
      breadcrumbs.push({ label: section.charAt(0).toUpperCase() + section.slice(1) });
      break;
  }

  return breadcrumbs;
}

export const DashboardShellContext = createContext(false);

const globalResultPath = (item, base) => {
  const id = item.id || item.openalex_id || item.article_id || item.author_id || item.journal_id;
  if (!id) return null;
  switch (String(item.type || item.entity_type || '').toUpperCase()) {
    case 'JOURNAL': return `${base}/journals/${id}`;
    case 'AUTHOR': return `${base}/authors/${id}`;
    case 'ARTICLE':
    case 'WORK': return `${base}/articles/${id}/visual`;
    case 'KEYWORD': return `${base}/keywords/${id}`;
    default: return null;
  }
};

const globalResultType = (item) => String(item.type || item.entity_type || 'RESULT').toUpperCase();

export default function DashboardShell({ children }) {
  const { lang = 'en' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const reduceMotion = useReducedMotion();
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerSearchRef = useRef(null);
  const [headerSearchValue, setHeaderSearchValue] = useState('');
  const [headerSearchResults, setHeaderSearchResults] = useState([]);
  const [headerSearchLoading, setHeaderSearchLoading] = useState(false);
  const [headerSearchError, setHeaderSearchError] = useState('');
  const [headerSearchOpen, setHeaderSearchOpen] = useState(false);
  const [activeSearchResult, setActiveSearchResult] = useState(0);
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('trending_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('trending_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const drawerCloseRef = useRef(null);
  const sidebarRef = useRef(null);
  const base = `/${lang}`;

  useEffect(() => {
    const query = headerSearchValue.trim();
    if (query.length < 2) {
      setHeaderSearchResults([]);
      setHeaderSearchError('');
      setHeaderSearchLoading(false);
      setHeaderSearchOpen(false);
      return undefined;
    }

    let isCurrent = true;
    setHeaderSearchLoading(true);
    setHeaderSearchError('');
    setHeaderSearchOpen(true);
    setActiveSearchResult(0);

    const timer = window.setTimeout(async () => {
      try {
        const response = await searchSystemApi(query, 8);
        const results = response?.data?.data?.items || [];
        if (isCurrent) setHeaderSearchResults(results);
      } catch (error) {
        if (isCurrent) {
          setHeaderSearchResults([]);
          setHeaderSearchError(error.response?.data?.message || 'Search is temporarily unavailable.');
        }
      } finally {
        if (isCurrent) setHeaderSearchLoading(false);
      }
    }, 250);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [headerSearchValue]);

  useEffect(() => {
    if (!headerSearchOpen) return undefined;
    const closeWhenOutside = (event) => {
      if (!headerSearchRef.current?.contains(event.target)) setHeaderSearchOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setHeaderSearchOpen(false);
    };
    document.addEventListener('mousedown', closeWhenOutside);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeWhenOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [headerSearchOpen]);

  const openGlobalResult = (item) => {
    const path = globalResultPath(item, base);
    if (path) navigate(path);
    setHeaderSearchOpen(false);
    setHeaderSearchValue('');
  };

  const handleHeaderSearchSubmit = (event) => {
    event.preventDefault();
    const result = headerSearchResults[activeSearchResult] || headerSearchResults[0];
    if (result) openGlobalResult(result);
  };

  const headerBreadcrumbs = useMemo(
    () => getHeaderBreadcrumbs(location.pathname, lang, t),
    [location.pathname, lang, t]
  );

  // Group project sub-routes so navigating between analytics tabs does not remount the parent layout
  const projectSubRouteMatch = location.pathname.match(/^(\/[^/]+\/project\/[^/]+)/);
  const shellKey = projectSubRouteMatch ? projectSubRouteMatch[1] : location.pathname;

  // Ensure window and sidebar always scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (sidebarRef.current) {
      sidebarRef.current.scrollTop = 0;
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const previousFocus = document.activeElement;
    drawerCloseRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
      if (event.key === 'Tab') {
        const panel = document.querySelector('[data-mobile-nav-panel]');
        const focusable = panel?.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])');
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      if (previousFocus instanceof HTMLElement) previousFocus.focus();
    };
  }, [mobileOpen]);

  const renderSidebar = (showLogo = true, isMobile = false) => {
    const isCollapsed = collapsed && !isMobile;
    return (
      <aside className="app-sidebar flex min-h-full flex-col border-r border-border bg-surface" aria-label="Primary navigation">
        {showLogo && (
          <div className={`h-14 min-h-14 flex items-center border-b border-border box-border ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3.5'}`}>
            {isCollapsed ? (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="group relative size-9 rounded-control flex items-center justify-center hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent"
                title="Expand sidebar"
                aria-label="Expand sidebar"
              >
                <div className="group-hover:hidden">
                  <Logo size={26} fontSize="0.95rem" showText={false} />
                </div>
                <div className="hidden group-hover:flex text-muted-foreground group-hover:text-foreground">
                  <Icon icon="lucide:panel-left-open" width={18} />
                </div>
              </button>
            ) : (
              <>
                <Link to={`${base}/dashboard`} className="flex items-center no-underline text-inherit overflow-hidden">
                  <Logo size={26} fontSize="0.95rem" showText={true} />
                </Link>
                <button
                  type="button"
                  onClick={toggleCollapsed}
                  className="size-7 rounded-control flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-muted transition-colors cursor-pointer border-0 bg-transparent shrink-0"
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                >
                  <Icon icon="lucide:panel-left-close" width={17} />
                </button>
              </>
            )}
          </div>
        )}
        <div className={`flex flex-1 flex-col ${isCollapsed ? 'p-2' : 'p-3'}`}>
          <nav className="flex flex-col gap-0.5">
            {items.map(({ label, path, icon: ItemIcon }) => (
              <NavLink
                key={path}
                to={`${base}/${path}`}
                onClick={() => setMobileOpen(false)}
                title={isCollapsed ? t(`navigation.${path}`, label) : undefined}
                className={({ isActive }) =>
                  `group flex h-9 min-h-[36px] w-full items-center rounded-control transition-colors ${
                    isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
                  } text-left text-xs ${
                    isActive
                      ? 'bg-primary-subtle font-semibold !text-primary'
                      : 'font-medium !text-muted-foreground hover:bg-surface-muted hover:!text-foreground'
                  }`
                }
              >
                <ItemIcon aria-hidden="true" className="shrink-0 text-base" />
                {!isCollapsed && <span className="truncate">{t(`navigation.${path}`, label)}</span>}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-0.5 border-t border-border pt-2">
            <button
              type="button"
              title={isCollapsed ? t('navigation.account', 'Account') : undefined}
              className={`flex h-9 min-h-[36px] w-full items-center rounded-control border-0 bg-transparent text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
              }`}
              onClick={() => {
                setMobileOpen(false);
                navigate(`${base}/profile`);
              }}
            >
              <FiUsers aria-hidden="true" className="text-base shrink-0" />
              {!isCollapsed && <span className="truncate">{t('navigation.account', 'Account')}</span>}
            </button>
            <button
              type="button"
              title={isCollapsed ? t('navigation.signOut', 'Sign out') : undefined}
              className={`flex h-9 min-h-[36px] w-full items-center rounded-control border-0 bg-transparent text-left text-xs font-semibold text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger cursor-pointer ${
                isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2.5 py-1.5'
              }`}
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
            >
              <FiLogOut aria-hidden="true" className="text-base shrink-0" />
              {!isCollapsed && <span className="truncate">{t('navigation.signOut', 'Sign out')}</span>}
            </button>
          </div>
        </div>
      </aside>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground md:flex">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-[var(--ds-z-sticky)] flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Logo size={30} fontSize="1.05rem" />
        <Button variant="ghost" size="icon" aria-label={t('navigation.open', 'Open navigation')} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><FiMenu /></Button>
      </header>

      {/* Desktop Sticky Sidebar (Flex item, zero margin needed for main) */}
      <div className={`hidden md:block shrink-0 transition-[width] duration-200 ease-in-out ${collapsed ? 'w-[64px]' : 'w-[230px]'}`}>
        <div ref={sidebarRef} className="sticky top-0 h-screen overflow-y-auto overflow-x-hidden">{renderSidebar(true, false)}</div>
      </div>

      {/* Main Content Column */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="app-topbar sticky top-0 z-[var(--ds-z-sticky)] flex max-md:hidden h-14 min-h-14 items-center border-b border-border bg-surface/95 px-4 sm:px-6 lg:px-8 backdrop-blur box-border">
          <div className="w-full flex items-center justify-between gap-4">
            <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-xs sm:text-sm">
                {headerBreadcrumbs.map((crumb, idx) => {
                  const isLast = idx === headerBreadcrumbs.length - 1;
                  return (
                    <div key={idx} className="flex items-center gap-1.5 min-w-0">
                      {idx > 0 && <span aria-hidden="true" className="text-subtle-foreground/60 select-none">/</span>}
                      {crumb.to && !isLast ? (
                        <Link
                          to={crumb.to}
                          className="text-muted-foreground hover:text-foreground transition-colors truncate no-underline font-medium"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className={`truncate ${isLast ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                          {crumb.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </nav>
            <div className="relative w-[280px] shrink-0 lg:w-[310px]" ref={headerSearchRef}>
              <form onSubmit={handleHeaderSearchSubmit} role="search">
                <FiSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="search"
                  value={headerSearchValue}
                  onChange={(event) => setHeaderSearchValue(event.target.value)}
                  onFocus={() => {
                    if (headerSearchValue.trim().length >= 2) setHeaderSearchOpen(true);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'ArrowDown' && headerSearchResults.length) {
                      event.preventDefault();
                      setActiveSearchResult((index) => Math.min(index + 1, headerSearchResults.length - 1));
                    } else if (event.key === 'ArrowUp' && headerSearchResults.length) {
                      event.preventDefault();
                      setActiveSearchResult((index) => Math.max(index - 1, 0));
                    }
                  }}
                  placeholder={t('navigation.searchManuscripts', 'Search manuscripts, authors, or IDs…')}
                  aria-label={t('navigation.search', 'Search')}
                  aria-expanded={headerSearchOpen}
                  aria-controls="header-global-search-results"
                  autoComplete="off"
                  className="h-9 w-full rounded-control border border-border bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
                />
              </form>

              {headerSearchOpen && (
                <div
                  id="header-global-search-results"
                  role="listbox"
                  className="absolute right-0 top-full z-[1100] mt-2 max-h-[min(70vh,420px)] w-[min(420px,calc(100vw-32px))] overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl"
                >
                  {headerSearchLoading ? (
                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                      <Icon icon="lucide:loader-2" className="animate-spin" width={15} />
                      <span>{t('searching', 'Searching…')}</span>
                    </div>
                  ) : headerSearchError ? (
                    <div className="px-3 py-3 text-xs text-danger">{headerSearchError}</div>
                  ) : headerSearchResults.length ? (
                    headerSearchResults.map((item, index) => {
                      const type = globalResultType(item);
                      const title = item.title || item.name || item.display_name || String(item.id || '');
                      const subtitle = [
                        item.authors?.slice?.(0, 3).map((author) => author.name || author.display_name).join(', '),
                        item.journal?.name || item.journal_name,
                        item.publicationYear || item.publication_year || item.year,
                        item.description,
                      ].filter(Boolean).join(' · ');
                      const isNavigable = Boolean(globalResultPath(item, base));
                      return (
                        <button
                          key={`${type}-${item.id || index}`}
                          type="button"
                          role="option"
                          aria-selected={index === activeSearchResult}
                          disabled={!isNavigable}
                          onMouseEnter={() => setActiveSearchResult(index)}
                          onClick={() => openGlobalResult(item)}
                          className={`flex w-full items-start gap-3 rounded-lg border-0 px-3 py-2.5 text-left transition-colors ${
                            index === activeSearchResult ? 'bg-primary-subtle' : 'bg-transparent hover:bg-surface-muted'
                          } ${isNavigable ? 'cursor-pointer' : 'cursor-default opacity-70'}`}
                        >
                          <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-primary-subtle text-primary">
                            <Icon icon={type === 'AUTHOR' ? 'lucide:user-round' : type === 'JOURNAL' ? 'lucide:book-open' : type === 'ARTICLE' || type === 'WORK' ? 'lucide:file-text' : 'lucide:search'} width={15} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-foreground">{title}</span>
                            {subtitle && <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{subtitle}</span>}
                          </span>
                          <span className="shrink-0 rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{type}</span>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-3 text-xs text-muted-foreground">
                      {t('noResults', 'No matching results.')}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <DashboardShellContext.Provider value>
          <motion.main
            key={shellKey}
            className="app-main flex-1 min-w-0"
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: 'easeOut' }}
          >
            {children}
          </motion.main>
        </DashboardShellContext.Provider>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[var(--ds-z-overlay)] bg-foreground/35 md:hidden" initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduceMotion ? undefined : { opacity: 0 }} onClick={() => setMobileOpen(false)}>
            <motion.div data-mobile-nav-panel role="dialog" aria-modal="true" aria-label={t('navigation.menu', 'Main navigation')} className="h-full w-[min(82vw,280px)] bg-surface shadow-popover flex flex-col" initial={reduceMotion ? false : { x: -280 }} animate={{ x: 0 }} exit={reduceMotion ? undefined : { x: -280 }} transition={{ type: 'tween', duration: reduceMotion ? 0 : 0.2, ease: 'easeOut' }} onClick={(event) => event.stopPropagation()}>
              <div className="flex h-14 min-h-14 items-center justify-between border-b border-border px-4 box-border"><Logo size={26} fontSize="0.95rem" /><Button ref={drawerCloseRef} variant="ghost" size="icon" aria-label={t('navigation.close', 'Close navigation')} onClick={() => setMobileOpen(false)}><FiX /></Button></div>
              <div className="flex-1 overflow-y-auto">{renderSidebar(false, true)}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

