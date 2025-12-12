import { useEffect, useState } from 'react'
import { analyticsService } from '../services/analyticsService'
import Heatmap from '../components/Analytics/Heatmap'
import type { ComprehensiveAnalysisDto, StudyTimeChartData } from '../types'
import {
    Clock,
    Calendar,
    BookOpen,
    TrendingUp,
    AlertTriangle,
    BarChart2,
    Activity
} from 'lucide-react'

export default function Analytics() {
    const [data, setData] = useState<ComprehensiveAnalysisDto | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const result = await analyticsService.getComprehensive()
            setData(result)
        } catch (error) {
            console.error('Analiz verileri yüklenemedi', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center">Analizler yükleniyor...</div>
    if (!data) return <div className="p-8 text-center text-red-400">Veri bulunamadı.</div>

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Analizler & İstatistikler
                </h1>
                <p className="text-gray-400">Çalışma performansınızı detaylı inceleyin.</p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Toplam Çalışma"
                    value={`${(data.totalStudyTime / 60).toFixed(1)} Saat`}
                    icon={<Clock className="w-5 h-5 text-emerald-400" />}
                    trend="+12% geçen haftaya göre"
                />
                <MetricCard
                    title="Günlük Ortalama"
                    value={`${data.dailyAverage} Dk`}
                    icon={<Activity className="w-5 h-5 text-blue-400" />}
                />
                <MetricCard
                    title="En Verimli Gün"
                    value={data.mostProductiveDay}
                    icon={<Calendar className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                    title="Favori Ders"
                    value={data.mostStudiedSubject}
                    icon={<BookOpen className="w-5 h-5 text-amber-400" />}
                />
            </div>

            {/* Heatmap Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-xl font-semibold text-white">Çalışma Yoğunluğu</h2>
                </div>
                {/* Son 1 yıl için başlangıç tarihi hesapla (kabaca) */}
                <Heatmap
                    data={data.heatmap || []}
                    startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                    endDate={new Date()}
                />
            </div>

            {/* Charts & Time Wasted */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Weekly Chart */}
                <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <BarChart2 className="w-5 h-5 text-blue-400" />
                        <h2 className="text-xl font-semibold text-white">Haftalık İlerleme</h2>
                    </div>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                        {(data.weeklyChart || []).map((day, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 flex-1 group">
                                <div className="w-full bg-gray-800 rounded-t-lg relative h-48 overflow-hidden">
                                    <div
                                        className="absolute bottom-0 w-full bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-500 rounded-t-lg group-hover:opacity-90"
                                        style={{ height: `${Math.min((day.minutes / 300) * 100, 100)}%` }}
                                    ></div>
                                </div>
                                <span className="text-xs text-gray-400 rotate-0 font-medium">{new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Focus Areas (Time Wasted logic could be here or focus distribution) */}
                <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        <h2 className="text-xl font-semibold text-white">Dikkat Gerekenler</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            <h4 className="font-medium text-amber-200">Düşük Aktivite</h4>
                            <p className="text-sm text-gray-400 mt-1">Son 3 gündür Matematik çalışmadınız.</p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                            <h4 className="font-medium text-red-200">Hedef Sapması</h4>
                            <p className="text-sm text-gray-400 mt-1">Günlük hedefinizin %40 altındasınız.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, trend }: { title: string, value: string, icon: any, trend?: string }) {
    return (
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm">{title}</span>
                {icon}
            </div>
            <div className="text-2xl font-bold text-white">{value}</div>
            {trend && <div className="text-xs text-emerald-400 mt-1">{trend}</div>}
        </div>
    )
}
