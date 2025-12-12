import axios, { AxiosError } from 'axios'
import { useAuthStore } from '../stores/authStore'

// API Response wrapper from backend
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5166/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
})

// Request interceptor - Add JWT token
api.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor - Handle errors and unwrap ApiResponse
api.interceptors.response.use(
    (response) => {
        // Unwrap ApiResponse - return just the data
        if (response.data && typeof response.data === 'object' && 'success' in response.data) {
            const apiResponse = response.data as ApiResponse<unknown>
            if (!apiResponse.success) {
                return Promise.reject(new Error(apiResponse.message))
            }
            // Return the inner data for convenience
            response.data = apiResponse.data
        }
        return response
    },
    async (error: AxiosError<ApiResponse<unknown>>) => {
        const originalRequest = error.config

        // Handle 401 - Token expired
        if (error.response?.status === 401 && originalRequest) {
            const authStore = useAuthStore.getState()

            // Try to refresh token
            if (authStore.refreshToken) {
                try {
                    const response = await axios.post(
                        `${api.defaults.baseURL}/Auth/refresh-token`,
                        { refreshToken: authStore.refreshToken }
                    )

                    const { accessToken, refreshToken } = response.data.data
                    authStore.setTokens(accessToken, refreshToken)

                    // Retry original request
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`
                    return api(originalRequest)
                } catch {
                    // Refresh failed - logout
                    authStore.logout()
                    window.location.href = '/login'
                }
            } else {
                authStore.logout()
                window.location.href = '/login'
            }
        }

        // Extract error message
        const message = error.response?.data?.message || error.message || 'Bir hata oluştu'
        return Promise.reject(new Error(message))
    }
)

export default api
