import { useState, useRef, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'

interface CommentFormProps {
    onSubmit: (content: string) => Promise<void>
    onCancel?: () => void
    initialValue?: string
    placeholder?: string
    isSubmitting?: boolean
    autoFocus?: boolean
    submitLabel?: string
    showCancel?: boolean
}

const CommentForm = ({
    onSubmit,
    onCancel,
    initialValue = '',
    placeholder = 'Yorumunuzu buraya yazın...',
    isSubmitting = false,
    autoFocus = false,
    submitLabel = 'Gönder',
    showCancel = false
}: CommentFormProps) => {
    const [content, setContent] = useState(initialValue)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus()
            // Set cursor to end
            textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length)
        }
    }, [autoFocus])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content.trim() || isSubmitting) return

        await onSubmit(content)
        setContent('')
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-4 items-start w-full animate-in fade-in duration-300">
            <div className="flex-1">
                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={placeholder}
                    className="w-full bg-[#0f1115] border border-white/5 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:border-neon-cyan text-gray-200 placeholder:text-gray-600 resize-none min-h-[80px] text-sm transition-all duration-200"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit(e)
                        }
                    }}
                />
            </div>
            <div className="flex flex-col gap-2">
                <button
                    type="submit"
                    disabled={!content.trim() || isSubmitting}
                    className="p-3 rounded-lg bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-semibold hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-neon-cyan/20 flex items-center justify-center min-w-[44px]"
                    title={submitLabel}
                >
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
                {(showCancel || onCancel) && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-2 rounded-lg text-gray-500 hover:text-gray-300 transition-colors text-xs font-medium"
                    >
                        İptal
                    </button>
                )}
            </div>
        </form>
    )
}

export default CommentForm
