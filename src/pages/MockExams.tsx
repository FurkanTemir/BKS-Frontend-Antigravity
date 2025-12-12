import { Loader2, Plus, TrendingUp, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { mockExamService } from '../services/mockExamService'
import type { MockExamDto, CreateMockExamDto } from '../types'

const MockExams = () => {
    const [exams, setExams] = useState<MockExamDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<CreateMockExamDto>({
        examName: '',
        examDate: new Date().toISOString().split('T')[0],
        examType: 1,
        fieldType: 1,
        totalNet: 0,
        turkishNet: undefined,
        mathematicsNet: undefined,
        scienceNet: undefined,
        socialNet: undefined,
        literatureNet: undefined,
        geographyNet: undefined,
        historyNet: undefined,
        philosophyNet: undefined,
        physicsNet: undefined,
        chemistryNet: undefined,
        biologyNet: undefined,
    })

    useEffect(() => {
        fetchExams()
    }, [])

    const fetchExams = async () => {
        try {
            setIsLoading(true)
            const data = await mockExamService.getAll()
            setExams(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sınavlar yüklenemedi')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // Calculate totalNet
            const nets = formData.examType === 1
                ? [formData.turkishNet, formData.mathematicsNet, formData.scienceNet, formData.socialNet]
                : [formData.literatureNet, formData.historyNet, formData.geographyNet, formData.philosophyNet, formData.physicsNet, formData.chemistryNet, formData.biologyNet]

            const totalNet = nets.filter(n => n !== undefined).reduce((sum, n) => sum + (n || 0), 0)

            const newExam = await mockExamService.create({ ...formData, totalNet })
            setExams([newExam, ...exams])
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Sınav kaydedilemedi')
        } finally {
            setIsSubmitting(false)
        }
    }

    const resetForm = () => {
        setFormData({
            examName: '',
            examDate: new Date().toISOString().split('T')[0],
            examType: 1,
            fieldType: 1,
            totalNet: 0,
            turkishNet: undefined,
            mathematicsNet: undefined,
            scienceNet: undefined,
            socialNet: undefined,
            literatureNet: undefined,
            geographyNet: undefined,
            historyNet: undefined,
            philosophyNet: undefined,
            physicsNet: undefined,
            chemistryNet: undefined,
            biologyNet: undefined,
        })
    }

    const isTYT = formData.examType === 1

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
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                        Denemeler
                    </h1>
                    <p className="text-gray-400 text-lg">Deneme sınavı sonuçlarınızı kaydedin</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Yeni Deneme
                </button>
            </header>

            {error && (
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            )}

            {/* Net Chart */}
            {exams.length > 0 && (
                <div className="glass-card p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <TrendingUp className="text-neon-cyan" size={28} />
                        <h3 className="text-2xl font-semibold">Net İlerleme Grafiği</h3>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-4">
                        {exams.slice(0, 10).map((exam, i) => (
                            <div key={exam.id} className="flex-1 flex flex-col items-center gap-3">
                                <div
                                    className="w-full rounded-t-xl bg-gradient-to-t from-neon-cyan to-neon-blue transition-all duration-500 hover:scale-105 relative"
                                    style={{ height: `${(exam.totalNet / 120) * 100}%`, minHeight: '20px' }}
                                >
                                    <div className="absolute inset-0 blur-xl opacity-50 -z-10 bg-gradient-to-t from-neon-cyan to-neon-blue" />
                                </div>
                                <span className="text-sm text-gray-400">{i + 1}</span>
                                <span className="text-xs text-neon-cyan font-semibold">{exam.totalNet}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Exams List */}
            <div className="space-y-4">
                {exams.length === 0 ? (
                    <div className="glass-card p-8 text-center text-gray-400">
                        Henüz deneme sınavı eklenmemiş. İlk denemenizi ekleyin!
                    </div>
                ) : (
                    exams.map((exam) => (
                        <div key={exam.id} className="glass-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-2xl font-semibold">{exam.examName}</h3>
                                    <p className="text-sm text-gray-400">
                                        {new Date(exam.examDate).toLocaleDateString('tr-TR')} • {exam.examType}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-5xl font-bold text-neon-cyan">{exam.totalNet}</p>
                                    <p className="text-sm text-gray-400">Toplam Net</p>
                                </div>
                            </div>

                            {/* Subject Nets */}
                            <div className="grid grid-cols-4 gap-4">
                                {exam.examType === 'TYT' ? (
                                    <>
                                        <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                            <p className="text-2xl font-bold text-neon-blue">{exam.turkishNet ?? '-'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Türkçe</p>
                                        </div>
                                        <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                            <p className="text-2xl font-bold text-neon-blue">{exam.mathematicsNet ?? '-'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Matematik</p>
                                        </div>
                                        <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                            <p className="text-2xl font-bold text-neon-blue">{exam.scienceNet ?? '-'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Fen</p>
                                        </div>
                                        <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                            <p className="text-2xl font-bold text-neon-blue">{exam.socialNet ?? '-'}</p>
                                            <p className="text-xs text-gray-400 mt-1">Sosyal</p>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {exam.literatureNet !== undefined && (
                                            <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                                <p className="text-2xl font-bold text-neon-blue">{exam.literatureNet}</p>
                                                <p className="text-xs text-gray-400 mt-1">Edebiyat</p>
                                            </div>
                                        )}
                                        {exam.historyNet !== undefined && (
                                            <div className="text-center p-3 bg-dark-300/30 rounded-lg">
                                                <p className="text-2xl font-bold text-neon-blue">{exam.historyNet}</p>
                                                <p className="text-xs text-gray-400 mt-1">Tarih</p>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Exam Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
                    <div className="glass-card max-w-3xl w-full p-8 relative border-2 border-white/10 my-8">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-neon-cyan transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                            Yeni Deneme Ekle
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Basic Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Sınav Adı</label>
                                    <input
                                        type="text"
                                        value={formData.examName}
                                        onChange={(e) => setFormData({ ...formData, examName: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Tarih</label>
                                    <input
                                        type="date"
                                        value={formData.examDate}
                                        onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Exam Type & Field Type */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Sınav Tipi</label>
                                    <select
                                        value={formData.examType}
                                        onChange={(e) => setFormData({ ...formData, examType: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                    >
                                        <option value={1}>TYT</option>
                                        <option value={2}>AYT</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Alan</label>
                                    <select
                                        value={formData.fieldType}
                                        onChange={(e) => setFormData({ ...formData, fieldType: parseInt(e.target.value) })}
                                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                    >
                                        <option value={0}>Yok</option>
                                        <option value={1}>Sayısal</option>
                                        <option value={2}>Eşit Ağırlık</option>
                                        <option value={3}>Sözel</option>
                                    </select>
                                </div>
                            </div>

                            {/* TYT Subjects */}
                            {isTYT && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg text-neon-cyan">TYT Dersler</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Türkçe', key: 'turkishNet' },
                                            { label: 'Matematik', key: 'mathematicsNet' },
                                            { label: 'Fen', key: 'scienceNet' },
                                            { label: 'Sosyal', key: 'socialNet' },
                                        ].map((subject) => (
                                            <div key={subject.key}>
                                                <label className="block text-sm text-gray-400 mb-2">{subject.label} Net</label>
                                                <input
                                                    type="number"
                                                    step="0.25"
                                                    value={formData[subject.key as keyof CreateMockExamDto] ?? ''}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, [subject.key]: e.target.value ? parseFloat(e.target.value) : undefined })
                                                    }
                                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AYT Subjects */}
                            {!isTYT && (
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-lg text-neon-blue">AYT Dersler</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { label: 'Edebiyat', key: 'literatureNet' },
                                            { label: 'Tarih', key: 'historyNet' },
                                            { label: 'Coğrafya', key: 'geographyNet' },
                                            { label: 'Felsefe', key: 'philosophyNet' },
                                            { label: 'Fizik', key: 'physicsNet' },
                                            { label: 'Kimya', key: 'chemistryNet' },
                                            { label: 'Biyoloji', key: 'biologyNet' },
                                        ].map((subject) => (
                                            <div key={subject.key}>
                                                <label className="block text-sm text-gray-400 mb-2">{subject.label} Net</label>
                                                <input
                                                    type="number"
                                                    step="0.25"
                                                    value={formData[subject.key as keyof CreateMockExamDto] ?? ''}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, [subject.key]: e.target.value ? parseFloat(e.target.value) : undefined })
                                                    }
                                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MockExams
