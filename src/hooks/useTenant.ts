import { useState, useEffect } from 'react';

export function useTenant() {
    // In a real app, parse window.location or use context
    const [tenant, setTenant] = useState({
        id: 'default',
        name: 'Demo Company',
        logo: null
    });

    return { tenant, loading: false };
}
