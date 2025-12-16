import { Heart } from 'lucide-react'
import type { CommentDto } from '../types'
import CommentForm from './CommentForm'
import { useState } from 'react'

interface CommentItemProps {
    comment: CommentDto
    activeReplyId?: number
    onReplyClick?: (commentId: number) => void
    onCancelReply?: () => void
    onSubmitReply?: (content: string, parentId: number) => Promise<void>
    onLike?: () => void
}

const CommentItem = ({
    comment,
    activeReplyId,
    onReplyClick,
    onCancelReply,
    onSubmitReply,
    onLike
}: CommentItemProps) => {
    const isReplying = activeReplyId === comment.id
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (content: string) => {
        if (!onSubmitReply) return
        setIsSubmitting(true)
        try {
            await onSubmitReply(content, comment.id)
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="animate-in fade-in duration-300 group">
            <div className="flex gap-4 items-start">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-900/20 text-white font-bold select-none border border-white/10 mt-1">
                    {comment.userName.charAt(0)}
                </div>

                {/* Content Area */}
                <div className="flex-1 space-y-2">
                    {/* Header: Name + Date */}
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-200 text-sm hover:text-neon-cyan transition-colors cursor-pointer">
                            {comment.userName}
                        </span>
                        <span className="text-xs text-gray-600">
                            {new Date(comment.createdDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            {' • '}
                            {new Date(comment.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>

                    {/* Comment Text */}
                    <div className="text-gray-300 text-[15px] leading-relaxed whitespace-pre-wrap font-normal">
                        {comment.content}
                    </div>

                    {/* Actions Footer */}
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
                    </div>

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
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default CommentItem
