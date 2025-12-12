import api from '../lib/api'
import type {
    ComprehensiveAnalysisDto,
    StudyTimeChartData,
    HeatmapData,
    TimeWastedData
} from '../types'

export const analyticsService = {
    getComprehensive: async (): Promise<ComprehensiveAnalysisDto> => {
        const response = await api.get<ComprehensiveAnalysisDto>('/Analytics/comprehensive')
        return response.data
    },

    getStudyTimeChart: async (startDate: string, endDate: string): Promise<StudyTimeChartData[]> => {
        const response = await api.get<StudyTimeChartData[]>(`/Analytics/study-time-chart`, {
            params: { startDate, endDate }
        })
        return response.data
    },

    getHeatmap: async (startDate: string, endDate: string): Promise<HeatmapData[]> => {
        const response = await api.get<HeatmapData[]>(`/Analytics/heatmap`, {
            params: { startDate, endDate }
        })
        return response.data
    },

    getTimeWasted: async (startDate: string, endDate: string): Promise<TimeWastedData[]> => {
        const response = await api.get<TimeWastedData[]>(`/Analytics/time-wasted`, {
            params: { startDate, endDate }
        })
        return response.data
    }
}
