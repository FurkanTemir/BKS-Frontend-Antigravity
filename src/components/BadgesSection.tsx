import { useEffect, useState } from 'react'
import { Star, Zap, Target, Lock, Crown, Flame, X, Trophy } from 'lucide-react'
import { gamificationService } from '../services/gamificationService'
import type { GamificationProfileDto, BadgeDto } from '../types'

interface BadgesSectionProps {
    gamificationData?: GamificationProfileDto
}

const BadgesSection = ({ gamificationData }: BadgesSectionProps) => {
    const [profile, setProfile] = useState<GamificationProfileDto | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (gamificationData) {
            setProfile(gamificationData)
            setLoading(false)
            return
        }

        const fetchProfile = async () => {
            try {
                const data = await gamificationService.getMyProfile()
                setProfile(data)
            } catch (error) {
                console.error('Failed to fetch gamification profile', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProfile()
    }, [gamificationData])

    // Mock Badges if none exist or for demo purposes
    // In a real scenario, we would use profile?.badges
    // Use a mix of real and mock for demonstration if empty
    const badges: Partial<BadgeDto & { icon: any, color: string, bg: string }>[] = [
        {
            id: 1,
            name: 'İlk Giriş',
            description: 'Platforma ilk kez giriş yaptın.',
            isEarned: true,
            icon: Star,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10'
        },
        {
            id: 2,
            name: 'Görev Ustası',
            description: '10 görev tamamladın.',
            isEarned: (profile?.totalPoints || 0) > 50,
            icon: Target,
            color: 'text-neon-cyan',
            bg: 'bg-neon-cyan/10'
        },
        {
            id: 3,
            name: 'Ateşli Seri',
            description: '3 gün üst üste çalıştın.',
            isEarned: (profile?.streak?.currentStreak || 0) >= 3,
            icon: Flame,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10'
        },
        {
            id: 4,
            name: 'Maratoncu',
            description: 'Toplam 10 saat çalıştın.',
            isEarned: false,
            icon: Zap,
            color: 'text-neon-purple',
            bg: 'bg-neon-purple/10'
        }
    ]

    // Override with real badges if available and mapped correctly (skipping complex mapping for this demo to ensure UI shows up)
    // We will stick to the "Designed" mock list but update 'isEarned' based on real data where possible.

    // Expanded mock list for the gallery
    const allBadges = [
        ...badges,
        {
            id: 5,
            name: 'Erkenci Kuş',
            description: 'Sabah 07:00\'den önce ders çalıştın.',
            isEarned: false,
            icon: Star,
            color: 'text-yellow-300',
            bg: 'bg-yellow-300/10'
        },
        {
            id: 6,
            name: 'Gece Kuşu',
            description: 'Gece yarısından sonra ders çalıştın.',
            isEarned: false,
            icon: Crown,
            color: 'text-indigo-400',
            bg: 'bg-indigo-400/10'
        },
        {
            id: 7,
            name: 'Haftasonu Savaşçısı',
            description: 'Haftasonu toplam 5 saat çalıştın.',
            isEarned: false,
            icon: Target,
            color: 'text-red-400',
            bg: 'bg-red-400/10'
        },
        {
            id: 8,
            name: 'Sosyal Kelebek',
            description: '5 arkadaşını davet ettin.',
            isEarned: false,
            icon: Zap,
            color: 'text-green-400',
            bg: 'bg-green-400/10'
        }
    ]

    const [isGalleryOpen, setIsGalleryOpen] = useState(false)

    if (loading) {
        return <div className="animate-pulse h-32 bg-dark-300/30 rounded-2xl mb-8"></div>
    }

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Crown className="text-amber-400" />
                    Rozetlerim
                </h3>
                <button
                    onClick={() => setIsGalleryOpen(true)}
                    className="text-sm text-neon-cyan hover:text-white transition-colors"
                >
                    Tümünü Gör
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {badges.map((badge, index) => {
                    const Icon = badge.icon
                    return (
                        <div
                            key={index}
                            className={`
                                relative p-4 rounded-2xl border transition-all duration-300 group cursor-pointer
                                ${badge.isEarned
                                    ? 'bg-dark-300/50 border-white/10 hover:border-neon-cyan/50 hover:bg-dark-300'
                                    : 'bg-dark-300/20 border-white/5 opacity-60 grayscale hover:opacity-100 hover:grayscale-0'}
                            `}
                        >
                            {/* Tooltip for Locked Badges */}
                            {!badge.isEarned && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[150px] p-2 bg-black/90 border border-white/10 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl text-center">
                                    <span className="text-neon-cyan font-bold block mb-0.5">KİLİTLİ</span>
                                    Hedef: {badge.description}
                                </div>
                            )}

                            <div className="flex flex-col items-center text-center gap-3">
                                <div className={`
                                    w-16 h-16 rounded-full flex items-center justify-center text-3xl
                                    ${badge.isEarned ? badge.bg : 'bg-white/5'}
                                    transition-transform group-hover:scale-110 duration-300
                                `}>
                                    <Icon size={32} className={badge.isEarned ? badge.color : 'text-gray-500'} />
                                </div>

                                <div>
                                    <h4 className={`font-bold ${badge.isEarned ? 'text-white' : 'text-gray-400'}`}>
                                        {badge.name}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1 leading-snug">
                                        {badge.description}
                                    </p>
                                </div>

                                {!badge.isEarned && (
                                    <div className="absolute top-2 right-2">
                                        <Lock size={14} className="text-gray-600" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Badges Gallery Modal */}
            {isGalleryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-dark-300 border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-dark-400/50">
                            <div>
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Trophy className="text-amber-400" />
                                    Rozet Galerisi
                                </h3>
                                <p className="text-gray-400 text-sm">Toplayabileceğin tüm başarımlar</p>
                            </div>
                            <button
                                onClick={() => setIsGalleryOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {allBadges.map((badge, index) => {
                                const Icon = badge.icon
                                return (
                                    <div
                                        key={index}
                                        className={`
                                            relative p-4 rounded-xl border transition-all duration-300 group
                                            ${badge.isEarned
                                                ? 'bg-dark-300/50 border-neon-cyan/20 hover:border-neon-cyan hover:bg-dark-300 shadow-lg shadow-neon-cyan/5'
                                                : 'bg-dark-300/20 border-white/5 opacity-70 hover:opacity-100 hover:border-white/20'}
                                        `}
                                    >
                                        <div className="flex flex-col items-center text-center gap-3">
                                            <div className={`
                                                w-14 h-14 rounded-full flex items-center justify-center text-2xl
                                                ${badge.isEarned ? badge.bg : 'bg-white/5'}
                                                ${badge.isEarned ? '' : 'grayscale'}
                                            `}>
                                                <Icon size={28} className={badge.isEarned ? badge.color : 'text-gray-500'} />
                                            </div>

                                            <div>
                                                <h4 className={`font-bold text-sm ${badge.isEarned ? 'text-white' : 'text-gray-400'}`}>
                                                    {badge.name}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 mt-1 leading-snug line-clamp-2">
                                                    {badge.description}
                                                </p>
                                            </div>

                                            {!badge.isEarned && (
                                                <div className="absolute top-2 right-2">
                                                    <Lock size={12} className="text-gray-600" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default BadgesSection
