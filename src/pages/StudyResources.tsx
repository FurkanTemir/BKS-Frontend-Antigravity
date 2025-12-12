import { useEffect, useState } from 'react'
import { studyResourceService } from '../services/studyResourceService'
import type { StudyResourceDto, CreateStudyResourceDto } from '../types'
import { Book, Video, Link as LinkIcon, Plus, Trash2, ExternalLink, CheckCircle } from 'lucide-react'

export default function StudyResources() {
    const [resources, setResources] = useState<StudyResourceDto[]>([])
    // const [loading, setLoading] = useState(true) -> Removed unused
    const [showAddModal, setShowAddModal] = useState(false)
    const [newResource, setNewResource] = useState<CreateStudyResourceDto>({
        name: '',
        type: 'Book',
        url: '',
        topicId: undefined, // Optional
        totalQuestions: 0
    })

    useEffect(() => {
        loadResources()
    }, [])

    const loadResources = async () => {
        try {
            const data = await studyResourceService.getAll()
            setResources(data)
        } catch (error) {
            console.error(error)
        }
    }


    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await studyResourceService.create(newResource)
            setShowAddModal(false)
            setNewResource({ name: '', type: 'Book', url: '', totalQuestions: 0 })
            loadResources()
        } catch (error) {
            alert('Kaynak eklenemedi.')
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Emin misiniz?')) return
        try {
            await studyResourceService.delete(id)
            setResources(prev => prev.filter(r => r.id !== id))
        } catch (error) {
            console.error(error)
        }
    }

    const handleUpdateSolved = async (id: number, current: number) => {
        const newCount = prompt('Toplam çözülen soru sayısı:', current.toString())
        if (newCount !== null) {
            try {
                await studyResourceService.updateSolvedCount(id, parseInt(newCount))
                loadResources()
            } catch (error) {
                console.error(error)
            }
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Book': return <Book className="w-5 h-5 text-emerald-400" />
            case 'Video': return <Video className="w-5 h-5 text-red-400" />
            case 'QuestionBank': return <CheckCircle className="w-5 h-5 text-blue-400" />
            default: return <LinkIcon className="w-5 h-5 text-gray-400" />
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Çalışma Kaynakları
                    </h1>
                    <p className="text-gray-400">Kitaplarınız, soru bankalarınız ve linkleriniz.</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors"
                >
                    <Plus className="w-5 h-5" /> Kaynak Ekle
                </button>
            </div>

            {/* Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="glass-panel p-6 rounded-2xl w-full max-w-md border border-white/10 bg-dark-400">
                        <h3 className="text-xl font-bold mb-4">Yeni Kaynak Ekle</h3>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Kaynak Adı</label>
                                <input
                                    type="text" required
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    value={newResource.name}
                                    onChange={e => setNewResource({ ...newResource, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tür</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    value={newResource.type}
                                    onChange={e => setNewResource({ ...newResource, type: e.target.value })}
                                >
                                    <option value="Book">Kitap</option>
                                    <option value="QuestionBank">Soru Bankası</option>
                                    <option value="Video">Video</option>
                                    <option value="Link">Link / Web</option>
                                </select>
                            </div>
                            {newResource.type === 'QuestionBank' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Toplam Soru</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                        value={newResource.totalQuestions}
                                        onChange={e => setNewResource({ ...newResource, totalQuestions: parseInt(e.target.value) })}
                                    />
                                </div>
                            )}
                            {(newResource.type === 'Video' || newResource.type === 'Link') && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                        value={newResource.url}
                                        onChange={e => setNewResource({ ...newResource, url: e.target.value })}
                                    />
                                </div>
                            )}
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-400 hover:text-white">İptal</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                    <div key={resource.id} className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors group relative">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/5">
                                    {getIcon(resource.type)}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-white">{resource.name}</h4>
                                    <span className="text-xs text-gray-400">{resource.type}</span>
                                </div>
                            </div>
                            <button onClick={() => handleDelete(resource.id)} className="text-gray-500 hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {resource.type === 'QuestionBank' && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-gray-400">
                                    <span>Çözülen</span>
                                    <span>{resource.solvedQuestions} / {resource.totalQuestions}</span>
                                </div>
                                <div className="h-2 bg-gray-800 rounded-full overflow-hidden cursor-pointer" onClick={() => handleUpdateSolved(resource.id, resource.solvedQuestions || 0)} title="İlerlemeyi güncellemek için tıkla">
                                    <div
                                        className="h-full bg-cyan-500 transition-all"
                                        style={{ width: `${Math.min(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100, 100)}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {(resource.url) && (
                            <a
                                href={resource.url}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-emerald-400 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" /> Kaynağa Git
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}
