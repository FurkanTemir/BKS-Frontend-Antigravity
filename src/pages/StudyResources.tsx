import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { studyResourceService } from '../services/studyResourceService'
import type { StudyResourceDto, CreateStudyResourceDto } from '../types'
import { Book, Video, Link as LinkIcon, Plus, Trash2, ExternalLink, CheckCircle, Search } from 'lucide-react'

export default function StudyResources() {
    const navigate = useNavigate()
    const [resources, setResources] = useState<StudyResourceDto[]>([])
    // const [loading, setLoading] = useState(true) -> Removed unused
    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedType, setSelectedType] = useState('All')

    // Internal state for form handling (string based) before converting to DTO
    const [newItem, setNewItem] = useState({
        name: '',
        type: 'Book', // Book, QuestionBank, Video, Link
        linkOrInfo: '',
        topicId: undefined as number | undefined,
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

    const getResourceTypeId = (type: string): number => {
        switch (type) {
            case 'Book': return 1
            case 'Video': return 2
            case 'QuestionBank': return 3
            case 'Link': return 4
            default: return 5 // Other
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            // Use PascalCase to ensure binding works on backend
            // @ts-ignore - Ignore type check for now if interface mismatch occurs during refactor
            const dto: any = {
                Name: newItem.name,
                ResourceType: getResourceTypeId(newItem.type),
                LinkOrInfo: newItem.linkOrInfo,
                TopicId: newItem.topicId,
                TotalQuestions: newItem.type === 'QuestionBank' ? newItem.totalQuestions : undefined
            }
            await studyResourceService.create(dto)
            setShowAddModal(false)
            setNewItem({ name: '', type: 'Book', linkOrInfo: '', topicId: undefined, totalQuestions: 0 })
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

    const getTypeName = (type: string) => {
        switch (type) {
            case 'Book': return 'Kitap'
            case 'Video': return 'Video'
            case 'QuestionBank': return 'Soru Bankası'
            case 'Link': return 'Link / Web'
            case 'Website': return 'Web Sitesi'
            case '0': return 'Link / Web' // Fallback for existing broken items
            default: return type
        }
    }

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = selectedType === 'All' || resource.resourceType === selectedType
        return matchesSearch && matchesType
    })

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                        Çalışma Kaynakları
                    </h1>
                    <p className="text-gray-400">Kitaplarınız, soru bankalarınız ve linkleriniz.</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-black font-semibold rounded-lg hover:bg-emerald-400 transition-colors whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" /> Kaynak Ekle
                    </button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Kaynak ara..."
                        className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-colors min-w-[200px]"
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                >
                    <option value="All">Tüm Türler</option>
                    <option value="Book">Kitap</option>
                    <option value="QuestionBank">Soru Bankası</option>
                    <option value="Video">Video</option>
                    <option value="Link">Link / Web</option>
                </select>
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
                                    value={newItem.name}
                                    onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Tür</label>
                                <select
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                    value={newItem.type}
                                    onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                >
                                    <option value="Book">Kitap</option>
                                    <option value="QuestionBank">Soru Bankası</option>
                                    <option value="Video">Video</option>
                                    <option value="Link">Link / Web</option>
                                </select>
                            </div>
                            {newItem.type === 'QuestionBank' && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Toplam Soru</label>
                                    <input
                                        type="number"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                        value={newItem.totalQuestions}
                                        onChange={e => setNewItem({ ...newItem, totalQuestions: parseInt(e.target.value) })}
                                    />
                                </div>
                            )}
                            {(newItem.type === 'Video' || newItem.type === 'Link') && (
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">URL</label>
                                    <input
                                        type="url"
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                                        value={newItem.linkOrInfo}
                                        onChange={e => setNewItem({ ...newItem, linkOrInfo: e.target.value })}
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
            {/* List or Empty State */}
            {filteredResources.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500 animate-in fade-in zoom-in duration-500">
                    <div className="p-6 bg-white/5 rounded-full mb-4 ring-1 ring-white/10 shadow-2xl shadow-emerald-500/10">
                        <Book className="w-12 h-12 text-gray-600" />
                    </div>
                    <p className="text-xl font-medium text-gray-400">No resources found</p>
                    <p className="text-sm mt-2 text-gray-600">Start by adding a new study resource.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                    {filteredResources.map(resource => (
                        <div
                            key={resource.id}
                            onClick={() => navigate(`/app/study-resources/${resource.id}`)}
                            className="glass-panel p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-300 group relative cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/10"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:border-emerald-500/30 transition-colors">
                                        {getIcon(resource.resourceType)}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{resource.name}</h4>
                                        <span className="text-xs text-gray-400">{getTypeName(resource.resourceType)}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleDelete(resource.id); }}
                                    className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {resource.resourceType === 'QuestionBank' && (
                                <div className="space-y-2 mt-4">
                                    <div className="flex justify-between text-xs text-gray-400 font-medium">
                                        <span>İlerleme</span>
                                        <span className={resource.solvedQuestions === resource.totalQuestions ? 'text-emerald-400' : ''}>
                                            {Math.round(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div
                                        className="h-2 bg-black/40 rounded-full overflow-hidden cursor-pointer ring-1 ring-white/5 group-hover:ring-emerald-500/20 transition-all"
                                        onClick={(e) => { e.stopPropagation(); handleUpdateSolved(resource.id, resource.solvedQuestions || 0); }}
                                        title="İlerlemeyi güncellemek için tıkla"
                                    >
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                            style={{ width: `${Math.min(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            {(resource.linkOrInfo) && (
                                <a
                                    href={resource.linkOrInfo}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 bg-black/20 hover:bg-emerald-500/10 border border-white/5 hover:border-emerald-500/50 rounded-lg text-sm text-gray-400 hover:text-emerald-400 transition-all font-medium"
                                >
                                    <ExternalLink className="w-4 h-4" /> Kaynağa Git
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
