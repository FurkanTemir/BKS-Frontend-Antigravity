import { useEffect, useState } from 'react'
import { analyticsService } from '../services/analyticsService'
import Heatmap from '../components/Analytics/Heatmap' // Yeni MonthlyHeatmap bileşenin
import type { ComprehensiveAnalysisDto } from '../types'
import {
    Clock,
    Calendar,
    BookOpen,
    TrendingUp,
    BarChart2
} from 'lucide-react'

export default function Analytics() {
    const [data, setData] = useState<ComprehensiveAnalysisDto | null>(null)
    const [loading, setLoading] = useState(true)

    // Not: heatmapRange state'ine ve tarih hesaplamaya artık gerek yok.
    // Yeni Heatmap bileşeni kendi içinde ay değiştirebiliyor.

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

    if (loading) return <div className="p-8 text-center text-gray-400 animate-pulse">Analizler yükleniyor...</div>
    if (!data) return <div className="p-8 text-center text-gray-500">Görüntülenecek veri bulunamadı.</div>

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 p-6 md:p-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Analizler & İstatistikler
                </h1>
                <p className="text-gray-400 mt-1">Çalışma performansınızı detaylı inceleyin.</p>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Toplam Çalışma"
                    value={formatDuration(data?.totalStudyTime ?? 0)}
                    icon={<Clock className="w-5 h-5 text-teal-400" />}
                />
                <MetricCard
                    title="Günlük Ortalama"
                    value={formatDuration(data?.dailyAverage ?? 0)}
                    icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
                />
                <MetricCard
                    title="En Verimli Gün"
                    value={data?.mostProductiveDay || 'Veri Yok'}
                    icon={<Calendar className="w-5 h-5 text-purple-400" />}
                />
                <MetricCard
                    title="Favori Ders"
                    value={data?.mostStudiedSubject || 'Henüz Yok'}
                    icon={<BookOpen className="w-5 h-5 text-amber-400" />}
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">

                {/* SOL TARAF: Heatmap (Takvim) */}
                <div className="lg:col-span-1 w-full">
                    {/* H-full ve min-h classlarını Heatmap'e prop olarak geçebiliriz veya Heatmap.tsx içinde düzenleyebiliriz. 
                        Şimdilik Heatmap bileşeninin dış kapsayıcısını burada kontrol edemediğimiz için (Heatmap içinde tanımlı),
                        Heatmap.tsx dosyasını düzenleyeceğiz. Buradaki wrapper'ın h-full olması önemli. */}
                    <Heatmap data={data?.heatmap || []} activities={data?.recentActivities || []} className="h-full min-h-[320px]" />
                </div>

                {/* SAĞ TARAF: Haftalık Grafik */}
                <div className="lg:col-span-2 p-6 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-teal-500/30 transition-all duration-300 group h-full min-h-[320px] flex flex-col">
                    <div className="flex items-center gap-2 mb-6 shrink-0">
                        <div className="p-2 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <BarChart2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Haftalık İlerleme</h2>
                    </div>

                    <div className="flex gap-4 flex-1 relative min-h-0">
                        {(() => {
                            const chartData = data?.weeklyChart || [];
                            const isEmpty = chartData.every(d => (d.totalSeconds || 0) === 0);

                            return (
                                <>
                                    {/* Y-Axis */}
                                    <div className="flex flex-col justify-between text-xs text-gray-400 font-medium py-6 text-right w-8 shrink-0">
                                        {[10, 8, 6, 4, 2, 0].map(h => (
                                            <span key={h}>{h}s</span>
                                        ))}
                                    </div>

                                    {/* Chart Area */}
                                    <div className="relative flex-1 bg-gray-900/50 rounded-xl p-4 border border-white/5 flex flex-col justify-end">

                                        {/* Grid Lines */}
                                        <div className={`absolute inset-x-4 inset-y-4 flex flex-col justify-between pointer-events-none ${isEmpty ? 'opacity-10' : 'opacity-100'}`}>
                                            {[...Array(6)].map((_, i) => (
                                                <div key={i} className="w-full h-px bg-white/5 border-t border-dashed border-gray-700/50"></div>
                                            ))}
                                        </div>

                                        {/* Empty State */}
                                        {isEmpty && (
                                            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                                <BarChart2 className="w-10 h-10 text-gray-700 mb-2 opacity-50" />
                                                <span className="text-sm font-medium text-gray-500">Bu hafta veri yok</span>
                                            </div>
                                        )}

                                        {/* Bars */}
                                        <div className={`relative h-full flex items-end justify-between z-10 gap-2 ${isEmpty ? 'opacity-0' : 'opacity-100'}`}>
                                            {chartData.map((day, i) => {
                                                const hours = (Number(day?.totalSeconds ?? 0) / 3600);
                                                const percentage = Math.min((hours / 10) * 100, 100);

                                                return (
                                                    <div key={i} className="flex flex-col items-center gap-2 flex-1 group/bar h-full justify-end">
                                                        {/* Tooltip */}
                                                        <div className="opacity-0 group-hover/bar:opacity-100 absolute bottom-[calc(100%+5px)] transition-all duration-200 bg-gray-800 text-xs text-white px-2 py-1 rounded border border-gray-700 shadow-xl whitespace-nowrap z-30 pointer-events-none mb-1">
                                                            <span className="font-bold text-teal-400">{hours.toFixed(1)}</span> Saat
                                                        </div>

                                                        {/* Bar */}
                                                        <div className="w-full max-w-[40px] bg-gray-800/30 rounded-t-sm relative h-full flex items-end overflow-hidden group-hover/bar:bg-gray-800/50 transition-colors">
                                                            <div
                                                                className="w-full transition-all duration-1000 ease-out rounded-t-sm relative bg-gradient-to-t from-blue-600 via-cyan-500 to-teal-400"
                                                                style={{ height: `${percentage}%` }}
                                                            >
                                                                <div className="absolute top-0 inset-x-0 h-[1px] bg-white/40 shadow-[0_0_10px_rgba(255,255,255,0.8)]"></div>
                                                            </div>
                                                        </div>

                                                        {/* Label */}
                                                        <span className="text-xs uppercase tracking-wider text-gray-400 font-medium group-hover/bar:text-gray-300 transition-colors">
                                                            {day?.date ? new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' }) : '-'}
                                                        </span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, subValue }: { title: string, value: string, icon: any, subValue?: string }) {
    // Empty state detection
    const isEmpty = value === 'Veri Yok' || value === 'Henüz Yok' || value === '-' || value === '0.0 Saat' || value === '0 Dk';

    return (
        <div className="p-5 rounded-2xl border border-gray-800 bg-gradient-to-br from-gray-900 to-black hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-900/10 transition-all duration-300 group">
            <div className="flex justify-between items-start mb-2">
                <span className="text-gray-400 text-sm font-medium group-hover:text-gray-300 transition-colors">{title}</span>
                <div className="p-2 bg-gray-800/50 rounded-lg group-hover:bg-teal-500/10 transition-colors">
                    {icon}
                </div>
            </div>
            <div className="mt-2">
                <h3 className={`tracking-tight transition-colors ${isEmpty ? 'text-lg font-medium italic text-gray-500' : 'text-2xl font-bold text-white'}`}>
                    {value}
                </h3>
                {subValue && <p className="text-xs text-gray-500 mt-1 font-medium">{subValue}</p>}
            </div>
        </div>
    )
}

function formatDuration(minutes: number): string {
    if (!minutes || minutes === 0) return '0 Dk';
    const totalMinutes = Math.round(minutes);
    if (totalMinutes < 60) {
        return `${totalMinutes} Dk`;
    }
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return mins > 0 ? `${hours} Sa ${mins} Dk` : `${hours} Sa`;
}