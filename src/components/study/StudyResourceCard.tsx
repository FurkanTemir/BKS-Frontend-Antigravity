import React from 'react'
import { Book, Video, Link as LinkIcon, CheckCircle, Trash2, ExternalLink, Calendar, FileText } from 'lucide-react'
import { StudyResourceDto } from '../../types'

interface StudyResourceCardProps {
    resource: StudyResourceDto
    onDelete: (id: number) => void
}

const StudyResourceCard: React.FC<StudyResourceCardProps> = ({ resource, onDelete }) => {

    const getIcon = (type: string) => {
        switch (type) {
            case 'Book':
                return <Book className="w-5 h-5 text-emerald-400" />
            case 'Video':
                return <Video className="w-5 h-5 text-red-400" />
            case 'QuestionBank':
                return <CheckCircle className="w-5 h-5 text-blue-400" />
            case 'Website':
            case 'Link':
                return <LinkIcon className="w-5 h-5 text-cyan-400" />
            default:
                return <FileText className="w-5 h-5 text-gray-400" />
        }
    }

    const getTypeName = (type: string) => {
        switch (type) {
            case 'Book': return 'Kitap'
            case 'Video': return 'Video'
            case 'QuestionBank': return 'Soru Bankası'
            case 'Link': return 'Link / Web'
            case 'Website': return 'Web Sitesi'
            default: return type
        }
    }

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString('tr-TR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch (e) {
            return dateString
        }
    }

    return (
        <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group relative hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10 flex flex-col h-full">

            {/* Main Content Wrapper - Grows to push footer down */}
            <div className="flex-grow flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-black/40 border border-white/5 group-hover:border-emerald-500/30 transition-colors shadow-sm">
                            {getIcon(resource.resourceType)}
                        </div>
                        <div>
                            <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1 text-lg">
                                {resource.name}
                            </h4>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                                <span className="font-medium px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5">
                                    {getTypeName(resource.resourceType)}
                                </span>
                                {resource.createdDate && (
                                    <span className="flex items-center gap-1 opacity-75">
                                        <Calendar className="w-3 h-3" />
                                        {formatDate(resource.createdDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            onDelete(resource.id)
                        }}
                        className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 absolute top-5 right-5"
                        title="Sil"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Specific Type Info - e.g. QuestionBank Progress */}
                {(resource.resourceType === 'QuestionBank' || resource.resourceType === 'Soru Bankası') && (
                    <div className="mt-auto mb-4 w-full">
                        <div className="flex justify-end mb-1">
                            <span className="text-xs font-medium text-emerald-400">
                                %{Math.round(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100)}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-700/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${Math.min(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer - Always at bottom */}
            <div className="mt-auto pt-4">
                {resource.linkOrInfo ? (
                    <a
                        href={resource.linkOrInfo}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-sm text-emerald-400 hover:text-emerald-300 transition-all font-medium group/btn"
                    >
                        <ExternalLink className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                        Kaynağa Git
                    </a>
                ) : (
                    <div className="h-[42px]" /> // Spacer to keep height consistent if no button
                )}
            </div>
        </div>
    )
}

export default StudyResourceCard
