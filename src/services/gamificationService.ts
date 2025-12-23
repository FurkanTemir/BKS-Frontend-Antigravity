import api from '../lib/api'
import type { GamificationProfileDto, ProfileStats } from '../types'

export const gamificationService = {
    getMyProfile: async (): Promise<GamificationProfileDto> => {
        const response = await api.get<GamificationProfileDto>('/Gamification/my-profile')
        return response.data
    },

    getProfileStats: async (): Promise<ProfileStats> => {
        const response = await api.get<ProfileStats>('/Gamification/stats')
        return response.data
    },

    // Debug method
    setStreak: async (days: number): Promise<void> => {
        await api.post(`/Gamification/debug/set-my-streak/${days}`)
    }
}
