import "server-only";

/**
 * This product is currently single-tenant in practice even though the
 * schema supports multiple organizations. Every public intake submission
 * is attributed to this seeded organization until real org onboarding
 * exists.
 */
export function getDefaultOrgId(): string {
  const orgId = process.env.DEFAULT_ORG_ID;
  if (!orgId) {
    throw new Error("DEFAULT_ORG_ID is not configured.");
  }
  return orgId;
}
