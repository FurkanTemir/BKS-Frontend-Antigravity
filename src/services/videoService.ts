import api from '../lib/api'
import type { VideoDto, GenerateUploadUrlRequest } from '../types'

export const videoService = {
    generateUploadUrl: async (data: GenerateUploadUrlRequest): Promise<{ uploadUrl: string, fileId: string }> => {
        const response = await api.post<{ uploadUrl: string, fileId: string }>('/Video/upload-url', data)
        return response.data
    },

    confirmUpload: async (id: number): Promise<VideoDto> => {
        const response = await api.post<VideoDto>(`/Video/${id}/confirm`)
        return response.data
    },

    getVideo: async (id: number): Promise<VideoDto> => {
        const response = await api.get<VideoDto>(`/Video/${id}`)
        return response.data
    },

    deleteVideo: async (id: number): Promise<void> => {
        await api.delete(`/Video/${id}`)
    }
}
