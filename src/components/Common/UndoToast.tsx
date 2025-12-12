import { useEffect, useState } from 'react'
import { commonService } from '../../services/commonService'
import { RotateCcw, X } from 'lucide-react'

// Simple event bus for triggering toast
export const undoEventBus = {
    trigger: () => { },
    listeners: [] as (() => void)[],
    subscribe(listener: () => void) {
        this.listeners.push(listener)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener)
        }
    },
    emit() {
        this.listeners.forEach(l => l())
    }
}

// Helper to trigger from other components
export const showUndoToast = () => undoEventBus.emit()

export default function UndoToast() {
    const [visible, setVisible] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)

    useEffect(() => {
        const unsubscribe = undoEventBus.subscribe(() => {
            setVisible(true)
            setTimeLeft(30) // 30 seconds to undo
        })
        return unsubscribe
    }, [])

    useEffect(() => {
        if (!visible || timeLeft <= 0) {
            if (timeLeft <= 0) setVisible(false)
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1)
        }, 1000)

        return () => clearInterval(timer)
    }, [visible, timeLeft])

    const handleUndo = async () => {
        try {
            await commonService.undoLastAction()
            setVisible(false)
            alert('İşlem geri alındı!')
            // Optionally trigger a global refresh or reload current page
            window.location.reload()
        } catch (error) {
            console.error(error)
            alert('Geri alma başarısız.')
        }
    }

    if (!visible) return null

    return (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
            <div className="bg-dark-300 border border-white/10 shadow-2xl rounded-xl p-4 flex items-center gap-4 min-w-[300px]">
                <div className="w-10 h-10 rounded-full bg-neon-cyan/20 flex items-center justify-center text-neon-cyan animate-pulse">
                    <RotateCcw className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-white">Öğe Silindi</h4>
                    <p className="text-xs text-gray-400">Geri almak için {timeLeft} saniye.</p>
                </div>
                <button
                    onClick={handleUndo}
                    className="px-3 py-1.5 bg-neon-cyan text-black text-sm font-semibold rounded-lg hover:bg-cyan-400 transition-colors"
                >
                    Geri Al
                </button>
                <button
                    onClick={() => setVisible(false)}
                    className="p-1 text-gray-400 hover:text-white"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    )
}
