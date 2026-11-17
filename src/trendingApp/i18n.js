import i18n from 'i18next';
import appI18n from '../shared/i18n/i18n';
import en from './locales/en.json';
import vi from './locales/vi.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';

// Keep analytics translations isolated from the main app's existing copy.
const trendingI18n = i18n.createInstance();
trendingI18n.init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    ja: { translation: ja },
    ko: { translation: ko },
  },
  lng: appI18n.language || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

appI18n.on('languageChanged', language => trendingI18n.changeLanguage(language));

export default trendingI18n;
