import { useEffect, useState } from 'react'
import { notificationService } from '../services/notificationService'
import type { NotificationDto, NotificationMessageDto, CreateNotificationDto } from '../types'
import { Bell, Clock, Trash2, Check, Mail, Settings } from 'lucide-react'

export default function Notifications() {
    const [activeTab, setActiveTab] = useState<'inbox' | 'reminders'>('inbox')
    const [messages, setMessages] = useState<NotificationMessageDto[]>([])
    const [reminders, setReminders] = useState<NotificationDto[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [loading, setLoading] = useState(true)

    // New Reminder Form State
    const [showAddReminder, setShowAddReminder] = useState(false)
    const [newReminder, setNewReminder] = useState<CreateNotificationDto>({
        title: '',
        message: '',
        reminderDate: '',
        notificationType: 1
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [msgs, rems, count] = await Promise.all([
                notificationService.getMessages(),
                notificationService.getAll(),
                notificationService.getUnreadCount()
            ])
            setMessages(msgs)
            setReminders(rems)
            setUnreadCount(count)
        } catch (error) {
            console.error('Bildirim verileri yüklenemedi', error)
        } finally {
            setLoading(false)
        }
    }

    const handleMarkRead = async (id: number) => {
        try {
            await notificationService.markRead(id)
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error(error)
        }
    }

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllRead()
            setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
            setUnreadCount(0)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteMessage = async (id: number) => {
        try {
            await notificationService.deleteMessage(id)
            setMessages(prev => prev.filter(m => m.id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    const handleDeleteReminder = async (id: number) => {
        try {
            await notificationService.delete(id)
            setReminders(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    const handleToggleReminder = async (id: number) => {
        try {
            await notificationService.toggle(id)
            setReminders(prev => prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r))
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreateReminder = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await notificationService.create(newReminder)
            setShowAddReminder(false)
            setNewReminder({ title: '', message: '', reminderDate: '', notificationType: 1 })
            const updatedReminders = await notificationService.getAll()
            setReminders(updatedReminders)
        } catch (error) {
            console.error(error)
            alert('Hatırlatma oluşturulamadı.')
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
                        Bildirim Merkezi
                    </h1>
                    <p className="text-gray-400">Hatırlatmalarınız ve sistem mesajlarınız.</p>
                </div>
                <div className="flex p-1 bg-white/5 rounded-lg border border-white/10">
                    <button
                        onClick={() => setActiveTab('inbox')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'inbox' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Mail className="w-4 h-4" />
                        Gelen Kutusu
                        {unreadCount > 0 && (
                            <span className="bg-red-500 text-white text-xs px-1.5 rounded-full">{unreadCount}</span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('reminders')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${activeTab === 'reminders' ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white'}`}
                    >
                        <Clock className="w-4 h-4" />
                        Hatırlatmalar
                    </button>
                </div>
            </div>

            {/* Content */}
            {activeTab === 'inbox' ? (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <button
                            onClick={handleMarkAllRead}
                            className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            <Check className="w-4 h-4" /> Tümünü Okundu İşaretle
                        </button>
                    </div>
                    {messages.length === 0 ? (
                        <div className="text-center py-12 glass-panel rounded-2xl border border-white/5 bg-white/5">
                            <Mail className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                            <p className="text-gray-400">Gelen kutunuz boş.</p>
                        </div>
                    ) : (
                        messages.map(msg => (
                            <div key={msg.id} className={`glass-panel p-4 rounded-xl border transition-colors ${msg.isRead ? 'border-white/5 bg-white/5 opacity-70' : 'border-amber-500/30 bg-amber-500/10'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className={`font-semibold ${msg.isRead ? 'text-gray-300' : 'text-white'}`}>{msg.title}</h4>
                                        <p className="text-gray-400 text-sm mt-1">{msg.message}</p>
                                        <div className="text-xs text-gray-500 mt-2">{new Date(msg.createdDate).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        {!msg.isRead && (
                                            <button
                                                onClick={() => handleMarkRead(msg.id)}
                                                className="p-2 hover:bg-white/10 rounded-lg text-emerald-400 transition-colors"
                                                title="Okundu İşaretle"
                                            >
                                                <Check className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg text-red-400 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Add Reminder Form Toggle */}
                    {!showAddReminder ? (
                        <button
                            onClick={() => setShowAddReminder(true)}
                            className="w-full py-4 rounded-xl border border-dashed border-white/20 hover:border-amber-500/50 hover:bg-amber-500/5 text-gray-400 hover:text-amber-400 transition-all flex items-center justify-center gap-2"
                        >
                            <Bell className="w-5 h-5" /> Yeni Hatırlatma Ekle
                        </button>
                    ) : (
                        <form onSubmit={handleCreateReminder} className="glass-panel p-6 rounded-2xl border border-amber-500/30 bg-black/40 space-y-4">
                            <h3 className="font-semibold text-lg text-white">Yeni Hatırlatma</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Başlık"
                                    required
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                                    value={newReminder.title}
                                    onChange={e => setNewReminder({ ...newReminder, title: e.target.value })}
                                />
                                <input
                                    type="datetime-local"
                                    required
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500"
                                    value={newReminder.reminderDate}
                                    onChange={e => setNewReminder({ ...newReminder, reminderDate: e.target.value })}
                                />
                            </div>
                            <textarea
                                placeholder="Mesajınız..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-amber-500 h-24"
                                value={newReminder.message}
                                onChange={e => setNewReminder({ ...newReminder, message: e.target.value })}
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddReminder(false)}
                                    className="px-4 py-2 rounded-lg text-gray-400 hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-400 transition-colors"
                                >
                                    Oluştur
                                </button>
                            </div>
                        </form>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reminders.map(reminder => (
                            <div key={reminder.id} className="glass-panel p-4 rounded-xl border border-white/10 bg-white/5 relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className={`font-semibold ${!reminder.isActive && 'text-gray-500 line-through'}`}>{reminder.title}</h4>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => handleToggleReminder(reminder.id)}
                                            className={`w-8 h-4 rounded-full transition-colors relative ${reminder.isActive ? 'bg-emerald-500' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${reminder.isActive ? 'left-4.5' : 'left-0.5'}`} style={{ left: reminder.isActive ? '18px' : '2px' }} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReminder(reminder.id)}
                                            className="p-1 hover:text-red-400 text-gray-500 transition-colors ml-2"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">{reminder.message}</p>
                                <div className="text-xs text-amber-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(reminder.reminderDate || '').toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
