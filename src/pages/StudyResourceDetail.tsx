import { ArrowLeft, Book, CheckCircle, Edit, ExternalLink, Link as LinkIcon, Loader2, Trash2, Video } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { studyResourceService } from '../services/studyResourceService'
import type { StudyResourceDto, CreateStudyResourceDto } from '../types'

const StudyResourceDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [resource, setResource] = useState<StudyResourceDto | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        name: '',
        type: 'Book',
        url: '',
        totalQuestions: 0
    })

    useEffect(() => {
        if (id) {
            fetchResource(parseInt(id))
        }
    }, [id])

    const fetchResource = async (resourceId: number) => {
        try {
            const data = await studyResourceService.getById(resourceId)
            setResource(data)

            // Map '0' to 'Link' for edit form to allow user to fix it
            const formType = data.resourceType === '0' ? 'Link' : (data.resourceType || 'Book')
            // If type is 'Website', map to 'Link' for select option
            const mappedFormType = formType === 'Website' ? 'Link' : formType

            setEditForm({
                name: data.name,
                type: mappedFormType,
                url: data.linkOrInfo || '',
                totalQuestions: data.totalQuestions || 0
            })
        } catch (err) {
            console.error('Failed to fetch resource:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!resource || !confirm('Bu kaynağı silmek istediğinizden emin misiniz?')) return

        setIsDeleting(true)
        try {
            await studyResourceService.delete(resource.id)
            navigate('/app/study-resources')
        } catch (err) {
            console.error('Failed to delete resource:', err)
        } finally {
            setIsDeleting(false)
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

    const handleUpdate = async () => {
        if (!resource) return

        try {
            // Use PascalCase to ensure binding works on backend
            // @ts-ignore
            const updateData: any = {
                Name: editForm.name,
                ResourceType: getResourceTypeId(editForm.type),
                LinkOrInfo: editForm.url,
                TotalQuestions: editForm.totalQuestions,
                TopicId: resource.topicId || undefined
            }
            await studyResourceService.update(resource.id, updateData)

            // Refresh data
            const updated = await studyResourceService.getById(resource.id)
            setResource(updated)
            setIsEditing(false)
        } catch (err) {
            console.error('Failed to update resource:', err)
            alert('Güncelleme başarısız oldu.')
        }
    }

    const handleUpdateProgress = async () => {
        if (!resource || resource.resourceType !== 'QuestionBank') return

        const current = resource.solvedQuestions || 0
        const newCountStr = prompt('Toplam çözülen soru sayısı:', current.toString())

        if (newCountStr !== null) {
            const newCount = parseInt(newCountStr)
            if (isNaN(newCount)) return

            try {
                await studyResourceService.updateSolvedCount(resource.id, newCount)
                const updated = await studyResourceService.getById(resource.id)
                setResource(updated)
            } catch (error) {
                console.error('Failed to update progress:', error)
            }
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'Book': return <Book className="w-8 h-8 text-emerald-400" />
            case 'Video': return <Video className="w-8 h-8 text-red-400" />
            case 'QuestionBank': return <CheckCircle className="w-8 h-8 text-blue-400" />
            default: return <LinkIcon className="w-8 h-8 text-gray-400" />
        }
    }

    const getTypeName = (type: string) => {
        switch (type) {
            case 'Book': return 'Kitap'
            case 'Video': return 'Video'
            case 'QuestionBank': return 'Soru Bankası'
            case 'Link': return 'Link / Web'
            case 'Website': return 'Web Sitesi'
            case '0': return 'Link / Web' // Fallback
            default: return type
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
        )
    }

    if (!resource) {
        return (
            <div className="p-8">
                <div className="glass-panel p-8 text-center text-gray-400">
                    <p className="text-xl mb-4">Kaynak bulunamadı</p>
                    <button
                        onClick={() => navigate('/app/study-resources')}
                        className="px-6 py-3 rounded-xl font-semibold bg-emerald-500 text-black hover:bg-emerald-400 transition-colors"
                    >
                        Listeye Dön
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
            {/* Back Button */}
            <button
                onClick={() => navigate('/app/study-resources')}
                className="flex items-center gap-2 text-gray-400 hover:text-emerald-400 transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Kaynaklara Dön</span>
            </button>

            {/* Main Card */}
            <div className="glass-panel p-8 space-y-8 bg-dark-400 border border-white/10 rounded-2xl relative">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-6">
                        <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                            {getIcon(resource.resourceType)}
                        </div>
                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                    className="text-3xl font-bold bg-transparent border-b border-emerald-500 focus:outline-none text-white w-full"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold text-white">
                                    {resource.name}
                                </h1>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                                {isEditing ? (
                                    <select
                                        value={editForm.type}
                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                        className="bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-sm text-gray-300 focus:border-emerald-500 outline-none"
                                    >
                                        <option value="Book">Kitap</option>
                                        <option value="QuestionBank">Soru Bankası</option>
                                        <option value="Video">Video</option>
                                        <option value="Link">Link / Web</option>
                                    </select>
                                ) : (
                                    <span className="text-emerald-400 font-medium px-3 py-1 bg-emerald-500/10 rounded-full text-sm">
                                        {getTypeName(resource.resourceType)}
                                    </span>
                                )}

                                <span className="text-gray-500 text-sm">
                                    Eklenme: {new Date(resource.createdDate).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors font-medium"
                                >
                                    Kaydet
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors font-medium"
                                >
                                    İptal
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                    title="Sil"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="h-px bg-white/10" />

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* URL / Link */}
                    {/* Show link section if type is Video, Website, Link OR '0' (fallback) OR if editing */}
                    {(resource.resourceType === 'Video' || resource.resourceType === 'Link' || resource.resourceType === 'Website' || resource.resourceType === '0' || isEditing) && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Bağlantı URL</h3>
                            {isEditing ? (
                                <input
                                    type="url"
                                    value={editForm.url}
                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                    placeholder="https://..."
                                />
                            ) : (
                                resource.linkOrInfo ? (
                                    <a
                                        href={resource.linkOrInfo}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="flex items-center gap-2 text-emerald-400 hover:underline break-all"
                                    >
                                        <LinkIcon size={16} />
                                        {resource.linkOrInfo}
                                        <ExternalLink size={14} className="opacity-50" />
                                    </a>
                                ) : (
                                    <p className="text-gray-500 italic">Link eklenmemiş</p>
                                )
                            )}
                        </div>
                    )}

                    {/* Progress (Question Bank) */}
                    {(resource.resourceType === 'QuestionBank' || isEditing) && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Soru Takibi</h3>
                                {!isEditing && (
                                    <button
                                        onClick={handleUpdateProgress}
                                        className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                                    >
                                        + İlerlemeyi Güncelle
                                    </button>
                                )}
                            </div>

                            {isEditing ? (
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">Toplam Soru Sayısı</label>
                                    <input
                                        type="number"
                                        value={editForm.totalQuestions}
                                        onChange={(e) => setEditForm({ ...editForm, totalQuestions: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:border-emerald-500 outline-none"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white font-medium">
                                            {resource.solvedQuestions || 0} / {resource.totalQuestions || 0} Soru
                                        </span>
                                        <span className="text-gray-400">
                                            {Math.round(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100)}% Tamamlandı
                                        </span>
                                    </div>
                                    <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-500"
                                            style={{ width: `${Math.min(((resource.solvedQuestions || 0) / (resource.totalQuestions || 1)) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Additional Info / Topic */}
                {resource.topicName && (
                    <div className="pt-4 border-t border-white/10">
                        <p className="text-gray-400 text-sm">
                            İlişkili Konu: <span className="text-white font-medium ml-1">{resource.topicName}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default StudyResourceDetail
