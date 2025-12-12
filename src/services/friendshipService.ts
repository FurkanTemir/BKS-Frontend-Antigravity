import api from '../lib/api'
import type { FriendDto, FriendRequestDto } from '../types'

export const friendshipService = {
    sendRequest: async (friendIdentifier: string): Promise<{ friendshipId: number }> => {
        const response = await api.post<{ friendshipId: number }>('/Friendship/request', { friendIdentifier })
        return response.data
    },

    acceptRequest: async (friendshipId: number): Promise<void> => {
        await api.put(`/Friendship/${friendshipId}/accept`)
    },

    rejectRequest: async (friendshipId: number): Promise<void> => {
        await api.put(`/Friendship/${friendshipId}/reject`)
    },

    removeFriend: async (friendId: number): Promise<void> => {
        await api.delete(`/Friendship/${friendId}`)
    },

    getFriends: async (): Promise<FriendDto[]> => {
        const response = await api.get<FriendDto[]>('/Friendship/friends')
        return response.data
    },

    getPendingRequests: async (): Promise<FriendRequestDto[]> => {
        const response = await api.get<FriendRequestDto[]>('/Friendship/requests')
        return response.data
    },

    cancelRequest: async (friendshipId: number): Promise<void> => {
        await api.delete(`/Friendship/request/${friendshipId}`)
    }
}
