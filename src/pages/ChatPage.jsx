import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import api from '../api/axiosConfig';
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi';

const ChatPage = () => {
    const [friends, setFriends] = useState([]);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connection, setConnection] = useState(null);
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);

    // Kullanıcı bilgisi (Lazy Initialization ile hemen al)
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            console.error("User parsing error:", e);
            return null;
        }
    });

    useEffect(() => {
        fetchFriends();
    }, []);

    // SignalR Bağlantısı
    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5166/chatHub", {
                accessTokenFactory: () => localStorage.getItem('token') // Token ile kimlik doğrulama
            })
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('SignalR Connected!');
                    // Mesaj alma olayını dinle
                    connection.on('ReceiveMessage', (message) => {
                        // Eğer mesaj şu an açık olan arkadaşımdan geliyorsa veya ben gönderdiysem listeye ekle
                        // Not: ChatHub'da kendime gönderdiğim mesajı receive etmiyorum ama burada kontrol etmekte fayda var
                        // Eğer farklı bir arkadaşımdan geliyorsa ona bildirim ikonu koyabiliriz (ileride)

                        setMessages(prevMessages => {
                            // Sadece açık olan arkadaşla ilgiliyse veya benim mesajımsa ekle
                            // (selectedFriend state'i effect içinde güncel olmayabilir, useRef veya functional update gerekebilir)
                            // Basit çözüm: Gelen mesaja göre filtreleme
                            return [...prevMessages, message];
                        });
                    });

                    connection.on('ErrorMessage', (error) => {
                        console.error("Chat Error:", error);
                        alert("Mesaj gönderilemedi: " + error);
                    });
                })
                .catch(e => console.log('Connection failed: ', e));
        }
    }, [connection]);

    // Seçili arkadaş değişince mesajları sadece onunla olanları filtreleyip göster
    // Ancak henüz backend'den geçmiş mesajları çekmedik.
    // İyileştirme: Seçili arkadaş değişince backend'den o kişiyle olan mesajları çek.
    useEffect(() => {
        if (selectedFriend && currentUser) {
            console.log(`Fetching messages for friendId: ${selectedFriend.id}, currentUser: ${currentUser.username}`);
            fetchMessages(selectedFriend.id);
        }
    }, [selectedFriend, currentUser]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchFriends = async () => {
        try {
            const response = await api.get('/Friendship/friends');
            setFriends(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Arkadaş listesi alınamadı", error);
            setLoading(false);
        }
    };

    const fetchMessages = async (friendId) => {
        try {
            // Mesajları çek
            const response = await api.get(`/Messages/conversation/${friendId}`);
            console.log("Mesajlar API Yanıtı:", response.data); // Debug için

            // Axios interceptor data'yı extract etmiş olabilir veya etmemiş olabilir.
            // Eğer response.data bir array ise (Interceptor çalıştı), direkt kullan.
            // Değilse ve .data property'si varsa (Interceptor çalışmadı veya format farklı), onu kullan.
            const messagesData = Array.isArray(response.data) ? response.data : (response.data?.data || []);

            setMessages(messagesData);

            // Mesajları okundu olarak işaretle
            await api.post(`/Messages/mark-read/${friendId}`);
        } catch (error) {
            console.error("Mesajlar alınamadı. Detay:", error.response ? error.response.data : error.message);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend || !connection) return;

        const messageToSend = {
            receiverId: selectedFriend.id,
            content: newMessage
        };

        try {
            await connection.invoke('SendMessage', messageToSend);
            console.log("Mesaj başarıyla gönderildi (SignalR Invoke Success)");

            // Optimistic UI update: Mesajı hemen ekrana bas
            const optimisticMsg = {
                id: Date.now(), // Geçici ID
                senderId: 0, // Ben
                senderName: currentUser?.username, // Ben
                receiverId: selectedFriend.id,
                content: newMessage,
                sentAt: new Date().toISOString(),
                isRead: false,
                isMine: true
            };
            setMessages(prev => [...prev, optimisticMsg]);
            setNewMessage('');
        } catch (e) {
            console.error('Mesaj gönderilemedi:', e);
        }
    };

    // Mesajları filtrele (Sadece seçili arkadaşla olanlar)
    const currentConversation = messages.filter(m =>
        (selectedFriend && (m.receiverId === selectedFriend.id && m.isMine)) ||
        (selectedFriend && (m.senderId === selectedFriend.id && !m.isMine))
    );

    return (
        <div className="container-fluid p-0 d-flex" style={{ height: 'calc(100vh - 60px)' }}>
            {/* Sol Taraf: Arkadaş Listesi */}
            <div className="d-flex flex-column border-end bg-white" style={{ width: '300px', maxWidth: '300px' }}>
                <div className="p-3 border-bottom bg-light">
                    <h5 className="mb-0 d-flex align-items-center">
                        <FiMessageSquare className="me-2" /> Sohbet Listesi
                    </h5>
                </div>
                <div className="flex-grow-1 overflow-auto">
                    {loading ? (
                        <div className="text-center p-3">Yükleniyor...</div>
                    ) : friends.length === 0 ? (
                        <div className="text-center p-3 text-muted">
                            <p>Henüz arkadaşınız yok.</p>
                            <a href="/friends" className="btn btn-sm btn-outline-primary">Arkadaş Ekle</a>
                        </div>
                    ) : (
                        <ul className="list-group list-group-flush">
                            {friends.map(friend => (
                                <button
                                    key={friend.id}
                                    className={`list-group-item list-group-item-action d-flex align-items-center ${selectedFriend?.id === friend.id ? 'active' : ''}`}
                                    onClick={() => setSelectedFriend(friend)}
                                >
                                    <div className="avatar-circle me-3 bg-secondary text-white d-flex align-items-center justify-content-center rounded-circle" style={{ width: '40px', height: '40px' }}>
                                        {friend.firstName?.charAt(0) || friend.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div className="fw-bold">{friend.firstName} {friend.lastName}</div>
                                        <div className="small text-muted">@{friend.email.split('@')[0]}</div>
                                    </div>
                                </button>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Sağ Taraf: Sohbet Alanı */}
            <div className="d-flex flex-column flex-grow-1 bg-light">
                {selectedFriend ? (
                    <>
                        <div className="p-3 bg-white border-bottom shadow-sm d-flex align-items-center">
                            <h5 className="mb-0">
                                {selectedFriend.firstName} {selectedFriend.lastName}
                            </h5>
                        </div>

                        <div className="flex-grow-1 p-4 overflow-auto" style={{ backgroundColor: '#f5f7fb' }}>
                            {currentConversation.length === 0 ? (
                                <div className="text-center text-muted mt-5">
                                    <FiMessageSquare size={40} className="mb-2" />
                                    <p>Henüz mesaj yok. İlk mesajı sen at!</p>
                                </div>
                            ) : (
                                currentConversation.map((msg, index) => (
                                    <div key={index} className={`d-flex mb-3 ${msg.isMine ? 'justify-content-end' : 'justify-content-start'}`}>
                                        <div
                                            className={`p-3 rounded-3 shadow-sm ${msg.isMine ? 'bg-primary text-white' : 'bg-white text-dark'}`}
                                            style={{ maxWidth: '70%', borderBottomRightRadius: msg.isMine ? '0' : '1rem', borderBottomLeftRadius: msg.isMine ? '1rem' : '0' }}
                                        >
                                            <div className="mb-1">{msg.content}</div>
                                            <div className={`small text-end ${msg.isMine ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.75rem' }}>
                                                {new Date(msg.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-3 bg-white border-top">
                            <form onSubmit={handleSendMessage} className="d-flex gap-2">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Mesajınızı yazın..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="btn btn-primary d-flex align-items-center">
                                    <FiSend />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                        <FiMessageSquare size={64} className="mb-3 opacity-50" />
                        <h4>Mesajlaşmak için bir arkadaş seçin</h4>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatPage;
