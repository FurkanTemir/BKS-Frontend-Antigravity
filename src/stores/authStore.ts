import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
    id: number
    email: string
    firstName: string
    lastName: string
    userName: string
    fieldType: string
}

interface AuthState {
    user: User | null
    token: string | null
    refreshToken: string | null
    isAuthenticated: boolean

    // Actions
    setUser: (user: User) => void
    setTokens: (token: string, refreshToken: string) => void
    login: (user: User, token: string, refreshToken: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,

            setUser: (user) => set({ user }),

            setTokens: (token, refreshToken) => set({ token, refreshToken }),

            login: (user, token, refreshToken) => set({
                user,
                token,
                refreshToken,
                isAuthenticated: true,
            }),

            logout: () => set({
                user: null,
                token: null,
                refreshToken: null,
                isAuthenticated: false,
            }),
        }),
        {
            name: 'bks-auth', // localStorage key
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)
