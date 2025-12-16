import { FileText, Loader2, Plus, Search, Tag, Upload, X, Bold, Italic, List, Link } from 'lucide-react'
import NoteCard from '../components/Notes/NoteCard'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { noteService } from '../services/noteService'
import type { NoteDto, CreateNoteDto } from '../types'

const Notes = () => {
    const navigate = useNavigate()
    const [notes, setNotes] = useState<NoteDto[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    const [formData, setFormData] = useState<CreateNoteDto & { file?: File }>({
        title: '',
        content: '',
        category: '',
        tags: [],
        file: undefined,
    })
    const [tagsInput, setTagsInput] = useState('')

    // Generate consistent colors for categories
    const getCategoryColor = (category?: string) => {
        if (!category) return '#3f3f46' // zinc-700
        const colors = [
            '#ef4444', // red
            '#f97316', // orange
            '#eab308', // yellow
            '#22c55e', // green
            '#06b6d4', // cyan
            '#3b82f6', // blue
            '#a855f7', // purple
            '#ec4899'  // pink
        ]
        let hash = 0
        for (let i = 0; i < category.length; i++) {
            hash = category.charCodeAt(i) + ((hash << 5) - hash)
        }
        return colors[Math.abs(hash) % colors.length]
    }

    useEffect(() => {
        fetchNotes()
    }, [])

    const fetchNotes = async () => {
        try {
            const data = await noteService.getAll()
            setNotes(data)
        } catch (err) {
            console.error('Failed to fetch notes:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] })
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t)
            const noteData: CreateNoteDto = {
                title: formData.title,
                content: formData.content,
                category: formData.category || undefined,
                tags,
            }

            const newNote = await noteService.create(noteData)

            // Upload file if exists
            if (formData.file) {
                await noteService.uploadFile(newNote.id, formData.file)
            }

            setNotes([newNote, ...notes])
            setIsModalOpen(false)
            resetForm()
        } catch (err) {
            console.error('Failed to create note:', err)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            await noteService.delete(id)
            setNotes(notes.filter(n => n.id !== id))
        } catch (err) {
            console.error('Failed to delete note:', err)
        }
    }

    const resetForm = () => {
        setFormData({ title: '', content: '', category: '', tags: [], file: undefined })
        setTagsInput('')
    }

    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-neon-purple" />
            </div>
        )
    }

    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <header className="flex items-center justify-between">
                <div className="space-y-2">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-neon-purple to-pink-500 bg-clip-text text-transparent">
                        Notlarım
                    </h1>
                    <p className="text-gray-400 text-lg">Ders notlarınızı düzenleyin ve saklayın</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-4 rounded-xl font-semibold bg-gradient-to-r from-neon-purple to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-2"
                >
                    <Plus size={20} />
                    Yeni Not
                </button>
            </header>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                    type="text"
                    placeholder="Notlarda ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-glass border border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none transition-all"
                />
            </div>

            {/* Masonry Layout */}
            {filteredNotes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center glass-card border border-white/5 rounded-2xl">
                    <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-zinc-500" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-300 mb-2">
                        {searchTerm ? 'Not bulunamadı' : 'Henüz notunuz yok'}
                    </h3>
                    <p className="text-gray-500 max-w-sm">
                        {searchTerm
                            ? 'Arama kriterlerinize uygun not bulunamadı.'
                            : 'Yeni bir not ekleyerek başlayın. Sağ üstteki "Yeni Not" butonunu kullanabilirsiniz.'}
                    </p>
                </div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {filteredNotes.map((note) => (
                        <div key={note.id} className="break-inside-avoid">
                            <NoteCard
                                note={note}
                                categoryColor={getCategoryColor(note.category)}
                                onClick={(n) => navigate(`/app/notes/${n.id}`)}
                                onDelete={handleDelete}
                                onEdit={(n) => {
                                    /* Handle Edit if needed, currently opens detail on click */
                                    navigate(`/app/notes/${n.id}`)
                                }}
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Add Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="relative w-full max-w-2xl bg-[#11121C] border border-gray-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 bg-[#11121C]">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-cyan-400" />
                                Yeni Not Oluştur
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto max-h-[80vh]">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Title Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Başlık</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-zinc-600"
                                        placeholder="Not başlığı..."
                                        required
                                    />
                                </div>

                                {/* Rich Text Style Content */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">İçerik</label>
                                    <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl overflow-hidden focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/50 transition-all">
                                        {/* Fake Toolbar */}
                                        <div className="flex items-center gap-1 p-2 border-b border-zinc-700/50 bg-zinc-800/80">
                                            <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Bold">
                                                <Bold size={16} />
                                            </button>
                                            <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Italic">
                                                <Italic size={16} />
                                            </button>
                                            <div className="w-px h-4 bg-zinc-700 mx-1" />
                                            <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="List">
                                                <List size={16} />
                                            </button>
                                            <button type="button" className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded transition-colors" title="Link">
                                                <Link size={16} />
                                            </button>
                                        </div>
                                        <textarea
                                            value={formData.content}
                                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                            className="w-full px-4 py-3 bg-transparent border-none text-white focus:ring-0 outline-none min-h-[150px] placeholder:text-zinc-600 resize-y"
                                            placeholder="Notunuzu buraya yazın..."
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Category & Tags Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Kategori</label>
                                        <input
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-zinc-600"
                                            placeholder="Örn: Matematik"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-400 ml-1">Etiketler</label>
                                        <div className="relative">
                                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                                            <input
                                                type="text"
                                                value={tagsInput}
                                                onChange={(e) => setTagsInput(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none transition-all placeholder:text-zinc-600"
                                                placeholder="Virgülle ayırın..."
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Drag & Drop File Input */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-400 ml-1">Dosya Ekle</label>
                                    <div className="relative group border-2 border-dashed border-zinc-700 hover:border-cyan-500/50 rounded-xl p-8 transition-all bg-zinc-800/20 hover:bg-zinc-800/50 text-center cursor-pointer">
                                        <input
                                            type="file"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="flex flex-col items-center gap-2 group-hover:-translate-y-1 transition-transform duration-300">
                                            <div className="p-3 bg-zinc-800 rounded-full group-hover:bg-cyan-500/20 transition-colors">
                                                <Upload className="w-6 h-6 text-zinc-400 group-hover:text-cyan-400 transition-colors" />
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                                                    {formData.file ? formData.file.name : 'Dosya yüklemek için tıklayın'}
                                                </p>
                                                {!formData.file && (
                                                    <p className="text-xs text-gray-500">veya sürükleyip bırakın</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Actions */}
                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-800/50">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-2.5 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-6 py-2.5 rounded-xl font-bold bg-cyan-500 text-black hover:bg-cyan-400 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Kaydediliyor...</span>
                                            </div>
                                        ) : (
                                            'Not Oluştur'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div >
    )
}

export default Notes
