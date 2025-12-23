import { motion } from 'framer-motion'
import { Check, X, Clock, User, Tag, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import type { PostDto } from '../../types'
import { useState } from 'react'

interface AdminApprovalCardProps {
    post: PostDto
    onApprove: (id: number) => void
    onReject: (id: number) => void
    onViewDetail?: (id: number) => void
    disabled?: boolean
}

const AdminApprovalCard = ({ post, onApprove, onReject, onViewDetail, disabled }: AdminApprovalCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false)

    // Helper to determine badge color based on topic (simplified)
    const getBadgeColor = (topic: string) => {
        if (topic.includes('Matematik') || topic.includes('Fen')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        if (topic.includes('Edebiyat') || topic.includes('Sosyal')) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    }

    // Determine if text is long enough to need truncation (mock check, realistically depends on char count or line height)
    const isLongContent = post.content.length > 300 || post.content.split('\n').length > 4

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="group relative overflow-hidden rounded-2xl border border-white/10 bg-dark-300/50 backdrop-blur-sm shadow-xl transition-all hover:border-white/20"
        >
            {/* "Review Sheet" Header Decoration */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-cyan/50 via-purple-500/50 to-neon-cyan/50 opacity-50" />

            <div className="flex flex-col md:flex-row">

                {/* Main Content Area */}
                <div className="flex-1 p-6 md:p-8 space-y-6">

                    {/* Header: User & Meta */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-white font-bold text-xl ring-2 ring-white/5 shadow-inner overflow-hidden">
                                    {post.profilePictureUrl ? (
                                        <img src={post.profilePictureUrl} alt={post.userName} className="w-full h-full object-cover" />
                                    ) : (
                                        post.userName.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="absolute -bottom-1 -right-1 bg-gray-900 rounded-full p-1 border border-gray-700">
                                    <User size={12} className="text-gray-400" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white group-hover:text-neon-cyan transition-colors">
                                    {post.userName}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                                    <span className="flex items-center gap-1.5">
                                        <Clock size={14} />
                                        {new Date(post.createdDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {/* Mock "New User" badge logic */}
                                    <span className="flex items-center gap-1.5 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded text-xs border border-emerald-400/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                        Yeni Gönderi
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Category Badge */}
                        <div className={`px-4 py-1.5 rounded-full text-sm font-medium border flex items-center gap-2 ${getBadgeColor(post.topicName)}`}>
                            <Tag size={14} />
                            {post.topicName}
                        </div>
                    </div>

                    {/* Post Content */}
                    {/* Alignment fix: ensure this div aligns exactly with the text part of the header, which is approx 4.5rem (w-14 + gap-4) */}
                    <div className="pl-0 md:pl-[4.5rem]">
                        <div className="relative">
                            <p
                                className={`text-gray-200 text-lg leading-relaxed whitespace-pre-wrap mb-4 transition-all duration-300 ${!isExpanded && isLongContent ? 'line-clamp-4' : ''}`}
                            >
                                {post.content}
                            </p>

                            {isLongContent && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="flex items-center gap-1 text-sm text-neon-cyan hover:text-white transition-colors font-medium mb-4 focus:outline-none"
                                >
                                    {isExpanded ? (
                                        <>
                                            <ChevronUp size={14} /> Daha Az Göster
                                        </>
                                    ) : (
                                        <>
                                            <ChevronDown size={14} /> Devamını Oku
                                        </>
                                    )}
                                </button>
                            )}
                        </div>

                        {(post.imageUrl || post.video) && (
                            <div className="mt-4 rounded-xl overflow-hidden bg-black/20 border border-white/5 shadow-lg max-w-2xl relative group/media ring-1 ring-white/5">
                                {post.contentType === 5 ? (
                                    <div className="aspect-video relative">
                                        <iframe
                                            src={(() => {
                                                const url = post.video?.publicUrl || post.imageUrl || '';
                                                if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
                                                if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
                                                return url;
                                            })()}
                                            className="w-full h-full"
                                            title="Post Video"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <img
                                            src={post.imageUrl}
                                            alt="Post attachment"
                                            className="w-full h-auto object-cover max-h-[500px]"
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Zone (Sidebar) */}
                <div className="w-full md:w-28 bg-dark-400/30 border-t md:border-t-0 md:border-l border-white/5 flex flex-row md:flex-col items-center justify-center gap-6 p-4 md:py-8 backdrop-blur-[2px]">

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onApprove(post.id)}
                        disabled={disabled}
                        title="Onayla"
                        className="group/btn w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <Check size={28} strokeWidth={3} className="drop-shadow-sm" />
                    </motion.button>

                    <div className="w-px h-8 bg-white/10 hidden md:block" />

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onReject(post.id)}
                        disabled={disabled}
                        title="Reddet"
                        className="group/btn w-14 h-14 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    >
                        <X size={28} strokeWidth={3} className="drop-shadow-sm" />
                    </motion.button>

                    {onViewDetail && (
                        <>
                            <div className="w-px h-8 bg-white/10 hidden md:block" />
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onViewDetail(post.id)}
                                title="Detayları Gör"
                                className="group/btn w-10 h-10 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                            >
                                <Eye size={20} strokeWidth={2} />
                            </motion.button>
                        </>
                    )}

                </div>
            </div>
        </motion.div>
    )
}

export default AdminApprovalCard
