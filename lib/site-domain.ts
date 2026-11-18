export const PRIMARY_PARENT_DOMAIN = "foredu.synology.me";
export const LEGACY_PARENT_DOMAIN = "lhsstart.synology.me";

export const PORTAL_SITE_URL = `https://${PRIMARY_PARENT_DOMAIN}`;
export const GRAMMAR_SITE_URL = `https://grammar.${PRIMARY_PARENT_DOMAIN}`;

const SHARED_AUTH_DOMAINS = [PRIMARY_PARENT_DOMAIN, LEGACY_PARENT_DOMAIN] as const;

export function sharedAuthDomainForHostname(hostname: string): string | null {
  const normalized = hostname.trim().toLowerCase().replace(/^\[|\]$/g, "");
  return SHARED_AUTH_DOMAINS.find(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`),
  ) ?? null;
}
