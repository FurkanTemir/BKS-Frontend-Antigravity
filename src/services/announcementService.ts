import api from '../lib/api'
import type { AnnouncementDto, CreateAnnouncementDto } from '../types'

export const announcementService = {
    getActive: async (): Promise<AnnouncementDto[]> => {
        const response = await api.get<AnnouncementDto[]>('/Announcement/active')
        return response.data
    },

    create: async (data: CreateAnnouncementDto): Promise<AnnouncementDto> => {
        const response = await api.post<AnnouncementDto>('/Announcement', data)
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Announcement/${id}`)
    }
}
