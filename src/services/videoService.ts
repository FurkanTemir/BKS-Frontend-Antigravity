import api from '../lib/api'
import type { VideoDto, GenerateUploadUrlRequest, PresignedUploadUrlDto } from '../types'

export const videoService = {
    generateUploadUrl: async (data: GenerateUploadUrlRequest): Promise<PresignedUploadUrlDto> => {
        const response = await api.post<PresignedUploadUrlDto>('/Video/upload-url', data)
        return response.data
    },

    uploadFileToUrl: async (uploadUrl: string, file: File) => {
        const response = await fetch(uploadUrl, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        })

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`)
        }
    },

    confirmUpload: async (id: number): Promise<VideoDto> => {
        const response = await api.post<VideoDto>(`/Video/${id}/confirm`, {})
        return response.data
    },

    getVideo: async (id: number): Promise<VideoDto> => {
        const response = await api.get<VideoDto>(`/Video/${id}`)
        return response.data
    },

    deleteVideo: async (id: number): Promise<boolean> => {
        const response = await api.delete<boolean>(`/Video/${id}`)
        return response.data
    }
}
