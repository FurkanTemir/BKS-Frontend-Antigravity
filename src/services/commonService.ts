import api from '../lib/api'
import type { UndoDto } from '../types'

export const commonService = {
    undo: async (undoHistoryId: number): Promise<void> => {
        await api.post('/Common/undo', { undoHistoryId })
    },

    getAvailableUndos: async (): Promise<UndoDto[]> => {
        const response = await api.get<UndoDto[]>('/Common/available-undos')
        return response.data
    }
}
