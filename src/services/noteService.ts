import api from '../lib/api'
import type { NoteDto, CreateNoteDto } from '../types'

export const noteService = {
    getAll: async (): Promise<NoteDto[]> => {
        const response = await api.get<NoteDto[]>('/Note')
        return response.data
    },

    getById: async (id: number): Promise<NoteDto> => {
        const response = await api.get<NoteDto>(`/Note/${id}`)
        return response.data
    },

    create: async (data: CreateNoteDto): Promise<NoteDto> => {
        const response = await api.post<NoteDto>('/Note', data)
        return response.data
    },

    update: async (id: number, data: CreateNoteDto): Promise<NoteDto> => {
        const response = await api.put<NoteDto>(`/Note/${id}`, data)
        return response.data
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/Note/${id}`)
    },

    uploadFile: async (noteId: number, file: File): Promise<void> => {
        const formData = new FormData()
        formData.append('file', file)
        await api.post(`/Note/${noteId}/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        })
    },

    deleteFile: async (noteId: number): Promise<void> => {
        await api.delete(`/Note/${noteId}/file`)
    },

    deleteBulk: async (noteIds: number[]): Promise<void> => {
        await api.delete('/Note/bulk-delete', { data: { noteIds } })
    },

    getByCategory: async (category: string): Promise<NoteDto[]> => {
        const response = await api.get<NoteDto[]>('/Note/by-category', {
            params: { category }
        })
        return response.data
    },

    getByTag: async (tag: string): Promise<NoteDto[]> => {
        const response = await api.get<NoteDto[]>('/Note/by-tag', {
            params: { tag }
        })
        return response.data
    },

    getTags: async (): Promise<string[]> => {
        const response = await api.get<string[]>('/Note/tags')
        return response.data
    }
}
