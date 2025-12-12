import api from '../lib/api'
import type { PostDto, CreatePostDto, LeaderboardEntryDto, CommentDto, CreateCommentDto } from '../types'

// Post API calls - backend uses /Post/recent for listing
export const postService = {
    getAll: async (): Promise<PostDto[]> => {
        // Backend uses /Post/recent to get all posts, not plain GET /Post
        const response = await api.get<PostDto[]>('/Post/recent')
        return response.data
    },

    create: async (data: CreatePostDto): Promise<PostDto> => {
        const response = await api.post<PostDto>('/Post', data)
        return response.data
    },

    like: async (id: number): Promise<void> => {
        // Backend uses ToggleLike - POST /Post/{id}/like
        await api.post(`/Post/${id}/like`)
    },

    unlike: async (id: number): Promise<void> => {
        // Same endpoint toggles like/unlike
        await api.post(`/Post/${id}/like`)
    },

    getMyPosts: async (): Promise<PostDto[]> => {
        const response = await api.get<PostDto[]>('/Post/mine')
        return response.data
    },

    addComment: async (data: CreateCommentDto): Promise<CommentDto> => {
        const response = await api.post<CommentDto>(`/Post/${data.postId}/comments`, data)
        return response.data
    },

    getComments: async (postId: number): Promise<CommentDto[]> => {
        const response = await api.get<CommentDto[]>(`/Post/${postId}/comments`)
        return response.data
    },

    // Admin Features
    getPendingPosts: async (): Promise<PostDto[]> => {
        const response = await api.get<PostDto[]>('/Post/admin/pending')
        return response.data
    },

    approvePost: async (id: number): Promise<void> => {
        await api.put(`/Post/admin/${id}/approve`)
    },

    rejectPost: async (id: number, reason: string): Promise<void> => {
        await api.put(`/Post/admin/${id}/reject`, { reason })
    }
}

// Leaderboard API calls
export const leaderboardService = {
    getWeekly: async (): Promise<LeaderboardEntryDto[]> => {
        const response = await api.get<LeaderboardEntryDto[]>('/Leaderboard/weekly')
        return response.data
    },

    getMonthly: async (): Promise<LeaderboardEntryDto[]> => {
        const response = await api.get<LeaderboardEntryDto[]>('/Leaderboard/monthly')
        return response.data
    },
}
