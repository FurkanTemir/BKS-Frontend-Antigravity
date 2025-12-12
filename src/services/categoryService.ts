import api from '../lib/api'
import type { CategoryDto } from '../types'

export const categoryService = {
    getAll: async (): Promise<CategoryDto[]> => {
        const response = await api.get<CategoryDto[]>('/Category')
        return response.data
    },

    getById: async (id: number): Promise<CategoryDto> => {
        const response = await api.get<CategoryDto>(`/Category/${id}`)
        return response.data
    },

    create: async (data: Omit<CategoryDto, 'id' | 'subCategories'>): Promise<number> => {
        const response = await api.post<{ id: number }>('/Category', data)
        return response.data.id
    },

    update: async (data: Partial<CategoryDto> & { id: number }): Promise<void> => {
        await api.put('/Category', data)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Category/${id}`)
    }
}
