import api from "../lib/api";
import type { PublicUserProfileDto } from '../types'

export const userService = {
    getPublicProfile: async (username: string): Promise<PublicUserProfileDto> => {
        if (!username) throw new Error("Username cannot be empty");
        // Remove trailing spaces or slashes if any
        const cleanUsername = username.trim().replace(/\/$/, "");
        const safeUsername = encodeURIComponent(cleanUsername);

        const response = await api.get<any>(`/User/${safeUsername}`)
        // Unwrap ApiResponse if needed, similar to other services
        return response.data
    },

    toggleFollow: async (userId: number): Promise<{ isFollowing: boolean }> => {
        const response = await api.post(`/Follow/${userId}`)
        return response.data;
    }
}
