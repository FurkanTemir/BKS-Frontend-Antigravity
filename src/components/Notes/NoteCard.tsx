import React from 'react'
import { Edit2, Trash2, Calendar, Tag } from 'lucide-react'
import type { NoteDto } from '../../types'

interface NoteCardProps {
    note: NoteDto
    categoryColor: string
    onEdit?: (note: NoteDto) => void
    onDelete?: (id: number) => void
    onClick?: (note: NoteDto) => void
}

export default function NoteCard({ note, categoryColor, onEdit, onDelete, onClick }: NoteCardProps) {
    // Format date nicely
    const formattedDate = new Date(note.createdDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    })

    return (
        <div
            onClick={() => onClick?.(note)}
            className="group relative bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 border-l-4 rounded-xl transition-all duration-300 cursor-pointer overflow-hidden hover:shadow-xl hover:-translate-y-1"
            style={{ borderLeftColor: categoryColor }}
        >
            {/* Background Glow Effect on Hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 pointer-events-none transition-opacity duration-300"
                style={{ backgroundColor: categoryColor }}
            />

            <div className="p-5 flex flex-col h-full">
                {/* Header */}
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-bold text-gray-100 line-clamp-1 group-hover:text-white transition-colors">
                        {note.title}
                    </h3>
                    {note.category && (
                        <span
                            className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                        >
                            {note.category}
                        </span>
                    )}
                </div>

                {/* Content Preview */}
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {note.content}
                </p>

                {/* Tags */}
                {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {note.tags.slice(0, 3).map((tag, index) => (
                            <span
                                key={index}
                                className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md bg-zinc-900 text-zinc-400 border border-zinc-800 group-hover:border-zinc-700 transition-colors"
                            >
                                <Tag className="w-3 h-3 opacity-50" />
                                {tag}
                            </span>
                        ))}
                        {note.tags.length > 3 && (
                            <span className="text-[10px] text-zinc-500 py-1 px-1">+{note.tags.length - 3}</span>
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800 mt-auto">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formattedDate}</span>
                    </div>

                    {/* Action Buttons (Visible on Hover) */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 translate-y-2 group-hover:translate-y-0">
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit?.(note)
                            }}
                            className="p-2 text-zinc-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors"
                            title="Düzenle"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete?.(note.id)
                            }}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
