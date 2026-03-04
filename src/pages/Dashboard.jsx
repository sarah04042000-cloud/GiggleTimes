import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getStories, getRiddles, getProgress } from '../services/api'
import StoryCard from '../components/StoryCard'
import { FiArrowRight, FiBook, FiBookOpen, FiHelpCircle, FiAward, FiUsers, FiShield, FiMusic } from 'react-icons/fi'
import { MdSportsEsports } from 'react-icons/md'

const QUICK = [
    { to: '/stories', emoji: '📚', label: 'Stories', bg: 'from-orange-400 to-pink-500', badge: 'Read now!' },
    { to: '/riddles', emoji: '🧩', label: 'Riddles', bg: 'from-purple-500 to-indigo-500', badge: 'Guess it!' },
    { to: '/songs', emoji: '🎵', label: 'Songs', bg: 'from-green-400 to-teal-500', badge: 'Play now!' },
    { to: '/quiz', emoji: '❓', label: 'Quiz', bg: 'from-yellow-400 to-orange-400', badge: '40+ Qs!' },
    { to: '/games', emoji: '🎮', label: 'Games', bg: 'from-blue-400 to-sky-400', badge: 'Play!' },
    { to: '/progress', emoji: '🏆', label: 'Progress', bg: 'from-rose-400 to-red-500', badge: 'My score' },
]

const FLOATIES = ['⭐', '🌈', '🦋', '🌸', '🎈', '🍭', '🌟', '🎀']

export default function Dashboard() {
    const { user, isAdmin, isParent } = useAuth()
    const [stories, setStories] = useState([])
    const [riddles, setRiddles] = useState([])
    const [progress, setProgress] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([getStories(), getRiddles(), getProgress()])
            .then(([sr, rd, pr]) => { setStories(sr.data); setRiddles(rd.data); setProgress(pr.data) })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    const categories = [...new Set(stories.map(s => s.category))].filter(Boolean)

    return (
        <div className="min-h-screen pt-16" style={{ background: '#FFF0F8' }}>

            {/* ── Hero Banner ────────────────────────────── */}
            <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#A855F7 0%,#F43F8E 40%,#FB923C 100%)' }}>
                {/* floating emojis */}
                {FLOATIES.map((em, i) => (
                    <span key={i} className="absolute text-3xl animate-float select-none pointer-events-none opacity-30"
                        style={{ top: `${10 + (i * 11) % 70}%`, left: `${(i * 13) % 90}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
                ))}
                <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16 text-white">
                    {/* role badge */}
                    <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-bold mb-4">
                        {isAdmin ? '🛡️ Admin' : isParent ? '👨‍👩‍👧 Parent' : '⭐ Kids'}
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black mb-3 drop-shadow-md">
                        Hello, <span className="text-yellow-300">{user?.username}</span>! 👋
                    </h1>
                    <p className="text-white/80 text-lg mb-6 max-w-lg">
                        Ready for stories, songs, riddles & games? Let's have fun! 🌟
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/stories" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                            <FiBook /> Browse Stories
                        </Link>
                        <Link to="/songs" className="inline-flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-2xl shadow-lg hover:scale-105 transition-transform">
                            🎵 Listen to Songs
                        </Link>
                        {isAdmin && <Link to="/admin" className="inline-flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-3 rounded-2xl hover:bg-white/30"><FiShield /> Admin</Link>}
                        {isParent && <Link to="/parent" className="inline-flex items-center gap-2 bg-white/20 text-white font-bold px-6 py-3 rounded-2xl hover:bg-white/30"><FiUsers /> Parent</Link>}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">

                {/* ── Quick Access Grid ───────────────────── */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 my-8">
                    {QUICK.map(({ to, emoji, label, bg, badge }) => (
                        <Link key={to} to={to}
                            className="group flex flex-col items-center gap-2 p-4 bg-white rounded-3xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border-2 border-transparent hover:border-kids-purple/20">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bg} flex items-center justify-center text-2xl shadow-lg group-hover:animate-pop`}>
                                {emoji}
                            </div>
                            <span className="text-xs font-black text-gray-700">{label}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">{badge}</span>
                        </Link>
                    ))}
                </div>

                {/* ── Progress Card ───────────────────────── */}
                {progress && (
                    <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-6 mb-8 text-white shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-black text-xl flex items-center gap-2">🏆 Your Progress</h2>
                            <Link to="/progress" className="text-sm bg-white/20 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-white/30">
                                View all <FiArrowRight size={12} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="bg-white/20 rounded-2xl py-3">
                                <p className="text-3xl font-black">{progress.points}</p>
                                <p className="text-xs text-white/70">Points ⭐</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl py-3">
                                <p className="text-3xl font-black">{progress.stories_completed}</p>
                                <p className="text-xs text-white/70">Stories 📖</p>
                            </div>
                            <div className="bg-white/20 rounded-2xl py-3">
                                <p className="text-3xl font-black">{progress.quizzes_taken}</p>
                                <p className="text-xs text-white/70">Quizzes 🎯</p>
                            </div>
                        </div>
                        {progress.badges?.length > 0 && (
                            <div className="mt-4 flex gap-2 flex-wrap">
                                {progress.badges.slice(0, 4).map(b => (
                                    <span key={b.id} className="text-xs bg-white/20 px-3 py-1 rounded-full font-bold">{b.emoji} {b.name}</span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Story Rows ─────────────────────────── */}
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <div className="animate-spin text-5xl">🌀</div>
                    </div>
                ) : (
                    <>
                        <ContentRow title="🌟 Featured Stories" to="/stories" items={stories.slice(0, 8)} />
                        {categories.map(cat => (
                            <ContentRow key={cat} title={`📚 ${cat} Stories`} to="/stories" items={stories.filter(s => s.category === cat).slice(0, 8)} />
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

function ContentRow({ title, to, items }) {
    if (!items.length) return null
    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-black" style={{ color: '#2D1B69' }}>{title}</h2>
                <Link to={to} className="flex items-center gap-1 text-sm font-bold text-kids-purple hover:text-purple-700">
                    See all <FiArrowRight size={14} />
                </Link>
            </div>
            <div className="row-scroll hide-scroll">
                {items.map((s, i) => <StoryCard key={s.id} story={s} index={i} />)}
            </div>
        </div>
    )
}
