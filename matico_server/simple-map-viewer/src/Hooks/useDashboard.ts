import { useState, useEffect } from 'react';
import api, {
    getDashboard,
    updateDashboard,
} from 'api';
import {
    Dashboard,
    UpdateDashboardDTO,
} from 'types'

export const useDashboard = (id: string) => {
    const [dashboard, setDashboard] = useState<Dashboard | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [saving, setSaving] = useState<boolean>(false);

    useEffect(() => {
        setLoading(true);
        getDashboard(id)
            .then((result) => setDashboard(result.data))
            .catch((e) => setError(e.toString()))
            .finally(() => setLoading(false));
    }, [id]);

    const updateDash = (update: UpdateDashboardDTO) => {
        setSaving(true);
        updateDashboard(id, update)
            .then((update) => setDashboard(update.data))
            .catch((e) => setError(e.toString()))
            .finally(() => setSaving(false));
    };

    return {
        dashboard,
        error,
        saving,
        loading,
        updateDashboard: updateDash,
    };
};
