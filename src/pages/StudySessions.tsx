import { Play, Pause, RotateCcw, Clock, Loader2, Save, Trash2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { studySessionService } from '../services/studySessionService'
import { topicService } from '../services/topicService'
import { useTimerStore } from '../stores/timerStore'
import type { StudySessionDto, TopicDto } from '../types'

const StudySessions = () => {
    const [sessions, setSessions] = useState<StudySessionDto[]>([])
    const [topics, setTopics] = useState<TopicDto[]>([])
    const [isLoading, setIsLoading] = useState(true)

    // Global Timer Store
    const {
        timeLeft,
        isRunning,
        isPaused,
        startSession,
        pauseSession,
        resumeSession,
        resetSession,
        finishSession,
        setTopicId,
        selectedTopicId,
        sessionType,
        setSessionType,
        plannedDuration,
        setPlannedDuration
    } = useTimerStore()

    const durationOptions = [5, 15, 25, 30, 45, 60] // minutes

    const fetchData = useCallback(async () => {
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
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        console.log("Fetched Sessions:", sessions);
        sessions.forEach(s => {
            console.log(`Session ID: ${s.id}, TopicId: ${s.topicId}, TopicName: ${s.topicName}`);
        });
    }, [sessions]);

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

    const handleStart = async () => {
        try {
            await startSession()
        } catch (err) {
            console.error(err)
        }
    }

    const handleFinish = async () => {
        try {
            await finishSession()
            // Refresh list
            const newSessions = await studySessionService.getAll()
            setSessions(newSessions)
        } catch (err) {
            console.error(err)
        }
    }

    const handleDeleteSession = async (id: number) => {
        if (!confirm('Bu çalışma oturumu kaydını silmek istediğinize emin misiniz?')) return

        try {
            await studySessionService.delete(id)
            setSessions(sessions.filter(s => s.id !== id))
        } catch (err) {
            console.error('Failed to delete session:', err)
        }
    }

    const progress = sessionType === 'Pomodoro'
        ? ((plannedDuration - timeLeft) / plannedDuration) * 100
        : 0

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

            {/* Timer */}
            <div className="glass-card p-12 text-center">
                {/* Timer Type Selection */}
                <div className="flex justify-center gap-4 mb-8">
                    <button
                        onClick={() => !isRunning && !isPaused && setSessionType('Pomodoro')}
                        disabled={isRunning || isPaused}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${sessionType === 'Pomodoro'
                            ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400'
                            : 'glass-card hover:bg-white/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        🍅 Pomodoro
                    </button>
                    <button
                        onClick={() => !isRunning && !isPaused && setSessionType('Normal')}
                        disabled={isRunning || isPaused}
                        className={`px-6 py-3 rounded-xl font-semibold transition-all ${sessionType === 'Normal'
                            ? 'bg-gradient-to-r from-neon-purple to-pink-500 text-white'
                            : 'glass-card hover:bg-white/10'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        ⏱️ Normal Sayaç
                    </button>
                </div>

                <div className="mb-8">
                    <h2 className="text-3xl font-semibold mb-2">
                        {sessionType === 'Pomodoro' ? 'Pomodoro Sayacı' : 'Normal Sayaç'}
                    </h2>
                    <p className="text-gray-400">
                        {sessionType === 'Pomodoro'
                            ? `${plannedDuration / 60} dakikalık odaklanmış çalışma`
                            : 'Başlangıçtan itibaren geçen süre'}
                    </p>
                </div>

                {/* Duration Selector for Pomodoro */}
                {sessionType === 'Pomodoro' && !isRunning && !isPaused && (
                    <div className="mb-8 max-w-md mx-auto">
                        <label className="block text-sm text-gray-400 mb-2">Süre Seçin</label>
                        <div className="grid grid-cols-3 gap-2">
                            {durationOptions.map((mins) => (
                                <button
                                    key={mins}
                                    onClick={() => setPlannedDuration(mins * 60)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${plannedDuration === mins * 60
                                        ? 'bg-neon-cyan text-dark-400'
                                        : 'bg-dark-300/50 hover:bg-dark-300'
                                        }`}
                                >
                                    {mins} dk
                                </button>
                            ))}
                        </div>
                    </div>
                )}

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
                    {!isRunning && !isPaused ? (
                        <button
                            onClick={handleStart}
                            className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <Play size={24} />
                            Başlat
                        </button>
                    ) : isPaused ? (
                        <>
                            <button
                                onClick={resumeSession}
                                className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 flex items-center gap-2"
                            >
                                <Play size={24} />
                                Devam Et
                            </button>
                            <button
                                onClick={handleFinish}
                                className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-green-400 to-green-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                            >
                                <Save size={24} />
                                Kaydet
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={pauseSession}
                            className="px-8 py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                        >
                            <Pause size={24} />
                            Duraklat
                        </button>
                    )}

                    <button
                        onClick={() => resetSession()}
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
                        onChange={(e) => setTopicId(e.target.value ? parseInt(e.target.value) : null)}
                        disabled={isRunning || isPaused}
                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all disabled:opacity-50"
                    >
                        <option value="">Konu seçiniz...</option>
                        {topics.map((topic) => (
                            <option key={topic.id} value={topic.id}>
                                {topic.lesson} - {topic.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Weekly Stats */}
            <div className="grid grid-cols-4 gap-6">
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
                    <div className="text-4xl mb-3">⏱️</div>
                    <p className="text-4xl font-bold text-neon-purple">
                        {sessions.filter(s => s.sessionType === 'Normal').length}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">Normal Sayaç</p>
                </div>
                <div className="glass-card p-6 text-center">
                    <div className="text-4xl mb-3">📚</div>
                    <p className="text-4xl font-bold text-green-400">{sessions.length}</p>
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
                                className="flex items-center justify-between p-4 bg-dark-300/30 rounded-lg hover:bg-dark-300/50 transition-colors relative group pr-16"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${session.sessionType === 'Pomodoro'
                                        ? 'bg-gradient-to-br from-neon-cyan to-neon-blue'
                                        : 'bg-gradient-to-br from-neon-purple to-pink-500'
                                        }`}>
                                        <span className="text-2xl">{session.sessionType === 'Pomodoro' ? '🍅' : '⏱️'}</span>
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

                                <button
                                    onClick={() => handleDeleteSession(session.id)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 bg-dark-200 shadow-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 rounded-lg transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

export default StudySessions
