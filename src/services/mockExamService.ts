import api from '../lib/api'
import type { MockExamDto, CreateMockExamDto, MockExamTargetDto } from '../types'

export const mockExamService = {
    getAll: async (): Promise<MockExamDto[]> => {
        const response = await api.get<MockExamDto[]>('/MockExam')
        return response.data
    },

    getById: async (id: number): Promise<MockExamDto> => {
        const response = await api.get<MockExamDto>(`/MockExam/${id}`)
        return response.data
    },

    create: async (data: CreateMockExamDto): Promise<MockExamDto> => {
        const response = await api.post<MockExamDto>('/MockExam', data)
        return response.data
    },

    update: async (id: number, data: CreateMockExamDto): Promise<MockExamDto> => {
        const response = await api.put<MockExamDto>('/MockExam', { ...data, id })
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/MockExam/${id}`)
    },

    getNetChart: async (examType: number) => {
        const response = await api.get('/MockExam/charts/net-change', {
            params: { examType }
        })
        return response.data
    },

    getSubjectProgressChart: async (examType: number) => {
        const response = await api.get('/MockExam/charts/subject-progress', {
            params: { examType }
        })
        return response.data
    },

    getAverageNetTrend: async (examType: number) => {
        const response = await api.get('/MockExam/charts/average-net-trend', {
            params: { examType }
        })
        return response.data
    },

    getPerformanceChart: async (examType: number) => {
        const response = await api.get('/MockExam/charts/performance', {
            params: { examType }
        })
        return response.data
    },

    setTarget: async (data: MockExamTargetDto): Promise<void> => {
        await api.post('/MockExam/set-target', data)
    },
}
