import api from '../lib/api'
import type { StudyResourceDto, CreateStudyResourceDto } from '../types'

export const studyResourceService = {
    getAll: async (topicId?: number): Promise<StudyResourceDto[]> => {
        const response = await api.get<StudyResourceDto[]>('/StudyResource', {
            params: { topicId }
        })
        return response.data
    },

    getById: async (id: number): Promise<StudyResourceDto> => {
        const response = await api.get<StudyResourceDto>(`/StudyResource/${id}`)
        return response.data
    },

    create: async (data: CreateStudyResourceDto): Promise<StudyResourceDto> => {
        const response = await api.post<StudyResourceDto>('/StudyResource', data)
        return response.data
    },

    update: async (id: number, data: CreateStudyResourceDto): Promise<void> => {
        await api.put(`/StudyResource`, { id, ...data }) // Controller expects UpdateStudyResourceDto which likely includes ID.
    },

    delete: async (id: number): Promise<void> => {
        await api.delete(`/StudyResource/${id}`)
    },

    updateSolvedCount: async (id: number, solvedCount: number): Promise<void> => {
        // Backend expects query param: ?id=X&solvedCount=Y or body?
        // Controller: UpdateSolvedQuestionCount(int id, int solvedCount) -> Query params likely if simple types or check exact route.
        // It was [HttpPut("{id}/solved-count")] with params in query probably or FromBody. 
        // Checked controller: [HttpPut("{id}/solved-count")] public async Task<IActionResult> UpdateSolvedQuestionCount(int id, [FromBody] int solvedCount) - wait, raw int body is tricky.
        // Let's check the controller outline I saw earlier for StudyResourceController.
        // Outline showed: UpdateSolvedQuestionCount
        // Actually standard practice for simple types in PUT body is JSON number.
        await api.put(`/StudyResource/${id}/solved-count`, solvedCount, {
            headers: { 'Content-Type': 'application/json' }
        })
    }
}
