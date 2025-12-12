import { useEffect, useState } from 'react'
import { announcementService } from '../../services/announcementService'
import type { AnnouncementDto, CreateAnnouncementDto } from '../../types'
import { Megaphone, Trash2, AlertTriangle, Plus, X } from 'lucide-react'

export default function AdminAnnouncements() {
    const [announcements, setAnnouncements] = useState<AnnouncementDto[]>([])
    const [showModal, setShowModal] = useState(false)
    const [newItem, setNewItem] = useState<CreateAnnouncementDto>({
        title: '',
        content: '',
        isEmergency: false
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await announcementService.getAll()
            setAnnouncements(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await announcementService.create(newItem)
            setShowModal(false)
            setNewItem({ title: '', content: '', isEmergency: false })
            loadData()
        } catch (error) {
            alert('Duyuru oluşturulamadı')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await announcementService.delete(id)
            setAnnouncements(prev => prev.filter(a => a.id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                        Duyuru Yönetimi
                    </h1>
                    <p className="text-gray-400">Sistem genelinde duyuru yayınlayın.</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Yeni Duyuru
                </button>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-white/10 bg-dark-400">
                        <h3 className="text-xl font-bold mb-4">Yeni Duyuru</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Başlık</label>
                                <input
                                    type="text" required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    value={newItem.title}
                                    onChange={e => setNewItem({ ...newItem, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">İçerik</label>
                                <textarea
                                    required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white h-24"
                                    value={newItem.content}
                                    onChange={e => setNewItem({ ...newItem, content: e.target.value })}
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="emergency"
                                    checked={newItem.isEmergency}
                                    onChange={e => setNewItem({ ...newItem, isEmergency: e.target.checked })}
                                    className="w-4 h-4"
                                />
                                <label htmlFor="emergency" className="text-sm text-gray-300">Acil Durum Bildirimi (Pop-up)</label>
                            </div>
                            <div className="flex justify-end gap-2 mt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg">Yayınla</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {announcements.map(item => (
                    <div key={item.id} className={`glass-panel p-4 rounded-xl border flex justify-between items-start ${item.isEmergency ? 'border-red-500/50 bg-red-500/10' : 'border-white/10 bg-white/5'}`}>
                        <div className="flex gap-4">
                            <div className={`p-3 rounded-full ${item.isEmergency ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                                {item.isEmergency ? <AlertTriangle className="w-6 h-6" /> : <Megaphone className="w-6 h-6" />}
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{item.title}</h4>
                                <p className="text-gray-300 mt-1">{item.content}</p>
                                <div className="text-xs text-gray-500 mt-2">{new Date(item.createdDate).toLocaleString()}</div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    )
}
