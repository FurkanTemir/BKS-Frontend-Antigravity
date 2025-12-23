import { Link } from 'react-router-dom'
import { Heart, Trash2, Loader2 } from 'lucide-react'
import type { CommentDto } from '../types'
import CommentForm from './CommentForm'
import { useState } from 'react'
import { useAuthStore } from '../stores/authStore'

interface CommentItemProps {
    comment: CommentDto
    activeReplyId?: number
    onReplyClick?: (commentId: number) => void
    onCancelReply?: () => void
    onSubmitReply?: (content: string, parentId: number) => Promise<void>
    onLike?: () => void
    onDelete?: (commentId: number) => Promise<void>
}

const CommentItem = ({
    comment,
    activeReplyId,
    onReplyClick,
    onCancelReply,
    onSubmitReply,
    onLike,
    onDelete
}: CommentItemProps) => {
    const isReplying = activeReplyId === comment.id
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const user = useAuthStore(state => state.user)

    const handleSubmit = async (content: string) => {
        if (!onSubmitReply) return
        setIsSubmitting(true)
        try {
            await onSubmitReply(content, comment.id)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!onDelete || !window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return
        setIsDeleting(true)
        try {
            await onDelete(comment.id)
        } catch {
            setIsDeleting(false)
        }
    }

    return (
        <div className={`animate-in fade-in duration-300 group ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex gap-4 items-start">
                {/* Avatar */}
                <Link to={`/app/u/${comment.userName}`} className="shrink-0 group/avatar">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-900/20 text-white font-bold select-none border border-white/10 mt-1 overflow-hidden group-hover/avatar:ring-2 ring-neon-cyan/50 transition-all">
                        {comment.profilePictureUrl ? (
                            <img src={comment.profilePictureUrl} alt={comment.userName} className="w-full h-full object-cover" />
                        ) : (
                            comment.userName.charAt(0).toUpperCase()
                        )}
                    </div>
                </Link>

                {/* Content Area */}
                <div className="flex-1 space-y-2">
                    {/* Header: Name + Date */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Link to={`/app/u/${comment.userName}`} className="font-semibold text-gray-200 text-sm hover:text-neon-cyan transition-colors cursor-pointer">
                                {comment.displayName || comment.userName}
                            </Link>
                            <span className="text-xs text-gray-600">
                                {new Date(comment.createdDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                {' • '}
                                {new Date(comment.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>

                        {/* Delete Action (Top Right for visibility or maintain in footer? User asked for delete function. Footer is standard.) */}
                        {/* Actually, let's put it in footer as usual, but verify if user prefers it elsewhere. Footer is cleaner. */}
                    </div>

                    {/* Comment Text */}
                    <div className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                        {comment.isDeleted ? (
                            <span className="italic text-gray-500 select-none">Bu yorum silindi.</span>
                        ) : (
                            comment.content
                        )}
                    </div>

                    {/* Actions Footer */}
                    {!comment.isDeleted && (
                        <div className="flex items-center gap-4 pt-1">
                            <button
                                onClick={() => onReplyClick && onReplyClick(comment.id)}
                                className="text-xs font-semibold text-gray-500 hover:text-neon-cyan transition-colors"
                            >
                                Yanıtla
                            </button>

                            <button
                                onClick={onLike}
                                className="flex items-center gap-1 group/like"
                            >
                                <Heart size={14} className="text-gray-500 group-hover/like:text-red-500 transition-colors" />
                            </button>

                            {/* Delete Button */}
                            {user?.id === comment.userId && onDelete && (
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex items-center gap-1 group/delete ml-auto md:ml-0"
                                    title="Yorumu sil"
                                >
                                    {isDeleting ? (
                                        <Loader2 size={14} className="animate-spin text-red-500" />
                                    ) : (
                                        <Trash2 size={14} className="text-gray-600 group-hover/delete:text-red-500 transition-colors" />
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Inline Reply Form */}
                    {isReplying && (
                        <div className="mt-4">
                            <CommentForm
                                onSubmit={handleSubmit}
                                onCancel={onCancelReply}
                                isSubmitting={isSubmitting}
                                autoFocus={true}
                                submitLabel="Yanıtla"
                                showCancel={true}
                                placeholder={`@${comment.userName} kullanıcısına yanıt ver...`}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-6 ml-5 pl-6 border-l-2 border-gray-800 hover:border-gray-700 transition-colors space-y-6">
                    {comment.replies.map(reply => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            activeReplyId={activeReplyId}
                            onReplyClick={onReplyClick}
                            onCancelReply={onCancelReply}
                            onSubmitReply={onSubmitReply}
                            onLike={onLike}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentItem
