import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { login } from '../services/api'
import { MdChildCare } from 'react-icons/md'
import { FiEye, FiEyeOff, FiUser, FiLock } from 'react-icons/fi'

export default function Login() {
    const [form, setForm] = useState({ username: '', password: '' })
    const [showPass, setShowPass] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const { loginUser } = useAuth()
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await login(form)
            loginUser(res.data.user, res.data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    function fillDemo(role) {
        const creds = {
            parent: { username: 'demo_parent', password: 'parent123' },
            kid: { username: 'demo_kid', password: 'kid123' },
            admin: { username: 'demo_admin', password: 'admin123' },
        }
        setForm(creds[role])
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFF0F8 0%, #EDE9FE 50%, #FCE7F3 100%)' }}>
            {/* Decorative blobs */}
            <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-40"
                style={{ background: '#DDD6FE', transform: 'translate(-50%,-50%)' }} />
            <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-40"
                style={{ background: '#FBCFE8', transform: 'translate(50%,50%)' }} />

            {/* Floating emojis */}
            {['⭐', '🌈', '🦋', '🌸', '🎈', '🍭'].map((em, i) => (
                <span key={i} className="absolute text-3xl animate-float select-none pointer-events-none opacity-50"
                    style={{ top: `${10 + (i * 14) % 75}%`, left: `${(i * 16) % 88}%`, animationDelay: `${i * 0.5}s` }}>{em}</span>
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
                    <p className="text-purple-500 font-semibold text-sm mt-1">Magical Adventures for Kids! 🌟</p>
                </div>

                {/* Card */}
                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <h1 className="text-2xl font-black mb-2" style={{ color: '#4C1D95' }}>Welcome Back! 👋</h1>
                    <p className="text-gray-500 text-sm mb-6">Sign in to continue your adventure</p>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-600 text-sm px-4 py-3 rounded-2xl mb-4 font-semibold">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                            <input
                                type="text"
                                placeholder="Username"
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
                                placeholder="Password"
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

                        <button type="submit" disabled={loading} className="btn-primary w-full mt-2 flex items-center justify-center gap-2 text-base py-3">
                            {loading ? <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-white" /> : '🚀'}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo quick-fill */}
                    <div className="mt-5">
                        <p className="text-xs text-gray-500 text-center mb-2 font-semibold">⚡ Quick demo login:</p>
                        <div className="flex gap-2 justify-center flex-wrap">
                            {['parent', 'kid', 'admin'].map((role) => (
                                <button
                                    key={role}
                                    onClick={() => fillDemo(role)}
                                    className="text-xs px-3 py-1.5 rounded-full font-bold transition-all capitalize"
                                    style={{ background: '#F3E8FF', color: '#7C3AED', border: '2px solid #DDD6FE' }}
                                >
                                    {role === 'parent' ? '👨‍👩‍👧' : role === 'kid' ? '🧒' : '🛡️'} {role}
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-black hover:underline" style={{ color: '#A855F7' }}>
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
