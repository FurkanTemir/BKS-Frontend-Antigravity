import { useState, useEffect } from 'react'
import { postService } from '../../services/postService'
import type { PostDto } from '../../types'
import { Loader2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import AdminApprovalCard from '../../components/Admin/AdminApprovalCard'
import RejectionModal from '../../components/Admin/RejectionModal'
import { useNavigate } from 'react-router-dom'

const AdminPosts = () => {
    const [posts, setPosts] = useState<PostDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [processingId, setProcessingId] = useState<number | null>(null)
    const [rejectionModalPostId, setRejectionModalPostId] = useState<number | null>(null)
    const navigate = useNavigate()

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
        // Optional: Add simple confirmation or just instant action with toast (keeping it snappy as requested)
        if (!confirm('Bu gönderiyi onaylıyor musunuz?')) return

        setProcessingId(id)
        try {
            await postService.approve(id)
            setPosts(prev => prev.filter(p => p.id !== id))
        } catch (err) {
            console.error(err)
            alert('İşlem başarısız.')
        } finally {
            setProcessingId(null)
        }
    }

    const initReject = (id: number) => {
        setRejectionModalPostId(id)
    }

    const handleConfirmReject = async (reason: string) => {
        if (!rejectionModalPostId) return

        setProcessingId(rejectionModalPostId)
        try {
            await postService.reject(rejectionModalPostId, reason)
            setPosts(prev => prev.filter(p => p.id !== rejectionModalPostId))
            setRejectionModalPostId(null)
        } catch (err) {
            console.error(err)
            alert('İşlem başarısız.')
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="min-h-screen p-6 md:p-12 space-y-10 animate-in fade-in duration-500">

            {/* Page Header */}
            <div className="max-w-5xl mx-auto flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight">Onay Merkezi</h1>
                    <p className="text-gray-400 mt-2 text-lg">
                        İncelenmeyi bekleyen <span className="text-neon-cyan font-bold">{posts.length}</span> gönderi var.
                    </p>
                </div>
                <button
                    onClick={fetchPending}
                    className="px-5 py-2.5 bg-white/5 rounded-xl hover:bg-white/10 text-sm font-medium transition-colors border border-white/5"
                >
                    Listeyi Yenile
                </button>
            </div>

            {/* Content Area */}
            <div className="max-w-5xl mx-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <Loader2 className="w-12 h-12 animate-spin text-neon-cyan" />
                        <p className="text-gray-500 animate-pulse">Veriler yükleniyor...</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        <AnimatePresence mode="popLayout">
                            {posts.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.02]"
                                >
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <Check className="w-10 h-10 text-emerald-500" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Her şey yolunda!</h3>
                                    <p className="text-gray-400 text-lg">Onay bekleyen yeni gönderi bulunmuyor.</p>
                                </motion.div>
                            ) : (
                                posts.map(post => (
                                    <AdminApprovalCard
                                        key={post.id}
                                        post={post}
                                        onApprove={handleApprove}
                                        onReject={initReject}
                                        onViewDetail={(id) => navigate(`/app/posts/${id}`)}
                                        disabled={processingId === post.id}
                                    />
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            <RejectionModal
                isOpen={!!rejectionModalPostId}
                onClose={() => !processingId && setRejectionModalPostId(null)}
                onConfirm={handleConfirmReject}
                isProcessing={processingId === rejectionModalPostId}
            />
        </div>
    )
}

export default AdminPosts
