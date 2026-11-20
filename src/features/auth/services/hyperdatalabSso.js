import { useAuthStore } from '../../../app/store/authStore';
import { useUserStore } from '../../../app/store/userStore';

const ATTEMPT_KEY = 'hyperdatalab-sso-attempt';
const ATTEMPT_TTL_MS = 10 * 60 * 1000;

function getConfig() {
  const ssoBaseUrl = import.meta.env.VITE_HYPERDATALAB_SSO_BASE_URL?.trim();
  const clientId = import.meta.env.VITE_HYPERDATALAB_SSO_CLIENT_ID?.trim();
  const callbackUrl = import.meta.env.VITE_HYPERDATALAB_SSO_CALLBACK_URL?.trim();
  const workerUrl = import.meta.env.VITE_WORKER_API_URL?.trim();
  if (!ssoBaseUrl || !clientId || !callbackUrl || !workerUrl) throw new Error('SSO_CONFIGURATION_MISSING');

  try {
    const urls = [new URL(ssoBaseUrl), new URL(callbackUrl), new URL(workerUrl)];
    const isLocal = ({ hostname }) => ['localhost', '127.0.0.1', '[::1]'].includes(hostname);
    if (urls.some((url) => url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocal(url)))) {
      throw new Error('SSO_CONFIGURATION_INVALID');
    }
    return { baseUrl: urls[0], callbackUrl: urls[1], workerUrl: urls[2], clientId };
  } catch (error) {
    if (error.message === 'SSO_CONFIGURATION_INVALID') throw error;
    throw new Error('SSO_CONFIGURATION_INVALID', { cause: error });
  }
}

function base64Url(bytes) {
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomToken() {
  return base64Url(crypto.getRandomValues(new Uint8Array(32)));
}

function safeReturnTo(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : '/';
  } catch {
    return '/';
  }
}

async function parseResponse(response, errorCode) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorCode);
  return body;
}

export async function startHyperdatalabSso(returnTo = '/') {
  const config = getConfig();
  const state = randomToken();
  const verifier = randomToken();
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  const challenge = base64Url(new Uint8Array(digest));
  sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify({ state, verifier, returnTo: safeReturnTo(returnTo), createdAt: Date.now() }));

  const authorizeUrl = new URL('/oauth/authorize', config.baseUrl);
  authorizeUrl.search = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.callbackUrl.href,
    scope: 'email profile hyperdatalab_profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
  }).toString();
  window.location.assign(authorizeUrl.href);
}

async function finishSso(callbackHref) {
  const config = getConfig();
  const callback = new URL(callbackHref);
  const savedAttempt = sessionStorage.getItem(ATTEMPT_KEY);
  sessionStorage.removeItem(ATTEMPT_KEY);
  if (!savedAttempt) throw new Error('SSO_ATTEMPT_MISSING');

  let attempt;
  try { attempt = JSON.parse(savedAttempt); } catch { throw new Error('SSO_ATTEMPT_INVALID'); }
  if (!Number.isFinite(attempt.createdAt) || Date.now() - attempt.createdAt > ATTEMPT_TTL_MS) throw new Error('SSO_ATTEMPT_EXPIRED');
  if (callback.searchParams.get('state') !== attempt.state) throw new Error('SSO_STATE_INVALID');
  if (callback.searchParams.has('error')) throw new Error('SSO_PROVIDER_REJECTED');
  const code = callback.searchParams.get('code');
  if (!code || typeof attempt.verifier !== 'string') throw new Error('SSO_CODE_MISSING');

  const tokenResponse = await fetch(new URL('/oauth/token', config.baseUrl), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: config.clientId,
      code,
      redirect_uri: config.callbackUrl.href,
      code_verifier: attempt.verifier,
    }),
  });
  const { access_token: ssoAccessToken } = await parseResponse(tokenResponse, 'SSO_TOKEN_EXCHANGE_FAILED');
  if (!ssoAccessToken) throw new Error('SSO_TOKEN_EXCHANGE_FAILED');

  try {
    const sessionResponse = await fetch(new URL('/api/v1/auth/sso/session', config.workerUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: ssoAccessToken }),
    });
    const sessionBody = await parseResponse(sessionResponse, 'SSO_SESSION_CREATE_FAILED');
    const session = sessionBody.data || sessionBody;
    if (!session.token || !session.user?.user_id) throw new Error('SSO_SESSION_CREATE_FAILED');
    const user = {
      ...session.user,
      id: session.user.user_id,
      uid: session.user.user_id,
      email: session.user.email || '',
      displayName: session.user.display_name || [session.user.first_name, session.user.last_name].filter(Boolean).join(' ') || session.user.email || '',
      role: session.user.role || 'STUDENT',
    };
    useAuthStore.getState().loginSuccess(session.token, user, false, session.refresh_token || null);
    useUserStore.getState().setEmail(user.email);
    useUserStore.getState().setUser?.(user);
  } finally {
    fetch(new URL('/oauth/revoke', config.baseUrl), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: ssoAccessToken }),
    }).catch(() => {});
  }

  return { returnTo: safeReturnTo(attempt.returnTo) };
}

let callbackPromise;
export function completeHyperdatalabSsoCallback(callbackHref) {
  if (!callbackPromise) {
    callbackPromise = finishSso(callbackHref).catch((error) => {
      callbackPromise = undefined;
      throw error;
    });
  }
  return callbackPromise;
}
