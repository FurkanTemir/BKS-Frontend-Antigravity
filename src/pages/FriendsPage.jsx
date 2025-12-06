import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserPlus, FiUserCheck, FiTrash2, FiMessageSquare, FiX, FiCheck } from 'react-icons/fi';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';

const FriendsPage = () => {
    const [activeTab, setActiveTab] = useState('list'); // 'list', 'requests', 'add'
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [addFriendInput, setAddFriendInput] = useState('');
    const [addFriendLoading, setAddFriendLoading] = useState(false);
    const navigate = useNavigate();

    // Kullanıcı bilgisi
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    // Arkadaş listesini çek
    const fetchFriends = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Friendship/friends');
            setFriends(response.data);
        } catch (error) {
            console.error("Arkadaş listesi alınamadı", error);
        } finally {
            setLoading(false);
        }
    };

    // Arkadaşlık isteklerini çek
    const fetchRequests = async () => {
        try {
            setLoading(true);
            // Hem gelen hem giden istekleri backend'den ayırmamız lazım.
            // Backend şimdilik tek bir endpoint veriyor olabilir, kontrol edelim.
            // Eğer backend Pending istekleri dönüyorsa, bunları SenderId == CurrentUser.Id ise 'Giden', değilse 'Gelen' diye ayırabiliriz.
            const response = await api.get('/Friendship/requests');
            // Gelen veri yapısına göre filtreleme yapılabilir. 
            // Varsayım: response.data bir liste ve içinde { id, senderId, senderName, receiverId, receiverName, status } var.
            setRequests(response.data);
        } catch (error) {
            console.error("İstekler alınamadı", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'list') {
            fetchFriends();
        } else if (activeTab === 'requests') {
            fetchRequests();
        }
    }, [activeTab]);

    const handleRemoveFriend = async (friendId) => {
        if (!window.confirm("Bu arkadaşı silmek istediğinize emin misiniz?")) return;
        try {
            await api.delete(`/Friendship/${friendId}`);
            fetchFriends(); // Listeyi güncelle
        } catch (error) {
            alert("Silme işlemi başarısız: " + (error.response?.data?.message || error.message));
        }
    };

    const handleAcceptRequest = async (friendshipId) => {
        try {
            await api.put(`/Friendship/${friendshipId}/accept`);
            fetchRequests(); // Listeyi güncelle
            // Opsiyonel: Kullanıcıya bildirim göster
        } catch (error) {
            console.error("Kabul etme hatası", error);
        }
    };

    const handleRejectRequest = async (friendshipId) => {
        if (!window.confirm("İsteği reddetmek istiyor musunuz?")) return;
        try {
            await api.put(`/Friendship/${friendshipId}/reject`);
            fetchRequests();
        } catch (error) {
            console.error("Reddetme hatası", error);
        }
    };

    const handleSendRequest = async (e) => {
        e.preventDefault();
        if (!addFriendInput.trim()) return;

        try {
            setAddFriendLoading(true);
            await api.post('/Friendship/request', { friendIdentifier: addFriendInput });
            alert("Arkadaşlık isteği gönderildi!");
            setAddFriendInput('');
        } catch (error) {
            alert("İstek gönderilemedi: " + (error.response?.data?.message || error.message));
        } finally {
            setAddFriendLoading(false);
        }
    };

    // Filtreleme (Arkadaş arama)
    const filteredFriends = friends.filter(f =>
        f.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mt-4">
            <div className="row mb-4">
                <div className="col">
                    <h2><FiUsers className="me-2" />Arkadaş Yönetim Merkezi</h2>
                    <p className="text-muted">Arkadaşlarını yönet, yeni arkadaşlar ekle ve isteklerini kontrol et.</p>
                </div>
            </div>

            {/* SEKMELER */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'list' ? 'active' : ''}`}
                        onClick={() => setActiveTab('list')}
                    >
                        <FiUsers className="me-2" />Arkadaşlarım
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'requests' ? 'active' : ''}`}
                        onClick={() => setActiveTab('requests')}
                    >
                        <FiUserCheck className="me-2" />İstekler
                        {/* Badge eklenebilir: <span className="badge bg-danger ms-2">3</span> */}
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === 'add' ? 'active' : ''}`}
                        onClick={() => setActiveTab('add')}
                    >
                        <FiUserPlus className="me-2" />Arkadaş Ekle
                    </button>
                </li>
            </ul>

            {/* İÇERİK: ARKADAŞ LİSTESİ */}
            {activeTab === 'list' && (
                <div>
                    <div className="mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Arkadaşlarında ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {loading ? (
                        <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
                    ) : filteredFriends.length === 0 ? (
                        <div className="text-center p-5 text-muted border rounded bg-light">
                            <FiUsers size={48} className="mb-3" />
                            <h5>Henüz hiç arkadaşın yok.</h5>
                            <p>Hemen "Arkadaş Ekle" sekmesinden yeni arkadaşlar bul!</p>
                        </div>
                    ) : (
                        <div className="list-group">
                            {filteredFriends.map(friend => (
                                <div key={friend.id} className="list-group-item d-flex justify-content-between align-items-center">
                                    <div className="d-flex align-items-center">
                                        <div className="avatar-circle bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center me-3" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                                            {friend.firstName?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h5 className="mb-0">{friend.firstName} {friend.lastName}</h5>
                                            <small className="text-muted">@{friend.email.split('@')[0]}</small>

                                            {/* Çalışma süresi vb. eklenebilir */}
                                            {/* <div className="small text-success"><FiClock className="me-1"/>340 dk bu hafta</div> */}
                                        </div>
                                    </div>
                                    <div className="d-flex gap-2">
                                        <button
                                            className="btn btn-primary btn-sm d-flex align-items-center"
                                            onClick={() => navigate('/chat')} // Chat sayfasına gittiğinde bu kişiyi seçili yapmalı (State ile taşınabilir)
                                        // İyileştirme: navigate('/chat', { state: { selectedFriend: friend } })
                                        >
                                            <FiMessageSquare className="me-2" /> Sohbet
                                        </button>
                                        <button
                                            className="btn btn-outline-danger btn-sm"
                                            onClick={() => handleRemoveFriend(friend.id)}
                                            title="Arkadaşlıktan Çıkar"
                                        >
                                            <FiTrash2 />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* İÇERİK: İSTEKLER */}
            {activeTab === 'requests' && (
                <div>
                    {loading ? (
                        <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
                    ) : requests.length === 0 ? (
                        <div className="text-center p-5 text-muted border rounded bg-light">
                            <FiUserCheck size={48} className="mb-3" />
                            <h5>Bekleyen istek yok.</h5>
                        </div>
                    ) : (
                        <div className="list-group">
                            {requests.map(req => {
                                const isIncoming = req.receiverId === currentUser.id; // İsteği alan ben miyim?
                                return (
                                    <div key={req.id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div>
                                            {isIncoming ? (
                                                <>
                                                    <span className="fw-bold">{req.senderName || 'Bilinmeyen Kullanıcı'}</span> sana arkadaşlık isteği gönderdi.
                                                    <div className="small text-muted">{new Date(req.sentAt).toLocaleDateString()}</div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="fw-bold">{req.receiverName || 'Bilinmeyen Kullanıcı'}</span> kullanıcısına istek gönderdin.
                                                    <div className="small text-muted">Durum: Bekliyor...</div>
                                                </>
                                            )}
                                        </div>
                                        <div className="d-flex gap-2">
                                            {isIncoming ? (
                                                <>
                                                    <button
                                                        className="btn btn-success btn-sm d-flex align-items-center"
                                                        onClick={() => handleAcceptRequest(req.id)}
                                                    >
                                                        <FiCheck className="me-1" /> Kabul Et
                                                    </button>
                                                    <button
                                                        className="btn btn-outline-danger btn-sm d-flex align-items-center"
                                                        onClick={() => handleRejectRequest(req.id)}
                                                    >
                                                        <FiX className="me-1" /> Reddet
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    className="btn btn-outline-secondary btn-sm"
                                                    disabled
                                                >
                                                    Bekliyor
                                                </button>
                                                // İptal Butonu eklenebilir: CancelRequest
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* İÇERİK: ARKADAŞ EKLE */}
            {activeTab === 'add' && (
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="card shadow-sm">
                            <div className="card-body p-5 text-center">
                                <FiUserPlus size={64} className="text-primary mb-4" />
                                <h3>Yeni Arkadaş Ekle</h3>
                                <p className="text-muted mb-4">
                                    Arkadaşının <strong>Kullanıcı Adı</strong>'nı veya <strong>BKS Arkadaş Kodu</strong>'nu girerek ona istek gönderebilirsin.
                                </p>

                                <form onSubmit={handleSendRequest}>
                                    <div className="input-group input-group-lg mb-3">
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Örn: ahmet123 veya BKS-DX89"
                                            value={addFriendInput}
                                            onChange={(e) => setAddFriendInput(e.target.value)}
                                            required
                                        />
                                        <button
                                            className="btn btn-primary"
                                            type="submit"
                                            disabled={addFriendLoading}
                                        >
                                            {addFriendLoading ? 'Gönderiliyor...' : 'İstek Gönder'}
                                        </button>
                                    </div>
                                </form>
                                {currentUser.friendCode && (
                                    <div className="mt-4 p-3 bg-light rounded border">
                                        <small className="text-muted d-block uppercase">Senin Arkadaş Kodun</small>
                                        <span className="h4 font-monospace  text-dark select-all">{currentUser.friendCode}</span>
                                        <div className="small text-muted mt-1">(Arkadaşların seni bu kodla ekleyebilir)</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FriendsPage;
