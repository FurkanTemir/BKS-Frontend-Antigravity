import { Link } from 'react-router-dom'
import { Heart, MessageSquare, Share2, Play } from 'lucide-react'
import type { PostDto } from '../types'

interface PostCardProps {
    post?: PostDto
    onClick?: () => void
    onLike?: (e: React.MouseEvent) => void
    onComment?: (e: React.MouseEvent) => void
    onShare?: (e: React.MouseEvent) => void
    isLoading?: boolean
    className?: string
    isDetailView?: boolean
}

const PostCard = ({
    post,
    onClick,
    onLike,
    onComment,
    onShare,
    isLoading = false,
    className,
    isDetailView = false
}: PostCardProps) => {

    // Helper for dynamic topic colors
    const getTopicStyle = (topicName: string = '') => {
        const lowerTopic = topicName.toLowerCase()

        // STEM / Math / Science -> Blue tones
        if (['matematik', 'fizik', 'kimya', 'biyoloji', 'fen', 'geometri', 'math', 'science'].some(t => lowerTopic.includes(t))) {
            return 'bg-blue-900/30 text-blue-400'
        }

        // Verbal / Literature -> Orange tones
        if (['edebiyat', 'tarih', 'coğrafya', 'türkçe', 'sosyal', 'felsefe', 'din'].some(t => lowerTopic.includes(t))) {
            return 'bg-orange-900/30 text-orange-400'
        }

        // Default -> Cyan/Gray Mix or User Choice (Using Cyan/Purple based on request)
        return 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20'
    }

    if (isLoading) {
        return (
            <div className={`p-6 rounded-xl border border-gray-800 bg-[#111318] space-y-4 ${className}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                            <div className="w-32 h-4 bg-white/5 rounded animate-pulse" />
                            <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
                        </div>
                    </div>
                    <div className="w-20 h-6 bg-white/5 rounded-full animate-pulse" />
                </div>
                <div className="w-full h-4 bg-white/5 rounded animate-pulse" />
                <div className="w-3/4 h-4 bg-white/5 rounded animate-pulse" />

                {/* Media Skeleton */}
                <div className="w-full aspect-video bg-white/5 rounded-xl animate-pulse" />

                <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                    <div className="w-8 h-8 bg-white/5 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-white/5 rounded animate-pulse" />
                    <div className="w-8 h-8 bg-white/5 rounded animate-pulse ml-auto" />
                </div>
            </div>
        )
    }

    if (!post) return null

    // Detail View Styles vs List View Styles
    const containerClasses = isDetailView
        ? `p-8 rounded-2xl border border-gray-800 bg-[#111318] ${className || ''}` // Static, no hover
        : `p-6 rounded-xl border border-gray-800 bg-[#111318] hover:bg-[#16181d] transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:shadow-[0_0_30px_-5px_var(--color-neon-cyan)]/20 ${className || ''}`

    const mediaContainerClasses = isDetailView
        ? "mb-8 rounded-xl overflow-hidden bg-black/20" // Full height allowed
        : "mb-4 relative w-full aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/5 group-hover:border-white/10 transition-colors"

    return (
        <div
            onClick={onClick}
            className={containerClasses}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link
                        to={`/app/u/${post.userName}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-3 group/user"
                    >
                        <div className={`rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden border border-white/10 ${isDetailView ? 'w-12 h-12 text-lg' : 'w-10 h-10'}`}>
                            {post.profilePictureUrl ? (
                                <img src={post.profilePictureUrl} alt={post.userName} className="w-full h-full object-cover" />
                            ) : (
                                post.userName.charAt(0).toUpperCase()
                            )}
                        </div>
                        <div>
                            <h3 className={`font-semibold text-gray-100 transition-colors line-clamp-1 ${isDetailView ? 'text-xl' : 'group-hover/user:text-neon-cyan'}`}>
                                {post.displayName || post.userName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <span>{new Date(post.createdDate).toLocaleDateString(undefined, { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                                {post.userRole && (
                                    <span className="px-1.5 py-0.5 rounded bg-white/5 text-gray-300 text-[10px]">
                                        {post.userRole}
                                    </span>
                                )}
                            </div>
                        </div>
                    </Link>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${getTopicStyle(post.topicName)}`}>
                    {post.topicName}
                </span>
            </div>

            {/* Content */}
            <p className={`text-gray-300 mb-4 leading-relaxed whitespace-pre-wrap ${isDetailView ? 'text-lg' : 'line-clamp-3'}`}>
                {post.content}
            </p>

            {/* Media */}
            {(post.imageUrl || post.video) && (
                <div className={mediaContainerClasses}>
                    {post.contentType === 5 && isDetailView ? (
                        <iframe
                            src={(() => {
                                const url = post.video?.publicUrl || post.imageUrl || '';
                                if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
                                if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
                                return url;
                            })()}
                            className="w-full h-[500px]"
                            title="Post Video"
                            frameBorder="0"
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : post.imageUrl ? (
                        <img
                            src={post.imageUrl}
                            alt="Post content"
                            className={`w-full h-full object-cover transition-transform duration-500 ${isDetailView ? 'max-h-[600px] object-contain' : 'group-hover:scale-105'}`}
                        />
                    ) : post.video ? (
                        <div className="w-full h-full flex items-center justify-center bg-black/40">
                            {/* List View Video Placeholder */}
                            <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 text-white group-hover:scale-110 transition-transform">
                                <Play size={24} fill="currentColor" className="ml-1" />
                            </div>
                            {post.video.thumbnailUrl && (
                                <img
                                    src={post.video.thumbnailUrl}
                                    className="absolute inset-0 w-full h-full object-cover -z-10 opacity-60"
                                />
                            )}
                        </div>
                    ) : null}
                </div>
            )}

            {/* Footer / Actions */}
            <div className="flex items-center gap-6 pt-4 border-t border-gray-800">
                <button
                    onClick={onLike}
                    className={`flex items-center gap-2 transition-colors ${post.isLikedByMe ? 'text-red-500' : 'text-gray-400 hover:text-neon-cyan'} ${isDetailView ? 'px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10' : ''}`}
                >
                    <Heart size={isDetailView ? 24 : 20} fill={post.isLikedByMe ? 'currentColor' : 'none'} />
                    <span className={`font-medium ${isDetailView ? 'text-base' : 'text-sm'}`}>{post.likeCount}</span>
                </button>

                <button
                    onClick={onComment}
                    className={`flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors ${isDetailView ? 'px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10' : ''}`}
                >
                    <MessageSquare size={isDetailView ? 24 : 20} />
                    <span className={`font-medium ${isDetailView ? 'text-base' : 'text-sm'}`}>{post.commentCount} {isDetailView && 'Yorum'}</span>
                </button>

                <button
                    onClick={onShare}
                    className="flex items-center gap-2 text-gray-400 hover:text-white ml-auto transition-colors"
                >
                    <Share2 size={isDetailView ? 24 : 20} />
                </button>
            </div>
        </div>
    )
}

export default PostCard
