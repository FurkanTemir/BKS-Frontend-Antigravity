import { useEffect, useState } from 'react'
import { friendshipService } from '../services/friendshipService'
import type { FriendDto, FriendRequestDto } from '../types'
import { UserPlus, UserCheck, UserX, Search, MessageCircle, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Friends() {
    const navigate = useNavigate()
    const [friends, setFriends] = useState<FriendDto[]>([])
    const [requests, setRequests] = useState<FriendRequestDto[]>([])
    const [searchCode, setSearchCode] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [friendsData, requestsData] = await Promise.all([
                friendshipService.getFriends(),
                friendshipService.getPendingRequests()
            ])
            setFriends(friendsData)
            setRequests(requestsData)
        } catch (error) {
            console.error('Arkadaş listesi yüklenemedi', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSendRequest = async () => {
        if (!searchCode) return
        try {
            await friendshipService.sendRequest(searchCode)
            setSearchCode('')
            alert('Arkadaşlık isteği gönderildi!')
        } catch (error) {
            alert('İstek gönderilemedi. Kod hatalı veya zaten ekli olabilir.')
        }
    }

    const handleAccept = async (id: number) => {
        try {
            await friendshipService.acceptRequest(id)
            loadData() // Refresh lists
        } catch (error) {
            console.error(error)
        }
    }

    const handleReject = async (id: number) => {
        try {
            await friendshipService.rejectRequest(id)
            loadData()
        } catch (error) {
            console.error(error)
        }
    }

    const handleRemove = async (id: number) => {
        if (!confirm('Arkadaşı silmek istediğinize emin misiniz?')) return
        try {
            await friendshipService.removeFriend(id)
            setFriends(prev => prev.filter(f => f.friendId !== id))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                    Arkadaşlar & Topluluk
                </h1>
                <p className="text-gray-400">Birlikte çalış, rekabet et ve sosyalleş.</p>
            </div>

            {/* Add Friend Section */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-white/5">
                <div className="flex items-center gap-2 mb-4">
                    <UserPlus className="w-5 h-5 text-pink-400" />
                    <h2 className="text-xl font-semibold text-white">Arkadaş Ekle</h2>
                </div>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Arkadaş Kodu (Örn: #AB123)"
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                            value={searchCode}
                            onChange={(e) => setSearchCode(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={handleSendRequest}
                        disabled={!searchCode}
                        className="px-6 py-3 bg-pink-500 hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                    >
                        İstek Gönder
                    </button>
                </div>
            </div>

            {/* Pending Requests */}
            {requests.length > 0 && (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Bekleyen İstekler ({requests.length})</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {requests.map(req => (
                            <div key={req.friendshipId} className="glass-panel p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 flex items-center justify-between">
                                <div>
                                    <div className="font-semibold text-white">{req.requesterName}</div>
                                    <div className="text-xs text-gray-400">{new Date(req.sentDate).toLocaleDateString()}</div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(req.friendshipId)}
                                        className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
                                        title="Kabul Et"
                                    >
                                        <UserCheck className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleReject(req.friendshipId)}
                                        className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        title="Reddet"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Friend List */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300">Arkadaşlarım ({friends.length})</h3>
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : friends.length === 0 ? (
                    <div className="text-center py-12 glass-panel rounded-2xl border border-white/5 bg-white/5">
                        <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400">Henüz arkadaşın yok. Arkadaş kodunu paylaşarak başlayabilirsin!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {friends.map(friend => (
                            <div key={friend.friendId} className="glass-panel p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors group">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                                            {friend.firstName[0]}{friend.lastName[0]}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white">{friend.firstName} {friend.lastName}</div>
                                            <div className="text-xs text-gray-400 flex items-center gap-1">
                                                <div className={`w-2 h-2 rounded-full ${friend.isOnline ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                                                {friend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                                                <span className="mx-1">•</span>
                                                Seviye {friend.level}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <button className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            ...
                                        </button>
                                        {/* Dropdown menu could go here, for now using direct buttons for quick actions if needed or just Chat */}
                                    </div>
                                </div>
                                <div className="mt-4 flex gap-2">
                                    <button
                                        onClick={() => navigate(`/messages?userId=${friend.friendId}`)}
                                        className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-gray-200 border border-white/10 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Mesaj
                                    </button>
                                    <button
                                        onClick={() => handleRemove(friend.friendId)}
                                        className="py-2 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                                        title="Arkadaşlıktan Çıkar"
                                    >
                                        <UserX className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
