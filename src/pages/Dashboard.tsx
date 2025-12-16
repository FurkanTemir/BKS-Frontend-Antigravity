import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, TrendingUp, Sparkles, Loader, BookOpen, Clock } from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import { gamificationService } from '../services/gamificationService'
import type { DashboardSummary, GamificationProfileDto } from '../types'

const Dashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [gamification, setGamification] = useState<GamificationProfileDto | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                const [dashboardData, gamificationData] = await Promise.all([
                    dashboardService.getSummary(),
                    gamificationService.getMyProfile()
                ])
                setSummary(dashboardData)
                setGamification(gamificationData)
            } catch (error) {
                console.error('Dashboard verileri yüklenemedi', error)
            } finally {
                setLoading(false)
            }
        }
        loadDashboard()
    }, [])

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Loader className="w-12 h-12 text-neon-cyan animate-spin" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan via-neon-blue to-neon-purple bg-clip-text text-transparent">
                    Dashboard
                </h1>
                <p className="text-gray-400 text-lg">
                    Hoş geldin! İşte bugünkü özet.
                </p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {/* Streak Widget */}
                <div className="glass-card group hover:shadow-orange-500 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Günlük Seri</h3>
                            <div className="relative">
                                <Flame className="text-orange-400 animate-pulse" size={28} />
                                <div className="absolute inset-0 blur-lg bg-orange-400/50" />
                            </div>
                        </div>
                        <p className="text-5xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">
                            {gamification?.streak?.currentStreak ?? 0}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">gün üst üste 🔥</p>
                        <div className="relative h-2 bg-dark-200 rounded-full overflow-hidden mt-3">
                            <div
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                style={{ width: `${Math.min(((Number(gamification?.streak?.currentStreak ?? 0)) / 30) * 100, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Hedef: 30 gün</p>
                    </div>
                </div>

                {/* Today's Study Time */}
                <div className="glass-card group hover:shadow-neon-cyan transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Bugün</h3>
                            <Clock className="text-neon-cyan" size={28} />
                        </div>
                        <p className="text-5xl font-bold text-neon-cyan">
                            {Number(summary?.studyTime?.todayMinutes ?? 0)}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">dakika çalışma</p>
                    </div>
                </div>

                {/* Weekly Study Time */}
                <div className="glass-card group hover:shadow-neon-blue transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Bu Hafta</h3>
                            <Sparkles className="text-neon-blue" size={28} />
                        </div>
                        <p className="text-5xl font-bold text-neon-blue">
                            {Math.round(Number(summary?.studyTime?.thisWeekMinutes ?? 0) / 60)}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">saat çalışma</p>
                    </div>
                </div>

                {/* Last Mock Exam */}
                <div className="glass-card group hover:shadow-neon-purple transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Son Deneme</h3>
                            <TrendingUp className="text-neon-purple" size={28} />
                        </div>
                        <p className="text-5xl font-bold text-neon-purple">
                            {summary?.mockExam?.lastExamNet !== undefined && summary?.mockExam?.lastExamNet !== null && !isNaN(Number(summary.mockExam.lastExamNet))
                                ? Number(summary.mockExam.lastExamNet).toFixed(1)
                                : '-'}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            {summary?.mockExam?.lastExamNet !== undefined && summary?.mockExam?.lastExamNet !== null ? 'Net' : 'Henüz Yok'}
                        </p>
                    </div>
                </div>

                {/* Topic Progress */}
                <div className="glass-card group hover:shadow-orange-500 transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-200">Konu İlerlemesi</h3>
                            <BookOpen className="text-orange-400" size={28} />
                        </div>
                        <p className="text-5xl font-bold text-orange-400">
                            {Number(summary?.topicProgress?.completedTopics ?? 0)}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">
                            / {Number(summary?.topicProgress?.totalTopics ?? 0)} konu tamamlandı
                        </p>
                    </div>
                </div>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4">Oturum İstatistikleri</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-dark-300/30 rounded-xl">
                            <p className="text-4xl">🍅</p>
                            <p className="text-3xl font-bold text-neon-cyan mt-2">
                                {summary?.studyTime?.pomodoroCount || 0}
                            </p>
                            <p className="text-sm text-gray-400">Pomodoro</p>
                        </div>
                        <div className="text-center p-4 bg-dark-300/30 rounded-xl">
                            <p className="text-4xl">⏱️</p>
                            <p className="text-3xl font-bold text-neon-purple mt-2">
                                {summary?.studyTime?.normalSessionCount || 0}
                            </p>
                            <p className="text-sm text-gray-400">Normal Sayaç</p>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6">
                    <h3 className="text-xl font-semibold mb-4">Deneme Sınavları</h3>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-dark-300/30 rounded-xl">
                            <p className="text-3xl font-bold text-neon-blue">
                                {summary?.mockExam?.totalExams || 0}
                            </p>
                            <p className="text-sm text-gray-400">Toplam</p>
                        </div>
                        <div className="text-center p-4 bg-dark-300/30 rounded-xl">
                            <p className="text-3xl font-bold text-green-400">
                                {summary?.mockExam?.tytCount || 0}
                            </p>
                            <p className="text-sm text-gray-400">TYT</p>
                        </div>
                        <div className="text-center p-4 bg-dark-300/30 rounded-xl">
                            <p className="text-3xl font-bold text-orange-400">
                                {summary?.mockExam?.aytCount || 0}
                            </p>
                            <p className="text-sm text-gray-400">AYT</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card p-6">
                <h3 className="text-xl font-semibold mb-4">Hızlı Erişim</h3>
                <div className="flex flex-wrap gap-4">
                    <Link to="/study-sessions" className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 font-semibold hover:scale-105 transition-transform">
                        🍅 Pomodoro Başlat
                    </Link>
                    <Link to="/mock-exams" className="px-6 py-3 rounded-xl bg-gradient-to-r from-neon-purple to-pink-500 text-white font-semibold hover:scale-105 transition-transform">
                        📝 Deneme Ekle
                    </Link>
                    <Link to="/topics" className="px-6 py-3 rounded-xl glass-card hover:bg-white/10 font-semibold transition-colors">
                        📚 Konulara Git
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Dashboard

