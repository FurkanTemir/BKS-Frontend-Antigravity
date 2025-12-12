import { Play, Pause, RotateCcw, Clock, Loader2 } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { studySessionService } from '../services/studySessionService'
import { topicService } from '../services/topicService'
import type { StudySessionDto, CreateStudySessionDto, TopicDto } from '../types'

const StudySessions = () => {
    const [sessions, setSessions] = useState<StudySessionDto[]>([])
    const [topics, setTopics] = useState<TopicDto[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Pomodoro timer state
    const POMODORO_DURATION = 25 * 60
    const [timeLeft, setTimeLeft] = useState(POMODORO_DURATION)
    const [isRunning, setIsRunning] = useState(false)
    const [currentSessionId, setCurrentSessionId] = useState<number | null>(null)
    const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null)
    const startTimeRef = useRef<Date | null>(null)

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        let interval: ReturnType<typeof setInterval> | null = null

        if (isRunning && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((time) => time - 1)
            }, 1000)
        } else if (timeLeft === 0 && isRunning) {
            handleStopSession()
        }

        return () => {
            if (interval) clearInterval(interval)
        }
    }, [isRunning, timeLeft])

    const fetchData = async () => {
        try {
            const [sessionsData, topicsData] = await Promise.all([
                studySessionService.getAll(),
                topicService.getAll()
            ])
            setSessions(sessionsData)
            setTopics(topicsData)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const mins = Math.floor((seconds % 3600) / 60)
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    const handleStartSession = async () => {
        try {
            const data: CreateStudySessionDto = {
                sessionType: 1, // Pomodoro
                topicId: selectedTopicId ?? undefined,
            }
            const result = await studySessionService.start(data)
            setCurrentSessionId(result.sessionId)
            startTimeRef.current = new Date()
            setIsRunning(true)
        } catch (err) {
            console.error('Failed to start session:', err)
        }
    }

    const handleStopSession = async () => {
        if (!currentSessionId || !startTimeRef.current) return

        try {
            const durationSeconds = Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
            await studySessionService.end({ id: currentSessionId, durationSeconds })
            // Refresh sessions list after ending
            const newSessions = await studySessionService.getAll()
            setSessions(newSessions)
            setIsRunning(false)
            setCurrentSessionId(null)
            startTimeRef.current = null
            setTimeLeft(POMODORO_DURATION)
        } catch (err) {
            console.error('Failed to end session:', err)
        }
    }

    const handleReset = () => {
        if (isRunning && currentSessionId) {
            handleStopSession()
        }
        setTimeLeft(POMODORO_DURATION)
        setIsRunning(false)
    }

    const progress = ((POMODORO_DURATION - timeLeft) / POMODORO_DURATION) * 100

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                    Çalışma Oturumları
                </h1>
                <p className="text-gray-400 text-lg">Pomodoro tekniği ile verimli çalış</p>
            </header>

            {/* Pomodoro Timer */}
            <div className="glass-card p-12 text-center">
                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-2">Pomodoro Sayacı</h2>
                    <p className="text-gray-400">25 dakikalık odaklanmış çalışma</p>
                </div>

                {/* Circular Timer */}
                <div className="relative inline-block mb-8">
                    <svg className="w-64 h-64 -rotate-90">
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="8"
                            fill="none"
                        />
                        <circle
                            cx="128"
                            cy="128"
                            r="120"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 120}`}
                            strokeDashoffset={`${2 * Math.PI * 120 * (1 - progress / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#00E5FF" />
                                <stop offset="100%" stopColor="#3BB1FF" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div>
                            <p className="text-6xl font-bold text-neon-cyan">{formatTime(timeLeft)}</p>
                            <p className="text-sm text-gray-400 mt-2">{Math.round(progress)}% tamamlandı</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    {!isRunning ? (
                        <button
                            onClick={handleStartSession}
                            className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <Play size={24} />
                            Başlat
                        </button>
                    ) : (
                        <button
                            onClick={handleStopSession}
                            className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <Pause size={24} />
                            Durdur
                        </button>
                    )}
                    <button
                        onClick={handleReset}
                        className="px-8 py-4 rounded-xl font-semibold text-lg glass-card hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
                    >
                        <RotateCcw size={24} />
                        Sıfırla
                    </button>
                </div>

                {/* Topic Selector */}
                <div className="max-w-md mx-auto">
                    <label className="block text-sm text-gray-400 mb-2">Çalışılacak Konu (İsteğe Bağlı)</label>
                    <select
                        value={selectedTopicId ?? ''}
                        onChange={(e) => setSelectedTopicId(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={isRunning}
                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all disabled:opacity-50"
                    >
                        <option value="">Konu seçiniz...</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.subjectName} - {topic.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-3 gap-6">
                <div className="glass-card p-6 text-center">
                    <Clock className="text-neon-cyan mx-auto mb-3" size={32} />
                    <p className="text-4xl font-bold text-neon-cyan">
                        {formatDuration(sessions.reduce((sum, s) => sum + s.durationSeconds, 0))}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Toplam Süre</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-3">🍅</div>
                    <p className="text-4xl font-bold text-neon-blue">
                        {sessions.filter(s => s.sessionType === 'Pomodoro').length}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Pomodoro</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-4xl font-bold text-neon-purple">{sessions.length}</p>
                    <p className="text-sm text-gray-400 mt-2">Toplam Oturum</p>
                </div>
            </div>

            {/* Session History */}
            <div className="glass-card p-6">
                <h3 className="text-2xl font-semibold mb-6">Çalışma Geçmişi</h3>
                <div className="space-y-3">
                    {sessions.length === 0 ? (
                        <p className="text-gray-400 text-center py-4">Henüz çalışma oturumu yok</p>
                    ) : (
                        sessions.slice(0, 10).map((session) => (
                            <div
                                key={session.id}
                                className="flex items-center justify-between p-4 bg-dark-300/30 rounded-lg hover:bg-dark-300/50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.sessionType === 'Pomodoro'
                                        ? 'bg-gradient-to-br from-neon-cyan to-neon-blue'
                                        : 'bg-gradient-to-br from-neon-purple to-pink-500'
                                        }`}>
                                        <Clock size={24} className="text-dark-400" />
                                    </div>
                                    <div>
                                        <p className="font-semibold">{session.topicName || 'Genel Çalışma'}</p>
                                        <p className="text-sm text-gray-400">
                                            {new Date(session.startTime).toLocaleDateString('tr-TR')} • {session.sessionType}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-neon-cyan">{formatDuration(session.durationSeconds)}</p>
                                    <p className="text-xs text-gray-400">Süre</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudySessions
