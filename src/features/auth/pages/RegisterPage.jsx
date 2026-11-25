import { useEffect } from 'react';
import { EXTERNAL_REGISTRATION_URL } from '../constants/registration';

export default function RegisterPage() {
  useEffect(() => {
    window.location.replace(EXTERNAL_REGISTRATION_URL);
  }, []);

  return <p className="p-6 text-sm text-muted-foreground">Redirecting to HyperDataLab registration...</p>;
}
