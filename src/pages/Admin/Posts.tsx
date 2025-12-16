import { useState, useEffect } from 'react'
import { postService } from '../../services/postService'
import type { PostDto } from '../../types'
import { Loader2, Check, X } from 'lucide-react'

const AdminPosts = () => {
    const [posts, setPosts] = useState<PostDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)

    useEffect(() => {
        fetchPending()
    }, [])

    const fetchPending = async () => {
        setIsLoading(true)
        try {
            const data = await postService.getPendingPosts()
            setPosts(data)
        } catch (err) {
            console.error('Failed to fetch pending posts:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleApprove = async (id: number) => {
        if (!confirm('Bu gönderiyi onaylıyor musunuz?')) return
        setProcessingId(id)
        try {
            await postService.approve(id)
            setPosts(posts.filter(p => p.id !== id))
        } catch (err) {
            console.error(err)
            alert('İşlem başarısız.')
        } finally {
            setProcessingId(null)
        }
    }

    const handleReject = async (id: number) => {
        const reason = prompt('Red sebebini giriniz:')
        if (!reason) return

        setProcessingId(id)
        try {
            await postService.reject(id, reason)
            setPosts(posts.filter(p => p.id !== id))
        } catch (err) {
            console.error(err)
            alert('İşlem başarısız.')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white">Onay Bekleyen Gönderiler</h1>
                    <p className="text-gray-400 mt-2">İncelenmesi gereken {posts.length} yeni gönderi var.</p>
                </div>
                <button onClick={fetchPending} className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 text-sm">Yenile</button>
            </header>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {posts.length === 0 ? (
                        <div className="p-12 text-center text-gray-500 border border-white/5 rounded-2xl bg-white/5">
                            <Check className="w-12 h-12 mx-auto mb-4 text-emerald-500 opacity-50" />
                            <h3 className="text-xl font-medium text-white">Her şey yolunda!</h3>
                            <p>Onay bekleyen gönderi bulunmuyor.</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post.id} className="glass-panel p-6 rounded-xl border border-white/5 bg-white/5 flex gap-6">
                                {/* User Info */}
                                <div className="shrink-0 text-center space-y-2 w-32 border-r border-white/5 pr-6">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-bold text-lg">
                                        {post.userName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-white truncate">{post.userName}</div>
                                        <div className="text-xs text-gray-400">{new Date(post.createdDate).toLocaleDateString()}</div>
                                    </div>
                                    <span className="inline-block px-2 py-1 text-xs bg-white/10 rounded text-gray-300">
                                        {post.topicName}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="flex-1">
                                    <p className="text-gray-200 text-lg leading-relaxed mb-4">{post.content}</p>
                                    {(post.imageUrl || post.video) && (
                                        <div className="h-64 rounded-lg overflow-hidden bg-black/20">
                                            {post.contentType === 5 ? (
                                                <iframe
                                                    src={(() => {
                                                        const url = post.video?.publicUrl || post.imageUrl || '';
                                                        if (url.includes('youtube.com/watch?v=')) return `https://www.youtube.com/embed/${url.split('v=')[1]?.split('&')[0]}`;
                                                        if (url.includes('youtu.be/')) return `https://www.youtube.com/embed/${url.split('youtu.be/')[1]}`;
                                                        return url;
                                                    })()}
                                                    className="w-full h-full"
                                                    title="Post Video"
                                                    frameBorder="0"
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                    allowFullScreen
                                                />
                                            ) : (
                                                <img src={post.imageUrl} alt="" className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="shrink-0 flex flex-col justify-center gap-3 border-l border-white/5 pl-6">
                                    <button
                                        onClick={() => handleApprove(post.id)}
                                        disabled={processingId === post.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors w-full justify-center"
                                    >
                                        <Check size={18} />
                                        Onayla
                                    </button>
                                    <button
                                        onClick={() => handleReject(post.id)}
                                        disabled={processingId === post.id}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 font-bold rounded-lg hover:bg-red-500/30 disabled:opacity-50 transition-colors w-full justify-center"
                                    >
                                        <X size={18} />
                                        Reddet
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    )
}

export default AdminPosts
