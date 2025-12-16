import api from '../lib/api'
import type {
    ComprehensiveAnalysisDto,
    StudyTimeChartData,
    HeatmapData,
    TimeWastedData
} from '../types'

export const analyticsService = {
    /**
     * Tüm analiz verilerini tek seferde çeker.
     * NOT: Heatmap takviminin düzgün çalışması için bu endpoint'in
     * son 1 yıllık (365 gün) veriyi döndürmesi önerilir.
     */
    getComprehensive: async (): Promise<ComprehensiveAnalysisDto> => {
        const response = await api.get<ComprehensiveAnalysisDto>('/Analytics/comprehensive')
        return response.data
    },

    /**
     * Belirli bir tarih aralığı için çalışma grafiği verisi çeker.
     * Format: YYYY-MM-DD
     */
    getStudyTimeChart: async (startDate: string, endDate: string): Promise<StudyTimeChartData[]> => {
        const response = await api.get<StudyTimeChartData[]>(`/Analytics/study-time-chart`, {
            params: { startDate, endDate }
        })
        return response.data
    },

    /**
     * Belirli bir tarih aralığı için yoğunluk haritası (heatmap) verisi çeker.
     */
    getHeatmap: async (startDate: string, endDate: string): Promise<HeatmapData[]> => {
        const response = await api.get<HeatmapData[]>(`/Analytics/heatmap`, {
            params: { startDate, endDate }
        })
        return response.data
    },

    /**
     * Boşa harcanan zaman verisini çeker.
     */
    getTimeWasted: async (startDate: string, endDate: string): Promise<TimeWastedData[]> => {
        const response = await api.get<TimeWastedData[]>(`/Analytics/time-wasted`, {
            params: { startDate, endDate }
        })
        return response.data
    }
}
