import { useEffect, useState } from 'react'
import { Trophy, CheckCircle, Globe } from 'lucide-react'
import { gamificationService } from '../services/gamificationService'
import type { ProfileStats } from '../types'

interface ProfileStatsCardProps {
    statsData?: ProfileStats
}

const ProfileStatsCard = ({ statsData }: ProfileStatsCardProps) => {
    const [stats, setStats] = useState<ProfileStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (statsData) {
            setStats(statsData)
            setLoading(false)
            return
        }

        const fetchStats = async () => {
            try {
                const data = await gamificationService.getProfileStats()
                setStats(data)
            } catch (error) {
                console.error('Failed to fetch profile stats', error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [statsData])

    const cards = [
        {
            label: 'Tamamlanan Görevler',
            value: stats?.totalCompletedTasks,
            icon: CheckCircle,
            color: 'text-neon-cyan',
            bg: 'bg-neon-cyan/10',
            border: 'border-neon-cyan/20'
        },
        {
            label: 'Toplam Puan',
            value: stats?.totalPoints,
            icon: Trophy,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-400/20'
        },
        {
            label: 'Global Sıralama',
            value: stats?.globalRank ? `#${stats.globalRank}` : '-',
            icon: Globe,
            color: 'text-neon-purple',
            bg: 'bg-neon-purple/10',
            border: 'border-neon-purple/20'
        }
    ]

    // Level Calculation
    const totalPoints = stats?.totalPoints || 0
    const currentLevel = Math.floor(totalPoints / 100) + 1
    const pointsForNextLevel = 100
    const currentLevelPoints = totalPoints % 100
    const progressPercent = (currentLevelPoints / pointsForNextLevel) * 100

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass-card p-6 rounded-2xl animate-pulse">
                        <div className="h-4 w-24 bg-white/10 rounded mb-4"></div>
                        <div className="h-8 w-16 bg-white/10 rounded"></div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {cards.map((card, index) => (
                <div
                    key={index}
                    className={`glass-card p-6 rounded-2xl border ${card.border} hover:scale-[1.02] transition-transform duration-300 relative overflow-hidden group`}
                >
                    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
                        <card.icon size={64} className={card.color} />
                    </div>

                    <div className="relative z-10">
                        <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-4`}>
                            <card.icon size={20} className={card.color} />
                        </div>
                        <div className="text-gray-400 text-sm font-medium mb-1">{card.label}</div>
                        <div className="text-3xl font-bold text-white tracking-tight">{card.value}</div>

                        {/* Progress Bar for Total Points */}
                        {card.label === 'Toplam Puan' && (
                            <div className="mt-4">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-amber-400 font-medium">Seviye {currentLevel}</span>
                                    <span className="text-gray-400">{currentLevelPoints} / {pointsForNextLevel}</span>
                                </div>
                                <div className="h-2 w-full bg-dark-400 rounded-full overflow-hidden border border-white/5">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${loading ? 0 : progressPercent}%` }}
                                    ></div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1 text-right">Seviye {currentLevel + 1} için {pointsForNextLevel - currentLevelPoints} puan</div>
                            </div>
                        )}

                        {/* Rank Info for Global Rank */}
                        {card.label === 'Global Sıralama' && stats?.globalRank && stats.globalRank > 0 && (
                            <div className="mt-4 text-xs text-neon-purple/80 font-medium">
                                İlk %{Math.max(1, Math.min(100, Math.round(100 / (stats.globalRank + 5))))} dilimdesin!
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ProfileStatsCard
