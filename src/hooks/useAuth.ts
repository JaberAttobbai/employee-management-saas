import { useState, useEffect } from 'react';
import { User } from '@/types/user';

export function useAuth() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // We assume an API endpoint /api/auth/me exists or will exist
        // Currently using the session approach or existing logic
        // For now, we can try to hit a protected endpoint or check cookie presence
        // Ideally we should implement /api/auth/me

        const checkAuth = async () => {
            try {
                // For now, we might not have /api/auth/me. 
                // In the existing project, auth is server-side mainly.
                // We will implement a simple fetch here expecting the API to be created in Phase 3
                // or we could check if we can read the cookie (client side can't read httpOnly)

                // Temporary: fail gracefully if endpoint doesn't exist
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.data);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    const logout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            setUser(null);
            window.location.href = '/login';
        } catch (error) {
            console.error('Logout failed', error);
        }
    }

    return { user, loading, logout };
}
