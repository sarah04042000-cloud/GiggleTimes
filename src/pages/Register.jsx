import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { register } from '../services/api'
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi'

const ROLES = [
    { value: 'parent', label: '👨‍👩‍👧 Parent', desc: 'Manage kids & subscription' },
    { value: 'kid', label: '🧒 Kid', desc: 'Listen & play quizzes' },
]

export default function Register() {
    const [form, setForm] = useState({ username: '', password: '', role: 'parent' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }
        setLoading(true)
        try {
            const res = await register(form)
            loginUser(res.data.user, res.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFF0F8 0%, #EDE9FE 50%, #FCE7F3 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-40"
                style={{ background: '#DDD6FE', transform: 'translate(50%,-50%)' }} />
            <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-40"
                style={{ background: '#FBCFE8', transform: 'translate(-50%,50%)' }} />

            {/* Floating emojis */}
            {['🌟', '🎀', '🌈', '🎮', '📚', '🏆'].map((em, i) => (
                <span key={i} className="absolute text-3xl animate-float select-none pointer-events-none opacity-50"
                    style={{ top: `${15 + (i * 13) % 70}%`, left: `${(i * 15) % 88}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
            ))}

            <div className="w-full max-w-md animate-slide-up relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-2">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xl text-3xl"
                            style={{ background: 'linear-gradient(135deg,#A855F7,#F43F8E)' }}>
                            🎉
                        </div>
                        <span className="text-3xl font-black">
                            <span style={{ color: '#A855F7' }}>Giggle</span>
                            <span style={{ color: '#F43F8E' }}>Times</span>
                        </span>
                    </div>
                    <p className="text-purple-500 font-semibold text-sm mt-1">Create your account to get started!</p>
                </div>

                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <h1 className="text-2xl font-black mb-2" style={{ color: '#4C1D95' }}>Create Account ✨</h1>
                    <p className="text-gray-500 text-sm mb-6">Join the fun — choose your role!</p>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4 font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* Role Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        {ROLES.map((r) => (
                            <button
                                key={r.value}
                                type="button"
                                onClick={() => setForm({ ...form, role: r.value })}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${form.role === r.value
                                        ? 'border-kids-purple shadow-md'
                                        : 'border-purple-100 hover:border-purple-300'
                                    }`}
                                style={{
                                    background: form.role === r.value
                                        ? 'linear-gradient(135deg,#F3E8FF,#FCE7F3)'
                                        : '#FAFAFA',
                                }}
                            >
                                <div className="text-sm font-black" style={{ color: '#4C1D95' }}>{r.label}</div>
                                <div className="text-xs mt-1 text-gray-500">{r.desc}</div>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Choose a username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value })}
                                className="input-field pl-10"
                                required
                            />
                        </div>
                        <div className="relative">
                            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                            <input
                                type={showPass ? 'text' : 'password'}
                                placeholder="Password (min. 6 characters)"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                className="input-field pl-10 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-purple-600"
                            >
                                {showPass ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2 text-base py-3"
                        >
                            {loading && (
                                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" />
                            )}
                            {loading ? 'Creating Account...' : '🌟 Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="font-black hover:underline" style={{ color: '#A855F7' }}>
                            Sign In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
