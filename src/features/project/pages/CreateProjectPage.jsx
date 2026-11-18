import { useTranslation } from "react-i18next";
import { t } from "i18next";
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ROUTES from '../../../app/routes/routePaths';
import useProjects from '../hooks/useProjects';
import { Icon } from '@iconify/react';
import { getSubjectAreasApi } from '../../catalog/api/catalogApi';
import keywordApi from '../../keywords/api/keywordApi';
import SearchableSelect from '../../../shared/components/Select/SearchableSelect';
import SearchableKeywordInput from '../../../shared/components/Input/SearchableKeywordInput';
import { PageContainer, PageHeader } from '../../../shared/ui/page-layout';
import { Card, CardHeader, CardTitle, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';
import { Badge } from '../../../shared/ui/badge';
import { Alert } from '../../../shared/ui/alert';

const FALLBACK_SUBJECT_AREAS = [
  { id: 11, subject_area_id: 11, display_name: "Agricultural and Biological Sciences", name: "Agricultural and Biological Sciences" },
  { id: 12, subject_area_id: 12, display_name: "Arts and Humanities", name: "Arts and Humanities" },
  { id: 13, subject_area_id: 13, display_name: "Biochemistry, Genetics and Molecular Biology", name: "Biochemistry, Genetics and Molecular Biology" },
  { id: 14, subject_area_id: 14, display_name: "Business, Management and Accounting", name: "Business, Management and Accounting" },
  { id: 15, subject_area_id: 15, display_name: "Chemical Engineering", name: "Chemical Engineering" },
  { id: 16, subject_area_id: 16, display_name: "Chemistry", name: "Chemistry" },
  { id: 17, subject_area_id: 17, display_name: "Computer Science", name: "Computer Science" },
  { id: 18, subject_area_id: 18, display_name: "Decision Sciences", name: "Decision Sciences" },
  { id: 19, subject_area_id: 19, display_name: "Earth and Planetary Sciences", name: "Earth and Planetary Sciences" },
  { id: 20, subject_area_id: 20, display_name: "Economics, Econometrics and Finance", name: "Economics, Econometrics and Finance" },
  { id: 21, subject_area_id: 21, display_name: "Energy", name: "Energy" },
  { id: 22, subject_area_id: 22, display_name: "Engineering", name: "Engineering" },
  { id: 23, subject_area_id: 23, display_name: "Environmental Science", name: "Environmental Science" },
  { id: 24, subject_area_id: 24, display_name: "Immunology and Microbiology", name: "Immunology and Microbiology" },
  { id: 25, subject_area_id: 25, display_name: "Materials Science", name: "Materials Science" },
  { id: 26, subject_area_id: 26, display_name: "Mathematics", name: "Mathematics" },
  { id: 27, subject_area_id: 27, display_name: "Medicine", name: "Medicine" },
  { id: 28, subject_area_id: 28, display_name: "Neuroscience", name: "Neuroscience" },
  { id: 29, subject_area_id: 29, display_name: "Nursing", name: "Nursing" },
  { id: 30, subject_area_id: 30, display_name: "Pharmacology, Toxicology and Pharmaceutics", name: "Pharmacology, Toxicology and Pharmaceutics" },
  { id: 31, subject_area_id: 31, display_name: "Physics and Astronomy", name: "Physics and Astronomy" },
  { id: 32, subject_area_id: 32, display_name: "Psychology", name: "Psychology" },
  { id: 33, subject_area_id: 33, display_name: "Social Sciences", name: "Social Sciences" },
  { id: 34, subject_area_id: 34, display_name: "Veterinary", name: "Veterinary" },
  { id: 35, subject_area_id: 35, display_name: "Dentistry", name: "Dentistry" },
  { id: 36, subject_area_id: 36, display_name: "Health Professions", name: "Health Professions" },
  { id: 10, subject_area_id: 10, display_name: "Multidisciplinary", name: "Multidisciplinary" }
];

const CreateProjectPage = () => {
  const { t: _t } = useTranslation();
  const navigate = useNavigate();
  const {
    createProject
  } = useProjects();

  // Form State
  const [title, setTitle] = useState('');
  const [subjectAreaId, setSubjectAreaId] = useState('');
  const [keywords, setKeywords] = useState([]);

  // API Data State
  const [areas, setAreas] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);

  // Loading States
  const [loading, setLoading] = useState(false);
  const [loadingCatalogs, setLoadingCatalogs] = useState(true);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [error, setError] = useState(null);

  // Initial Data Fetch
  useEffect(() => {
    const fetchCatalogs = async () => {
      setLoadingCatalogs(true);
      try {
        const areasRes = await getSubjectAreasApi();
        const items = areasRes?.data?.data?.items || areasRes?.data?.data || areasRes?.data || [];
        if (Array.isArray(items) && items.length > 0) {
          setAreas(items);
        } else {
          setAreas(FALLBACK_SUBJECT_AREAS);
        }
      } catch (err) {
        console.warn('Could not fetch subject areas from API, using fallback data:', err);
        setAreas(FALLBACK_SUBJECT_AREAS);
      } finally {
        setLoadingCatalogs(false);
      }
    };
    fetchCatalogs();
  }, []);

  // Fetch suggested keywords based on selected subject area
  useEffect(() => {
    if (!subjectAreaId) {
      setSuggestedKeywords([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoadingSuggestions(true);
      try {
        const queryParams = { limit: 10, subject_area_id: subjectAreaId };
        const res = await keywordApi.getKeywords(queryParams);
        const items = res?.data?.data?.items || res?.data?.data || res?.data || [];
        // Map to string names for the UI suggestions
        setSuggestedKeywords(Array.isArray(items) ? items.map(k => k.display_name || k.name).filter(Boolean) : []);
      } catch (err) {
        console.error(t("project.loiTaiGoiYTuKhoa"), err);
      } finally {
        setLoadingSuggestions(false);
      }
    };
    fetchSuggestions();
  }, [subjectAreaId]);
  const selectedAreaObj = areas.find(a => String(a.id || a.subject_area_id) === String(subjectAreaId));
  const selectedAreaName = selectedAreaObj ? selectedAreaObj.display_name || selectedAreaObj.name || selectedAreaObj.area_name : '';
  const removeKeyword = kw => {
    setKeywords(keywords.filter(k => k !== kw));
  };
  const addSuggestedKeyword = kw => {
    if (!keywords.includes(kw)) {
      setKeywords([...keywords, kw]);
    }
  };

  // Handle Area Change
  const handleAreaChange = val => {
    setSubjectAreaId(val);
  };
  const areaOptions = Array.isArray(areas) ? areas.map(area => ({
    value: area.id || area.subject_area_id,
    label: area.display_name || area.name || area.area_name
  })) : [];
  const handleSubmit = async e => {
    e.preventDefault();
    if (!title.trim() || !subjectAreaId) {
      setError(t("project.vuiLongNhapTenDuAnVaChonLinhVu"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await createProject({
        title: title.trim(),
        subject_area_id: parseInt(subjectAreaId, 10),
        subject_category_ids: [],
        journal_ids: [],
        keywords: keywords
      });

      const projectId = res?.data?.project_id || res?.data?.id || res?.project_id;
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        setError(res?.message || t("project.taoDuAnThatBai"));
      }
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err.response?.data?.message || err.message || t("project.daCoLoiXayRaKhiTaoDuAn"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <PageContainer className="max-w-[760px] py-6 sm:py-10 pb-36 space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Workspace', to: ROUTES.DASHBOARD },
          { label: t("project.duAnTheoDoi", "Research Projects"), to: ROUTES.PROJECTS },
          { label: t("project.taoDuAnMoi", "Create Project") }
        ]}
        title={t("project.khoiTaoDuAnNghienCuuMoi")}
        description={t("project.thietLapKhongGianLamViecDeTuDo")}
      />

      <Card className="border border-border shadow-xs">
        <CardHeader className="border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon icon="lucide:folder-plus" width={18} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                {t("project.thongTinDuAn", "Project Information")}
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("project.nhapThongTinCoBanDeTheoDoi", "Define tracking parameters to monitor trends and relevant publications")}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6 sm:p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="items-center">
              <Icon icon="lucide:alert-circle" width="18" className="shrink-0" />
              <div className="flex-1 text-xs">{error}</div>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="projectTitle" className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("project.tenDuAn")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                id="projectTitle"
                placeholder={t("project.viDuNghienCuuUngDungDeepLearni")}
                value={title}
                onChange={e => setTitle(e.target.value)}
                disabled={loading}
                autoFocus
                required
                className="w-full h-11 px-3.5 rounded-control border border-border bg-surface text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-0 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 transition-all"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subjectArea" className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("project.linhVucNghienCuuChinh")} <span className="text-destructive">*</span>
              </label>
              <SearchableSelect
                options={areas.map(a => ({
                  value: a.id || a.subject_area_id,
                  label: a.display_name || a.name || a.area_name
                }))}
                fetchOptions={async search => {
                  try {
                    const res = await getSubjectAreasApi({
                      search,
                      limit: 20
                    });
                    const items = res?.data?.data?.items || res?.data?.data || res?.data || [];
                    if (Array.isArray(items) && items.length > 0) {
                      return items.map(a => ({
                        value: a.id || a.subject_area_id,
                        label: a.display_name || a.name || a.area_name
                      }));
                    }
                  } catch (e) {
                    // Fallback to local areas list
                  }
                  const term = (search || '').toLowerCase();
                  const filtered = FALLBACK_SUBJECT_AREAS.filter(a =>
                    !term || (a.display_name || a.name || '').toLowerCase().includes(term)
                  );
                  return filtered.map(a => ({
                    value: a.id || a.subject_area_id,
                    label: a.display_name || a.name
                  }));
                }}
                value={subjectAreaId}
                onChange={handleAreaChange}
                placeholder={t("project.chonLinhVucNghienCuu")}
                disabled={loadingCatalogs || loading}
                debounceTime={100}
                loading={loadingCatalogs}
                limit={20}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                {t("project.tuKhoaMuonTheoDoi")}
              </label>
              <p className="text-xs text-muted-foreground m-0">
                {t("project.nhanEnterHoacGoDauPhayDeThemTu")}
              </p>
              
              <SearchableKeywordInput
                keywords={keywords}
                subjectAreaId={subjectAreaId}
                placeholder={t("project.chonTuKhoaTheoDoi")}
                disabled={loading}
                onAddKeyword={val => {
                  if (val && !keywords.includes(val)) {
                    setKeywords([...keywords, val]);
                  }
                }}
                onRemoveKeyword={removeKeyword}
              />

              {subjectAreaId && suggestedKeywords.length > 0 && (
                <div className="pt-2 text-xs">
                  <span className="text-muted-foreground font-medium">{t("project.goiYTuKhoaNoiBat")}:</span>
                  {loadingSuggestions ? (
                    <span className="text-muted-foreground ms-2">{t("common.dangTai")}</span>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {suggestedKeywords.filter(k => !keywords.includes(k)).map(sugg => (
                        <Badge
                          key={sugg}
                          variant="secondary"
                          className="cursor-pointer hover:border-primary transition-colors py-1 px-2.5"
                          onClick={() => addSuggestedKeyword(sugg)}
                        >
                          + {sugg}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading}>
                {t("common.huy", "Cancel")}
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim() || !subjectAreaId}
                isLoading={loading}
                loadingText={t("project.dangTao")}
                className="flex items-center gap-1.5"
              >
                <Icon icon="lucide:plus" width={16} />
                <span>{t("project.taoDuAn")}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
};
export default CreateProjectPage;
