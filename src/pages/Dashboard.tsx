import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Flame, TrendingUp, Sparkles, Loader } from 'lucide-react'
import { dashboardService } from '../services/dashboardService'
import type { DashboardSummary } from '../types'

// Mock Data removed


const Dashboard = () => {
    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                // Parallel fetch for potential future endpoints, currently just summary covers most
                // const [summaryData, trendsData] = await Promise.all([
                //     dashboardService.getSummary(),
                //     dashboardService.getTrends()
                // ])

                // For now, getSummary seems to have most info based on DTO
                const data = await dashboardService.getSummary()
                setSummary(data)
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Streak Widget */}
                <div className="glass-card group hover:shadow-neon-cyan transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-200">Günlük Seri</h3>
                            <div className="relative">
                                <Flame className="text-orange-400 animate-pulse" size={32} />
                                <div className="absolute inset-0 blur-lg bg-orange-400/50" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <p className="text-7xl font-bold bg-gradient-to-br from-orange-400 to-orange-600 bg-clip-text text-transparent">
                                {summary?.streak || 0}
                            </p>
                            <p className="text-sm text-gray-400">Gün üst üste çalışma 🔥</p>
                            <div className="relative h-2 bg-dark-200 rounded-full overflow-hidden">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
                                    style={{ width: `${Math.min(((summary?.streak || 0) / 30) * 100, 100)}%` }} // Hedef 30 gün varsayıldı
                                />
                            </div>
                            <p className="text-xs text-gray-500">Aylık Hedef: 30 gün</p>
                        </div>
                    </div>
                </div>

                {/* Weekly Progress (Last Mock Exam Net as placeholder or completed topics) */}
                <div className="glass-card group hover:shadow-neon-blue transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-200">Son Deneme</h3>
                            <div className="relative">
                                <TrendingUp className="text-neon-blue" size={32} />
                                <div className="absolute inset-0 blur-lg bg-neon-blue/50" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-2">
                                <p className="text-7xl font-bold text-neon-blue">
                                    {summary?.lastMockExamNet !== undefined ? summary.lastMockExamNet.toFixed(1) : '-'}
                                </p>
                                <span className="text-2xl text-neon-blue/70">
                                    {summary?.lastMockExamNet !== undefined ? 'Net' : 'Henüz Yok'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Study Time */}
                <div className="glass-card group hover:shadow-neon-purple transition-all duration-500 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-purple/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-semibold text-gray-200">Haftalık Süre</h3>
                            <div className="relative">
                                <Sparkles className="text-neon-purple animate-pulse" size={32} />
                                <div className="absolute inset-0 blur-lg bg-neon-purple/50" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-2">
                                <p className="text-7xl font-bold text-neon-purple">
                                    {Math.round((summary?.weeklyStudyMinutes || 0) / 60)}
                                </p>
                                <span className="text-3xl text-neon-purple/70">saat</span>
                            </div>
                            <p className="text-sm text-gray-400">
                                {summary?.weeklyStudyMinutes || 0} dakika çalışma
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Chart */}
            <div className="glass-card p-8">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-semibold">Haftalık Çalışma Grafiği</h3>
                    <Link to="/analytics" className="px-4 py-2 rounded-lg bg-neon-cyan/20 text-neon-cyan text-sm font-medium hover:bg-neon-cyan/30 transition-colors">
                        Detaylı Analiz &rarr;
                    </Link>
                </div>
                <div className="flex items-end justify-between h-64 gap-6">
                    {summary?.weeklyProgress?.map((minutes, i) => {
                        const height = Math.min((minutes / 180) * 100, 100) // Max 3 saat (180dk) referans
                        const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                                <div className="relative w-full h-full flex items-end">
                                    <div
                                        className="w-full rounded-t-xl bg-gradient-to-t from-neon-cyan via-neon-blue to-neon-purple transition-all duration-700 hover:scale-105 relative overflow-hidden"
                                        style={{ height: `${height}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-1000" />
                                    </div>
                                </div>
                                <span className="text-sm font-medium text-gray-300">{days[i]}</span>
                                <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-6">
                                    {minutes} dk
                                </span>
                            </div>
                        )
                    }) || <div className="text-gray-500 w-full text-center">Veri yok</div>}
                </div>
            </div>
        </div >
    )
}

export default Dashboard
