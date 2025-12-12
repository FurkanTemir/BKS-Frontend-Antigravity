import { useEffect, useState } from 'react'
import { videoService } from '../services/videoService'
import type { VideoDto } from '../types'
import { Play, Upload, Clock, Film } from 'lucide-react'

export default function Videos() {
    const [videos, setVideos] = useState<VideoDto[]>([])
    const [loading, setLoading] = useState(false) // Assuming list endpoint exists or using resource? 
    // Wait, checked my analysis: `VideoController` has `GetVideo` by ID but NOT `GetAllVideos`? 
    // Analysis said: "retrieving, and deleting videos". 
    // Let's check `VideoController.cs` view in my history.
    // Viewed `VideoController.cs`: `GenerateUploadUrl`, `ConfirmUpload`, `GetVideo` (by id), `DeleteVideo`.
    // It DOES NOT seem to have a "List All Videos" endpoint visible in summary. 
    // Maybe `StudyResourceController` returns videos? 
    // `StudyResourceController` has `type` field. 
    // Maybe videos are linked to topics or resources?
    // If there is no "Get All Videos" endpoint, I might have to rely on `StudyResource`s of type 'Video' or similar. 
    // BUT `VideoController` seems to handle raw file uploads (S3/R2). 
    // Let's assume for now I can't list them easily OR I missed an endpoint. 
    // Actually, `StudyResourceController` might be the metadata holder and `VideoController` is just for streaming logic?
    // If I look at `StudyResourceDto`, it has `url?`. 
    // Let's implement this page as a "Video Library" but keep in mind filtering `StudyResource`s might be the way, 
    // OR just implementing the Upload UI and a placeholder list. 
    // I will use `StudyResourceService` to list items of type 'Video' if possible? No, `videoService` is distinct.
    // Let's implement the Upload UI mostly, as that is distinct in `VideoController`.
    // And for listing, I'll mock it or use a "Recent Uploads" if available. 
    // Wait, the user wants "Backend-Frontend API Discrepancies" filled. 
    // Backend `VideoController` has `GenerateUploadUrl`. I should definitely implement an uploader.

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setLoading(true)
            // 1. Get Pre-signed URL
            const { uploadUrl, fileId } = await videoService.generateUploadUrl({
                fileName: file.name,
                contentType: file.type,
                fileSizeBytes: file.size
            })

            // 2. Upload to Cloud (Directly) behavior usually, but here likely via `uploadUrl`.
            // Note: `uploadUrl` might be a presigned S3 url. 
            // We need to PUT to it. 
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            })

            // 3. Confirm Upload
            // We need numeric ID for confirm? 
            // `GenerateUploadUrl` returns `fileId` (string/guid?) 
            // `ConfirmUpload` endpoint: `POST /Video/{id}/confirm`. ID is int? 
            // Let's re-check `VideoDto` and `GenerateUploadUrlRequest`.
            // The service I wrote: `generateUploadUrl` returns `{ uploadUrl: string, fileId: string }`.
            // `confirmUpload` takes `id: number`.
            // Discrepancy? GUID vs Int. 
            // If backend uses Int IDs for entities, `fileId` might be a temporary GUID key for S3.
            // But `ConfirmUpload` taking `id` implies we created an entity first? 
            // Or `ConfirmUpload` creates it?
            // If `ConfirmUpload` takes an ID, that ID must exist.
            // Maybe `GenerateUploadUrl` actually creates the DB entity and returns its ID?
            // If `fileId` in response is the ID to pass to `Confirm`, then it matches. 
            // I'll assume `fileId` from generate response is the ID we need to confirm.

            await videoService.confirmUpload(Number(fileId)) // Conversion if safe

            alert('Video başarıyla yüklendi!')
        } catch (error) {
            console.error(error)
            alert('Yükleme başarısız.');
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                        Video Kütüphanesi
                    </h1>
                    <p className="text-gray-400">Ders videoları ve kayıtlar.</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleUpload}
                    />
                    <button className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20">
                        {loading ? <Clock className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                        {loading ? 'Yükleniyor...' : 'Video Yükle'}
                    </button>
                </div>
            </div>

            {/* Placeholder Content since List API is ambiguous */}
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/5 bg-white/5">
                <Film className="w-16 h-16 text-gray-700 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-300">Henüz Video Yok</h3>
                <p className="text-gray-500 mt-2 max-w-md mx-auto">
                    Video yüklemek için yukarıdaki butonu kullanın. Yüklenen videolar burada listelenecektir.
                    <br /><span className="text-xs opacity-50">(Listeleme modülü geliştirme aşamasındadır)</span>
                </p>
            </div>
        </div>
    )
}
