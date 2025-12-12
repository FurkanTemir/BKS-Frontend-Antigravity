import { FileText, Loader2, Plus, Search, Tag, Trash2, Upload, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { noteService } from '../services/noteService'
import type { NoteDto, CreateNoteDto } from '../types'

const Notes = () => {
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

            {/* Notes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredNotes.length === 0 ? (
                    <div className="col-span-full glass-card p-8 text-center text-gray-400">
                        {searchTerm ? 'Arama sonucu bulunamadı' : 'Henüz not eklenmemiş'}
                    </div>
                ) : (
                    filteredNotes.map((note) => (
                        <div key={note.id} className="glass-card p-6 flex flex-col group hover:border-neon-purple/30 transition-all duration-300">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-neon-purple to-pink-500 flex items-center justify-center">
                                        <FileText className="text-white" size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-neon-purple transition-colors">
                                            {note.title}
                                        </h3>
                                        <p className="text-xs text-gray-400">
                                            {new Date(note.createdDate).toLocaleDateString('tr-TR')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 text-sm mb-6 line-clamp-3 flex-1">{note.content}</p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                                {note.category && (
                                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-neon-purple/20 text-neon-purple border border-neon-purple/20">
                                        {note.category}
                                    </span>
                                )}
                                {note.tags.slice(0, 3).map((tag) => (
                                    <span key={tag} className="px-2 py-1 rounded-md text-xs font-medium bg-white/5 text-gray-300 border border-white/10">
                                        #{tag}
                                    </span>
                                ))}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                <span className="text-xs text-gray-500">
                                    {note.topicName || 'Genel'}
                                </span>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Note Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="glass-card max-w-2xl w-full p-8 relative border-2 border-white/10">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-neon-purple transition-colors"
                        >
                            <X size={24} />
                        </button>

                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-purple to-pink-500 bg-clip-text text-transparent">
                            Not Oluştur
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Başlık</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                    placeholder="Not başlığı..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">İçerik</label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all min-h-[150px]"
                                    placeholder="Buraya yazın..."
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Kategori</label>
                                    <input
                                        type="text"
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                        placeholder="Örn: Matematik"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-2">Etiketler</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            type="text"
                                            value={tagsInput}
                                            onChange={(e) => setTagsInput(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all"
                                            placeholder="Virgülle ayırın..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-400 mb-2">Dosya Ekle</label>
                                <div className="relative border-2 border-dashed border-gray-600 rounded-xl p-8 hover:border-neon-purple transition-colors text-center cursor-pointer group">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <Upload className="mx-auto text-gray-400 group-hover:text-neon-purple mb-2 transition-colors" size={32} />
                                    <p className="text-gray-400 group-hover:text-white transition-colors">
                                        {formData.file ? formData.file.name : 'Dosya seçmek için tıklayın'}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-purple to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Notes
