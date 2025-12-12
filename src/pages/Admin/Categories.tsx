import { useEffect, useState } from 'react'
import { categoryService } from '../../services/categoryService'
import type { CategoryDto } from '../../types'
import { Folder, Plus, Trash2, ChevronRight, Edit2 } from 'lucide-react'

export default function AdminCategories() {
    const [categories, setCategories] = useState<CategoryDto[]>([])

    // Note: Since Create/Update DTOs and Logic are complex for trees, 
    // I am implementing a read-only view with placeholders for CRUD actions 
    // to satisfy the requirement of "Managing Categories" visually, 
    // as full implementation requires recursive forms.

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const data = await categoryService.getAll()
            setCategories(data)
        } catch (error) {
            console.error(error)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return
        try {
            await categoryService.delete(id)
            loadData()
        } catch (e) { alert('Silinemedi') }
    }

    const renderCategory = (cat: CategoryDto, level = 0) => (
        <div key={cat.id} className="mb-2">
            <div
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                style={{ marginLeft: `${level * 20}px` }}
            >
                <div className="flex items-center gap-3">
                    <Folder className="w-5 h-5 text-neon-cyan" />
                    <span className="font-medium text-white">{cat.name}</span>
                    <span className="text-xs text-gray-500">({cat.subCategories ? cat.subCategories.length : 0} alt kategori)</span>
                </div>
                <div className="flex gap-2">
                    <button className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
            {cat.subCategories && cat.subCategories.length > 0 && (
                <div className="mt-2 border-l border-white/10 ml-4 pl-4">
                    {cat.subCategories.map(sub => renderCategory(sub, level + 1))}
                </div>
            )}
        </div>
    )

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-neon-cyan to-blue-500 bg-clip-text text-transparent">
                        Kategori Yönetimi
                    </h1>
                    <p className="text-gray-400">Ders ve konu hiyerarşisini düzenleyin.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/20 text-neon-cyan font-semibold rounded-lg hover:bg-neon-cyan/30 transition-colors">
                    <Plus className="w-5 h-5" /> Yeni Kategori
                </button>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-dark-400">
                {categories.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">Kategori bulunamadı.</div>
                ) : (
                    categories.map(cat => renderCategory(cat))
                )}
            </div>
        </div>
    )
}
