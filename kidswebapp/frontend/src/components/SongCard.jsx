import { useRef, useState, useEffect } from 'react'
import { FiHeart, FiSkipForward } from 'react-icons/fi'
import { melodyPlayer } from '../utils/melodyPlayer'

// Note: toggleSongFavorite may not exist in api.js, so we guard it
let toggleSongFavorite
try {
    const api = require('../services/api')
    toggleSongFavorite = api.toggleSongFavorite
} catch { }

export default function SongCard({ song, index = 0, isPlaying, onPlay, onNext, showNav = false }) {
    const [progress, setProgress] = useState(0)
    const [time, setTime] = useState('0:00')
    const [fav, setFav] = useState(false)
    const ownsPlayback = useRef(false)

    function fmt(s) {
        if (!s || isNaN(s)) return '0:00'
        return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
    }

    function toggle() {
        if (isPlaying) {
            ownsPlayback.current = false
            melodyPlayer.stop()
            onPlay?.(null)
        } else {
            setProgress(0)
            setTime('0:00')
            ownsPlayback.current = true

            const ok = melodyPlayer.play(song.title, {
                onProgress: (pct, elapsed) => {
                    if (!ownsPlayback.current) return
                    setProgress(pct)
                    setTime(fmt(elapsed))
                },
                onEnd: () => {
                    if (!ownsPlayback.current) return
                    ownsPlayback.current = false
                    onPlay?.(null)
                    onNext?.()
                },
            })

            if (ok) {
                onPlay?.(song.id)
            } else {
                ownsPlayback.current = false
            }
        }
    }

    useEffect(() => {
        if (!isPlaying) {
            ownsPlayback.current = false
            setProgress(0)
            setTime('0:00')
        }
    }, [isPlaying])

    async function handleFav(e) {
        e.stopPropagation()
        try {
            if (toggleSongFavorite) {
                const r = await toggleSongFavorite(song.id)
                setFav(r.data.favorited)
            } else {
                setFav(f => !f)
            }
        } catch { setFav(f => !f) }
    }

    return (
        <div className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all border-2 ${isPlaying
                ? 'border-purple-300'
                : 'border-purple-100 hover:border-purple-200'
            }`}
            style={{
                background: isPlaying ? '#F3E8FF' : '#FFFFFF',
            }}>

            {/* Index / visualizer */}
            <div className="w-7 flex-shrink-0 text-center">
                {isPlaying
                    ? <div className="flex items-end justify-center gap-px h-4">
                        {[8, 12, 6].map((h, i) => (
                            <div key={i} className="w-0.5 bg-purple-500 rounded-full animate-bounce"
                                style={{ height: h, animationDelay: `${i * 120}ms` }} />
                        ))}
                    </div>
                    : <span className="text-gray-400 text-xs font-bold">{index + 1}</span>
                }
            </div>

            {/* Cover */}
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 bg-purple-100">
                <img
                    src={song.cover_image || `https://picsum.photos/seed/s${index + 30}/100`}
                    alt={song.title}
                    className="w-full h-full object-cover"
                    onError={e => { e.target.src = `https://picsum.photos/seed/${index + 50}/100` }}
                />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate" style={{ color: isPlaying ? '#6D28D9' : '#2D1B69' }}>
                    {song.title}
                </p>
                <p className="text-xs text-gray-500 truncate font-semibold">
                    {song.artist} · {song.category}
                    <span className="ml-1">🎵</span>
                </p>
                {isPlaying && (
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-400 text-xs w-8">{time}</span>
                        <div className="flex-1 h-1.5 bg-purple-100 rounded-full">
                            <div
                                className="h-full bg-gradient-to-r from-purple-500 to-pink-400 rounded-full transition-all"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
                <button
                    onClick={toggle}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold transition-all text-white"
                    style={{ background: isPlaying ? '#A855F7' : '#DDD6FE', color: isPlaying ? 'white' : '#7C3AED' }}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
                {showNav && (
                    <button onClick={onNext} className="text-gray-400 hover:text-purple-600 p-1">
                        <FiSkipForward size={14} />
                    </button>
                )}
                <button
                    onClick={handleFav}
                    className="p-1 transition-colors"
                    style={{ color: fav ? '#EF4444' : '#D1D5DB' }}
                >
                    <FiHeart size={13} fill={fav ? 'currentColor' : 'none'} />
                </button>
            </div>
        </div>
    )
}
