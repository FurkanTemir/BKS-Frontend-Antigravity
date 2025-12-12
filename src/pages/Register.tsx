import { Eye, EyeOff, GraduationCap, Lock, Mail, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/authService'
import { useAuthStore } from '../stores/authStore'

const Register = () => {
    const navigate = useNavigate()
    const login = useAuthStore((state) => state.login)

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        fieldType: 1, // 1: Sayısal
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)

        try {
            const response = await authService.register(formData)
            // Backend returns flat fields, construct user object
            const user = {
                id: response.userId,
                email: response.email,
                firstName: response.firstName,
                lastName: response.lastName,
                userName: response.userName,
                fieldType: response.fieldType?.toString() || 'Sayısal'
            }
            login(user, response.token, response.refreshToken)
            navigate('/app/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Kayıt başarısız')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Abstract background shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-neon-purple/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-neon-cyan/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/3 h-1/3 bg-neon-blue/5 rounded-full blur-2xl" />
            </div>

            {/* Register Card */}
            <div className="glass-card w-full max-w-md p-8 relative z-10 border-2 border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-neon-purple to-neon-cyan bg-clip-text text-transparent">
                        Kayıt Ol
                    </h1>
                    <p className="text-gray-400 mt-2">Bireysel Kariyer Sistemi'ne katıl</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Ad</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                <input
                                    type="text"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none transition-all"
                                    placeholder="Adınız"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Soyad</label>
                            <input
                                type="text"
                                value={formData.lastName}
                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                className="w-full px-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none transition-all"
                                placeholder="Soyadınız"
                                required
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">E-posta</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none transition-all"
                                placeholder="ornek@email.com"
                                required
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Şifre</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full pl-12 pr-12 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white placeholder-gray-500 focus:border-neon-purple focus:outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-neon-purple transition-colors"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">En az 8 karakter, büyük/küçük harf, rakam ve sembol</p>
                    </div>

                    {/* Field Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Alan</label>
                        <div className="relative">
                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                            <select
                                value={formData.fieldType}
                                onChange={(e) => setFormData({ ...formData, fieldType: parseInt(e.target.value) })}
                                className="w-full pl-12 pr-4 py-3 bg-dark-300/50 border-2 border-neon-purple/30 rounded-xl text-white focus:border-neon-purple focus:outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value={1}>Sayısal</option>
                                <option value={2}>Sözel</option>
                                <option value={3}>Eşit Ağırlık</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-4 rounded-xl font-semibold text-lg bg-gradient-to-r from-neon-purple to-neon-cyan text-white hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        {isLoading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400">
                        Zaten hesabın var mı?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-neon-cyan hover:underline font-medium"
                        >
                            Giriş Yap
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
