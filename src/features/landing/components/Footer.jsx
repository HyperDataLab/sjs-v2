/**
 * File source thuộc hệ thống FE ResearchPulse.
 *
 * File: features\landing\components\Footer.jsx
 */
import { useTranslation } from 'react-i18next';
import Logo from '../../../shared/components/Logo';

export default function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const links = [
    { labelKey: 'footerAbout', href: '#' },
    { labelKey: 'footerTerms', href: '#' },
    { labelKey: 'footerPrivacy', href: '#' },
    { labelKey: 'footerContact', href: '#' },
  ];

  return (
    <footer className="border-t border-border bg-surface py-7 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-10">
          {/* Brand and Description */}
          <div className="min-w-0">
            <Logo size={36} fontSize="1.125rem" />
            <p className="mt-2 ml-12 mb-0 max-w-[320px] text-sm leading-5 text-muted-foreground">
              {t('footerDesc')}
            </p>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Footer" className="flex flex-wrap justify-center md:justify-end gap-x-7 gap-y-3">
            {links.map((link) => (
              <a
                key={link.labelKey}
                href={link.href}
                className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
              >
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
        </div>

        {/* Copyright */}
        <div className="mt-6 border-t border-border pt-4 text-center text-xs text-muted-foreground">
          © {currentYear} Trending System. {t('footerRights')}
        </div>
      </div>
    </footer>
  );
}
