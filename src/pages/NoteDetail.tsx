import { ArrowLeft, Calendar, Download, Edit, FileText, Loader2, Tag, Trash2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { noteService } from '../services/noteService'
import type { NoteDto, CreateNoteDto } from '../types'

const NoteDetail = () => {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [note, setNote] = useState<NoteDto | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editForm, setEditForm] = useState({
        title: '',
        content: '',
        category: '',
        tags: ''
    })

    useEffect(() => {
        if (id) {
            fetchNote(parseInt(id))
        }
    }, [id])

    const fetchNote = async (noteId: number) => {
        try {
            const data = await noteService.getById(noteId)
            setNote(data)
            setEditForm({
                title: data.title,
                content: data.content,
                category: data.category || '',
                tags: data.tags.join(', ')
            })
        } catch (err) {
            console.error('Failed to fetch note:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!note || !confirm('Bu notu silmek istediğinizden emin misiniz?')) return

        setIsDeleting(true)
        try {
            await noteService.delete(note.id)
            navigate('/app/notes')
        } catch (err) {
            console.error('Failed to delete note:', err)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleUpdate = async () => {
        if (!note) return

        try {
            const updateData: CreateNoteDto = {
                title: editForm.title,
                content: editForm.content,
                category: editForm.category || undefined,
                tags: editForm.tags.split(',').map(t => t.trim()).filter(t => t)
            }
            const updated = await noteService.update(note.id, updateData)
            setNote(updated)
            setIsEditing(false)
        } catch (err) {
            console.error('Failed to update note:', err)
        }
    }

    const handleDownloadFile = () => {
        if (note?.filePath) {
            window.open(`http://localhost:5166${note.filePath}`, '_blank')
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
            </div>
        )
    }

    if (!note) {
        return (
            <div className="p-8">
                <div className="glass-card p-8 text-center text-gray-400">
                    <p className="text-xl mb-4">Not bulunamadı</p>
                    <button
                        onClick={() => navigate('/app/notes')}
                        className="px-6 py-3 rounded-xl font-semibold bg-gradient-to-r from-neon-purple to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
                    >
                        Notlara Dön
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8 max-w-4xl mx-auto">
            {/* Back Button */}
            <button
                onClick={() => navigate('/app/notes')}
                className="flex items-center gap-2 text-gray-400 hover:text-neon-purple transition-colors group"
            >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                <span>Notlara Dön</span>
            </button>

            {/* Main Card */}
            <div className="glass-card p-8 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                            <FileText className="text-white" size={28} />
                        </div>
                        <div>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="text-3xl font-bold bg-transparent border-b-2 border-neon-purple focus:outline-none text-white"
                                />
                            ) : (
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-purple to-pink-500 bg-clip-text text-transparent">
                                    {note.title}
                                </h1>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                                <span className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(note.createdDate).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </span>
                                {note.updatedDate && (
                                    <span className="text-gray-500">
                                        (Güncellendi: {new Date(note.updatedDate).toLocaleDateString('tr-TR')})
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <button
                                    onClick={handleUpdate}
                                    className="px-4 py-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
                                >
                                    Kaydet
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
                                >
                                    İptal
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="p-2 rounded-lg bg-neon-purple/20 text-neon-purple hover:bg-neon-purple/30 transition-colors"
                                    title="Düzenle"
                                >
                                    <Edit size={20} />
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                                    title="Sil"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Category & Tags */}
                <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                        <div className="flex gap-4 w-full">
                            <div className="flex-1">
                                <label className="block text-sm text-gray-400 mb-1">Kategori</label>
                                <input
                                    type="text"
                                    value={editForm.category}
                                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                    className="w-full px-3 py-2 bg-dark-300/50 border border-neon-purple/30 rounded-lg text-white focus:outline-none focus:border-neon-purple"
                                    placeholder="Kategori"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm text-gray-400 mb-1">Etiketler</label>
                                <input
                                    type="text"
                                    value={editForm.tags}
                                    onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                                    className="w-full px-3 py-2 bg-dark-300/50 border border-neon-purple/30 rounded-lg text-white focus:outline-none focus:border-neon-purple"
                                    placeholder="Virgülle ayırın"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            {note.category && (
                                <span className="px-3 py-1.5 rounded-lg text-sm font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/30">
                                    {note.category}
                                </span>
                            )}
                            {note.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white/5 text-gray-300 border border-white/10 flex items-center gap-1"
                                >
                                    <Tag size={12} />
                                    {tag}
                                </span>
                            ))}
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="border-t border-white/10 pt-6">
                    {isEditing ? (
                        <textarea
                            value={editForm.content}
                            onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                            className="w-full min-h-[300px] px-4 py-3 bg-dark-300/50 border border-neon-purple/30 rounded-xl text-white focus:outline-none focus:border-neon-purple"
                            placeholder="Not içeriği..."
                        />
                    ) : (
                        <div className="text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap font-light text-lg">
                            {note.content}
                        </div>
                    )}
                </div>

                {/* File Attachment Card */}
                {note.filePath && (
                    <div className="border-t border-white/10 pt-6 animate-in slide-in-from-bottom-2 duration-500">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Ekli Dosya</h3>

                        <div className="group relative overflow-hidden bg-[#161825] border border-gray-800 rounded-2xl hover:border-neon-purple/50 transition-all duration-300">
                            {/* Background Glow */}
                            <div className="absolute inset-0 bg-gradient-to-r from-neon-purple/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                            <div className="flex flex-col sm:flex-row items-center gap-6 p-6">
                                {/* Icon / Thumbnail Box */}
                                <div className="relative shrink-0 w-full sm:w-24 h-24 bg-black/40 rounded-xl flex items-center justify-center border border-white/5 overflow-hidden">
                                    {['.jpg', '.jpeg', '.png', '.gif', '.webp'].some(ext => note.filePath?.toLowerCase().endsWith(ext)) ? (
                                        <img
                                            src={`http://localhost:5166${note.filePath}`}
                                            alt={note.fileName}
                                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <FileText className="w-10 h-10 text-gray-500 group-hover:text-neon-purple transition-colors" />
                                    )}
                                </div>

                                {/* File Info */}
                                <div className="flex-1 text-center sm:text-left space-y-1 z-10">
                                    <h4 className="text-lg font-bold text-white group-hover:text-neon-purple transition-colors line-clamp-1" title={note.fileName}>
                                        {note.fileName || 'Dosya'}
                                    </h4>
                                    <p className="text-sm text-gray-400 font-mono">
                                        {note.fileType || 'Bilinmeyen Dosya Türü'}
                                    </p>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={handleDownloadFile}
                                    className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-neon-purple text-black hover:bg-white hover:scale-105 shadow-lg shadow-neon-purple/20 transition-all active:scale-95"
                                >
                                    <Download size={18} />
                                    <span>İndir</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Topic Info */}
                {note.topicName && (
                    <div className="border-t border-white/10 pt-6">
                        <p className="text-sm text-gray-400">
                            İlişkili Konu: <span className="text-neon-purple">{note.topicName}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default NoteDetail
