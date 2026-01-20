import { useState, useEffect } from 'react';
import { Employee } from '@/types/employee';

export function useEmployees() {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch('/api/employees')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setEmployees(data.data);
                } else {
                    setError(data.error || 'Failed to fetch');
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    return { employees, loading, error };
}
