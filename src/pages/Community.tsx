import { Heart, Loader2, MessageSquare, Share2, Trophy, User, Users } from 'lucide-react'
import { useState, useEffect } from 'react'
import { postService, leaderboardService } from '../services/communityService'
import type { PostDto, LeaderboardEntryDto } from '../types'

const Community = () => {
    const [activeTab, setActiveTab] = useState<'feed' | 'leaderboard'>('feed')
    const [posts, setPosts] = useState<PostDto[]>([])
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntryDto[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [activeTab])

    const fetchData = async () => {
        setIsLoading(true)
        try {
            if (activeTab === 'feed') {
                const data = await postService.getAll()
                setPosts(data)
            } else {
                const data = await leaderboardService.getWeekly()
                setLeaderboard(data)
            }
        } catch (err) {
            console.error('Failed to fetch data:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleLike = async (postId: number, isLiked: boolean) => {
        try {
            if (isLiked) {
                await postService.unlike(postId)
            } else {
                await postService.like(postId)
            }
            // Update local state
            setPosts(posts.map(p =>
                p.id === postId
                    ? { ...p, isLikedByMe: !isLiked, likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1 }
                    : p
            ))
        } catch (err) {
            console.error('Failed to toggle like:', err)
        }
    }

    const formatStudyTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <header className="space-y-2">
                <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple to-neon-blue bg-clip-text text-transparent">
                    Topluluk
                </h1>
                <p className="text-gray-400 text-lg">Arkadaşlarınla etkileşime geç ve yarış!</p>
            </header>

            {/* Tabs */}
            <div className="flex gap-4 border-b border-white/10 pb-1">
                <button
                    onClick={() => setActiveTab('feed')}
                    className={`px-6 py-3 font-semibold text-lg transition-colors relative ${activeTab === 'feed' ? 'text-neon-purple' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Users size={20} />
                        Akış
                    </div>
                    {activeTab === 'feed' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-neon-purple rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('leaderboard')}
                    className={`px-6 py-3 font-semibold text-lg transition-colors relative ${activeTab === 'leaderboard' ? 'text-neon-blue' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <div className="flex items-center gap-2">
                        <Trophy size={20} />
                        Liderlik Tablosu
                    </div>
                    {activeTab === 'leaderboard' && (
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-neon-blue rounded-t-full" />
                    )}
                </button>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {activeTab === 'feed' && (
                            <>
                                {posts.length === 0 ? (
                                    <div className="glass-card p-8 text-center text-gray-400">
                                        Henüz paylaşım yok
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <div key={post.id} className="glass-card p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neon-purple to-blue-500 flex items-center justify-center text-white font-bold">
                                                        {post.userName.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-white">{post.userName}</h3>
                                                        <div className="flex items-center gap-2 text-xs text-gray-400">
                                                            <span>{new Date(post.createdDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            <span>•</span>
                                                            <span className="text-neon-blue">{post.userRole}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-300 border border-white/10">
                                                    {post.topicName}
                                                </div>
                                            </div>

                                            <p className="text-gray-200 mb-6 leading-relaxed">{post.content}</p>

                                            {post.imageUrl && (
                                                <img src={post.imageUrl} alt="" className="w-full rounded-xl mb-4" />
                                            )}

                                            <div className="flex items-center gap-6 pt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => handleLike(post.id, post.isLikedByMe)}
                                                    className={`flex items-center gap-2 transition-colors ${post.isLikedByMe ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                                                >
                                                    <Heart size={20} fill={post.isLikedByMe ? 'currentColor' : 'none'} />
                                                    <span className="text-sm font-medium">{post.likeCount}</span>
                                                </button>
                                                <button className="flex items-center gap-2 text-gray-400 hover:text-neon-blue transition-colors">
                                                    <MessageSquare size={20} />
                                                    <span className="text-sm font-medium">Yorum</span>
                                                </button>
                                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                                                    <Share2 size={20} />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </>
                        )}

                        {activeTab === 'leaderboard' && (
                            <div className="glass-card p-0 overflow-hidden">
                                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-white/5">
                                    <h3 className="text-xl font-bold bg-gradient-to-r from-neon-blue to-cyan-400 bg-clip-text text-transparent">
                                        Haftalık Sıralama
                                    </h3>
                                    <div className="text-sm text-gray-400">Çalışma Süresi</div>
                                </div>
                                <div className="divide-y divide-white/5">
                                    {leaderboard.map((entry) => (
                                        <div
                                            key={entry.userId}
                                            className={`flex items-center justify-between p-6 hover:bg-white/5 transition-colors ${entry.isCurrentUser ? 'bg-neon-cyan/10' : entry.rank <= 3 ? 'bg-gradient-to-r from-neon-blue/5 to-transparent' : ''
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 flex items-center justify-center font-bold rounded-full ${entry.rank === 1 ? 'bg-yellow-500 text-black' :
                                                    entry.rank === 2 ? 'bg-gray-400 text-black' :
                                                        entry.rank === 3 ? 'bg-orange-700 text-white' :
                                                            'text-gray-500'
                                                    }`}>
                                                    {entry.rank}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-dark-200 flex items-center justify-center border border-white/10">
                                                    <User size={20} className="text-gray-400" />
                                                </div>
                                                <span className={`font-semibold ${entry.rank <= 3 ? 'text-white' : 'text-gray-300'} ${entry.isCurrentUser ? 'text-neon-cyan' : ''}`}>
                                                    {entry.firstName} {entry.lastName}
                                                    {entry.isCurrentUser && <span className="ml-2 text-xs">(Sen)</span>}
                                                </span>
                                            </div>
                                            <span className="font-mono font-bold text-neon-blue">{formatStudyTime(entry.studyTimeMinutes)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Trophy className="text-yellow-500" size={18} />
                                Senin Durumun
                            </h3>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-gray-400">Sıralama</span>
                                <span className="text-white font-bold">
                                    #{leaderboard.find(e => e.isCurrentUser)?.rank || '-'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-400">Süre</span>
                                <span className="text-neon-cyan font-bold">
                                    {formatStudyTime(leaderboard.find(e => e.isCurrentUser)?.studyTimeMinutes || 0)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Community
