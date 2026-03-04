import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import { FiBook, FiBookOpen, FiHelpCircle, FiUser, FiLogOut, FiShield, FiMenu, FiX, FiAward, FiUsers, FiMusic } from 'react-icons/fi'
import { MdChildCare, MdSportsEsports } from 'react-icons/md'

export default function Navbar() {
    const { user, logoutUser, isAdmin, isParent } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const [menuOpen, setMenuOpen] = useState(false)

    function handleLogout() { logoutUser(); navigate('/login') }

    const NAV_LINKS = [
        { to: '/stories', label: 'Stories', icon: '📚', color: 'text-orange-500' },
        { to: '/riddles', label: 'Riddles', icon: '🧩', color: 'text-purple-500' },
        { to: '/songs', label: 'Songs', icon: '🎵', color: 'text-green-500' },
        { to: '/quiz', label: 'Quiz', icon: '❓', color: 'text-yellow-500' },
        { to: '/games', label: 'Games', icon: '🎮', color: 'text-blue-500' },
        { to: '/progress', label: 'Progress', icon: '🏆', color: 'text-rose-500' },
        ...(!isParent && !isAdmin ? [] : [{ to: '/account', label: 'Account', icon: '👤', color: 'text-gray-500' }]),
    ]

    const isActive = (to) => location.pathname === to

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-purple-100 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link to="/dashboard" className="flex items-center gap-2 group">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-kids-purple to-kids-pink flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <MdChildCare className="text-white text-xl" />
                        </div>
                        <span className="text-xl font-black tracking-tight">
                            <span className="text-kids-purple">Giggle</span>
                            <span className="text-kids-pink">Times</span>
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({ to, label, icon, color }) => (
                            <Link key={to} to={to}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all duration-200
                                    ${isActive(to)
                                        ? 'bg-purple-100 text-kids-purple shadow-inner'
                                        : `text-gray-500 hover:bg-purple-50 hover:${color}`}`}>
                                <span>{icon}</span>{label}
                            </Link>
                        ))}
                        {isParent && (
                            <Link to="/parent" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/parent') ? 'bg-green-100 text-green-600' : 'text-green-500 hover:bg-green-50'}`}>
                                <FiUsers size={14} />Parent
                            </Link>
                        )}
                        {isAdmin && (
                            <Link to="/admin" className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all ${isActive('/admin') ? 'bg-yellow-100 text-yellow-600' : 'text-yellow-500 hover:bg-yellow-50'}`}>
                                <FiShield size={14} />Admin
                            </Link>
                        )}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-purple-50 border-2 border-purple-100 rounded-2xl px-3 py-1.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kids-purple to-kids-pink flex items-center justify-center text-sm font-black text-white shadow">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                                <p className="text-sm font-black text-gray-800 leading-none">{user?.username}</p>
                                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
                            <FiLogOut size={14} />Logout
                        </button>
                    </div>

                    {/* Mobile toggle */}
                    <button className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-purple-50 transition-all" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden bg-white border-t-2 border-purple-100 px-4 py-4">
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        {NAV_LINKS.map(({ to, label, icon }) => (
                            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
                                className={`flex flex-col items-center gap-1 p-3 rounded-2xl text-xs font-bold transition-all
                                    ${isActive(to) ? 'bg-purple-100 text-kids-purple' : 'text-gray-500 hover:bg-purple-50'}`}>
                                <span className="text-xl">{icon}</span>{label}
                            </Link>
                        ))}
                    </div>
                    <div className="border-t border-purple-100 pt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-kids-purple to-kids-pink flex items-center justify-center text-sm font-black text-white">
                                {user?.username?.[0]?.toUpperCase()}
                            </div>
                            <span className="font-bold text-gray-700 text-sm">{user?.username}</span>
                        </div>
                        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-400 rounded-xl hover:bg-red-50">
                            <FiLogOut size={16} />Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    )
}
