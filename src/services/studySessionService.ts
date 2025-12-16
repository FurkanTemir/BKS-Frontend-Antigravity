import api from '../lib/api'
import type { StudySessionDto, CreateStudySessionDto, EndStudySessionDto } from '../types'

// StudySession API calls - backend uses /StudySession
export const studySessionService = {
    getAll: async (): Promise<StudySessionDto[]> => {
        const response = await api.get<StudySessionDto[]>('/StudySession')
        return response.data
    },

    start: async (data: CreateStudySessionDto): Promise<{ sessionId: number }> => {
        // Backend returns { sessionId, message } not full StudySessionDto
        const response = await api.post<{ sessionId: number }>('/StudySession/start', data)
        return response.data
    },

    end: async (data: EndStudySessionDto): Promise<{ message: string }> => {
        // Backend returns simple success message
        const response = await api.put<{ message: string }>('/StudySession/end', data)
        return response.data
    },

    getWeeklyStats: async () => {
        const response = await api.get('/StudySession/stats/weekly')
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/StudySession/${id}`)
    },
}
