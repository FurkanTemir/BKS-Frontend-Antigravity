import api from '../lib/api'
import type { MessageDto } from '../types'

export const messageService = {
    async getConversation(friendId: number): Promise<MessageDto[]> {
        const response = await api.get<MessageDto[]>(`/Messages/conversation/${friendId}`)
        return response.data
    },

    async sendMessage(receiverId: number, content: string): Promise<MessageDto> {
        const response = await api.post<MessageDto>('/Messages/send', { receiverId, content })
        return response.data
    },

    async markAsRead(friendId: number): Promise<void> {
        await api.post(`/Messages/mark-read/${friendId}`)
    }
}
