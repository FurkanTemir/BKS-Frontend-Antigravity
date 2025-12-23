import { Camera, Key, Loader2, Save, Settings, Shield, User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { authService } from '../services/authService'
import { exportService } from '../services/exportService'
import type { UpdateProfileRequest, ChangePasswordRequest } from '../types'
import { useAuthStore } from '../stores/authStore'
import ProfileStatsCard from '../components/ProfileStatsCard'
import ActivityTimeline from '../components/ActivityTimeline'
import ImageUploadModal from '../components/ImageUploadModal'
import BadgesSection from '../components/BadgesSection'

const Profile = () => {
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'settings'>('profile')
    const user = useAuthStore((state) => state.user)
    const setUser = useAuthStore((state) => state.setUser)
    const logout = useAuthStore((state) => state.logout)

    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    // const [gamification, setGamification] = useState<GamificationProfileDto | null>(null)

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

    // Profile Picture State
    const [imageSrc, setImageSrc] = useState<string | null>(null)
    const [isCropModalOpen, setIsCropModalOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0]

            // Basic validation
            if (file.size > 2 * 1024 * 1024) {
                setMessage({ type: 'error', text: 'Dosya boyutu 2MB\'dan küçük olmalı.' })
                return
            }

            const imageDataUrl = await readFile(file)
            setImageSrc(imageDataUrl)
            setIsCropModalOpen(true)
            e.target.value = '' // reset input
        }
    }

    const readFile = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader()
            reader.addEventListener('load', () => resolve(reader.result as string))
            reader.readAsDataURL(file)
        })
    }

    const handleUploadProfilePicture = async (croppedImageBlob: Blob) => {
        try {
            setIsLoading(true)

            // Convert blob to file used by authService
            const file = new File([croppedImageBlob], "profile.jpg", { type: "image/jpeg" })
            const response = await authService.uploadProfilePicture(file)

            // Update user state
            if (user) {
                // Force a cache-busting timestamp to refresh the image immediately
                const newProfileUrl = `${response.profilePictureUrl}?t=${new Date().getTime()}`
                setUser({ ...user, profilePictureUrl: newProfileUrl })
            }

            setIsCropModalOpen(false)
            setMessage({ type: 'success', text: 'Profil fotoğrafı güncellendi!' })
        } catch (e) {
            console.error(e)
            setMessage({ type: 'error', text: 'Fotoğraf yüklenirken hata oluştu.' })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName,
                lastName: user.lastName,
                userName: user.userName,
            })
            // loadGamification()
        }
    }, [user])

    // const loadGamification = async () => {
    //     try {
    //         const data = await gamificationService.getMyProfile()
    //         setGamification(data)
    //     } catch (error) {
    //         console.error('Gamification verisi yüklenemedi', error)
    //     }
    // }

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

    // Delete Account State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
    const [deletePassword, setDeletePassword] = useState('')

    const handleDeleteAccount = async () => {
        if (!deletePassword) return

        setIsLoading(true)
        try {
            await authService.deleteAccount(deletePassword)
            logout() // Force logout on success
            // Navigate handled by AppRouter redirecting on !user
        } catch (err) {
            console.error(err)
            alert('Silme işlemi başarısız. Şifrenizi kontrol edin.')
        } finally {
            setIsLoading(false)
        }
    }

    const getWelcomeMessage = () => {
        const hour = new Date().getHours()
        const name = user?.firstName || 'Öğrenci'

        if (hour >= 5 && hour < 12) return `Günaydın, ${name}!`
        if (hour >= 12 && hour < 18) return `Tünaydın, ${name}!`
        if (hour >= 18 && hour < 22) return `İyi Akşamlar, ${name}!`
        return `İyi Geceler, ${name}!`
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
        )
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Profile Info Card (Main Focus) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2 lg:row-span-1 glass-card p-6 md:p-8 relative overflow-hidden group hover:scale-[1.01] transition-all duration-300 rounded-2xl shadow-lg hover:shadow-neon-cyan/10">
                    <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="relative group/avatar cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-neon-cyan/30 shadow-xl shadow-neon-cyan/20 transition-all group-hover/avatar:border-neon-cyan group-hover/avatar:scale-105">
                                {user!.profilePictureUrl ? (
                                    <img src={user!.profilePictureUrl} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user!.firstName.charAt(0)}{user!.lastName.charAt(0)}</span>
                                )}

                                {/* Overlay for hover prompt */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera size={28} className="text-white drop-shadow-md" />
                                </div>
                            </div>

                            {/* Permanent Edit Badge */}
                            <div className="absolute bottom-0 right-0 md:bottom-1 md:right-1 p-2 bg-dark-300 rounded-full border border-neon-cyan/50 text-neon-cyan shadow-lg group-hover/avatar:scale-110 transition-transform z-20">
                                <Camera size={16} />
                            </div>

                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                {getWelcomeMessage()}
                            </h1>
                            <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-gray-400">
                                <span className="flex items-center gap-1 font-medium text-white/80">
                                    @{user!.userName}
                                </span>
                                <span className="hidden md:block w-1 h-1 bg-gray-600 rounded-full mt-2.5"></span>
                                <span>{user!.email}</span>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-4 py-2 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-full text-sm font-semibold tracking-wide">
                                    {user!.fieldType}
                                </span>
                                <button className="px-4 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center">
                                    Profili Düzenle
                                </button>
                            </div>
                        </div>

                        <div className="absolute top-4 right-4">
                            <button
                                onClick={handleLogout}
                                className="p-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
                                title="Çıkış Yap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                            </button>
                        </div>
                    </div>

                    {/* Decorative Background Blur */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
                </div>

                {/* 2. Activity Timeline (Tall Sidebar on LG, Full on MD to maintain order/visibility) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-3 h-full min-h-[300px]">
                    <ActivityTimeline />
                </div>

                {/* 3. Stats Cards (Spanning width of left col) */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <ProfileStatsCard />
                </div>

                {/* 4. Badges Section */}
                <div className="col-span-1 md:col-span-2 lg:col-span-2">
                    <BadgesSection />
                </div>

            </div>

            {/* Tabs & Forms Section */}

            {/* Tabs (Scrollable on mobile) */}
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                <div className="flex gap-2 border-b border-white/10 min-w-max">
                    {[
                        { id: 'profile', label: 'Profil', icon: User },
                        { id: 'security', label: 'Güvenlik', icon: Shield },
                        { id: 'settings', label: 'Ayarlar', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as typeof activeTab)}
                            className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors relative min-h-[44px] ${activeTab === tab.id ? 'text-neon-cyan' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <tab.icon size={20} />
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-neon-cyan" />
                            )}
                        </button>
                    ))}
                </div>
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
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all min-h-[48px]"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Soyad</label>
                                <input
                                    type="text"
                                    value={profileData.lastName}
                                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all min-h-[48px]"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Kullanıcı Adı</label>
                            <input
                                type="text"
                                value={profileData.userName}
                                onChange={(e) => setProfileData({ ...profileData, userName: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-cyan/30 rounded-xl text-white focus:border-neon-cyan focus:outline-none transition-all min-h-[48px]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">E-posta</label>
                            <input
                                type="email"
                                value={user!.email}
                                disabled
                                className="w-full px-4 py-3 bg-dark-400/50 border-2 border-white/10 rounded-xl text-gray-500 cursor-not-allowed min-h-[48px]"
                            />
                            <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez.</p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-blue text-dark-400 font-semibold rounded-xl hover:shadow-neon-cyan hover:scale-105 transition-all duration-300 disabled:opacity-50 min-h-[48px]"
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
                            <h4 className="font-medium text-gray-300">Veri Dışa Aktırma</h4>
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
                                        } catch (e) { alert('Dışa aktırma başarısız') }
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
                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-colors"
                            >
                                Hesabı Sil
                            </button>
                        </div>
                    </div>
                )}
            </div>
            {/* Crop Modal */}
            <ImageUploadModal
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                imageSrc={imageSrc}
                onUpload={handleUploadProfilePicture}
            />
            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-300 border border-red-500/30 rounded-2xl w-full max-w-md overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-red-500/10 flex items-start gap-4">
                            <div className="p-3 bg-red-500/20 rounded-full text-red-500">
                                <Shield size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Hesabı Sil</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    Bu işlem geri alınamaz (şimdilik soft delete). Hesabını silmek istediğine emin misin?
                                    Devam etmek için şifreni gir.
                                </p>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Şifre</label>
                                <input
                                    type="password"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full px-4 py-3 bg-dark-400/50 border-2 border-red-500/30 rounded-xl text-white focus:border-red-500 focus:outline-none transition-all placeholder:text-gray-600"
                                    placeholder="Şifrenizi girin"
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-red-500/5 flex justify-end gap-3 rounded-b-2xl">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false)
                                    setDeletePassword('')
                                }}
                                className="px-4 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                İptal
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={isLoading || !deletePassword}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-lg shadow-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isLoading ? <Loader2 className="animate-spin" size={18} /> : 'Hesabımı Sil'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default Profile
