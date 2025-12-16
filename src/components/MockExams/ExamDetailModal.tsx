import { X, Edit2, Trash2, Calendar, Trophy, Share2 } from 'lucide-react'
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Tooltip
} from 'recharts'
import type { MockExamDto } from '../../types'

interface ExamDetailModalProps {
    isOpen: boolean
    onClose: () => void
    exam: MockExamDto
}

export default function ExamDetailModal({ isOpen, onClose, exam }: ExamDetailModalProps) {
    if (!isOpen) return null

    // Determine Subjects & Data based on Exam Type
    const isTYT = exam.examType === 'TYT'

    // Chart Data Preparation
    const chartData = isTYT
        ? [
            { subject: 'Türkçe', net: exam.turkishNet || 0, full: 40 },
            { subject: 'Sosyal', net: exam.socialNet || 0, full: 20 },
            { subject: 'Matematik', net: exam.mathematicsNet || 0, full: 40 },
            { subject: 'Fen', net: exam.scienceNet || 0, full: 20 },
        ]
        : [
            { subject: 'Mat', net: exam.mathematicsNet || 0, full: 40 },
            { subject: 'Fiz', net: exam.physicsNet || 0, full: 14 },
            { subject: 'Kim', net: exam.chemistryNet || 0, full: 13 },
            { subject: 'Biyo', net: exam.biologyNet || 0, full: 13 },
            { subject: 'Edb', net: exam.literatureNet || 0, full: 24 },
            { subject: 'Tar', net: exam.historyNet || 0, full: 10 },
            { subject: 'Coğ', net: exam.geographyNet || 0, full: 6 },
        ].filter(item => (item.net || 0) > 0) // Filter empty subjects for AYT to keep chart clean if valid

    // Table Data Preparation
    const tableData = isTYT
        ? [
            { name: 'Türkçe', net: exam.turkishNet },
            { name: 'Sosyal', net: exam.socialNet },
            { name: 'Matematik', net: exam.mathematicsNet },
            { name: 'Fen Bilimleri', net: exam.scienceNet },
        ]
        : [
            // AYT Full List
            { name: 'Matematik', net: exam.mathematicsNet },
            { name: 'Fizik', net: exam.physicsNet },
            { name: 'Kimya', net: exam.chemistryNet },
            { name: 'Biyoloji', net: exam.biologyNet },
            { name: 'Edebiyat', net: exam.literatureNet },
            { name: 'Tarih-1', net: exam.historyNet },
            { name: 'Coğrafya-1', net: exam.geographyNet },
            { name: 'Felsefe', net: exam.philosophyNet },
            { name: 'Din Kültürü', net: exam.religionNet },
        ].filter(row => row.net !== undefined && row.net !== null && row.net !== 0) // Hide empty rows for AYT

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Modal Container */}
            <div className="relative bg-[#11121C] border border-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">

                {/* --- Header --- */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800 bg-[#11121C] z-10">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                                {exam.examName}
                            </h2>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide border ${isTYT
                                    ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                }`}>
                                {exam.examType}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <Calendar className="w-4 h-4" />
                            {new Date(exam.examDate).toLocaleDateString('tr-TR', { dateStyle: 'long' })}
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:block text-right">
                            <div className="text-sm text-gray-500 uppercase font-bold tracking-wider">Toplam Puan</div>
                            <div className="text-3xl font-bold text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                                {exam.totalNet.toFixed(2)}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 -mr-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* --- Body Scrollable Area --- */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">

                        {/* Left Column: Visuals */}
                        <div className="bg-gray-900/30 rounded-2xl border border-gray-800 p-4 flex flex-col items-center justify-center min-h-[300px]">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 w-full text-center">Başarı Analizi</h3>
                            <div className="w-full h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
                                        <PolarGrid stroke="#374151" strokeOpacity={0.5} />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                                        <Radar
                                            name="Net"
                                            dataKey="net"
                                            stroke="#22d3ee"
                                            strokeWidth={2}
                                            fill="#22d3ee"
                                            fillOpacity={0.3}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#111827',
                                                borderColor: '#374151',
                                                color: '#f3f4f6',
                                                borderRadius: '8px'
                                            }}
                                            itemStyle={{ color: '#22d3ee' }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 flex gap-4 text-xs font-medium text-gray-500">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-3 h-3 bg-cyan-500/30 border border-cyan-500 rounded-full"></div>
                                    Senin Netlerin
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Stats Table */}
                        <div className="flex flex-col">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                    Ders Bazlı Detaylar
                                </h3>
                            </div>

                            <div className="w-full overflow-hidden rounded-xl border border-gray-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="bg-gray-900/80 text-gray-400 border-b border-gray-800 text-left">
                                            <th className="py-3 px-4 font-medium">Ders</th>
                                            <th className="py-3 px-4 font-medium text-center text-green-500/70">D</th>
                                            <th className="py-3 px-4 font-medium text-center text-red-500/70">Y</th>
                                            <th className="py-3 px-4 font-medium text-center text-gray-500">B</th>
                                            <th className="py-3 px-4 font-medium text-right text-cyan-400">Net</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800/50">
                                        {tableData.map((row, index) => (
                                            <tr key={row.name} className={`hover:bg-white/5 transition-colors ${index % 2 === 0 ? 'bg-transparent' : 'bg-gray-900/20'}`}>
                                                <td className="py-3 px-4 text-gray-300 font-medium">{row.name}</td>
                                                <td className="py-3 px-4 text-center text-gray-500">-</td>
                                                <td className="py-3 px-4 text-center text-gray-500">-</td>
                                                <td className="py-3 px-4 text-center text-gray-500">-</td>
                                                <td className="py-3 px-4 text-right font-mono font-bold text-gray-200">
                                                    {(row.net || 0).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot className="bg-cyan-950/20 border-t border-gray-800">
                                        <tr>
                                            <td className="py-3 px-4 text-cyan-400 font-bold">TOPLAM</td>
                                            <td className="py-3 px-4 text-center"></td>
                                            <td className="py-3 px-4 text-center"></td>
                                            <td className="py-3 px-4 text-center"></td>
                                            <td className="py-3 px-4 text-right text-cyan-400 font-bold text-lg">
                                                {exam.totalNet.toFixed(2)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="p-4 md:p-6 border-t border-gray-800 bg-[#11121C] flex justify-between items-center z-10">
                    <button className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5">
                        <Share2 className="w-4 h-4" />
                        Paylaş
                    </button>

                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all text-sm font-semibold">
                            <Trash2 className="w-4 h-4" />
                            Sil
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2 rounded-xl text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all text-sm font-bold shadow-[0_0_15px_-5px_rgba(34,211,238,0.3)]">
                            <Edit2 className="w-4 h-4" />
                            Düzenle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
