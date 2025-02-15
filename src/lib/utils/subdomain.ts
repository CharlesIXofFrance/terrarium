export type SubdomainType = 'app' | 'platform' | 'community';

export interface ParsedDomain {
  subdomain: string | null;
  type: SubdomainType;
  isCustomDomain: boolean;
}

const APP_DOMAIN = 'localhost:3000'; // For tests we always use localhost
const PLATFORM_SUBDOMAIN = 'platform';

export function parseDomain(
  hostname: string = window.location.hostname
): ParsedDomain {
  // Check for test environment or localhost
  if (process.env.NODE_ENV === 'test' || hostname.includes('localhost')) {
    // Check URL parameters first
    const params = new URLSearchParams(window.location.search);
    const rawSubdomain = params.get('subdomain');
    const subdomainParam =
      typeof rawSubdomain === 'string' ? rawSubdomain : null;

    // Debug logging
    console.log('parseDomain - Debug:', {
      hostname,
      subdomain: subdomainParam,
      pathname: window.location.pathname,
      search: window.location.search,
      params: Object.fromEntries(params.entries()),
      env: process.env.NODE_ENV,
    });

    // Handle platform subdomain
    if (subdomainParam === PLATFORM_SUBDOMAIN) {
      return {
        subdomain: PLATFORM_SUBDOMAIN,
        type: 'platform',
        isCustomDomain: false,
      };
    }

    // Handle community subdomain
    if (subdomainParam) {
      return {
        subdomain: subdomainParam,
        type: 'community',
        isCustomDomain: false,
      };
    }

    // Check for platform path as fallback
    if (window.location.pathname.startsWith('/platform')) {
      return {
        subdomain: PLATFORM_SUBDOMAIN,
        type: 'platform',
        isCustomDomain: false,
      };
    }

    // Default to app type for no subdomain
    return { subdomain: null, type: 'app', isCustomDomain: false };
  }

  // Handle production domains
  const parts = hostname.split('.');
  const isCustomDomain = !hostname.endsWith(APP_DOMAIN);

  // Handle custom domains
  if (isCustomDomain) {
    return {
      subdomain: hostname,
      type: 'community',
      isCustomDomain: true,
    };
  }

  // Handle subdomains
  if (parts.length > 2) {
    const subdomain = parts[0];
    if (subdomain === PLATFORM_SUBDOMAIN) {
      return { subdomain, type: 'platform', isCustomDomain: false };
    }
    return { subdomain, type: 'community', isCustomDomain: false };
  }

  // Main domain
  return { subdomain: null, type: 'app', isCustomDomain: false };
}

export function getSubdomainUrl(
  subdomain: string | null,
  path: string = ''
): string {
  // Handle test environment or localhost
  if (
    process.env.NODE_ENV === 'test' ||
    window.location.hostname.includes('localhost')
  ) {
    const url = new URL('http://localhost:3000');

    // Set subdomain parameter if provided
    if (subdomain) {
      url.searchParams.set('subdomain', subdomain);
    }

    // Handle path
    if (path && path !== '/') {
      url.pathname = path;
    }

    return url.toString();
  }

  // Handle production URLs
  const protocol = window.location.protocol;
  if (subdomain) {
    return `${protocol}//${subdomain}.${APP_DOMAIN}${path}`;
  }
  return `${protocol}//${APP_DOMAIN}${path}`;
}

export function redirectToSubdomain(
  subdomain: string | null,
  path: string = ''
) {
  window.location.href = getSubdomainUrl(subdomain, path);
}
