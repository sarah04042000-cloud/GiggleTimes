import { useEffect, useState } from 'react'
import { getProgress } from '../services/api'
import { FiAward, FiBook, FiHelpCircle } from 'react-icons/fi'

export default function Progress() {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getProgress().then(r => setData(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: '#FFF0F8' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kids-purple" />
        </div>
    )

    if (!data) return (
        <div className="min-h-screen pt-24 flex items-center justify-center" style={{ background: '#FFF0F8' }}>
            <p className="text-gray-500 font-semibold">Could not load progress. 😢</p>
        </div>
    )

    const pctToNext = data.points_to_next_level > 0 ? Math.max(0, 100 - (data.points_to_next_level / 100) * 100) : 100

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#FBBF24 0%,#F43F8E 50%,#A855F7 100%)' }}>
                {['🏆', '⭐', '🎖', '📊', '🌟', '🎯'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 13) % 70}%`, left: `${(i * 15) % 88}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
                ))}
                <div className="relative max-w-3xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-1">🏆 My Progress</h1>
                    <p className="text-yellow-100 font-semibold">Track your achievements and badges</p>
                </div>
            </div>

            <div className="pt-6 pb-8 px-4 sm:px-6 max-w-3xl mx-auto">

                {/* Level card */}
                <div className="glass rounded-3xl p-6 mb-6"
                    style={{ background: 'linear-gradient(135deg,#F3E8FF,#FCE7F3)', border: '2px solid #DDD6FE' }}>
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <p className="text-purple-500 text-sm font-bold">Level {data.level}</p>
                            <h2 className="text-3xl font-black" style={{ color: '#4C1D95' }}>{data.level_name}</h2>
                        </div>
                        <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                            style={{ background: 'linear-gradient(135deg,#A855F7,#F43F8E)' }}>
                            <span className="text-4xl font-black text-white">{data.level}</span>
                        </div>
                    </div>
                    <div className="mb-2 flex justify-between text-xs font-semibold text-purple-600">
                        <span>{data.points} pts</span>
                        <span>{data.points_to_next_level} pts to next level</span>
                    </div>
                    <div className="w-full rounded-full h-3" style={{ background: '#DDD6FE' }}>
                        <div className="h-3 rounded-full transition-all duration-1000"
                            style={{ width: `${pctToNext}%`, background: 'linear-gradient(to right,#A855F7,#F43F8E)' }} />
                    </div>
                </div>

                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {[
                        { icon: FiBook, label: 'Stories Read', value: data.stories_completed, color: '#22C55E', bg: '#DCFCE7' },
                        { icon: FiHelpCircle, label: 'Quizzes Done', value: data.quizzes_taken, color: '#FBBF24', bg: '#FEF3C7' },
                        { icon: FiAward, label: 'Total Points', value: data.points, color: '#A855F7', bg: '#F3E8FF' },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                        <div key={label} className="rounded-2xl p-4 text-center"
                            style={{ background: bg, border: '2px solid rgba(0,0,0,0.05)' }}>
                            <Icon className="mx-auto mb-2 text-2xl" style={{ color }} />
                            <p className="text-2xl font-black" style={{ color }}>{value}</p>
                            <p className="text-xs text-gray-600 font-semibold">{label}</p>
                        </div>
                    ))}
                </div>

                {/* Badges */}
                <h2 className="text-xl font-black mb-4" style={{ color: '#2D1B69' }}>🎖 Badges</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
                    {data.all_badges.map(badge => {
                        const earned = data.badges.find(b => b.id === badge.id)
                        return (
                            <div key={badge.id}
                                className={`rounded-2xl p-4 transition-all ${earned ? '' : 'opacity-40'}`}
                                style={{
                                    background: earned ? '#F3E8FF' : '#F9FAFB',
                                    border: `2px solid ${earned ? '#C084FC' : '#E5E7EB'}`,
                                }}>
                                <span className="text-3xl">{badge.emoji}</span>
                                <p className="font-bold text-sm mt-2" style={{ color: '#2D1B69' }}>{badge.name}</p>
                                <p className="text-gray-500 text-xs mt-1">{badge.desc}</p>
                                {earned && <span className="text-xs font-black block mt-2" style={{ color: '#A855F7' }}>✓ Earned!</span>}
                            </div>
                        )
                    })}
                </div>

                {/* Recent quiz results */}
                {data.recent_quiz_results?.length > 0 && (
                    <>
                        <h2 className="text-xl font-black mb-4" style={{ color: '#2D1B69' }}>📊 Recent Quizzes</h2>
                        <div className="rounded-2xl overflow-hidden"
                            style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                            {data.recent_quiz_results.map((r, i) => (
                                <div key={i} className="flex items-center justify-between px-4 py-3"
                                    style={{ borderBottom: i < data.recent_quiz_results.length - 1 ? '1px solid #F3E8FF' : 'none' }}>
                                    <div>
                                        <p className="text-sm font-bold" style={{ color: '#2D1B69' }}>{r.correct}/{r.total} correct</p>
                                        <p className="text-gray-400 text-xs">{r.submitted_at?.slice(0, 10)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-lg font-black ${r.score_pct >= 75 ? 'text-green-500' : r.score_pct >= 50 ? 'text-yellow-500' : 'text-red-400'}`}>{r.score_pct}%</p>
                                        <p className="text-xs font-bold" style={{ color: '#A855F7' }}>+{r.points_earned} pts</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
