import { useEffect, useState } from 'react'
import { getSongs } from '../services/api'
import { melodyPlayer } from '../utils/melodyPlayer'

const SONG_COLORS = [
    { bg: 'from-purple-400 to-pink-400', light: '#F3E8FF', bar: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700' },
    { bg: 'from-orange-300 to-red-400', light: '#FFF7ED', bar: 'bg-orange-400', badge: 'bg-orange-100 text-orange-700' },
    { bg: 'from-green-400 to-teal-400', light: '#ECFDF5', bar: 'bg-green-500', badge: 'bg-green-100 text-green-700' },
    { bg: 'from-blue-400 to-indigo-400', light: '#EFF6FF', bar: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700' },
    { bg: 'from-yellow-400 to-orange-300', light: '#FEFCE8', bar: 'bg-yellow-500', badge: 'bg-yellow-100 text-yellow-700' },
]

export default function Songs() {
    const [songs, setSongs] = useState([])
    const [loading, setLoading] = useState(true)
    const [playingId, setPlayingId] = useState(null)
    const [search, setSearch] = useState('')
    const [progress, setProgress] = useState({})

    useEffect(() => {
        getSongs().then(r => setSongs(r.data)).catch(console.error).finally(() => setLoading(false))
        return () => melodyPlayer.stop()
    }, [])

    const filtered = songs.filter(s =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.artist || '').toLowerCase().includes(search.toLowerCase())
    )

    function togglePlay(song, idx) {
        if (playingId === song.id) {
            melodyPlayer.stop()
            setPlayingId(null)
            setProgress(p => ({ ...p, [song.id]: 0 }))
            return
        }
        melodyPlayer.stop()
        setPlayingId(song.id)
        setProgress(p => ({ ...p, [song.id]: 0 }))

        melodyPlayer.play(song.title, {
            onProgress: (pct) => setProgress(p => ({ ...p, [song.id]: pct })),
            onEnd: () => {
                setPlayingId(null)
                setProgress(p => ({ ...p, [song.id]: 100 }))
                const nextSong = filtered[idx + 1]
                if (nextSong) {
                    setTimeout(() => togglePlay(nextSong, idx + 1), 600)
                }
            }
        })
    }

    const currentSong = songs.find(s => s.id === playingId)

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* ── Hero ─────────────────────────────── */}
            <div className="relative overflow-hidden pt-20 pb-10 px-6"
                style={{ background: 'linear-gradient(135deg,#22C55E 0%,#3B82F6 40%,#A855F7 100%)' }}>
                {['🎵', '🎶', '🎸', '🎤', '🎹', '🎺'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 12) % 60}%`, left: `${(i * 17) % 90}%`, animationDelay: `${i * 0.5}s` }}>{em}</span>
                ))}
                <div className="relative text-center max-w-lg mx-auto">
                    <div className="text-6xl mb-3 animate-bounce">🎵</div>
                    <h1 className="text-5xl font-black text-white drop-shadow mb-2">Songs</h1>
                    <p className="text-green-100 text-lg font-semibold">Kids' nursery rhymes — tap ▶ to play the melody!</p>
                </div>
            </div>

            {/* ── Now Playing Bar ──────────────────── */}
            {currentSong && (
                <div className="sticky top-16 z-30 mx-4 mt-4 rounded-3xl overflow-hidden shadow-xl"
                    style={{ background: 'linear-gradient(135deg,#A855F7,#F43F8E)' }}>
                    <div className="flex items-center gap-4 px-5 py-3">
                        <div className="flex gap-1 items-end h-8">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-1.5 rounded-full bg-white"
                                    style={{ height: `${12 + i * 4}px`, animation: `bounceSm ${0.4 + i * 0.1}s ease-in-out infinite` }} />
                            ))}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-black text-white leading-tight truncate text-base">{currentSong.title}</p>
                            <p className="text-purple-100 text-xs font-semibold">{currentSong.artist} 🎤</p>
                        </div>
                        <button onClick={() => togglePlay(currentSong, filtered.findIndex(s => s.id === currentSong.id))}
                            className="bg-white/25 hover:bg-white/40 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center transition-all text-lg">
                            ⏹
                        </button>
                    </div>
                    <div className="h-2 bg-white/20">
                        <div className="h-full bg-white rounded-full transition-all duration-300"
                            style={{ width: `${progress[currentSong.id] || 0}%` }} />
                    </div>
                </div>
            )}

            {/* ── Search ───────────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 mt-6">
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search songs..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl font-semibold focus:outline-none border-2 transition-all"
                        style={{ background: '#FFFFFF', color: '#2D1B69', borderColor: '#E9D5FF' }} />
                </div>
            </div>

            {/* ── Song Cards ───────────────────────── */}
            <div className="max-w-2xl mx-auto px-4 mt-6 space-y-3">
                {loading ? (
                    <div className="text-center py-20 text-5xl animate-bounce">🎵</div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-6xl mb-3">🎤</p>
                        <p className="text-gray-500 font-bold">No songs found!</p>
                    </div>
                ) : (
                    filtered.map((song, idx) => {
                        const col = SONG_COLORS[idx % SONG_COLORS.length]
                        const isPlaying = playingId === song.id
                        const pct = progress[song.id] || 0
                        return (
                            <div key={song.id}
                                className="rounded-3xl overflow-hidden transition-all duration-300 hover:scale-[1.01]"
                                style={{
                                    background: isPlaying ? '#F3E8FF' : '#FFFFFF',
                                    border: `2px solid ${isPlaying ? '#C084FC' : '#E9D5FF'}`,
                                    boxShadow: isPlaying ? '0 4px 20px rgba(168,85,247,0.2)' : '0 2px 8px rgba(168,85,247,0.06)',
                                }}>

                                <div className="flex items-center gap-4 p-4">
                                    {/* Big colorful play button */}
                                    <button onClick={() => togglePlay(song, idx)}
                                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${col.bg} flex items-center justify-center text-white text-3xl shadow-lg hover:scale-110 transition-transform flex-shrink-0`}>
                                        {isPlaying ? '⏸' : '▶'}
                                    </button>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <div>
                                                <p className="font-black text-base leading-tight" style={{ color: '#2D1B69' }}>
                                                    {song.emoji || '🎵'} {song.title}
                                                </p>
                                                <p className="text-sm font-semibold text-gray-500">{song.artist}</p>
                                            </div>
                                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${col.badge}`}>
                                                {song.category?.replace(' Nursery Rhymes', '').replace(' Rhymes', '')}
                                            </span>
                                        </div>

                                        {/* Lyrics snippet when not playing */}
                                        {!isPlaying && song.lyrics && (
                                            <p className="text-xs text-gray-400 italic truncate mt-1">
                                                "{song.lyrics.split('\n')[0]}"
                                            </p>
                                        )}

                                        {/* Progress bar when playing */}
                                        {isPlaying && (
                                            <div className="mt-2">
                                                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#E9D5FF' }}>
                                                    <div className={`h-full ${col.bar} rounded-full transition-all duration-300`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                                <p className="text-[10px] text-purple-500 mt-1 font-semibold">♪ Playing melody... {Math.round(pct)}%</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Lyrics panel when playing */}
                                {isPlaying && song.lyrics && (
                                    <div className="px-5 pb-4 pt-1" style={{ borderTop: '2px solid #E9D5FF' }}>
                                        <p className="text-xs font-bold text-purple-500 mb-2">📝 Lyrics</p>
                                        <p className="text-sm leading-loose whitespace-pre-wrap font-semibold" style={{ color: '#4C1D95' }}>
                                            {song.lyrics}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
