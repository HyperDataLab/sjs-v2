export const EXTERNAL_REGISTRATION_URL = 'https://hyperdatalab.org/#register-section';

export const redirectToExternalRegistration = () => {
  window.location.assign(EXTERNAL_REGISTRATION_URL);
};
