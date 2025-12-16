import { useEffect } from 'react'
import { useTimerStore } from '../stores/timerStore'

const GlobalTimer = () => {
    const { isRunning, timeLeft, tick, finishSession, sessionType, plannedDuration } = useTimerStore()

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null

        if (isRunning) {
            interval = setInterval(() => {
                tick()
            }, 1000)
        }

        // Auto-finish only for Pomodoro when time reaches 0
        if (sessionType === 'Pomodoro' && timeLeft === 0 && isRunning) {
            finishSession()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning, timeLeft, tick, finishSession, sessionType, plannedDuration])

    return null // Invisible component
}

export default GlobalTimer
