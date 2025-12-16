import { useState, useMemo } from 'react'
import type { StudyActivityDto } from '../../types'

interface HeatmapData {
    date: string
    totalSeconds: number
}

interface HeatmapProps {
    data: HeatmapData[]
    className?: string
    activities?: StudyActivityDto[]
}

const MonthlyHeatmap = ({ data, className, activities = [] }: HeatmapProps) => {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<{ date: string, count: number } | null>(null)

    const dataMap = useMemo(() => {
        return data.reduce((acc, curr) => {
            const dateKey = curr.date.includes('T') ? curr.date.split('T')[0] : curr.date;
            acc[dateKey] = (acc[dateKey] || 0) + curr.totalSeconds;
            return acc
        }, {} as Record<string, number>)
    }, [data])

    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear()
        const month = currentDate.getMonth()
        const firstDayOfMonth = new Date(year, month, 1)
        const lastDayOfMonth = new Date(year, month + 1, 0)

        let startDay = firstDayOfMonth.getDay() - 1
        if (startDay === -1) startDay = 6

        const days = []
        for (let i = 0; i < startDay; i++) {
            days.push({ day: null, date: null, count: 0 })
        }
        for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
            const seconds = dataMap[dateStr] || 0
            days.push({ day: i, date: dateStr, count: seconds / 60 })
        }
        return days
    }, [currentDate, dataMap])

    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))

    const getIntensityClass = (minutes: number) => {
        if (minutes === 0) return 'bg-gray-800/30 text-gray-600 hover:bg-gray-800'
        if (minutes <= 60) return 'bg-teal-900/40 text-teal-200 border border-teal-900/50'
        if (minutes <= 180) return 'bg-teal-700/60 text-white border border-teal-600/50'
        return 'bg-teal-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.3)] border border-teal-400'
    }

    return (
        <div className={`w-full bg-gradient-to-br from-gray-900 to-black rounded-xl border border-gray-800 p-5 flex flex-col h-full min-h-[400px] ${className}`}>

            {/* Top Section: Calendar */}
            <div className="flex-none">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold text-gray-200 ml-1">
                        {currentDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })}
                    </span>

                    <div className="flex gap-1">
                        <button onClick={prevMonth} className="p-1 hover:bg-gray-800 text-gray-400 rounded transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        <button onClick={nextMonth} className="p-1 hover:bg-gray-800 text-gray-400 rounded transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7 gap-1.5 mb-2">
                    {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
                        <div key={d} className="text-center text-[10px] font-medium text-gray-500 pb-1">
                            {d}
                        </div>
                    ))}

                    {calendarDays.map((item, index) => (
                        item.day ? (
                            <div
                                key={index}
                                onClick={() => setSelectedDay({ date: item.date!, count: item.count })}
                                className={`
                                    relative group h-9 w-full flex items-center justify-center rounded-md transition-all duration-200
                                    ${getIntensityClass(item.count)}
                                    cursor-pointer border-2 ${selectedDay?.date === item.date ? 'border-white/50' : 'border-transparent'}
                                `}
                                title={`${item.date}\n${Math.round(item.count)} dakika`}
                            >
                                <span className="text-xs font-medium">{item.day}</span>

                                {/* Tooltip */}
                                <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 bg-gray-900/95 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-gray-700 pointer-events-none whitespace-nowrap shadow-xl transition-opacity">
                                    <span className="font-bold text-teal-400">{Math.round(item.count)} dk</span>
                                </div>
                            </div>
                        ) : (
                            <div key={index} className="h-9"></div>
                        )
                    ))}
                </div>

                {/* Legend */}
                <div className="flex justify-end items-center gap-2 mt-2 mr-1">
                    <span className="text-[10px] text-gray-500">Az</span>
                    <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-gray-800/30 border border-transparent"></div>
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-teal-900/40 border border-teal-900/50"></div>
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-teal-700/60 border border-teal-600/50"></div>
                        <div className="w-2.5 h-2.5 rounded-[2px] bg-teal-500 border border-teal-400"></div>
                    </div>
                    <span className="text-[10px] text-gray-500">Çok</span>
                </div>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gray-800/50 my-4 shrink-0"></div>

            {/* Bottom Section: Details */}
            <div className="flex-1 flex flex-col justify-end">
                {selectedDay ? (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-white">
                                {new Date(selectedDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${selectedDay.count > 0 ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-800 text-gray-400'}`}>
                                {selectedDay.count > 0 ? 'Tamamlandı' : 'Veri Yok'}
                            </span>
                        </div>
                        <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30 flex items-center gap-3">
                            <div className="p-2 bg-teal-500/10 rounded-md">
                                <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Toplam Çalışma</p>
                                <p className="text-lg font-bold text-white">{Math.round(selectedDay.count)} dk</p>
                            </div>
                        </div>
                        {selectedDay.count > 0 && (
                            <p className="text-[10px] text-gray-500 mt-2 text-center">Detaylı loglar için günlük rapora gidin.</p>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col h-full">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Son Aktiviteler</h4>
                        <div className="space-y-2">
                            {activities.length > 0 ? (
                                activities.map((activity) => (
                                    <div key={activity.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/20 border border-gray-800/50 hover:bg-gray-800/40 transition-colors cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-1.5 h-1.5 rounded-full ${activity.color === 'purple' ? 'bg-purple-400' : 'bg-blue-400'}`}></div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-medium text-gray-300">{activity.title}</span>
                                                <span className="text-[10px] text-gray-500">
                                                    {new Date(activity.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} ({new Date(activity.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })})
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-400">{activity.duration}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 text-xs py-4">Henüz aktivite yok.</div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MonthlyHeatmap