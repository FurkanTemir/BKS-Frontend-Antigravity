import type { PostDto } from '../../types'
import { MessageCircle, Heart, Eye, AlertCircle, Pencil } from 'lucide-react'

interface PostCardProps {
    post: PostDto
    onEdit?: (post: PostDto) => void
}

const PostCard = ({ post, onEdit }: PostCardProps) => {
    // Determine status color/text based on flags or post prop logic
    // But since the parent filters and knows the tab, passing explicit flags is easy.
    // However, internally we can also derive if needed. 
    // The prompt says "Status Badges (Status Logic): Implement different visual styles based on the post status".
    // I'll rely on the parent or derived logic. 
    // Let's implement derived logic to be safe if props aren't fully indicative, 
    // but the tabs in MyPosts use isApproved/rejectionReason.

    const getStatusConfig = () => {
        if (post.isApproved) {
            return {
                badgeBg: 'bg-green-500/10',
                badgeText: 'text-green-400',
                label: 'Onaylandı',
                borderColor: 'group-hover:border-green-500/50'
            }
        }
        if (post.rejectionReason) {
            return {
                badgeBg: 'bg-red-500/10',
                badgeText: 'text-red-400',
                label: 'Reddedildi',
                borderColor: 'group-hover:border-red-500/50'
            }
        }
        return {
            badgeBg: 'bg-amber-500/10',
            badgeText: 'text-amber-400',
            label: 'Onay Bekliyor',
            borderColor: 'group-hover:border-amber-500/50'
        }
    }

    const config = getStatusConfig()

    return (
        <div className={`
            group relative p-6 rounded-2xl
            bg-[#1a1c1e] border border-gray-800
            transition-all duration-300 ease-out
            hover:-translate-y-1 hover:shadow-2xl hover:bg-[#222426]
            ${config.borderColor}
            max-w-4xl w-full mx-auto mb-4
        `}>
            {/* Header: Badges */}
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase ${config.badgeBg} ${config.badgeText} border border-white/5`}>
                        {config.label}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 text-xs text-gray-400 border border-white/5">
                        {post.topicName}
                    </span>
                </div>
                <span className="text-xs font-medium text-gray-500">
                    {new Date(post.createdDate).toLocaleDateString("tr-TR", {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </span>
            </div>

            {/* Content */}
            <div className="mb-6 relative">
                {/* Title logic if exists, but PostDto usually has just content. 
                     The prompt asked: "Make the Title more prominent with text-xl font-bold text-white."
                     If there's no title field, I'll use a truncated version of content as "title-like" or just the content itself stylized.
                     Looking at MyPosts.tsx before (view_file output), it renders: {post.content}
                     There is no separate title. I will treat the beginning of content or the content itself as the main text.
                  */}
                <p className="text-xl font-bold text-white leading-relaxed line-clamp-2 mb-2">
                    {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                </p>
                {post.content.length > 100 && (
                    <p className="text-gray-400 text-sm line-clamp-2">
                        {post.content}
                    </p>
                )}
            </div>

            {/* Rejection Reason */}
            {!post.isApproved && post.rejectionReason && (
                <div className="mt-4 mb-6 p-4 rounded-xl bg-red-500/5 border border-red-500/10 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-bold text-red-400 mb-1">Red Sebebi</h4>
                            <p className="text-sm text-red-300/80 leading-relaxed">
                                {post.rejectionReason}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Footer: Metrics & Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-pink-400 transition-colors">
                        <Heart size={18} />
                        <span className="text-sm font-medium">{post.likeCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-400 transition-colors">
                        <MessageCircle size={18} />
                        <span className="text-sm font-medium">{post.commentCount}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-400 transition-colors">
                        <Eye size={18} />
                        <span className="text-sm font-medium">{post.viewCount}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    {!post.isApproved && !post.rejectionReason && onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(post);
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 hover:scale-105 transition-all"
                        >
                            <Pencil size={16} />
                            <span className="text-sm font-bold">Düzenle</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PostCard
