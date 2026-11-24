import { useTranslation } from "react-i18next";
import { useState } from 'react';
import { useNavigate, useLocation, Link, useParams } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import AuthLayout from '../../../app/layouts/AuthLayout';
import AuthBanner from '../components/AuthBanner';
import LoginForm from '../components/LoginForm';
import SocialAuthButton from '../components/SocialAuthButton';
import { toast } from '../../../shared/utils/toast';
import ROUTES from '../../../app/routes/routePaths';
import { startHyperdatalabSso } from '../services/hyperdatalabSso';
import { Alert } from '../../../shared/ui/alert';
import { useAuthStore } from '../../../app/store/authStore';
import { getAuthenticatedHomePath, getDefaultLang } from '../../../app/routes/languageRouting';
const DASHBOARD_PAGE = ROUTES.DASHBOARD;
export default function LoginPage() {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();
  const { lang } = useParams();
  const { login } = useAuth();
  const isDevelopment = import.meta.env.DEV;
  const [isLoading, setIsLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState(false);
  const [error, setError] = useState(null);

  // Nếu người dùng bị redirect tới login từ một trang khác, đăng nhập xong quay lại trang đó.
  const from = location.state?.from 
    ? `${location.state.from.pathname}${location.state.from.search || ''}` 
    : DASHBOARD_PAGE;

  const handlePasswordLogin = async payload => {
    setIsLoading(true);
    setError(null);
    try {
      await login(payload.email, payload.password, payload.remember_login);
      const signedInUser = useAuthStore.getState().user;
      const destination = signedInUser?.role === 'ADMINISTRATOR'
        ? getAuthenticatedHomePath(signedInUser, lang || getDefaultLang())
        : from;
      navigate(destination, { replace: true });
    } catch (loginError) {
      console.error('Login failed:', loginError.response?.data?.message || loginError.message);
      setError(loginError.response?.data?.message || loginError.message || t('auth.dangNhapKhongThanhCongVuiLongK'));
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* SSO is the production sign-in method. Password login remains available locally for development. */}
      <div className="mb-6">
        <SocialAuthButton onClick={handleLoginWithSso} disabled={ssoLoading} label={t('auth.dangNhapBangSso')} />
      </div>

      {error && <Alert variant="destructive" className="mb-4 py-3">{error}</Alert>}
      {isDevelopment ? (
        <>
          <div className="my-6 flex items-center justify-center text-xs font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <div className="h-px flex-1 bg-border" />
            <span className="px-3">{t('auth.hoac')}</span>
            <div className="h-px flex-1 bg-border" />
          </div>
          <LoginForm onSubmit={handlePasswordLogin} isLoading={isLoading} apiError={error} />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">{t('auth.chuaCoTaiKhoan')}</span>{' '}
            <Link to={ROUTES.REGISTER} className="font-semibold text-primary hover:underline">
              {t('signUp')}
            </Link>
          </div>
        </>
      ) : (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          {t('auth.ssoOnlyAccounts', 'Use your approved HyperDataLab account to sign in. New accounts are managed by your administrator.')}
        </p>
      )}
    </AuthLayout>
  );
}
