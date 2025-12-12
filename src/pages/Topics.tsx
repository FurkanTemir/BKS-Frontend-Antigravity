import { BookOpen, CheckCircle, Circle, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { topicService } from '../services/topicService'
import type { TopicDto } from '../types'

const Topics = () => {
    const [selectedExamType, setSelectedExamType] = useState<'TYT' | 'AYT'>('TYT')
    const [topics, setTopics] = useState<TopicDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTopics()
    }, [])

    const fetchTopics = async () => {
        try {
            setIsLoading(true)
            const data = await topicService.getAll()
            console.log('Fetched topics:', data) // Debug log
            setTopics(data)
        } catch (err) {
            console.error('Fetch error:', err) // Debug log
            setError(err instanceof Error ? err.message : 'Konular yüklenemedi')
        } finally {
            setIsLoading(false)
        }
    }

    // Filter topics - handle both string ('TYT') and number (1) examType formats
    const filteredTopics = topics.filter(t => {
        const examTypeStr = typeof t.examType === 'number'
            ? (t.examType === 1 ? 'TYT' : 'AYT')
            : t.examType
        return examTypeStr === selectedExamType
    })

    // Group by lesson
    const groupedBySubject = filteredTopics.reduce((acc, topic) => {
        if (!acc[topic.lesson]) {
            acc[topic.lesson] = []
        }
        acc[topic.lesson].push(topic)
        return acc
    }, {} as Record<string, TopicDto[]>)

    const handleToggle = async (topicId: number) => {
        try {
            const result = await topicService.toggleCompletion(topicId)
            // Backend returns { isCompleted: boolean }, update local state
            setTopics(topics.map(t =>
                t.id === topicId ? { ...t, isCompleted: result.isCompleted } : t
            ))
        } catch (err) {
            console.error('Toggle failed:', err)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-8">
                <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-cyan to-neon-blue bg-clip-text text-transparent">
                    Konularım
                </h1>
                <p className="text-gray-400 text-lg">Konu çalışma ilerlemenizi takip edin</p>
            </header>

            {/* Exam Type Tabs */}
            <div className="flex gap-4">
                {(['TYT', 'AYT'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setSelectedExamType(type)}
                        className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${selectedExamType === type
                            ? 'bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 shadow-neon-cyan scale-105'
                            : 'glass-card text-gray-300 hover:text-neon-cyan'
                            }`}
                    >
                        {type}
                    </button>
                ))}
            </div>

            {/* Subject Groups */}
            <div className="space-y-6">
                {Object.entries(groupedBySubject).map(([subject, subjectTopics]) => {
                    const completed = subjectTopics.filter(t => t.isCompleted).length
                    const total = subjectTopics.length
                    const percentage = Math.round((completed / total) * 100)

                    return (
                        <div key={subject} className="glass-card p-6">
                            {/* Subject Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-cyan to-neon-blue flex items-center justify-center">
                                        <BookOpen size={24} className="text-dark-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-semibold">{subject}</h3>
                                        <p className="text-sm text-gray-400">{completed}/{total} konu tamamlandı</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-neon-cyan">{percentage}%</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="relative h-3 bg-dark-200 rounded-full overflow-hidden mb-6">
                                <div
                                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>

                            {/* Topics List */}
                            <div className="space-y-3">
                                {subjectTopics.map((topic) => (
                                    <div
                                        key={topic.id}
                                        className={`flex items-center justify-between p-4 rounded-lg border transition-all duration-300 cursor-pointer ${topic.isCompleted
                                            ? 'bg-neon-cyan/10 border-neon-cyan/30 hover:bg-neon-cyan/20'
                                            : 'bg-dark-300/30 border-white/5 hover:border-neon-cyan/20'
                                            }`}
                                        onClick={() => handleToggle(topic.id)}
                                    >
                                        <div className="flex items-center gap-4">
                                            {topic.isCompleted ? (
                                                <CheckCircle className="text-neon-cyan" size={24} />
                                            ) : (
                                                <Circle className="text-gray-500" size={24} />
                                            )}
                                            <span className={`font-medium ${topic.isCompleted ? 'text-neon-cyan' : 'text-gray-300'}`}>
                                                {topic.name}
                                            </span>
                                        </div>
                                        {topic.isCompleted && (
                                            <span className="text-xs text-neon-cyan/70 bg-neon-cyan/10 px-3 py-1 rounded-full">
                                                Tamamlandı ✓
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Summary Footer */}
            <div className="glass-card p-6">
                <div className="grid grid-cols-3 gap-6 text-center">
                    <div>
                        <p className="text-3xl font-bold text-neon-cyan">
                            {filteredTopics.filter(t => t.isCompleted).length}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Tamamlanan</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-neon-blue">
                            {filteredTopics.filter(t => !t.isCompleted).length}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Devam Eden</p>
                    </div>
                    <div>
                        <p className="text-3xl font-bold text-neon-purple">
                            {filteredTopics.length}
                        </p>
                        <p className="text-sm text-gray-400 mt-2">Toplam</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Topics
