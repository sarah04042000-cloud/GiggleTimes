import { useEffect, useState } from 'react'
import { getQuizzes, submitQuiz } from '../services/api'
import { FiCheckCircle, FiXCircle, FiAward, FiRefreshCw } from 'react-icons/fi'

const CATEGORIES = ['All', 'Moral', 'Bedtime', 'Animal', 'Mythology', 'Riddles']

export default function Quiz() {
    const [quizzes, setQuizzes] = useState([])
    const [loading, setLoading] = useState(true)
    const [cat, setCat] = useState('All')
    const [idx, setIdx] = useState(0)
    const [selected, setSelected] = useState(null)
    const [score, setScore] = useState(0)
    const [finished, setFinished] = useState(false)
    const [answered, setAnswered] = useState(false)
    const [answers, setAnswers] = useState([])
    const [submitting, setSubmitting] = useState(false)
    const [serverResult, setServerResult] = useState(null)

    useEffect(() => {
        getQuizzes().then(r => setQuizzes(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const filtered = cat === 'All' ? quizzes : quizzes.filter(q => q.category === cat)

    function handleAnswer(opt) {
        if (answered) return
        setSelected(opt)
        setAnswered(true)
        if (opt === filtered[idx].answer) setScore(s => s + 1)
        setAnswers(prev => [...prev, { quiz_id: filtered[idx].id, selected: opt }])
    }

    async function handleNext() {
        if (idx + 1 >= filtered.length) {
            setFinished(true); setSubmitting(true)
            try { const r = await submitQuiz(answers); setServerResult(r.data) } catch { }
            setSubmitting(false)
        } else {
            setIdx(i => i + 1); setSelected(null); setAnswered(false)
        }
    }

    function handleRestart() {
        setIdx(0); setSelected(null); setScore(0)
        setFinished(false); setAnswered(false); setAnswers([]); setServerResult(null)
    }

    function changeCat(c) { setCat(c); handleRestart() }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFF0F8' }}>
            <div className="text-5xl animate-bounce">❓</div>
        </div>
    )

    if (finished) {
        const pct = filtered.length ? Math.round((score / filtered.length) * 100) : 0
        const { emoji, msg, color, grad } = pct === 100
            ? { emoji: '🏆', msg: 'Perfect!', color: '#EAB308', grad: 'from-yellow-400 to-orange-400' }
            : pct >= 75 ? { emoji: '🌟', msg: 'Great Job!', color: '#22C55E', grad: 'from-green-400 to-teal-400' }
                : pct >= 50 ? { emoji: '👍', msg: 'Good Effort!', color: '#3B82F6', grad: 'from-blue-400 to-indigo-400' }
                    : { emoji: '📚', msg: 'Keep Practicing!', color: '#FB923C', grad: 'from-orange-400 to-red-400' }
        return (
            <div className="min-h-screen flex items-center justify-center pt-16 px-4" style={{ background: '#FFF0F8' }}>
                <div className="glass rounded-3xl p-10 text-center max-w-md w-full animate-slide-up shadow-2xl">
                    <div className="text-7xl mb-4">{emoji}</div>
                    <h2 className="text-3xl font-black mb-2" style={{ color: '#2D1B69' }}>{msg}</h2>
                    <p className="text-5xl font-black mb-2" style={{ color }}>{score}/{filtered.length}</p>
                    <p className="text-gray-500 font-semibold mb-4">Questions correct</p>
                    {serverResult && <p className="font-bold mb-4" style={{ color: '#A855F7' }}>+{serverResult.points_earned} points earned! 🎉</p>}
                    <div className="w-full h-3 rounded-full mb-8 bg-purple-100">
                        <div className={`h-3 rounded-full bg-gradient-to-r ${grad} transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                    <button onClick={handleRestart} className="btn-primary flex items-center gap-2 mx-auto">
                        <FiRefreshCw />Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (!filtered.length) return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-4 pt-16" style={{ background: '#FFF0F8' }}>
            <p className="text-gray-400 text-5xl">❓</p>
            <p className="text-gray-500 font-semibold">No quizzes in this category.</p>
            <button onClick={() => changeCat('All')} className="btn-primary">Show All</button>
        </div>
    )

    const q = filtered[idx]
    const LETTERS = ['A', 'B', 'C', 'D']

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* ── Hero ─────────────────────────────── */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#3B82F6 0%,#6D28D9 50%,#EC4899 100%)' }}>
                {['❓', '🎯', '🏆', '💡', '🧠', '✅'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 12) % 70}%`, left: `${(i * 17) % 90}%`, animationDelay: `${i * 0.5}s` }}>{em}</span>
                ))}
                <div className="relative max-w-2xl mx-auto text-center">
                    <h1 className="text-4xl font-black text-white mb-1">❓ Quiz Time</h1>
                    <p className="text-blue-100 font-semibold">Test your knowledge and earn points!</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6">

                {/* Category pills */}
                <div className="flex gap-2 mb-6 overflow-x-auto hide-scroll pb-1">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => changeCat(c)}
                            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-all"
                            style={{
                                background: cat === c ? '#A855F7' : '#EDE9FE',
                                color: cat === c ? 'white' : '#6D28D9',
                                border: `2px solid ${cat === c ? '#7C3AED' : '#DDD6FE'}`,
                            }}>
                            {c}
                        </button>
                    ))}
                </div>

                {/* Progress */}
                <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600 text-sm font-semibold">Question {idx + 1} of {filtered.length}</span>
                    <span className="font-bold text-sm flex items-center gap-1" style={{ color: '#A855F7' }}>
                        <FiAward />Score: {score}
                    </span>
                </div>
                <div className="h-3 rounded-full mb-8 overflow-hidden bg-purple-100">
                    <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${((idx + 1) / filtered.length) * 100}%`, background: 'linear-gradient(to right,#A855F7,#F43F8E)' }} />
                </div>

                {/* Question */}
                <span className="text-xs px-3 py-1 rounded-full font-bold"
                    style={{ background: '#F3E8FF', color: '#7C3AED', border: '2px solid #DDD6FE' }}>{q.category}</span>
                <div className="rounded-2xl p-6 md:p-8 mt-3 mb-6"
                    style={{ background: '#FFFFFF', border: '2px solid #E9D5FF', boxShadow: '0 4px 16px rgba(168,85,247,0.10)' }}>
                    <h2 className="text-xl md:text-2xl font-bold leading-snug" style={{ color: '#2D1B69' }}>{q.question}</h2>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                    {q.options.map((opt, i) => {
                        let style = {
                            background: '#FFFFFF',
                            border: '2px solid #E9D5FF',
                            color: '#2D1B69',
                        }
                        let iconEl = null
                        if (answered) {
                            if (opt === q.answer) {
                                style = { background: '#DCFCE7', border: '2px solid #86EFAC', color: '#166534' }
                                iconEl = <FiCheckCircle className="ml-auto text-green-500 flex-shrink-0" />
                            } else if (opt === selected) {
                                style = { background: '#FEE2E2', border: '2px solid #FCA5A5', color: '#991B1B' }
                                iconEl = <FiXCircle className="ml-auto text-red-500 flex-shrink-0" />
                            } else {
                                style = { background: '#F9FAFB', border: '2px solid #E5E7EB', color: '#9CA3AF' }
                            }
                        }
                        return (
                            <button key={opt} onClick={() => handleAnswer(opt)}
                                className="p-4 rounded-xl text-left transition-all duration-200 flex items-center gap-3 hover:scale-[1.01]"
                                style={style}>
                                <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                                    style={{ background: '#F3E8FF', color: '#7C3AED' }}>{LETTERS[i]}</span>
                                <span className="text-sm md:text-base font-semibold">{opt}</span>
                                {iconEl}
                            </button>
                        )
                    })}
                </div>

                {answered && (
                    <div className="flex flex-col items-center gap-4 animate-slide-up">
                        <p className={`text-base font-black ${selected === q.answer ? 'text-green-600' : 'text-red-500'}`}>
                            {selected === q.answer ? '✅ Correct! +1 point' : `❌ Answer: "${q.answer}"`}
                        </p>
                        <button onClick={handleNext} disabled={submitting} className="btn-primary text-base px-8 py-3">
                            {idx + 1 >= filtered.length ? (submitting ? 'Saving...' : '🏁 See Results') : 'Next Question →'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
