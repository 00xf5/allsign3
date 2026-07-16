// @ts-nocheck — Deno shared module

export interface GeoInfo {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  continent?: string;
  org?: string;
  timezone?: string;
}

export function getClientIp(req: Request): string | null {
  const cf = req.headers.get('cf-connecting-ip')?.trim();
  if (cf) return cf;

  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip')?.trim();
  return realIp || null;
}

/**
 * Resolve visitor geo from proxy IP headers + optional client fallback.
 * Always tries to include `ip` when any source is available.
 */
export async function resolveGeo(
  req: Request,
  fallback: GeoInfo = {},
): Promise<GeoInfo> {
  const headerIp = getClientIp(req);
  const seedIp = headerIp || fallback.ip || null;

  if (!seedIp) {
    return { ...fallback };
  }

  try {
    const res = await fetch(`https://ipwho.is/${seedIp}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    if (!d.success) throw new Error('ipwho.is returned success=false');

    return {
      ip: d.ip || seedIp,
      country: d.country || fallback.country,
      countryCode: d.country_code || fallback.countryCode,
      region: d.region || fallback.region,
      city: d.city || fallback.city,
      continent: d.continent || fallback.continent,
      org: d.connection?.isp || d.connection?.org || fallback.org,
      timezone: d.timezone?.id || fallback.timezone,
    };
  } catch (err) {
    console.error('Server-side geo lookup failed, using fallback:', err);
    return {
      ...fallback,
      ip: fallback.ip || seedIp,
    };
  }
}
