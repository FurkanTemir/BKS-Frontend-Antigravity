import { useMemo } from 'react'

interface HeatmapData {
    date: string
    count: number
}

interface HeatmapProps {
    data: HeatmapData[]
    startDate: Date
    endDate: Date
}

const Heatmap = ({ data, startDate }: HeatmapProps) => {
    // Generate dates for the last 365 days or custom range
    const calendarData = useMemo(() => {
        const weeks = []
        const currentDate = new Date(startDate)
        currentDate.setDate(currentDate.getDate() - currentDate.getDay()) // Start from Sunday

        for (let i = 0; i < 53; i++) {
            const week = []
            for (let j = 0; j < 7; j++) {
                const dateStr = currentDate.toISOString().split('T')[0]
                const dayData = data.find(d => d.date.startsWith(dateStr))

                week.push({
                    date: dateStr,
                    count: dayData ? dayData.count : 0,
                    level: getIntensityLevel(dayData ? dayData.count : 0)
                })
                currentDate.setDate(currentDate.getDate() + 1)
            }
            weeks.push(week)
        }
        return weeks
    }, [data, startDate])

    function getIntensityLevel(count: number) {
        if (count === 0) return 0
        if (count < 30) return 1
        if (count < 60) return 2
        if (count < 120) return 3
        return 4
    }

    const getLevelColor = (level: number) => {
        switch (level) {
            case 0: return 'bg-gray-800'
            case 1: return 'bg-emerald-900/40 border-emerald-900/50'
            case 2: return 'bg-emerald-700/60 border-emerald-700/70'
            case 3: return 'bg-emerald-500/80 border-emerald-500/90'
            case 4: return 'bg-emerald-400 border-emerald-300'
            default: return 'bg-gray-800'
        }
    }

    return (
        <div className="w-full overflow-x-auto pb-2">
            <div className="min-w-fit">
                <div className="flex gap-1">
                    {calendarData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-1">
                            {week.map((day, dIndex) => (
                                <div
                                    key={day.date}
                                    title={`${day.date}: ${day.count} dakika`}
                                    className={`w-3 h-3 rounded-sm border ${getLevelColor(day.level)} transition-all hover:scale-125 cursor-help`}
                                ></div>
                            ))}
                        </div>
                    ))}
                </div>
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-400">
                    <span>Az</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-gray-800"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-900/40"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-700/60"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-500/80"></div>
                        <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
                    </div>
                    <span>Çok</span>
                </div>
            </div>
        </div>
    )
}

export default Heatmap
