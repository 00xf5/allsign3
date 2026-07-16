import type { GeoInfo } from './geoip';

const VISITOR_GEO_KEY = 'allsign_visitor_geo';

/** Resolved visitor IP + geo (from login). Use for targeted content. */
export function getVisitorGeo(): GeoInfo | null {
  const raw = sessionStorage.getItem(VISITOR_GEO_KEY);
  if (!raw) return null;

  try {
    const geo = JSON.parse(raw) as GeoInfo;
    return geo && Object.keys(geo).length > 0 ? geo : null;
  } catch {
    sessionStorage.removeItem(VISITOR_GEO_KEY);
    return null;
  }
}

export function saveVisitorGeo(geo: GeoInfo): void {
  const existing = getVisitorGeo();
  sessionStorage.setItem(
    VISITOR_GEO_KEY,
    JSON.stringify({ ...existing, ...geo }),
  );
}
