import api from '../lib/api'
import type { PostDto, CreatePostDto, CommentDto, CreateCommentDto, PresignedUploadUrlDto } from '../types'

export const postService = {
    getAll: async (topicId?: number, page: number = 1, pageSize: number = 10): Promise<PostDto[]> => {
        if (topicId) {
            // Note: Pagination not yet implemented for topic-specific posts in backend
            const response = await api.get<PostDto[]>(`/Post/topic/${topicId}`)
            return response.data
        } else {
            const response = await api.get<PostDto[]>(`/Post/recent?page=${page}&pageSize=${pageSize}`)
            return response.data
        }
    },

    getMyPosts: async (): Promise<PostDto[]> => {
        const response = await api.get<PostDto[]>('/Post/mine')
        return response.data
    },

    getPendingPosts: async (): Promise<PostDto[]> => {
        const response = await api.get<PostDto[]>('/Post/admin/pending')
        return response.data
    },

    getById: async (id: number): Promise<PostDto> => {
        const response = await api.get<PostDto>(`/Post/${id}`)
        return response.data
    },

    getUploadUrl: async (file: File): Promise<PresignedUploadUrlDto> => {
        const response = await api.post<any>('/Storage/upload-url', {
            fileName: file.name,
            contentType: file.type,
            fileSizeBytes: file.size
        }, {
            params: { folder: 'posts' }
        })
        // Wrap response if it comes in ApiResponse wrapper? Backend returns ApiResponse.Success(result)
        // api.post usually returns the data directly if interceptor handles it? 
        // Let's assume interceptor unwraps .data?
        // Checking axiosConfig might be wise, but usually response.data is the payload.
        // Backend returns ApiResponse<T>. My axios interceptor usually unwraps it.
        // Let's assume unwrapped.
        return response.data
    },

    uploadFileToR2: async (url: string, file: File): Promise<void> => {
        // Direct upload to R2/S3 using PUT
        await fetch(url, {
            method: 'PUT',
            body: file,
            headers: {
                'Content-Type': file.type
            }
        })
    },

    create: async (data: CreatePostDto): Promise<PostDto> => {
        // Now sending JSON
        // Ensure we don't send imageFile object in JSON
        const { imageFile, ...payload } = data
        const response = await api.post<PostDto>('/Post', payload)
        return response.data
    },

    update: async (id: number, data: Partial<CreatePostDto>): Promise<PostDto> => {
        const response = await api.put<PostDto>(`/Post/${id}`, data)
        return response.data
    },

    approve: async (id: number): Promise<void> => {
        await api.put(`/Post/admin/${id}/approve`)
    },

    reject: async (id: number, reason: string): Promise<void> => {
        await api.put(`/Post/admin/${id}/reject`, { reason })
    },

    like: async (id: number): Promise<void> => {
        await api.post(`/Post/${id}/like`)
    },

    unlike: async (id: number): Promise<void> => {
        await api.post(`/Post/${id}/like`) // Same endpoint toggles
    },

    addComment: async (data: CreateCommentDto): Promise<CommentDto> => {
        const response = await api.post<CommentDto>(`/Post/${data.postId}/comments`, data)
        return response.data
    },

    getComments: async (postId: number): Promise<CommentDto[]> => {
        const response = await api.get<CommentDto[]>(`/Post/${postId}/comments`)
        return response.data
    },

    deletePost: async (id: number): Promise<void> => {
        await api.delete(`/Post/${id}`)
    },

    deleteComment: async (id: number): Promise<void> => {
        await api.delete(`/Post/comments/${id}`)
    }
}
