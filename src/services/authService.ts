import api from '../lib/api'
import type {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '../types'

export const authService = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/Auth/login', data)
        return response.data
    },

    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/Auth/register', data)
        return response.data
    },

    getProfile: async () => {
        const response = await api.get('/Auth/profile')
        return response.data
    },

    updateProfile: async (data: UpdateProfileRequest) => {
        const response = await api.put('/Auth/profile', data)
        return response.data
    },

    changePassword: async (data: ChangePasswordRequest) => {
        const response = await api.put('/Auth/change-password', data)
        return response.data
    },

    refreshToken: async (refreshToken: string) => {
        const response = await api.post('/Auth/refresh-token', { refreshToken })
        return response.data
    },

    logout: async () => {
        const response = await api.post('/Auth/logout')
        return response.data
    },
}
