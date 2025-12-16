import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { friendshipService } from '../services/friendshipService'
import { messageService } from '../services/messageService'
import type { FriendDto, MessageDto } from '../types'
import { Send, Search, MessageCircle } from 'lucide-react'

export default function Messages() {
    const [searchParams] = useSearchParams()
    const preselectedUserId = searchParams.get('userId')

    const [friends, setFriends] = useState<FriendDto[]>([])
    const [selectedFriend, setSelectedFriend] = useState<FriendDto | null>(null)
    const [messages, setMessages] = useState<MessageDto[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)

    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        loadFriends()
    }, [])

    useEffect(() => {
        if (selectedFriend && selectedFriend.friendId) {
            loadMessages(selectedFriend.friendId)
            const interval = setInterval(() => loadMessages(selectedFriend.friendId), 5000)
            return () => clearInterval(interval)
        }
    }, [selectedFriend])

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const loadFriends = async () => {
        try {
            const data = await friendshipService.getFriends()
            setFriends(data)

            if (preselectedUserId) {
                const friend = data.find(f => f.friendId === parseInt(preselectedUserId))
                if (friend) setSelectedFriend(friend)
            } else if (data.length > 0 && !selectedFriend) {
                // Optionally select first friend? No, let user choose.
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const loadMessages = async (friendId: number) => {
        try {
            const data = await messageService.getConversation(friendId)
            setMessages(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedFriend) return

        try {
            const sentMsg = await messageService.sendMessage(selectedFriend.friendId, newMessage)
            setMessages(prev => [...prev, sentMsg])
            setNewMessage('')
            scrollToBottom()
        } catch (error) {
            console.error(error)
            alert('Mesaj gönderilemedi.')
        }
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 p-6 animate-in fade-in duration-500">
            {/* Sidebar - Friend List */}
            <div className="w-80 glass-panel rounded-2xl border border-white/10 bg-black/40 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/10">
                    <h2 className="text-xl font-bold text-white mb-4">Mesajlar</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-pink-500/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="p-4 text-center text-gray-500">Yükleniyor...</div>
                    ) : friends.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">Henüz mesajlaşacak arkadaşın yok.</div>
                    ) : (
                        friends.map(friend => (
                            <div
                                key={friend.friendshipId}
                                onClick={() => setSelectedFriend(friend)}
                                className={`p-4 flex items-center gap-3 cursor-pointer hover:bg-white/5 transition-colors ${selectedFriend?.friendId === friend.friendId ? 'bg-pink-500/10 border-r-2 border-pink-500' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-white font-medium">
                                    {friend.firstName[0]}{friend.lastName[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-medium text-white truncate">{friend.firstName} {friend.lastName}</h3>
                                        {friend.lastMessageDate && (
                                            <span className="text-xs text-gray-500">
                                                {new Date(friend.lastMessageDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">
                                        {friend.lastMessage || 'Henüz mesaj yok...'}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 glass-panel rounded-2xl border border-white/10 bg-black/40 flex flex-col overflow-hidden">
                {selectedFriend ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                                    {selectedFriend.firstName[0]}{selectedFriend.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">{selectedFriend.firstName} {selectedFriend.lastName}</h3>
                                    <div className={`flex items-center gap-1 text-xs ${selectedFriend.isOnline ? 'text-emerald-400' : 'text-gray-400'}`}>
                                        <div className={`w-2 h-2 rounded-full ${selectedFriend.isOnline ? 'bg-emerald-400' : 'bg-gray-400'}`} />
                                        {selectedFriend.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-gray-400">
                                {/* Buttons removed */}
                            </div>
                        </div>

                        {/* Messages List */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-black/20">
                            {messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                                    <MessageCircle className="w-12 h-12 mb-2 opacity-50" />
                                    <p>Sohbet geçmişi yok.</p>
                                    <p className="text-sm">İlk mesajı göndererek konuşmayı başlat!</p>
                                </div>
                            ) : (
                                messages.map(msg => {
                                    const isMe = msg.senderId !== selectedFriend.friendId // Assuming current user ID is handled
                                    return (
                                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe
                                                ? 'bg-pink-600 text-white rounded-tr-none'
                                                : 'bg-gray-800 text-gray-200 rounded-tl-none'
                                                }`}>
                                                <p>{msg.content}</p>
                                                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-pink-200' : 'text-gray-500'}`}>
                                                    {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white/5 border-t border-white/10">
                            <form onSubmit={handleSendMessage} className="flex gap-2">
                                <input
                                    type="text"
                                    className="flex-1 bg-black/40 border border-white/10 rounded-full px-6 py-3 text-white focus:outline-none focus:border-pink-500/50 placeholder-gray-500"
                                    placeholder="Bir mesaj yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="w-12 h-12 rounded-full bg-pink-500 hover:bg-pink-600 flex items-center justify-center text-white transition-colors shadow-lg shadow-pink-500/20"
                                >
                                    <Send className="w-5 h-5 ml-1" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                        <h3 className="text-xl font-medium text-gray-300">Bir sohbet seçin</h3>
                        <p>Mesajlaşmaya başlamak için soldaki listeden bir arkadaşınızı seçin.</p>
                    </div>
                )}
            </div>
        </div >
    )
}
