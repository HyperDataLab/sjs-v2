import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import SocialAuthButton from '../components/SocialAuthButton';
import { toast } from '../../../shared/utils/toast';
import ROUTES from '../../../app/routes/routePaths';
import { startHyperdatalabSso } from '../services/hyperdatalabSso';
import { Alert } from '../../../shared/ui/alert';
const DASHBOARD_PAGE = ROUTES.DASHBOARD;
export default function LoginPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  // HyperDataLab SSO is the only supported sign-in method.
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nếu người dùng bị redirect tới login từ một trang khác, đăng nhập xong quay lại trang đó.
  const from = location.state?.from 
    ? `${location.state.from.pathname}${location.state.from.search || ''}` 
    : DASHBOARD_PAGE;

  const handleLoginWithSso = async () => {
    setSsoLoading(true);
    setError(null);
    try {
      await startHyperdatalabSso(from);
    } catch (ssoError) {
      const message = ssoError.message === 'SSO_CONFIGURATION_MISSING'
        ? t('auth.ssoChuaCauHinh')
        : t('auth.ssoDangNhapThatBai');
      setError(message);
      toast.error(message);
      setSsoLoading(false);
    }
  };
  return (
    <AuthLayout banner={<AuthBanner />}>
      <div className="mb-6 space-y-1">
        <h2 className="font-display font-semibold text-base text-foreground m-0">{t("signIn")}</h2>
        <p className="text-sm text-muted-foreground m-0">{t("auth.chaoMungTroLaiVuiLongNhapThong")}</p>
      </div>

      {/* Single sign-on entry point. */}
      <div className="mb-6">
        <SocialAuthButton onClick={handleLoginWithSso} disabled={ssoLoading} label={t('auth.dangNhapBangSso')} />
      </div>

      {error && <Alert variant="destructive" className="mb-4 py-3">{error}</Alert>}
      <p className="mt-5 text-center text-xs text-muted-foreground">
        {t('auth.ssoOnlyAccounts', 'Use your approved HyperDataLab account to sign in. New accounts are managed by your administrator.')}
      </p>
    </AuthLayout>
  );
}
