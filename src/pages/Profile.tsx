import { Camera, Key, Loader2, Save, Settings, Shield, User, Trophy } from 'lucide-react'
import { useState, useEffect } from 'react'
import { authService } from '../services/authService'
import { gamificationService } from '../services/gamificationService'
import { exportService } from '../services/exportService'
import type { UpdateProfileRequest, ChangePasswordRequest, GamificationProfileDto } from '../types'
import { useAuthStore } from '../stores/authStore'

const Profile = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile')
    const user = useAuthStore((state) => state.user)
    const setUser = useAuthStore((state) => state.setUser)
    const logout = useAuthStore((state) => state.logout)

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    const [gamification, setGamification] = useState<GamificationProfileDto | null>(null)

    const [profileData, setProfileData] = useState<UpdateProfileRequest>({
        firstName: '',
        lastName: '',
        userName: '',
    })

    const [passwordData, setPasswordData] = useState<ChangePasswordRequest>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    })

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
            })
            loadGamification()
        }
    }, [user])

    const loadGamification = async () => {
        try {
            const data = await gamificationService.getMyProfile()
            setGamification(data)
        } catch (error) {
            console.error('Gamification verisi yüklenemedi', error)
        }
    }

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            await authService.updateProfile(profileData)
            setUser({ ...user!, ...profileData })
            setMessage({ type: 'success', text: 'Profil güncellendi!' })
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Güncelleme başarısız' })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setMessage({ type: 'error', text: 'Şifreler eşleşmiyor!' })
            return
        }

        setIsLoading(true)
        setMessage({ type: '', text: '' })

        try {
            await authService.changePassword(passwordData)
            setMessage({ type: 'success', text: 'Şifre değiştirildi!' })
            setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' })
        } catch (err) {
            setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Şifre değiştirilemedi' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleLogout = async () => {
        try {
            await authService.logout()
        } catch {
            // Ignore logout errors
        }
        logout()
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header with Profile Card */}
            <div className="glass-card p-8">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl font-bold text-white">
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-dark-300 border-2 border-neon-cyan flex items-center justify-center hover:bg-dark-200 transition-colors">
                            <Camera size={14} className="text-neon-cyan" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h1 className="text-4xl font-bold">{user.firstName} {user.lastName}</h1>
                        <p className="text-gray-400 mt-1">@{user.userName}</p>
                        <div className="flex items-center gap-4 mt-3">
                            <span className="px-3 py-1 bg-neon-cyan/20 text-neon-cyan rounded-full text-sm font-medium">
                                {user.fieldType}
                            </span>
                            <span className="text-gray-500 text-sm">{user.email}</span>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    >
                        Çıkış Yap
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-white/10">
                {[
                    { id: 'profile', label: 'Profil', icon: User },
                    { id: 'security', label: 'Güvenlik', icon: Shield },
                    { id: 'settings', label: 'Ayarlar', icon: Settings },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative ${activeTab === tab.id ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'
                            }`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan" />
                        )}
                    </button>
                ))}
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-500/20 border border-green-500/50 text-green-400' : 'bg-red-500/20 border border-red-500/50 text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tab Content */}
            <div className="max-w-2xl">
                {activeTab === 'profile' && (
                    <form onSubmit={handleProfileSubmit} className="glass-card p-8 space-y-6">
                        <h3 className="text-2xl font-semibold mb-6">Profil Bilgileri</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Ad</label>
                                <input
                                    type="text"
                                    value={profileData.firstName}
                                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Soyad</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Kullanıcı Adı</label>
                            <input
                                type="text"
                                value={profileData.userName}
                                onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                            <input
                                type="email"
                                value={user.email}
                                disabled
                                className="w-full px-4 py-3 bg-dark-400/50 border-2 border-white/10 rounded-xl text-gray-500 cursor-not-allowed"
                            />
                            <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 font-semibold rounded-xl hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </form>
                )}

                {activeTab === 'security' && (
                    <form onSubmit={handlePasswordSubmit} className="glass-card p-8 space-y-6">
                        <h3 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                            <Key className="text-neon-purple" />
                            Şifre Değiştir
                        </h3>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Mevcut Şifre</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Yeni Şifre</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">En az 8 karakter, büyük/küçük harf, rakam ve sembol içermeli.</p>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Yeni Şifre (Tekrar)</label>
                            <input
                                type="password"
                                value={passwordData.confirmNewPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmNewPassword: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-purple to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                        >
                            <Shield size={18} />
                            {isLoading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
                        </button>
                    </form>
                )}

                {activeTab === 'settings' && (
                    <div className="glass-card p-8 space-y-6">
                        <h3 className="text-2xl font-semibold mb-6">Uygulama Ayarları</h3>

                        <div className="space-y-4">
                            <h4 className="font-medium text-gray-300">Bildirimler</h4>
                            {[
                                { label: 'Günlük hatırlatma', desc: 'Her gün çalışma hatırlatması al' },
                                { label: 'Haftalık özet', desc: 'Haftalık ilerleme raporu' },
                            ].map((setting, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-dark-300/30 rounded-xl">
                                    <div>
                                        <p className="font-medium">{setting.label}</p>
                                        <p className="text-sm text-gray-500">{setting.desc}</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked={i === 0} />
                                        <div className="w-11 h-6 bg-dark-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-neon-cyan"></div>
                                    </label>
                                </div>
                            ))}
                        </div>

                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <h4 className="font-medium text-gray-300">Veri Dışa Aktarma</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={async () => {
                                        try {
                                            const blob = await exportService.exportAllData()
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `bks-backup-${new Date().toISOString().split('T')[0]}.zip`
                                            a.click()
                                        } catch (e) { alert('Dışa aktarma başarısız') }
                                    }}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
                                >
                                    <div className="font-medium text-white mb-1">Tüm Veriler (Zip)</div>
                                    <div className="text-xs text-gray-500">Tam yedekleme</div>
                                </button>
                                <button
                                    onClick={async () => {
                                        try {
                                            const blob = await exportService.exportMockExams() // Using MockExams as reports
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `deneme-raporu.xlsx`
                                            a.click()
                                        } catch (e) { alert('Rapor oluşturma başarısız') }
                                    }}
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors"
                                >
                                    <div className="font-medium text-white mb-1">Deneme Raporu</div>
                                    <div className="text-xs text-gray-500">Excel formatında</div>
                                </button>
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10">
                            <h4 className="font-medium text-red-400 mb-4">Tehlikeli Bölge</h4>
                            <button className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors">
                                Hesabı Sil
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Profile
