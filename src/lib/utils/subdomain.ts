export type SubdomainType = 'app' | 'platform' | 'community';

export interface ParsedDomain {
  subdomain: string | null;
  type: SubdomainType;
  isCustomDomain: boolean;
}

const APP_DOMAIN = import.meta.env.VITE_APP_DOMAIN || 'localhost:3000';
const PLATFORM_SUBDOMAIN = 'platform';

export function parseDomain(hostname: string = window.location.hostname): ParsedDomain {
  // Handle localhost development
  if (hostname.includes('localhost')) {
    // For local development, use URL parameters to simulate subdomains
    const params = new URLSearchParams(window.location.search);
    const subdomain = params.get('subdomain')?.split('/')[0] || null; // Only take the first part before any slash

    // Debug logging
    console.log('parseDomain - Debug:', {
      hostname,
      subdomain,
      pathname: window.location.pathname,
      search: window.location.search,
      params: Object.fromEntries(params.entries()),
    });

    if (subdomain === PLATFORM_SUBDOMAIN) {
      return { subdomain, type: 'platform', isCustomDomain: false };
    }
    return subdomain 
      ? { subdomain, type: 'community', isCustomDomain: false }
      : { subdomain: null, type: 'app', isCustomDomain: false };
  }

  // Handle production domains
  const parts = hostname.split('.');
  const isCustomDomain = !hostname.endsWith(APP_DOMAIN);

  // Handle custom domains
  if (isCustomDomain) {
    return { 
      subdomain: hostname, 
      type: 'community', 
      isCustomDomain: true 
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

export function getSubdomainUrl(subdomain: string | null, path: string = ''): string {
  if (window.location.hostname.includes('localhost')) {
    // Get current subdomain parameter to preserve any existing path
    const params = new URLSearchParams(window.location.search);
    const currentSubdomain = params.get('subdomain')?.split('/')[0] || '';
    
    // Create URL with the path
    const url = new URL('http://localhost:3000/');
    
    // Set subdomain parameter with path
    if (subdomain) {
      url.searchParams.set('subdomain', path ? `${subdomain}${path}` : subdomain);
    }
    
    return url.toString();
  }

  const protocol = window.location.protocol;
  if (subdomain) {
    return `${protocol}//${subdomain}.${APP_DOMAIN}${path}`;
  }
  return `${protocol}//${APP_DOMAIN}${path}`;
}

export function redirectToSubdomain(subdomain: string | null, path: string = '') {
  window.location.href = getSubdomainUrl(subdomain, path);
}
