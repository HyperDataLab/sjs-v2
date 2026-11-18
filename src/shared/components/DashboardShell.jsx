import { AnimatePresence, motion } from 'framer-motion';
import { NavLink, useNavigate, useParams } from 'react-router-dom';
import { FiBarChart2, FiFileText, FiFolder, FiGlobe, FiMenu, FiSearch, FiUsers, FiX, FiLogOut } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { createContext } from 'react';
import { useTranslation } from 'react-i18next';
import Logo from './Logo';
import { Button } from '../ui/button';
import useAuth from '../../features/auth/hooks/useAuth';

const items = [
  { label: 'Overview', path: 'dashboard', icon: FiBarChart2 },
  { label: 'Projects', path: 'projects', icon: FiFolder },
  { label: 'Search', path: 'search', icon: FiSearch },
  { label: 'Articles', path: 'articles', icon: FiFileText },
  { label: 'Authors', path: 'authors', icon: FiUsers },
  { label: 'Geography', path: 'geography', icon: FiGlobe },
];

export const DashboardShellContext = createContext(false);

export default function DashboardShell({ children }) {
  const { lang = 'en' } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = `/${lang}`;

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [mobileOpen]);

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-border bg-surface px-3 py-5" aria-label="Primary navigation">
      <div className="border-b border-border px-2 pb-6"><Logo size={30} fontSize="1.05rem" /></div>
      <nav className="flex flex-col gap-1 pt-5">
        {items.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={`${base}/${path}`}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) => `flex min-h-11 w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm font-semibold no-underline transition-colors ${isActive ? 'bg-primary-subtle text-primary' : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}`}
          >
            <Icon aria-hidden="true" /> <span>{t(`navigation.${path}`, label)}</span>
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1 border-t border-border pt-3">
        <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded-control border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground" onClick={() => navigate(`${base}/profile`)}>
          <FiUsers aria-hidden="true" /> <span>{t('navigation.account', 'Account')}</span>
        </button>
        <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded-control border-0 bg-transparent px-3 py-2.5 text-left text-sm font-semibold text-muted-foreground transition-colors hover:bg-danger-subtle hover:text-danger" onClick={() => logout()}>
          <FiLogOut aria-hidden="true" /> <span>{t('navigation.signOut', 'Sign out')}</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-[var(--ds-z-sticky)] flex min-h-16 items-center justify-between border-b border-border bg-surface px-4 md:hidden">
        <Logo size={30} fontSize="1.05rem" />
        <Button variant="ghost" size="icon" aria-label={t('navigation.open', 'Open navigation')} aria-expanded={mobileOpen} onClick={() => setMobileOpen(true)}><FiMenu /></Button>
      </header>
      <div className="fixed inset-y-0 left-0 z-30 hidden w-[232px] md:block">{sidebar}</div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[var(--ds-z-overlay)] bg-foreground/35 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)}>
            <motion.div role="dialog" aria-modal="true" aria-label={t('navigation.menu', 'Main navigation')} className="h-full w-[min(82vw,280px)] bg-surface shadow-popover" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.2, ease: 'easeOut' }} onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-border p-4"><Logo size={30} fontSize="1.05rem" /><Button variant="ghost" size="icon" aria-label={t('navigation.close', 'Close navigation')} onClick={() => setMobileOpen(false)}><FiX /></Button></div>
              {sidebar}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <DashboardShellContext.Provider value>
        <motion.main className="app-main min-h-screen px-4 py-5 md:ml-[232px] md:px-6 md:py-6" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          {children}
        </motion.main>
      </DashboardShellContext.Provider>
    </div>
  );
}

