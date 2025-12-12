import api from '../lib/api'
import type { DashboardSummary } from '../types'

export const dashboardService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>('/Dashboard/summary')
        return response.data
    },

    getWeeklyChart: async () => {
        const response = await api.get('/Dashboard/charts/weekly')
        return response.data
    },

    // Recommendations removed as per user request


    getComparativeStats: async () => {
        const response = await api.get('/Dashboard/comparative')
        return response.data
    },

    getTrends: async () => {
        const response = await api.get('/Dashboard/trends')
        return response.data
    },
}
