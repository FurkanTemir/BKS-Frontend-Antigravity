import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { studySessionService } from '../services/studySessionService'

type SessionType = 'Pomodoro' | 'Normal'

interface TimerState {
    timeLeft: number
    isRunning: boolean
    isPaused: boolean
    currentSessionId: number | null
    startTime: string | null
    selectedTopicId: number | null
    sessionType: SessionType
    plannedDuration: number // in seconds

    // Actions
    setTopicId: (id: number | null) => void
    setSessionType: (type: SessionType) => void
    setPlannedDuration: (duration: number) => void
    startSession: (topicId?: number) => Promise<void>
    pauseSession: () => void
    resumeSession: () => void
    resetSession: () => Promise<void>
    finishSession: () => Promise<void>
    tick: () => void
}

const DEFAULT_POMODORO_DURATION = 25 * 60

export const useTimerStore = create<TimerState>()(
    persist(
        (set, get) => ({
            timeLeft: DEFAULT_POMODORO_DURATION,
            isRunning: false,
            isPaused: false,
            currentSessionId: null,
            startTime: null,
            selectedTopicId: null,
            sessionType: 'Pomodoro',
            plannedDuration: DEFAULT_POMODORO_DURATION,

            setTopicId: (id) => set({ selectedTopicId: id }),

            setSessionType: (type) => {
                const duration = type === 'Pomodoro' ? get().plannedDuration : 0
                set({
                    sessionType: type,
                    timeLeft: duration
                })
            },

            setPlannedDuration: (duration) => set({
                plannedDuration: duration,
                timeLeft: duration
            }),

            startSession: async (topicId) => {
                try {
                    const { selectedTopicId: stateTopicId, sessionType, plannedDuration } = get()
                    const finalTopicId = topicId !== undefined ? topicId : stateTopicId

                    const result = await studySessionService.start({
                        sessionType: sessionType === 'Pomodoro' ? 1 : 2,
                        topicId: finalTopicId ?? undefined
                    })

                    const initialTime = sessionType === 'Pomodoro' ? plannedDuration : 0

                    set({
                        currentSessionId: result.sessionId,
                        startTime: new Date().toISOString(),
                        isRunning: true,
                        isPaused: false,
                        timeLeft: initialTime,
                        selectedTopicId: finalTopicId
                    })
                } catch (err) {
                    console.error('Failed to start session in store:', err)
                    throw err
                }
            },

            pauseSession: () => set({ isRunning: false, isPaused: true }),

            resumeSession: () => set({ isRunning: true, isPaused: false }),

            resetSession: async () => {
                const { currentSessionId, sessionType, plannedDuration } = get()
                if (currentSessionId) {
                    try {
                        await studySessionService.delete(currentSessionId)
                    } catch (err) {
                        console.error('Failed to delete cancelled session:', err)
                    }
                }

                const resetTime = sessionType === 'Pomodoro' ? plannedDuration : 0

                set({
                    isRunning: false,
                    isPaused: false,
                    currentSessionId: null,
                    startTime: null,
                    timeLeft: resetTime
                })
            },

            finishSession: async () => {
                const { currentSessionId, timeLeft, sessionType, plannedDuration } = get()
                if (!currentSessionId) return

                try {
                    const durationSeconds = sessionType === 'Pomodoro'
                        ? (plannedDuration - timeLeft)
                        : timeLeft

                    await studySessionService.end({
                        id: currentSessionId,
                        durationSeconds: durationSeconds > 0 ? durationSeconds : 1
                    })

                    const resetTime = sessionType === 'Pomodoro' ? plannedDuration : 0

                    set({
                        isRunning: false,
                        isPaused: false,
                        currentSessionId: null,
                        startTime: null,
                        timeLeft: resetTime
                    })
                } catch (err) {
                    console.error('Failed to finish session in store:', err)
                    throw err
                }
            },

            tick: () => {
                const { timeLeft, isRunning, sessionType } = get()
                if (!isRunning) return

                if (sessionType === 'Pomodoro') {
                    // Count down
                    if (timeLeft > 0) {
                        set({ timeLeft: timeLeft - 1 })
                    }
                } else {
                    // Count up
                    set({ timeLeft: timeLeft + 1 })
                }
            }
        }),
        {
            name: 'bks-timer-storage',
            partialize: (state) => ({
                timeLeft: state.timeLeft,
                isRunning: state.isRunning,
                isPaused: state.isPaused,
                currentSessionId: state.currentSessionId,
                startTime: state.startTime,
                selectedTopicId: state.selectedTopicId,
                sessionType: state.sessionType,
                plannedDuration: state.plannedDuration
            })
        }
    )
)
