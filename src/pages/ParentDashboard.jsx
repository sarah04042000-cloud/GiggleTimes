import { useEffect, useState } from 'react'
import { getChildren, createChild, getChildProgress, setScreenTime, getContentSettings, setContentSettings } from '../services/api'
import { FiUsers, FiPlus, FiClock, FiHelpCircle, FiShield } from 'react-icons/fi'

const ALL_CATEGORIES = ['Moral', 'Bedtime', 'Animal', 'Mythology', 'Adventure']

export default function ParentDashboard() {
    const [children, setChildren] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedChild, setSelectedChild] = useState(null)
    const [childProgress, setChildProgress] = useState(null)
    const [showCreate, setShowCreate] = useState(false)
    const [form, setForm] = useState({ username: '', password: '' })
    const [screenTime, setScreenTimeVal] = useState(60)
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')

    // Content settings state
    const [allowedCats, setAllowedCats] = useState(null) // null = all allowed
    const [contentLoading, setContentLoading] = useState(false)
    const [allAllowed, setAllAllowed] = useState(true)

    useEffect(() => {
        getChildren().then(r => setChildren(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    async function handleSelectChild(c) {
        setSelectedChild(c)
        setChildProgress(null)
        setScreenTimeVal(c.screen_time_limit || 60)
        setAllowedCats(null)
        setAllAllowed(true)
        try {
            const [prog, settings] = await Promise.all([
                getChildProgress(c.id).catch(() => null),
                getContentSettings(c.id).catch(() => null),
            ])
            if (prog) setChildProgress(prog.data)
            if (settings) {
                const cats = settings.data.allowed_categories
                if (cats === null) {
                    setAllAllowed(true)
                    setAllowedCats(ALL_CATEGORIES)
                } else {
                    setAllAllowed(false)
                    setAllowedCats(cats)
                }
            }
        } catch { }
    }

    async function handleCreate(e) {
        e.preventDefault()
        setErr('')
        try {
            await createChild(form)
            setMsg(`✅ Child account "${form.username}" created!`)
            setForm({ username: '', password: '' })
            setShowCreate(false)
            const r2 = await getChildren()
            setChildren(r2.data)
        } catch (ex) { setErr(ex.response?.data?.error || 'Failed to create child') }
    }

    async function handleScreenTime() {
        if (!selectedChild) return
        try {
            await setScreenTime(selectedChild.id, screenTime)
            setMsg(`✅ Screen time set to ${screenTime} minutes/day`)
        } catch { }
    }

    function toggleCategory(cat) {
        if (allAllowed) return
        setAllowedCats(prev => {
            if (!prev) return [cat]
            if (prev.includes(cat)) return prev.filter(c => c !== cat)
            return [...prev, cat]
        })
    }

    async function saveContentSettings() {
        if (!selectedChild) return
        setContentLoading(true)
        try {
            // null = all allowed, array = restricted
            const toSave = allAllowed ? null : (allowedCats || [])
            await setContentSettings(selectedChild.id, toSave)
            setMsg('✅ Content settings saved!')
            setTimeout(() => setMsg(''), 3000)
        } catch (e) {
            setErr(e.response?.data?.error || 'Failed to save settings')
            setTimeout(() => setErr(''), 3000)
        } finally {
            setContentLoading(false)
        }
    }

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#22C55E 0%,#3B82F6 50%,#A855F7 100%)' }}>
                {['👨\u200d👩\u200d👧', '🧒', '⭐', '📚', '🏆', '🕐'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 13) % 70}%`, left: `${(i * 15) % 88}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
                ))}
                <div className="relative max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-1">👨‍👩‍👧 Parent Dashboard</h1>
                        <p className="text-green-100 font-semibold">Manage your children's learning</p>
                    </div>
                    <button onClick={() => setShowCreate(!showCreate)} className="btn-primary flex items-center gap-2">
                        <FiPlus />Add Child
                    </button>
                </div>
            </div>

            <div className="pt-6 px-4 sm:px-6 max-w-5xl mx-auto">

                {msg && <div className="border-2 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold" style={{ background: '#DCFCE7', borderColor: '#86EFAC', color: '#166534' }}>{msg}</div>}
                {err && <div className="border-2 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold" style={{ background: '#FEE2E2', borderColor: '#FCA5A5', color: '#991B1B' }}>{err}</div>}

                {/* Create child form */}
                {showCreate && (
                    <div className="rounded-2xl p-6 mb-6 shadow-md" style={{ background: '#FFFFFF', border: '2px solid #DDD6FE' }}>
                        <h2 className="text-lg font-black mb-4" style={{ color: '#2D1B69' }}>Create Child Account 🧒</h2>
                        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
                            <input type="text" placeholder="Child's username" value={form.username}
                                onChange={e => setForm({ ...form, username: e.target.value })}
                                className="input-field flex-1" required />
                            <input type="password" placeholder="Password" value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                className="input-field flex-1" required />
                            <button type="submit" className="btn-primary whitespace-nowrap">Create Account</button>
                        </form>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Children list */}
                    <div className="md:col-span-1">
                        <h2 className="text-lg font-black mb-3 flex items-center gap-2" style={{ color: '#2D1B69' }}><FiUsers className="text-kids-purple" />My Children ({children.length})</h2>
                        {loading ? <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-kids-purple" /> :
                            children.length === 0 ? (
                                <div className="rounded-xl p-6 text-center" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <p className="text-3xl mb-2">👶</p>
                                    <p className="text-sm text-gray-500 font-semibold">No child accounts yet. Add one!</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {children.map(c => (
                                        <button key={c.id} onClick={() => handleSelectChild(c)}
                                            className="w-full rounded-xl p-4 text-left transition-all hover:scale-[1.01]"
                                            style={{
                                                background: selectedChild?.id === c.id ? '#F3E8FF' : '#FFFFFF',
                                                border: `2px solid ${selectedChild?.id === c.id ? '#A855F7' : '#E9D5FF'}`,
                                            }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black uppercase shadow-md"
                                                    style={{ background: 'linear-gradient(135deg,#22C55E,#14B8A6)' }}>
                                                    {c.username[0]}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm" style={{ color: '#2D1B69' }}>{c.username}</p>
                                                    <p className="text-gray-400 text-xs font-semibold">{c.points || 0} points ⭐</p>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )
                        }
                    </div>

                    {/* Child detail */}
                    <div className="md:col-span-2">
                        {!selectedChild ? (
                            <div className="rounded-2xl p-10 text-center h-full flex items-center justify-center" style={{ background: '#FFFFFF', border: '2px dashed #DDD6FE' }}>
                                <div><p className="text-4xl mb-3">👈</p><p className="text-gray-500 font-semibold">Select a child to view progress</p></div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* Stats */}
                                {childProgress && (
                                    <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                        <h3 className="font-black mb-4" style={{ color: '#2D1B69' }}>{selectedChild.username}'s Stats 📊</h3>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="text-center rounded-xl p-3" style={{ background: '#F3E8FF' }}><p className="text-xl font-black" style={{ color: '#A855F7' }}>{childProgress.child.points}</p><p className="text-xs text-gray-500 font-semibold">Points</p></div>
                                            <div className="text-center rounded-xl p-3" style={{ background: '#DCFCE7' }}><p className="text-xl font-black" style={{ color: '#22C55E' }}>{childProgress.child.stories_completed_count}</p><p className="text-xs text-gray-500 font-semibold">Stories</p></div>
                                            <div className="text-center rounded-xl p-3" style={{ background: '#FEF3C7' }}><p className="text-xl font-black" style={{ color: '#FBBF24' }}>{childProgress.child.quizzes_taken}</p><p className="text-xs text-gray-500 font-semibold">Quizzes</p></div>
                                        </div>
                                        {childProgress.child.badges?.length > 0 && (
                                            <div className="flex gap-2 flex-wrap">
                                                {childProgress.child.badges.map((b, i) => (
                                                    <span key={i} className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: '#EDE9FE', color: '#6D28D9' }}>{b}</span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Screen time */}
                                <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="font-black mb-3 flex items-center gap-2" style={{ color: '#2D1B69' }}><FiClock className="text-kids-purple" />Screen Time Limit</h3>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="15" max="240" step="15" value={screenTime}
                                            onChange={e => setScreenTimeVal(Number(e.target.value))}
                                            className="flex-1 accent-kids-purple" />
                                        <span className="font-black min-w-[80px]" style={{ color: '#2D1B69' }}>{screenTime} min/day</span>
                                        <button onClick={handleScreenTime} className="btn-primary text-sm py-2">Save</button>
                                    </div>
                                </div>

                                {/* Content Controls */}
                                <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="font-black mb-1 flex items-center gap-2" style={{ color: '#2D1B69' }}><FiShield className="text-kids-purple" />Story Content Controls</h3>
                                    <p className="text-gray-500 text-xs mb-4 font-semibold">Select which story categories {selectedChild.username} can access</p>

                                    {/* All allowed toggle */}
                                    <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                                        <div
                                            onClick={() => {
                                                const next = !allAllowed
                                                setAllAllowed(next)
                                                if (next) setAllowedCats(ALL_CATEGORIES)
                                                else setAllowedCats([])
                                            }}
                                            className={`relative w-11 h-6 rounded-full transition-colors ${allAllowed ? 'bg-kids-purple' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${allAllowed ? 'left-6' : 'left-1'}`} />
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: '#2D1B69' }}>Allow all categories</span>
                                    </label>

                                    {/* Category checkboxes */}
                                    {!allAllowed && (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                            {ALL_CATEGORIES.map(cat => {
                                                const checked = allowedCats?.includes(cat) ?? false
                                                return (
                                                    <button
                                                        key={cat}
                                                        type="button"
                                                        onClick={() => toggleCategory(cat)}
                                                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all"
                                                        style={{
                                                            background: checked ? '#F3E8FF' : '#F9FAFB',
                                                            border: `2px solid ${checked ? '#A855F7' : '#E5E7EB'}`,
                                                            color: checked ? '#6D28D9' : '#6B7280',
                                                        }}
                                                    >
                                                        <div className="w-4 h-4 rounded border flex items-center justify-center"
                                                            style={{ background: checked ? '#A855F7' : 'transparent', borderColor: checked ? '#A855F7' : '#D1D5DB' }}>
                                                            {checked && <span className="text-white text-xs">✓</span>}
                                                        </div>
                                                        {cat}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}

                                    <button
                                        onClick={saveContentSettings}
                                        disabled={contentLoading}
                                        className="btn-primary text-sm py-2 flex items-center gap-2 disabled:opacity-60"
                                    >
                                        {contentLoading ? <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" /> : '💾'} Save Content Settings
                                    </button>
                                </div>

                                {/* Quiz results */}
                                {childProgress?.quiz_results?.length > 0 && (
                                    <div className="rounded-2xl p-5 shadow-sm" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                        <h3 className="font-black mb-3 flex items-center gap-2" style={{ color: '#2D1B69' }}><FiHelpCircle className="text-kids-purple" />Recent Quiz Results</h3>
                                        {childProgress.quiz_results.map((r, i) => (
                                            <div key={i} className="flex justify-between py-2" style={{ borderBottom: i < childProgress.quiz_results.length - 1 ? '1px solid #F3E8FF' : 'none' }}>
                                                <span className="text-gray-600 text-sm font-semibold">{r.correct}/{r.total} correct — {r.score_pct}%</span>
                                                <span className="font-bold text-sm" style={{ color: '#A855F7' }}>+{r.points_earned} pts</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
