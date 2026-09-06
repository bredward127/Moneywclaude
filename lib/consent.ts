/**
 * Bump this whenever the intake disclosure/consent copy changes materially,
 * so consent_records keeps an exact record of which version a lead agreed
 * to.
 */
export const DISCLOSURE_VERSION = "intake-consent-v1";

export function getClientIp(request: Request): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip");
}
