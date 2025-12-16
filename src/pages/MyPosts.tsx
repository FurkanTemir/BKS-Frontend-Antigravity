import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import type { PostDto } from '../types'
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, Pencil, X, Save } from 'lucide-react'

const MyPosts = () => {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<PostDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('approved')

    // Edit State
    const [editingPost, setEditingPost] = useState<PostDto | null>(null)
    const [editContent, setEditContent] = useState('')
    const [isEditSubmitting, setIsEditSubmitting] = useState(false)

    useEffect(() => {
        fetchPosts()
    }, [])

    const fetchPosts = async () => {
        setIsLoading(true)
        try {
            const data = await postService.getMyPosts()
            setPosts(data)
        } catch (err) {
            console.error('Failed to fetch my posts:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUpdate = async () => {
        if (!editingPost || !editContent.trim()) return

        setIsEditSubmitting(true)
        try {
            await postService.update(editingPost.id, {
                content: editContent,
                imageUrl: editingPost.imageUrl, // Preserve existing image
                videoId: editingPost.video ? editingPost.video.id : undefined // Preserve existing video
            })
            // Refresh posts
            await fetchPosts()
            setEditingPost(null)
            setEditContent('')
        } catch (err) {
            console.error('Failed to update post:', err)
        } finally {
            setIsEditSubmitting(false)
        }
    }

    const filteredPosts = posts.filter(post => {
        if (activeTab === 'approved') return post.isApproved
        if (activeTab === 'pending') return !post.isApproved && !post.rejectionReason
        if (activeTab === 'rejected') return !post.isApproved && post.rejectionReason
        return false
    })

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Benim Paylaşımlarım
                </h1>
                <p className="text-gray-400 mt-2">Paylaşımlarının durumunu buradan takip edebilirsin.</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'approved' ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <CheckCircle size={16} />
                        Onaylananlar
                    </div>
                    {activeTab === 'approved' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'pending' ? 'text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Onay Bekleyenler
                    </div>
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400" />}
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`pb-3 px-4 text-sm font-medium transition-colors relative ${activeTab === 'rejected' ? 'text-red-400' : 'text-gray-400 hover:text-white'}`}
                >
                    <div className="flex items-center gap-2">
                        <XCircle size={16} />
                        Reddedilenler
                    </div>
                    {activeTab === 'rejected' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-red-400" />}
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredPosts.length === 0 ? (
                        <div className="glass-panel p-8 text-center text-gray-500">
                            Bu kategoride paylaşım bulunmuyor.
                        </div>
                    ) : (
                        filteredPosts.map(post => (
                            <div
                                key={post.id}
                                onClick={() => navigate('/app/posts/' + post.id)}
                                className="glass-panel p-6 rounded-xl border border-white/5 bg-white/5 space-y-4 cursor-pointer hover:bg-white/10 transition-colors relative group"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="px-2 py-1 rounded-full bg-white/10 text-xs text-gray-300 border border-white/10">
                                                {post.topicName}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {new Date(post.createdDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-white line-clamp-2">{post.content}</p>
                                    </div>

                                    <div className="flex items-start gap-2">
                                        {activeTab === 'pending' && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setEditingPost(post)
                                                    setEditContent(post.content)
                                                }}
                                                className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 transition-colors"
                                                title="Düzenle"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                        )}

                                        {activeTab === 'rejected' && (
                                            <div className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 max-w-md">
                                                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <div className="text-sm font-medium text-red-400">Red Sebebi</div>
                                                    <div className="text-sm text-red-300/80">{post.rejectionReason}</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {activeTab === 'approved' && (
                                    <div className="flex items-center gap-4 text-sm text-gray-400 pt-4 border-t border-white/5">
                                        <span>{post.likeCount} Beğeni</span>
                                        <span>{post.commentCount} Yorum</span>
                                        <span>{post.viewCount} Görüntülenme</span>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
            {/* Edit Modal */}
            {editingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-dark-300 rounded-2xl w-full max-w-lg border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Pencil size={18} className="text-yellow-400" />
                                Gönderiyi Düzenle
                            </h3>
                            <button
                                onClick={() => setEditingPost(null)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">İçerik</label>
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full h-32 bg-dark-400 text-white rounded-xl p-4 border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none resize-none"
                                    placeholder="İçeriğinizi düzenleyin..."
                                />
                            </div>

                            {/* Warning about re-approval */}
                            <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
                                <p className="text-sm text-yellow-200/80">
                                    Düzenleme yapıldığında gönderiniz tekrar onay sürecine girecektir.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingPost(null)}
                                className="px-4 py-2 rounded-xl text-gray-300 hover:bg-white/5 transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={!editContent.trim() || isEditSubmitting}
                                className="px-6 py-2 rounded-xl bg-neon-blue text-black font-bold hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                {isEditSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={18} />}
                                Kaydet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyPosts
