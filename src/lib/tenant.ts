export function getTenantFromHost(host: string) {
    // Simple subdomain extraction
    // localhost:3000 -> null
    // tenant.domain.com -> tenant

    if (!host) return null;

    const parts = host.split('.');

    // Check if localhost (development)
    if (host.includes('localhost')) {
        // for dev: sub.localhost:3000
        if (parts.length > 1 && parts[0] !== 'localhost') {
            return parts[0];
        }
        return null;
    }

    // Production (sub.domain.com)
    if (parts.length > 2) {
        return parts[0];
    }

    return null;
}
