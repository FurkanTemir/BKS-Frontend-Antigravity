import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Loader2, ArrowLeft, UserPlus, UserCheck, MessageCircle } from 'lucide-react'
import { userService } from '../services/userService'
import { useAuthStore } from '../stores/authStore'
import type { PublicUserProfileDto, GamificationProfileDto } from '../types'
import ProfileStatsCard from '../components/ProfileStatsCard'
import BadgesSection from '../components/BadgesSection'

const PublicProfile = () => {
    const { username } = useParams<{ username: string }>()
    const navigate = useNavigate()
    const { user: currentUser } = useAuthStore()
    const [profile, setProfile] = useState<PublicUserProfileDto | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // Optimistic UI state
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [followLoading, setFollowLoading] = useState(false)

    const [friendshipStatus, setFriendshipStatus] = useState(0) // 0: None, 1: Pending, 2: Accepted, 3: Rejected
    const [friendRequestLoading, setFriendRequestLoading] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            if (!username) return
            try {
                setLoading(true)
                const data = await userService.getPublicProfile(username)
                setProfile(data)
                setIsFollowing(data.isFollowing)
                setFollowersCount(data.followersCount)
                setFollowingCount(data.followingCount)
                setFriendshipStatus(data.friendshipStatus)
            } catch (err: any) {
                console.error(err)
                if (err.response && err.response.status === 404) {
                    setError('Kullanıcı bulunamadı.')
                } else {
                    setError('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.')
                }
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [username])

    const handleFollow = async () => {
        if (!profile || followLoading) return

        // Optimistic update
        const previousState = isFollowing
        setIsFollowing(!previousState)
        setFollowersCount(prev => previousState ? prev - 1 : prev + 1)
        setFollowLoading(true)

        try {
            await userService.toggleFollow(profile.id)
        } catch (error) {
            // Revert on error
            setIsFollowing(previousState)
            setFollowersCount(prev => previousState ? prev + 1 : prev - 1)
            console.error(error)
        } finally {
            setFollowLoading(false)
        }
    }

    const handleAddFriend = async () => {
        if (!profile || friendRequestLoading) return
        setFriendRequestLoading(true)
        try {
            await import('../services/friendshipService').then(m => m.friendshipService.sendRequest(profile.userName))
            setFriendshipStatus(1) // Sent/Pending
        } catch (error) {
            console.error(error)
        } finally {
            setFriendRequestLoading(false)
        }
    }

    const handleMessage = () => {
        if (!profile) return
        navigate(`/app/messages/${profile.id}`)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[500px]">
                <Loader2 className="w-8 h-8 animate-spin text-neon-cyan" />
            </div>
        )
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-4">
                <p className="text-red-400 text-lg">{error || 'Kullanıcı bulunamadı.'}</p>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-white"
                >
                    <ArrowLeft size={18} />
                    Geri Dön
                </button>
            </div>
        )
    }

    const isOwnProfile = currentUser?.id === profile.id

    // Prepare data for child components
    const gamificationData: GamificationProfileDto = {
        streak: profile.streak || { currentStreak: 0, maxStreak: 0, lastActivityDate: new Date().toISOString() },
        badges: profile.badges,
        totalPoints: profile.stats?.totalPoints || 0
    }

    return (
        <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Header / Main Card */}
            <div className="glass-card p-6 md:p-8 relative overflow-hidden rounded-2xl shadow-lg border-2 border-transparent">
                <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-4xl font-bold text-white overflow-hidden border-4 border-neon-cyan/30 shadow-xl shadow-neon-cyan/20">
                            {profile.profilePictureUrl ? (
                                <img src={profile.profilePictureUrl} alt={profile.userName} className="w-full h-full object-cover" />
                            ) : (
                                <span>{profile.firstName?.charAt(0) || ''}{profile.lastName?.charAt(0) || ''}</span>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 text-center md:text-left space-y-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
                                    {profile.firstName} {profile.lastName}
                                </h1>
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-3 text-gray-400 mt-1">
                                    <span className="flex items-center gap-1 font-medium text-white/80">
                                        @{profile.userName}
                                    </span>
                                    <span className="hidden md:block w-1 h-1 bg-gray-600 rounded-full mt-2.5"></span>
                                    <span>Katılım: {new Date(profile.joinDate).toLocaleDateString('tr-TR')}</span>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {!isOwnProfile && (
                                <div className="flex items-center gap-3 justify-center md:justify-end">
                                    {/* Message Button - Only if Friends (Status 2) */}
                                    {friendshipStatus === 2 && (
                                        <button
                                            onClick={handleMessage}
                                            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors border border-white/10"
                                            title="Mesaj Gönder"
                                        >
                                            <MessageCircle size={20} />
                                        </button>
                                    )}

                                    {/* Friend Button */}
                                    {friendshipStatus !== 2 && (
                                        <button
                                            onClick={handleAddFriend}
                                            disabled={friendshipStatus === 1 || friendRequestLoading}
                                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${friendshipStatus === 1
                                                ? 'bg-transparent border-2 border-white/20 text-white/60 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-neon-purple to-pink-500 text-white hover:from-neon-purple/90 hover:to-pink-500/90 hover:scale-105 shadow-lg shadow-neon-purple/20'
                                                }`}
                                        >
                                            {friendRequestLoading ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : friendshipStatus === 1 ? (
                                                <>
                                                    <UserCheck size={20} />
                                                    <span>İstek Gönderildi</span>
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus size={20} />
                                                    <span>Arkadaş Ekle</span>
                                                </>
                                            )}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleFollow}
                                        disabled={followLoading}
                                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 ${isFollowing
                                            ? 'bg-transparent border-2 border-white/20 text-white hover:border-red-500/50 hover:text-red-400'
                                            : 'bg-neon-cyan text-black hover:bg-neon-cyan/90 hover:scale-105 shadow-lg shadow-neon-cyan/20'
                                            }`}
                                    >
                                        {followLoading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : isFollowing ? (
                                            <>
                                                <UserCheck size={20} />
                                                <span>Takip Ediliyor</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus size={20} />
                                                <span>Takip Et</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Stats Row */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-6 pt-4 border-t border-white/5">
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{followersCount}</div>
                                <div className="text-sm text-gray-400">Takipçi</div>
                            </div>
                            <div className="text-center md:text-left">
                                <div className="text-2xl font-bold text-white">{followingCount}</div>
                                <div className="text-sm text-gray-400">Takip Edilen</div>
                            </div>
                            {profile.fieldType && (
                                <div className="flex items-center">
                                    <span className="px-4 py-1 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-full text-sm font-semibold tracking-wide">
                                        {profile.fieldType}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Decorative Background Blur */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-neon-cyan/5 rounded-full blur-3xl pointer-events-none"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stats */}
                <div className="col-span-1 md:col-span-2">
                    <ProfileStatsCard statsData={profile.stats} />
                </div>

                {/* Badges */}
                <div className="col-span-1 md:col-span-2">
                    <BadgesSection gamificationData={gamificationData} />
                </div>
            </div>
        </div>
    )
}

export default PublicProfile
