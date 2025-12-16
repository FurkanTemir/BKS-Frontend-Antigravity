
import { useState, useRef, useEffect } from 'react'
import { X, PenTool, Image as ImageIcon, Video, Send, Loader2, Upload, ChevronDown, Check, Search } from 'lucide-react'
import { postService } from '../services/postService'
import { videoService } from '../services/videoService'
import type { TopicDto, CreatePostDto } from '../types'

interface CreatePostModalProps {
    isOpen: boolean
    onClose: () => void
    topics: TopicDto[]
    onSuccess: () => void
}

const CreatePostModal = ({ isOpen, onClose, topics, onSuccess }: CreatePostModalProps) => {
    const [content, setContent] = useState('')
    const [selectedTopicId, setSelectedTopicId] = useState<number | ''>('')
    const [contentType, setContentType] = useState<number>(1) // Default: Note
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Combobox State
    const [searchQuery, setSearchQuery] = useState('')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    const filteredTopics = topics.filter(topic =>
        topic.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const handleTopicSelect = (topicId: number) => {
        setSelectedTopicId(topicId)
        setIsDropdownOpen(false)
        setSearchQuery('')
    }

    if (!isOpen) return null

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        const file = e.dataTransfer.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setImageFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleCreatePost = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content || !selectedTopicId) return

        setIsSubmitting(true)
        try {
            let videoId: number | undefined
            let imageUrl: string | undefined

            // Handle Video Upload if selected
            if (contentType === 5 && videoFile) {
                // 1. Generate Upload URL
                const { uploadUrl, videoId: generatedVideoId } = await videoService.generateUploadUrl({
                    fileName: videoFile.name,
                    contentType: videoFile.type,
                    fileSizeBytes: videoFile.size
                })

                // 2. Upload to R2
                await videoService.uploadFileToUrl(uploadUrl, videoFile)

                // 3. Confirm Upload
                await videoService.confirmUpload(generatedVideoId)
                videoId = generatedVideoId
            }
            // Handle Image Upload if selected
            else if (contentType !== 5 && imageFile) {
                // 1. Generate Upload URL via Post Service (Storage Controller)
                const { uploadUrl, publicUrl } = await postService.getUploadUrl(imageFile)

                // 2. Upload to R2
                await postService.uploadFileToR2(uploadUrl, imageFile)

                // 3. Set Image URL
                imageUrl = publicUrl
            }

            const postData: CreatePostDto = {
                content,
                topicId: Number(selectedTopicId),
                contentType,
                videoId, // Send the confirmed video ID
                imageUrl, // Send the uploaded image URL
                // imageFile: contentType !== 5 ? imageFile : null // No longer sending file to backend directly
            }

            // Create Post using updated service
            await postService.create(postData)

            // Reset form
            setContent('')
            setSelectedTopicId('')
            setImageFile(null)
            setImagePreview(null)
            setVideoFile(null)
            setContentType(1)

            onSuccess()
            onClose()

            alert('Gönderiniz oluşturuldu ve onay için adminlere iletildi.')
        } catch (err) {
            console.error('Failed to create post:', err)
            alert('Gönderi oluşturulurken bir hata oluştu.')
        } finally {
            setIsSubmitting(false)
        }
    }



    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="w-full max-w-2xl bg-[#1a1b26] border border-white/10 rounded-2xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <PenTool className="text-neon-cyan" size={24} />
                    Yeni Paylaşım Oluştur
                </h2>

                <form onSubmit={handleCreatePost} className="space-y-6">
                    {/* Topic Selection (Combobox) */}
                    <div className="space-y-2 relative" ref={dropdownRef}>
                        <label className="text-sm text-gray-400 ml-1">Konu Seç</label>

                        <div
                            className={`relative w-full bg-[#0f1115] border rounded-xl p-2 flex items-center gap-2 transition-all ${isDropdownOpen ? 'border-neon-cyan ring-1 ring-neon-cyan/50' : 'border-gray-800 hover:border-gray-700'}`}
                            onClick={() => {
                                setIsDropdownOpen(true)
                                inputRef.current?.focus()
                            }}
                        >
                            <Search className="text-gray-500 ml-2 shrink-0" size={18} />

                            {/* Selected Tag */}
                            {selectedTopicId && (
                                <div className="flex items-center gap-1 bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap animate-in fade-in zoom-in-95">
                                    {topics.find(t => t.id === selectedTopicId)?.name}
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            setSelectedTopicId('')
                                        }}
                                        className="hover:text-white transition-colors ml-1"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}

                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={selectedTopicId ? "" : "Konu ara veya seç..."}
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setIsDropdownOpen(true)
                                }}
                                onFocus={() => setIsDropdownOpen(true)}
                                className="bg-transparent text-gray-200 placeholder:text-gray-600 outline-none w-full text-sm h-8"
                            />

                            <ChevronDown
                                size={18}
                                className={`text-gray-500 mr-2 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                            />
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1e2128] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                <ul className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                                    {filteredTopics.length > 0 ? (
                                        filteredTopics.map(topic => (
                                            <li key={topic.id}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleTopicSelect(topic.id)}
                                                    className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${selectedTopicId === topic.id
                                                        ? 'bg-neon-cyan/10 text-neon-cyan active'
                                                        : 'text-gray-300 hover:bg-neon-cyan/5 hover:text-neon-cyan'
                                                        }`}
                                                >
                                                    {topic.name}
                                                    {selectedTopicId === topic.id && <Check size={16} />}
                                                </button>
                                            </li>
                                        ))
                                    ) : (
                                        <li className="px-4 py-8 text-center text-gray-500 text-sm">
                                            Sonuç bulunamadı.
                                        </li>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="Aklında ne var? Bir soru sor veya not paylaş..."
                        className="w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-neon-blue/50 focus:border-neon-blue outline-none resize-none min-h-[150px] transition-all"
                    />

                    <div className="space-y-2">
                        <label className="text-sm text-gray-400 ml-1">İçerik Türü</label>
                        <div className="flex gap-4">
                            <select
                                value={contentType}
                                onChange={(e) => setContentType(Number(e.target.value))}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-neon-blue/50 outline-none [&>option]:bg-[#1a1b26]"
                            >
                                <option value="1">Not / Yazı</option>
                                <option value="2">Soru Çözümü</option>
                                <option value="3">Görsel Çözüm</option>
                                <option value="4">Özet</option>
                                <option value="5">Video</option>
                            </select>
                        </div>
                    </div>

                    {/* Media Upload Area */}
                    <div className="relative">
                        {contentType === 5 ? (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Video Dosyası Yükle</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex items-center gap-2 px-4 py-8 bg-white/5 hover:bg-white/10 border-2 border-dashed border-white/10 hover:border-neon-cyan/50 rounded-xl cursor-pointer transition-all w-full justify-center flex-col group">
                                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <Video size={24} className="text-neon-cyan" />
                                        </div>
                                        <div className="text-center">
                                            <span className="text-gray-300 font-medium block">
                                                {videoFile ? videoFile.name : 'Video Yükle'}
                                            </span>
                                            <span className="text-xs text-gray-500 mt-1">MP4, WebM (Max 100MB)</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept="video/*"
                                            className="hidden"
                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <label className="text-sm text-gray-400 ml-1">Görsel Ekle (Opsiyonel)</label>
                                <div
                                    className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-xl hover:bg-white/5 hover:border-neon-blue/50 transition-all cursor-pointer overflow-hidden group"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <>
                                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                                    <Upload size={16} /> Değiştir
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="flex flex-col items-center text-center p-4">
                                            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <ImageIcon className="text-gray-400 group-hover:text-neon-blue" size={24} />
                                            </div>
                                            <p className="text-gray-300 font-medium">Görseli sürükle veya seç</p>
                                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF (Max 10MB)</p>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 text-gray-400 hover:text-white font-medium mr-4 transition-colors"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={!content || !selectedTopicId || isSubmitting}
                            className="flex items-center gap-2 px-8 py-2.5 bg-neon-blue text-black font-bold rounded-xl hover:bg-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-neon-blue/20"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                            Paylaş
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default CreatePostModal
