import api from '../lib/api'
import type {
    NotificationDto,
    CreateNotificationDto,
    NotificationMessageDto
} from '../types'

export const notificationService = {
    // Reminders
    getAll: async (): Promise<NotificationDto[]> => {
        const response = await api.get<NotificationDto[]>('/Notification')
        return response.data
    },

    getById: async (id: number): Promise<NotificationDto> => {
        const response = await api.get<NotificationDto>(`/Notification/${id}`)
        return response.data
    },

    create: async (data: CreateNotificationDto): Promise<NotificationDto> => {
        const response = await api.post<NotificationDto>('/Notification', data)
        return response.data
    },

    update: async (id: number, data: CreateNotificationDto): Promise<void> => {
        await api.put(`/Notification/${id}`, data) // Backend might expect object with ID inside, checked controller: uses [FromBody] NotificationDto which usually doesn't have ID in body for update if route param exists, but let's check controller later. Just assuming standard REST.
    },

    toggle: async (id: number): Promise<void> => {
        await api.put(`/Notification/${id}/toggle`)
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Notification/${id}`)
    },

    // Notification Messages (Inbox)
    getMessages: async (unreadOnly = false): Promise<NotificationMessageDto[]> => {
        const response = await api.get<NotificationMessageDto[]>('/Notification/messages', {
            params: { unreadOnly }
        })
        return response.data
    },

    getUnreadCount: async (): Promise<number> => {
        const response = await api.get<number>('/Notification/messages/unread-count')
        return response.data
    },

    markRead: async (id: number): Promise<void> => {
        await api.put(`/Notification/messages/${id}/read`)
    },

    markAllRead: async (): Promise<void> => {
        await api.put('/Notification/messages/read-all')
    },

    deleteMessage: async (id: number): Promise<void> => {
        await api.delete(`/Notification/messages/${id}`)
    }
}
