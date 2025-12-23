import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import type { PostDto, CommentDto } from '../types'
import PostCard from '../components/PostCard'
import CommentItem from '../components/CommentItem'
import CommentForm from '../components/CommentForm'
import { Loader2, ArrowLeft, MessageSquare } from 'lucide-react'

const PostDetail = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [post, setPost] = useState<PostDto | null>(null)
    const [comments, setComments] = useState<CommentDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isMainSubmitting, setIsMainSubmitting] = useState(false)
    const [activeReplyId, setActiveReplyId] = useState<number | undefined>(undefined)

    useEffect(() => {
        if (id) fetchPostDetail()
    }, [id])

    const buildCommentTree = (flatComments: CommentDto[]): CommentDto[] => {
        const commentMap = new Map<number, CommentDto>()
        const roots: CommentDto[] = []

        // Initialize map and replies array
        flatComments.forEach(c => {
            commentMap.set(c.id, { ...c, replies: [] })
        })

        flatComments.forEach(c => {
            if (c.parentId) {
                const parent = commentMap.get(c.parentId)
                if (parent) {
                    parent.replies?.push(commentMap.get(c.id)!)
                } else {
                    // Orphaned comment or parent not loaded? Treat as root for now or ignore.
                    roots.push(commentMap.get(c.id)!)
                }
            } else {
                roots.push(commentMap.get(c.id)!)
            }
        })

        return roots.sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
    }

    const fetchPostDetail = async () => {
        if (!id) return
        setIsLoading(true)
        try {
            const postData = await postService.getById(parseInt(id))
            setPost(postData)
            const commentsData = await postService.getComments(parseInt(id))
            setComments(buildCommentTree(commentsData))
        } catch (err) {
            console.error('Failed to fetch post detail:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLike = async () => {
        if (!post) return
        try {
            if (post.isLikedByMe) {
                await postService.unlike(post.id)
            } else {
                await postService.like(post.id)
            }
            setPost({
                ...post,
                isLikedByMe: !post.isLikedByMe,
                likeCount: post.isLikedByMe ? post.likeCount - 1 : post.likeCount + 1
            })
        } catch (err) {
            console.error('Failed to toggle like:', err)
        }
    }

    const handleSubmitComment = async (content: string, parentId?: number) => {
        if (!post) return

        // If parentId is provided, we are not submitting via main form, so we don't set main submitting state
        if (!parentId) setIsMainSubmitting(true)

        try {
            await postService.addComment({
                postId: post.id,
                content: content,
                parentId: parentId
            })

            // Refresh comments to get correct tree
            const commentsData = await postService.getComments(post.id)
            setComments(buildCommentTree(commentsData))

            setPost(prev => prev ? ({ ...prev, commentCount: (prev.commentCount || 0) + 1 }) : null)

            // If it was a reply, close the reply form
            if (parentId) {
                setActiveReplyId(undefined)
            }
        } catch (err) {
            console.error('Failed to add comment:', err)
        } finally {
            if (!parentId) setIsMainSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId: number) => {
        if (!post) return

        // 1. Optimistic Update
        const previousComments = [...comments]

        const markAsDeleted = (nodes: CommentDto[]): CommentDto[] => {
            return nodes.map(node => {
                if (node.id === commentId) {
                    return { ...node, isDeleted: true } // Content handled by Render logic (isDeleted check)
                }
                if (node.replies) {
                    return { ...node, replies: markAsDeleted(node.replies) }
                }
                return node
            })
        }

        setComments(prev => markAsDeleted(prev))

        try {
            await postService.deleteComment(commentId)

            // 2. Background Sync (Optional but good for consistency)
            const commentsData = await postService.getComments(post.id)
            setComments(buildCommentTree(commentsData))

            setPost(prev => prev ? ({ ...prev, commentCount: Math.max(0, (prev.commentCount || 0) - 1) }) : null)
        } catch (err) {
            console.error('Failed to delete comment:', err)
            // 3. Rollback on Error
            setComments(previousComments)
            alert('Yorum silinirken bir hata oluştu.')
        }
    }

    if (isLoading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-blue w-8 h-8" /></div>
    if (!post) return <div className="p-8 text-center text-gray-500">Gönderi bulunamadı.</div>

    return (
        <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4"
            >
                <ArrowLeft size={20} /> Geri Dön
            </button>

            {/* Main Post Card */}
            <PostCard
                post={post}
                isDetailView={true}
                onLike={handleLike}
                onShare={() => { }}
            />

            {/* Comments Section */}
            {post.isApproved && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-white">Yorumlar</h3>

                    {/* Main Input (Top Level Comments Only) */}
                    <div className="p-4 rounded-xl border border-gray-800 bg-[#111318]">
                        <CommentForm
                            onSubmit={(content) => handleSubmitComment(content)}
                            isSubmitting={isMainSubmitting}
                            placeholder="Yorumunu buraya yaz..."
                        />
                    </div>

                    {/* List */}
                    <div className="space-y-8 pt-4">
                        {comments.map(comment => (
                            <CommentItem
                                key={comment.id}
                                comment={comment}
                                activeReplyId={activeReplyId}
                                onReplyClick={(id) => setActiveReplyId(id)}
                                onCancelReply={() => setActiveReplyId(undefined)}
                                onSubmitReply={handleSubmitComment}
                                onLike={() => { }}
                                onDelete={handleDeleteComment}
                            />
                        ))}
                        {comments.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                                <p>Henüz yorum yok. İlk yorumu sen yap!</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default PostDetail
