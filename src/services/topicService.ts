import api from '../lib/api'
import type { TopicDto } from '../types'

// Topics API calls - backend uses /Topics (plural)
export const topicService = {
    getAll: async (): Promise<TopicDto[]> => {
        const response = await api.get<TopicDto[]>('/Topics')
        return response.data
    },

    getByExamType: async (examType: 'TYT' | 'AYT'): Promise<TopicDto[]> => {
        const examTypeNum = examType === 'TYT' ? 1 : 2
        const response = await api.get<TopicDto[]>(`/Topics?examType=${examTypeNum}`)
        return response.data
    },

    toggleCompletion: async (id: number): Promise<{ isCompleted: boolean }> => {
        console.log('Toggling topic:', id)
        const response = await api.post<any>('/Topics/toggle', { topicId: id })
        console.log('Toggle response:', response.data)
        // Backend returns camelCase 'isCompleted' usually
        return { isCompleted: response.data.isCompleted ?? response.data.IsCompleted }
    },

    markComplete: async (id: number): Promise<void> => {
        await api.post('/Topics/toggle', { TopicId: id })
    },

    markIncomplete: async (id: number): Promise<void> => {
        await api.post('/Topics/toggle', { TopicId: id })
    },

    bulkComplete: async (topicIds: number[], isCompleted: boolean): Promise<void> => {
        await api.post('/Topics/bulk-complete', { topicIds, isCompleted })
    }
}
