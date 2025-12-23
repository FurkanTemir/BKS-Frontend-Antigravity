import api from '../lib/api';
import type { UserActivity } from '../types/UserActivity';

export const activityService = {
    getRecentActivities: async (): Promise<UserActivity[]> => {
        const response = await api.get<UserActivity[]>(`/Activity/recent?t=${new Date().getTime()}`);
        return response.data;
    }
};
