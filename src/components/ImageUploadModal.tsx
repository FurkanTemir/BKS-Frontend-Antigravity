
import { X, Loader2, Save } from 'lucide-react'
import { useState } from 'react'
import Cropper from 'react-easy-crop'
import getCroppedImg from '../utils/canvasUtils'

interface ImageUploadModalProps {
    isOpen: boolean
    onClose: () => void
    imageSrc: string | null
    onUpload: (croppedImageBlob: Blob) => Promise<void>
}

const ImageUploadModal = ({ isOpen, onClose, imageSrc, onUpload }: ImageUploadModalProps) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    const onCropComplete = (_: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }

    const handleSave = async () => {
        if (!imageSrc || !croppedAreaPixels) return

        try {
            setIsLoading(true)
            const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels)
            if (!croppedImageBlob) return

            await onUpload(croppedImageBlob)
            onClose()
        } catch (error) {
            console.error('Error cropping/uploading image:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen || !imageSrc) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-dark-300 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-white">Fotoğrafı Düzenle</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="relative h-80 w-full bg-black">
                    <Cropper
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                    />
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Yakınlaştır</label>
                        <input
                            type="range"
                            value={zoom}
                            min={1}
                            max={3}
                            step={0.1}
                            aria-labelledby="Zoom"
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full accent-neon-cyan"
                        />
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-2 px-4 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-white"
                        >
                            İptal
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className="flex-1 py-2 px-4 rounded-xl bg-neon-cyan text-dark-400 font-semibold hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            Kaydet
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ImageUploadModal
