import { useEffect, useState } from 'react'
import { getRiddles } from '../services/api'

const DIFF_CFG = {
    Easy: { gradient: 'from-emerald-400 to-green-300', badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200' },
    Medium: { gradient: 'from-amber-400 to-yellow-300', badge: 'bg-amber-100 text-amber-700 border border-amber-200' },
    Hard: { gradient: 'from-rose-400 to-red-300', badge: 'bg-rose-100 text-rose-700 border border-rose-200' },
}

function RiddleCard({ riddle, onReveal, revealed }) {
    const cfg = DIFF_CFG[riddle.difficulty] || DIFF_CFG.Easy
    return (
        <div
            className="rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:scale-[1.02]"
            style={{
                background: revealed
                    ? 'linear-gradient(135deg,#F3E8FF,#FCE7F3)'
                    : '#FFFFFF',
                border: `2px solid ${revealed ? '#C084FC' : '#E9D5FF'}`,
                boxShadow: revealed ? '0 4px 20px rgba(168,85,247,0.18)' : '0 2px 8px rgba(168,85,247,0.07)',
            }}
            onClick={() => !revealed && onReveal(riddle.id)}
        >
            <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cfg.gradient} flex items-center justify-center text-2xl flex-shrink-0 shadow-md`}>
                    {riddle.emoji || '🧩'}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${cfg.badge}`}>{riddle.difficulty}</span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-purple-50 text-purple-600">{riddle.category}</span>
                    </div>
                    <p className="font-bold text-sm leading-snug" style={{ color: '#2D1B69' }}>{riddle.question}</p>
                </div>
            </div>

            {riddle.hint && !revealed && (
                <p className="text-gray-500 text-xs mb-3 italic bg-yellow-50 px-3 py-1.5 rounded-xl">💡 Hint: {riddle.hint}</p>
            )}

            {revealed ? (
                <div className="mt-3 rounded-xl px-4 py-3"
                    style={{ background: 'linear-gradient(135deg,#EDE9FE,#FCE7F3)', border: '2px solid #C084FC' }}>
                    <p className="text-xs text-purple-500 font-bold mb-0.5">Answer:</p>
                    <p className="font-black text-base" style={{ color: '#6D28D9' }}>✅ {riddle.answer}</p>
                </div>
            ) : (
                <button className="w-full mt-3 py-2.5 rounded-xl font-bold text-sm transition-all"
                    style={{ background: '#F3E8FF', color: '#7C3AED', border: '2px solid #DDD6FE' }}>
                    🔍 Tap to Reveal Answer
                </button>
            )}
        </div>
    )
}

export default function Riddles() {
    const [riddles, setRiddles] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [filter, setFilter] = useState('All')
    const [revealed, setRevealed] = useState(new Set())
    const [score, setScore] = useState(0)

    useEffect(() => {
        getRiddles().then(r => setRiddles(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const categories = ['All', ...new Set(riddles.map(r => r.category))]

    const filtered = riddles.filter(r => {
        const matchSearch = r.question.toLowerCase().includes(search.toLowerCase()) ||
            r.answer.toLowerCase().includes(search.toLowerCase()) ||
            (r.category || '').toLowerCase().includes(search.toLowerCase())
        const matchFilter = filter === 'All' || r.category === filter
        return matchSearch && matchFilter
    })

    function handleReveal(id) {
        if (!revealed.has(id)) {
            setRevealed(prev => new Set([...prev, id]))
            setScore(s => s + 10)
        }
    }

    function resetAll() { setRevealed(new Set()); setScore(0) }

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* ── Hero Banner ────────────── */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#A855F7 0%,#7C3AED 50%,#F43F8E 100%)' }}>
                {['🧩', '❓', '🤔', '💡', '🎯', '🧠'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 12) % 70}%`, left: `${(i * 17) % 90}%`, animationDelay: `${i * 0.5}s` }}>{em}</span>
                ))}
                <div className="relative max-w-4xl mx-auto flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-1">🧩 Riddles</h1>
                        <p className="text-purple-100 font-semibold">Can you solve them all? Tap a riddle to reveal the answer!</p>
                    </div>
                    <div className="flex gap-3">
                        <div className="rounded-2xl px-5 py-3 text-center bg-white/20 backdrop-blur">
                            <p className="text-xs text-purple-100 font-semibold">Solved</p>
                            <p className="text-white font-black text-xl">{revealed.size}<span className="text-purple-200">/{riddles.length}</span></p>
                        </div>
                        <div className="rounded-2xl px-5 py-3 text-center"
                            style={{ background: 'rgba(251,191,36,0.25)', border: '2px solid rgba(251,191,36,0.5)' }}>
                            <p className="text-xs text-yellow-100 font-semibold">Score</p>
                            <p className="text-yellow-200 font-black text-xl">⭐ {score}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-6">

                {/* Search */}
                <div className="relative mb-4">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search riddles..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl font-semibold focus:outline-none transition-all"
                        style={{
                            background: '#FFFFFF',
                            color: '#2D1B69',
                            border: '2px solid #DDD6FE',
                        }} />
                </div>

                {/* Category filter */}
                <div className="flex gap-2 flex-wrap mb-4">
                    {categories.map(cat => (
                        <button key={cat} onClick={() => setFilter(cat)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold transition-all"
                            style={{
                                background: filter === cat ? '#A855F7' : '#EDE9FE',
                                color: filter === cat ? 'white' : '#6D28D9',
                                border: `2px solid ${filter === cat ? '#7C3AED' : '#DDD6FE'}`,
                            }}>
                            {cat}
                        </button>
                    ))}
                    {revealed.size > 0 && (
                        <button onClick={resetAll} className="ml-auto px-4 py-1.5 rounded-full text-xs font-bold text-red-600"
                            style={{ background: '#FEE2E2', border: '2px solid #FECACA' }}>
                            🔄 Reset All
                        </button>
                    )}
                </div>

                {/* Progress bar */}
                {riddles.length > 0 && (
                    <div className="mb-5">
                        <div className="flex justify-between text-xs font-semibold text-purple-600 mb-1">
                            <span>Progress</span><span>{Math.round((revealed.size / riddles.length) * 100)}%</span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden bg-purple-100">
                            <div className="h-full rounded-full transition-all duration-500"
                                style={{ width: `${(revealed.size / riddles.length) * 100}%`, background: 'linear-gradient(to right,#A855F7,#F43F8E)' }} />
                        </div>
                    </div>
                )}

                {/* Grid */}
                {loading ? (
                    <div className="text-center py-20 text-5xl animate-bounce">🧩</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-400">
                        <div className="text-5xl mb-3">🧩</div><p className="font-semibold">No riddles found</p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                        {filtered.map(riddle => (
                            <RiddleCard key={riddle.id} riddle={riddle} revealed={revealed.has(riddle.id)} onReveal={handleReveal} />
                        ))}
                    </div>
                )}
            </div>

            {/* Completion banner */}
            {riddles.length > 0 && revealed.size === riddles.length && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-2xl px-8 py-4 shadow-2xl z-50 text-center animate-bounce"
                    style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)' }}>
                    <p className="text-white font-black text-lg">🏆 You solved them all!</p>
                    <p className="text-white/90 text-sm font-semibold">Total score: ⭐ {score} points</p>
                </div>
            )}
        </div>
    )
}
