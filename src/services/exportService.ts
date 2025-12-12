import api from '../lib/api'

export const exportService = {
    exportTopicProgress: async (): Promise<Blob> => {
        const response = await api.get('/Export/topic-progress', { responseType: 'blob' })
        return response.data
    },

    exportMockExams: async (): Promise<Blob> => {
        const response = await api.get('/Export/mock-exams', { responseType: 'blob' })
        return response.data
    },

    exportStudySessions: async (): Promise<Blob> => {
        const response = await api.get('/Export/study-sessions', { responseType: 'blob' })
        return response.data
    },

    exportAllData: async (): Promise<Blob> => {
        const response = await api.get('/Export/all-data', { responseType: 'blob' })
        return response.data
    }
}
