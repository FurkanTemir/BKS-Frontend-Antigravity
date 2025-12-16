import { MessageSquare, PenTool } from 'lucide-react'
import PostCard from '../components/PostCard'
import CreatePostModal from '../components/CreatePostModal'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'
import { topicService } from '../services/topicService'
// import { videoService } from '../services/videoService' - Removed unused
import type { PostDto, TopicDto } from '../types'

const Posts = () => {
    const navigate = useNavigate()
    const [posts, setPosts] = useState<PostDto[]>([])
    const [topics, setTopics] = useState<TopicDto[]>([])
    const [isLoading, setIsLoading] = useState(true) // Initial load
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Pagination State
    const [page, setPage] = useState(1)
    const [hasMore, setHasMore] = useState(true)
    const [isFetchingNextPage, setIsFetchingNextPage] = useState(false)
    const observer = useRef<IntersectionObserver | null>(null)

    const lastPostElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoading || isFetchingNextPage) return
        if (observer.current) observer.current.disconnect()

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1)
            }
        })

        if (node) observer.current.observe(node)
    }, [isLoading, isFetchingNextPage, hasMore])

    // Initial Data Fetch
    useEffect(() => {
        fetchInitialData()
    }, [])

    // Pagination Fetch
    useEffect(() => {
        if (page > 1) {
            fetchNextPage()
        }
    }, [page])

    const fetchInitialData = async () => {
        setIsLoading(true)
        try {
            const [postsData, topicsData] = await Promise.all([
                postService.getAll(undefined, 1, 10),
                topicService.getAll()
            ])
            setPosts(postsData)
            setTopics(topicsData)
            setHasMore(postsData.length === 10)
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const fetchNextPage = async () => {
        setIsFetchingNextPage(true)
        try {
            const newPosts = await postService.getAll(undefined, page, 10)
            setPosts(prevPosts => [...prevPosts, ...newPosts])
            setHasMore(newPosts.length === 10)
        } catch (err) {
            console.error('Failed to fetch next page:', err)
        } finally {
            setIsFetchingNextPage(false)
        }
    }

    const handleLike = async (e: React.MouseEvent, postId: number, isLiked: boolean) => {
        e.stopPropagation()
        try {
            if (isLiked) {
                await postService.unlike(postId)
            } else {
                await postService.like(postId)
            }
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, isLikedByMe: !isLiked, likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1 }
                    : p
            ))
        } catch (err) {
            console.error('Failed to toggle like:', err)
        }
    }

    // Helper to get embed URL removed as handled by PostCard

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500 relative">
            <header className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                        Paylaşımlar
                    </h1>
                    <p className="text-gray-400 mt-2">Toplulukla etkileşime geç, sorularını sor ve deneyimlerini paylaş.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-neon-blue text-white font-bold rounded-xl shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform"
                >
                    <PenTool size={20} />
                    Paylaşım Yap
                </button>
            </header>

            <CreatePostModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                topics={topics}
                onSuccess={() => {
                    setPage(1)
                    fetchInitialData()
                    setIsModalOpen(false)
                }}
            />

            {isLoading ? (
                <div className="space-y-6 max-w-3xl mx-auto">
                    {[1, 2, 3].map((i) => (
                        <PostCard key={i} isLoading={true} />
                    ))}
                </div>
            ) : (
                <div className="space-y-6 max-w-3xl mx-auto">
                    {posts.length === 0 ? (
                        <div className="glass-panel p-12 text-center text-gray-500">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 opacity-50" />
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">Henüz Paylaşım Yok</h3>
                            <p>Topluluğa ilk katkıyı sen yap, yukarıdaki butona tıklayarak paylaş!</p>
                        </div>
                    ) : (
                        <>
                            {posts.map((post, index) => {
                                if (posts.length === index + 1) {
                                    return (
                                        <div ref={lastPostElementRef} key={post.id}>
                                            <PostCard
                                                post={post}
                                                onClick={() => navigate(`/app/posts/${post.id}`)}
                                                onLike={(e) => handleLike(e, post.id, post.isLikedByMe)}
                                                onComment={(e) => {
                                                    e.stopPropagation()
                                                    navigate(`/app/posts/${post.id}`)
                                                }}
                                                onShare={(e) => {
                                                    e.stopPropagation()
                                                }}
                                            />
                                        </div>
                                    )
                                } else {
                                    return (
                                        <PostCard
                                            key={post.id}
                                            post={post}
                                            onClick={() => navigate(`/app/posts/${post.id}`)}
                                            onLike={(e) => handleLike(e, post.id, post.isLikedByMe)}
                                            onComment={(e) => {
                                                e.stopPropagation()
                                                navigate(`/app/posts/${post.id}`)
                                            }}
                                            onShare={(e) => {
                                                e.stopPropagation()
                                            }}
                                        />
                                    )
                                }
                            })}

                            {isFetchingNextPage && (
                                <div className="pt-4">
                                    <PostCard isLoading={true} />
                                </div>
                            )}

                            {!hasMore && posts.length > 0 && (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                    Tüm gönderileri gördünüz ✨
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default Posts
