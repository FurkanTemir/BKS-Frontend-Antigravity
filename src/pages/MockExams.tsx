import { useState, useEffect } from 'react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine
} from 'recharts'
import {
    Trophy,
    TrendingUp,
    Calendar,
    Plus,
    Target,
    ChevronDown,
    Search,
    X,
    Save
} from 'lucide-react'
import { mockExamService } from '../services/mockExamService'
import type { MockExamDto, CreateMockExamDto } from '../types'
import ExamDetailModal from '../components/MockExams/ExamDetailModal'

export default function MockExams() {
    const [selectedType, setSelectedType] = useState<'ALL' | 'TYT' | 'AYT'>('ALL')
    const [searchQuery, setSearchQuery] = useState('')
    const [exams, setExams] = useState<MockExamDto[]>([])
    const [loading, setLoading] = useState(true)
    const [isChartReady, setIsChartReady] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedExam, setSelectedExam] = useState<MockExamDto | null>(null)

    useEffect(() => {
        loadExams()
        // Wait for entrance animation to finish before rendering chart to avoid width(-1) error
        const timer = setTimeout(() => setIsChartReady(true), 600)
        return () => clearTimeout(timer)
    }, [])

    const loadExams = async () => {
        try {
            const data = await mockExamService.getAll()
            setExams(data)
        } catch (error) {
            console.error('Deneme sınavları yüklenemedi:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filter Logic
    const filteredExams = exams.filter(exam => {
        const matchesType = selectedType === 'ALL' || exam.examType === selectedType
        const matchesSearch = exam.examName.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesType && matchesSearch
    }).sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime()) // Newest first

    // Chart Data (Chronological)
    const chartData = exams.length > 0
        ? [...filteredExams]
            .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
            .slice(-4) // Last 4 exams
            .map(exam => ({
                name: exam.examName.length > 15 ? exam.examName.substring(0, 15) + '...' : exam.examName,
                net: exam.totalNet,
                fullDate: new Date(exam.examDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
            }))
        : []

    if (loading) {
        return <div className="p-8 text-center text-gray-400 animate-pulse">Veriler yükleniyor...</div>
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-10 p-6 md:p-8 min-h-screen">

            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-cyan-400" />
                        Deneme Takip
                    </h1>
                    <p className="text-gray-400 mt-1 pl-11">Sınav performansınızı analiz edin ve hedeflerinize ulaşın.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-cyan-400 hover:bg-cyan-300 text-black font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-400/20 flex items-center gap-2 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Yeni Deneme
                </button>
            </div>

            {/* --- Progress Chart Section --- */}
            <div className="p-1 rounded-2xl bg-gradient-to-b from-gray-800 to-transparent p-[1px]">
                <div className="bg-gray-950/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-800 relative overflow-hidden group">
                    <div className="flex items-center gap-2 mb-6 z-10 relative">
                        <div className="p-2 bg-purple-500/10 rounded-lg">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Net İlerlemesi</h2>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl -z-10 group-hover:bg-cyan-500/10 transition-all duration-700"></div>

                    <div style={{ width: '100%', height: '300px' }}>
                        {isChartReady && chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorNet" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} vertical={false} />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                                        axisLine={false}
                                        tickLine={false}
                                        domain={[0, 120]}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#111827',
                                            borderColor: '#374151',
                                            borderRadius: '8px',
                                            color: '#f3f4f6'
                                        }}
                                        itemStyle={{ color: '#22d3ee' }}
                                        formatter={(value: any) => [`${value} Net`, 'Toplam Net']}
                                        labelStyle={{ color: '#9ca3af', marginBottom: '0.25rem' }}
                                        cursor={{ stroke: '#22d3ee', strokeWidth: 2, strokeDasharray: '4 4' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="net"
                                        stroke="#22d3ee"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorNet)"
                                        activeDot={{ r: 6, strokeWidth: 0, fill: '#fff' }}
                                    />
                                    <ReferenceLine y={100} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'right', value: 'Hedef', fill: '#10b981', fontSize: 12 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-gray-500">
                                <p>Henüz veri yok</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* --- Filters & Search --- */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-auto min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Deneme ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-gray-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-gray-600"
                    />
                </div>

                <div className="flex p-1 bg-gray-900 border border-gray-800 rounded-xl w-full sm:w-auto">
                    {(['ALL', 'TYT', 'AYT'] as const).map(type => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all ${selectedType === type
                                ? 'bg-gray-800 text-white shadow-sm'
                                : 'text-gray-400 hover:text-gray-200'
                                }`}
                        >
                            {type === 'ALL' ? 'Tümü' : type}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- Exams Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredExams.map((exam) => (
                    <div
                        key={exam.id}
                        className="group relative bg-[#0B0C15] border border-gray-800 rounded-2xl p-6 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.1)] flex flex-col h-full"
                    >
                        {/* Background Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 via-transparent to-transparent rounded-2xl pointer-events-none" />

                        {/* Top Row: Type & Date */}
                        <div className="flex justify-between items-start mb-6 z-10">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold tracking-wide ${exam.examType === 'TYT'
                                        ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                                        : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                        {exam.examType}
                                    </span>
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(exam.examDate).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-gray-100 line-clamp-1 group-hover:text-cyan-400 transition-colors" title={exam.examName}>
                                    {searchQuery ? (
                                        exam.examName.split(new RegExp(`(${searchQuery})`, 'gi')).map((part, index) => (
                                            part.toLowerCase() === searchQuery.toLowerCase() ? (
                                                <span key={index} className="text-cyan-400">{part}</span>
                                            ) : (
                                                <span key={index}>{part}</span>
                                            )
                                        ))
                                    ) : (
                                        exam.examName
                                    )}
                                </h3>
                            </div>

                            <div className="text-right">
                                <div className="text-3xl font-bold text-white tracking-tight">
                                    {exam.totalNet}
                                </div>
                                <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mt-[-2px]">
                                    Toplam Net
                                </div>
                            </div>
                        </div>

                        {/* Middle Row: Subject Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-900/50 p-3 rounded-xl border border-gray-800/50">
                            <SubjectStat label="Türkçe/Ed." value={exam.examType === 'TYT' ? exam.turkishNet : exam.literatureNet} />
                            <SubjectStat label="Matematik" value={exam.mathematicsNet} />
                            <SubjectStat label="Fen Bil." value={exam.examType === 'TYT' ? exam.scienceNet : (exam.physicsNet || 0) + (exam.chemistryNet || 0) + (exam.biologyNet || 0)} />
                            <SubjectStat label="Sosyal" value={exam.examType === 'TYT' ? exam.socialNet : (exam.historyNet || 0) + (exam.geographyNet || 0)} />
                        </div>

                        {/* Bottom Row: Score & Actions */}
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-800 z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-gray-400 text-sm">Puan:</span>
                                <span className="text-white font-bold">-</span>
                            </div>
                            <button
                                onClick={() => setSelectedExam(exam)}
                                className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center gap-1 transition-colors"
                            >
                                Detaylar <ChevronDown className="w-4 h-4 -rotate-90" />
                            </button>
                        </div>
                    </div>
                ))}

                {/* Empty State */}
                {filteredExams.length === 0 && (
                    <div className="col-span-full py-20 text-center border border-dashed border-gray-800 rounded-2xl bg-gray-900/20">
                        <Target className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-400">Sonuç bulunamadı</h3>
                        <p className="text-gray-500 mt-2">Henüz deneme sınavı girmemişsiniz veya arama sonucu boş.</p>
                    </div>
                )}
            </div>

            {/* --- Add Mock Exam Modal --- */}
            {isModalOpen && (
                <AddMockExamModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={() => {
                        setIsModalOpen(false)
                        loadExams()
                    }}
                />
            )}

            {/* --- Detail Modal --- */}
            {selectedExam && (
                <ExamDetailModal
                    isOpen={!!selectedExam}
                    onClose={() => setSelectedExam(null)}
                    exam={selectedExam}
                />
            )}
        </div>
    )
}

// --- Helper Components ---
function SubjectStat({ label, value }: { label: string, value?: number | null }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] text-gray-500 uppercase font-semibold">{label}</span>
            <span className={`font-mono text-sm font-medium ${value != null ? 'text-gray-300' : 'text-gray-600'}`}>
                {value != null ? Number(value).toFixed(1) : '-'}
            </span>
        </div>
    )
}

// --- Constants ---
const TYT_SUBJECTS = [
    { key: 'turkish', label: 'Türkçe' },
    { key: 'mathematics', label: 'Matematik' },
    { key: 'social', label: 'Sosyal' },
    { key: 'science', label: 'Fen' }
] as const

const AYT_SUBJECTS = [
    { key: 'mathematics', label: 'Matematik' },
    { key: 'physics', label: 'Fizik' },
    { key: 'chemistry', label: 'Kimya' },
    { key: 'biology', label: 'Biyoloji' },
    { key: 'literature', label: 'Edebiyat' },
    { key: 'history', label: 'Tarih-1' },
    { key: 'geography', label: 'Coğrafya-1' },
    { key: 'philosophy', label: 'Felsefe' },
    { key: 'religion', label: 'Din K.' }
] as const

function AddMockExamModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false)
    const [examType, setExamType] = useState<1 | 2>(1)
    const [baseInfo, setBaseInfo] = useState({
        examName: '',
        examDate: new Date().toISOString().split('T')[0]
    })

    // Store correct/incorrect counts for each subject
    // Key format: 'turkish', 'mathematics', etc. (matching DTO prefixes)
    const [scores, setScores] = useState<Record<string, { correct: number | '', incorrect: number | '' }>>({})

    // Calculate Nets and Total
    const calculatedNets = (() => {
        const subjects = examType === 1 ? TYT_SUBJECTS : AYT_SUBJECTS
        const nets: Record<string, number> = {}
        let total = 0

        subjects.forEach(sub => {
            const score = scores[sub.key] || { correct: 0, incorrect: 0 }
            const c = Number(score.correct) || 0
            const i = Number(score.incorrect) || 0
            // Ensure net isn't negative if preferred, or allow it. Usually exams allow negative. Let's allow negative.
            // Actually, keep it simple: c - i/4
            nets[sub.key] = c - (i / 4)
            total += nets[sub.key]
        })

        return { nets, total }
    })()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const dto: any = {
                examName: baseInfo.examName,
                examDate: baseInfo.examDate,
                examType: examType,
                fieldType: 0,
                totalNet: calculatedNets.total
            }

            // Map calculated nets to DTO fields (e.g., 'turkish' -> 'turkishNet')
            Object.entries(calculatedNets.nets).forEach(([key, value]) => {
                dto[`${key}Net`] = value
            })

            await mockExamService.create(dto as CreateMockExamDto)
            onSuccess()
        } catch (error) {
            console.error('Failed to create mock exam', error)
        } finally {
            setLoading(false)
        }
    }

    const handleScoreChange = (subjectKey: string, field: 'correct' | 'incorrect', value: string) => {
        const numVal = value === '' ? '' : Math.max(0, parseFloat(value))
        setScores(prev => ({
            ...prev,
            [subjectKey]: {
                ...prev[subjectKey],
                [field]: numVal
            }
        }))
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#11121C] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-800 bg-[#11121C]/95 backdrop-blur-xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Plus className="w-5 h-5 text-cyan-400" />
                        Yeni Deneme Ekle
                    </h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-gray-400">Deneme Adı</label>
                            <input
                                type="text"
                                required
                                value={baseInfo.examName}
                                onChange={e => setBaseInfo(prev => ({ ...prev, examName: e.target.value }))}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                                placeholder="Örn: Özdebir TG-1"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Tarih</label>
                            <input
                                type="date"
                                required
                                value={baseInfo.examDate}
                                onChange={e => setBaseInfo(prev => ({ ...prev, examDate: e.target.value }))}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Sınav Türü</label>
                            <select
                                value={examType}
                                onChange={e => {
                                    setExamType(Number(e.target.value) as 1 | 2)
                                    setScores({}) // Reset scores on type change
                                }}
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
                            >
                                <option value={1}>TYT</option>
                                <option value={2}>AYT</option>
                            </select>
                        </div>
                    </div>

                    <div className="h-px bg-gray-800" />

                    {/* Scores Input Grid */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider">Ders Sonuçları</h3>
                            <div className="text-cyan-400 font-mono font-bold bg-cyan-950/30 px-3 py-1 rounded border border-cyan-500/30">
                                Toplam: {calculatedNets.total.toFixed(2)} Net
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(examType === 1 ? TYT_SUBJECTS : AYT_SUBJECTS).map((sub) => {
                                const score = scores[sub.key] || { correct: '', incorrect: '' }
                                const currentNet = (Number(score.correct) || 0) - ((Number(score.incorrect) || 0) / 4)

                                return (
                                    <div key={sub.key} className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl space-y-3 hover:border-gray-700 transition-colors">
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-800/50">
                                            <span className="text-sm font-semibold text-gray-300">{sub.label}</span>
                                            <span className="text-xs font-mono text-gray-500">{currentNet.toFixed(2)} Net</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-green-500/70 font-bold tracking-wider">Doğru</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={score.correct}
                                                    onChange={(e) => handleScoreChange(sub.key, 'correct', e.target.value)}
                                                    className="w-full bg-gray-950/50 border border-gray-800 rounded px-2 py-1.5 text-white text-center focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 outline-none transition-all font-mono"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase text-red-500/70 font-bold tracking-wider">Yanlış</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={score.incorrect}
                                                    onChange={(e) => handleScoreChange(sub.key, 'incorrect', e.target.value)}
                                                    className="w-full bg-gray-950/50 border border-gray-800 rounded px-2 py-1.5 text-white text-center focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 outline-none transition-all font-mono"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div className="sticky bottom-0 p-4 -mx-6 -mb-6 border-t border-gray-800 bg-[#11121C]/95 backdrop-blur-xl flex justify-end gap-3 mt-8">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-gray-400 font-medium hover:text-white transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all active:scale-95"
                        >
                            {loading ? (
                                <span className="animate-spin text-xl">•</span>
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            Kaydet
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
