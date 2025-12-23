import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import type { PostDto } from '../types'
import { Loader2, Clock, CheckCircle, XCircle, AlertCircle, Pencil, X, Save, FileQuestion, Plus } from 'lucide-react'
import PostCard from '../components/Posts/PostCard'

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
        <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Benim Paylaşımlarım
                    </h1>
                    <p className="text-gray-400 mt-2">Paylaşımlarının durumunu buradan takip edebilirsin.</p>
                </div>
                <button
                    onClick={() => navigate('/app/posts')} // Assuming main posts page or create modal trigger
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-neon-blue text-black font-bold hover:bg-blue-400 hover:scale-105 transition-all shadow-lg shadow-neon-blue/20"
                >
                    <Plus size={20} />
                    Yeni Paylaşım
                </button>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 p-1 rounded-xl bg-white/5 border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('approved')}
                    className={`
                        px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center gap-2
                        ${activeTab === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <CheckCircle size={16} />
                    Onaylananlar
                </button>
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`
                        px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center gap-2
                        ${activeTab === 'pending'
                            ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <Clock size={16} />
                    Onay Bekleyenler
                </button>
                <button
                    onClick={() => setActiveTab('rejected')}
                    className={`
                        px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300
                        flex items-center gap-2
                        ${activeTab === 'rejected'
                            ? 'bg-red-500/20 text-red-400 shadow-lg shadow-red-500/10'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }
                    `}
                >
                    <XCircle size={16} />
                    Reddedilenler
                </button>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-purple-400" />
                </div>
            ) : (
                <div className="min-h-[400px]">
                    {filteredPosts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <FileQuestion className="w-12 h-12 text-gray-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">
                                Henüz paylaşım bulunamadı
                            </h3>
                            <p className="text-gray-400 max-w-sm mb-8">
                                Bu kategoride henüz bir paylaşımın yok. Fikirlerini toplulukla paylaşmaya ne dersin?
                            </p>
                            <button
                                onClick={() => navigate('/app/posts')}
                                className="px-8 py-3 rounded-full border border-white/10 hover:bg-white/5 transition-all text-white font-medium flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Paylaşım Oluştur
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {filteredPosts.map(post => (
                                <div key={post.id} onClick={() => navigate('/app/posts/' + post.id)} className="cursor-pointer">
                                    <PostCard
                                        post={post}
                                        onEdit={(post) => {
                                            setEditingPost(post)
                                            setEditContent(post.content)
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Edit Modal */}
            {editingPost && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#1a1c1e] rounded-2xl w-full max-w-lg border border-gray-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <Pencil size={18} className="text-amber-400" />
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
                                    className="w-full h-32 bg-[#0f1112] text-white rounded-xl p-4 border border-white/10 focus:border-neon-blue focus:ring-1 focus:ring-neon-blue outline-none resize-none placeholder-gray-600"
                                    placeholder="İçeriğinizi düzenleyin..."
                                />
                            </div>

                            {/* Warning about re-approval */}
                            <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex gap-3">
                                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
                                <p className="text-sm text-amber-200/80 leading-relaxed">
                                    Düzenleme yapıldığında gönderiniz tekrar <span className="text-amber-400 font-bold">onay sürecine</span> girecektir.
                                </p>
                            </div>
                        </div>

                        <div className="p-4 border-t border-white/5 bg-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingPost(null)}
                                className="px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors font-medium"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleUpdate}
                                disabled={!editContent.trim() || isEditSubmitting}
                                className="px-6 py-2 rounded-xl bg-neon-blue text-black font-bold hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-neon-blue/20"
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
