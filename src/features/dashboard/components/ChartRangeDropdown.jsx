import { useTranslation } from 'react-i18next';

export default function ChartRangeDropdown({ value, onChange }) {
  const { t } = useTranslation();
  return <label className="inline-flex items-center">
    <span className="sr-only">{t('dashboard.khoangThoiGian')}</span>
    <select value={value} onChange={(event) => onChange(event.target.value)}
      className="min-h-9 max-w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 focus:outline-2 focus:outline-offset-2 focus:outline-[#0071BC]">
      <option value="5">{t('dashboard.5NamGanNhat')}</option>
      <option value="10">{t('dashboard.10NamGanNhat')}</option>
      <option value="all">{t('dashboard.tatCa')}</option>
    </select>
  </label>;
}
