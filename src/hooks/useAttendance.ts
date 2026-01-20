import { useState, useEffect } from 'react';
import { Attendance } from '@/types/attendance';

export function useAttendance() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [loading, setLoading] = useState(true);

    // This would usually accept a date range or employee ID
    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/attendance');
            const data = await res.json();
            if (data.success) {
                setAttendance(data.data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Don't auto-fetch everything potentially, but for now we do to match pattern
        // fetchAttendance(); 
        setLoading(false); // Default to not loading until manually triggered or implemented
    }, []);

    return { attendance, loading, fetchAttendance };
}
