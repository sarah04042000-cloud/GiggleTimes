import { useEffect, useState } from 'react'
import { adminGetStats, adminGetUsers, adminDeleteUser, adminUpdateUser, adminCreateUser, adminGetStories, adminCreateStory, adminDeleteStory, adminGetRiddles, adminCreateRiddle, adminDeleteRiddle, adminGetQuizzes, adminCreateQuiz, adminDeleteQuiz, adminGetPayments, adminGetGames, adminCreateGame, adminDeleteGame, adminToggleGame } from '../services/api'
import { FiUsers, FiBook, FiBookOpen, FiHelpCircle, FiDollarSign, FiPlus, FiTrash2, FiEdit2, FiX, FiUserPlus } from 'react-icons/fi'

const TABS = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'users', label: '👥 Users' },
    { id: 'stories', label: '📖 Stories' },
    { id: 'riddles', label: '🧩 Riddles' },
    { id: 'quizzes', label: '❓ Quizzes' },
    { id: 'games', label: '🎮 Games' },
    { id: 'payments', label: '💰 Payments' },
]

function useAdminData() {
    const [stats, setStats] = useState(null)
    const [users, setUsers] = useState([])
    const [stories, setStories] = useState([])
    const [riddles, setRiddles] = useState([])
    const [quizzes, setQuizzes] = useState([])
    const [payments, setPayments] = useState([])
    const [games, setGames] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Promise.all([adminGetStats(), adminGetUsers(), adminGetStories(), adminGetRiddles(), adminGetQuizzes(), adminGetPayments(), adminGetGames()])
            .then(([s, u, st, rd, q, p, g]) => { setStats(s.data); setUsers(u.data); setStories(st.data); setRiddles(rd.data); setQuizzes(q.data); setPayments(p.data); setGames(g.data) })
            .catch(console.error).finally(() => setLoading(false))
    }, [])

    return { stats, users, setUsers, stories, setStories, riddles, setRiddles, quizzes, setQuizzes, payments, games, setGames, loading }
}

export default function AdminPanel() {
    const { stats, users, setUsers, stories, setStories, riddles, setRiddles, quizzes, setQuizzes, payments, games, setGames, loading } = useAdminData()
    const [tab, setTab] = useState('dashboard')
    const [msg, setMsg] = useState('')
    const [err, setErr] = useState('')
    const [storyForm, setStoryForm] = useState({ title: '', category: '', audio_file: '', image: '', description: '', full_text: '' })
    const [riddleForm, setRiddleForm] = useState({ question: '', answer: '', hint: '', category: 'General', difficulty: 'Easy', emoji: '🧩' })
    const [quizForm, setQuizForm] = useState({ question: '', options: ['', '', '', ''], answer: '', category: 'General' })
    const [editingUser, setEditingUser] = useState(null)
    const [editForm, setEditForm] = useState({ role: '', subscription_status: '', subscription: '', password: '' })
    const [showAddUser, setShowAddUser] = useState(false)
    const [newUserForm, setNewUserForm] = useState({ username: '', password: '', role: 'parent' })
    const [gameForm, setGameForm] = useState({ label: '', emoji: '🎮', desc: '', builtin_id: '', color: 'from-purple-500 to-blue-500' })

    function flash(ok, text) { ok ? setMsg(text) : setErr(text); setTimeout(() => { setMsg(''); setErr('') }, 3500) }

    async function addGame(e) {
        e.preventDefault()
        if (!gameForm.label.trim()) { flash(false, 'Name is required'); return }
        try {
            const r = await adminCreateGame(gameForm)
            setGames(prev => [...prev, { ...gameForm, id: r.data.id, active: true }])
            setGameForm({ label: '', emoji: '🎮', desc: '', builtin_id: '', color: 'from-purple-500 to-blue-500' })
            flash(true, `✅ Game "${gameForm.label}" added!`)
        } catch (ex) { flash(false, ex.response?.data?.error || 'Failed to add game') }
    }

    async function deleteGame(id, label) {
        if (!window.confirm(`Delete "${label}"?`)) return
        try { await adminDeleteGame(id); setGames(prev => prev.filter(g => g.id !== id)); flash(true, `✅ Deleted "${label}"`) }
        catch (ex) { flash(false, 'Failed to delete game') }
    }

    async function toggleGame(id) {
        try {
            const r = await adminToggleGame(id)
            setGames(prev => prev.map(g => g.id === id ? { ...g, active: r.data.active } : g))
        } catch (ex) { flash(false, 'Failed to toggle game') }
    }

    function openEditUser(u) {
        setEditingUser(u)
        setEditForm({ role: u.role, subscription_status: u.subscription_status || 'inactive', subscription: u.subscription || '', password: '' })
    }

    async function saveUser(e) {
        e.preventDefault()
        if (!editForm.role) { flash(false, 'Role is required'); return }
        try {
            await adminUpdateUser(editingUser.id, editForm)
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...editForm } : u))
            flash(true, `✅ User "${editingUser.username}" updated`)
            setEditingUser(null)
        } catch (ex) { flash(false, ex.response?.data?.error || 'Failed to update user') }
    }

    async function handleCreateUser(e) {
        e.preventDefault()
        if (!newUserForm.username.trim() || !newUserForm.password.trim()) { flash(false, 'Username and password are required'); return }
        try {
            const r = await adminCreateUser(newUserForm)
            const created = { id: r.data.id, username: newUserForm.username, role: newUserForm.role, points: 0, subscription_status: 'inactive' }
            setUsers(prev => [...prev, created])
            setNewUserForm({ username: '', password: '', role: 'parent' })
            setShowAddUser(false)
            flash(true, `✅ User "${newUserForm.username}" created!`)
        } catch (ex) { flash(false, ex.response?.data?.error || 'Failed to create user') }
    }

    async function addStory(e) {
        e.preventDefault()
        if (!storyForm.title.trim()) { flash(false, 'Title is required'); return }
        if (!storyForm.category.trim()) { flash(false, 'Category is required'); return }
        try { const r = await adminCreateStory(storyForm); setStories(prev => [...prev, { ...storyForm, id: r.data.id }]); flash(true, '✅ Story added!') } catch { flash(false, 'Failed to add story') }
    }
    async function delStory(id) {
        if (!confirm('Delete this story?')) return
        try { await adminDeleteStory(id); setStories(prev => prev.filter(s => s.id !== id)); flash(true, 'Story deleted') } catch { flash(false, 'Failed') }
    }
    async function addRiddle(e) {
        e.preventDefault()
        if (!riddleForm.question.trim()) { flash(false, 'Question is required'); return }
        if (!riddleForm.answer.trim()) { flash(false, 'Answer is required'); return }
        try { const r = await adminCreateRiddle(riddleForm); setRiddles(prev => [...prev, { ...riddleForm, id: r.data.id }]); flash(true, '✅ Riddle added!'); setRiddleForm({ question: '', answer: '', hint: '', category: 'General', difficulty: 'Easy', emoji: '🧩' }) } catch { flash(false, 'Failed to add riddle') }
    }
    async function delRiddle(id) {
        if (!confirm('Delete this riddle?')) return
        try { await adminDeleteRiddle(id); setRiddles(prev => prev.filter(r => r.id !== id)); flash(true, 'Riddle deleted') } catch { flash(false, 'Failed') }
    }
    async function addQuiz(e) {
        e.preventDefault()
        const opts = quizForm.options.filter(Boolean)
        if (opts.length < 2) { flash(false, 'At least 2 options required'); return }
        if (!quizForm.answer.trim()) { flash(false, 'Correct answer is required'); return }
        if (!opts.includes(quizForm.answer)) { flash(false, 'Answer must exactly match one of the options'); return }
        try { const r = await adminCreateQuiz({ ...quizForm, options: opts }); setQuizzes(prev => [...prev, { ...quizForm, id: r.data.id }]); flash(true, '✅ Quiz added!') } catch { flash(false, 'Failed to add quiz') }
    }
    async function delQuiz(id) {
        if (!confirm('Delete this question?')) return
        try { await adminDeleteQuiz(id); setQuizzes(prev => prev.filter(q => q.id !== id)); flash(true, 'Question deleted') } catch { flash(false, 'Failed') }
    }
    async function delUser(id, username) {
        if (username === 'demo_admin') { flash(false, '⛔ Cannot delete the main admin account'); return }
        if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return
        try { await adminDeleteUser(id); setUsers(prev => prev.filter(u => u.id !== id)); flash(true, 'User deleted') } catch { flash(false, 'Failed') }
    }

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#FBBF24 0%,#FB923C 40%,#A855F7 100%)' }}>
                <div className="relative max-w-6xl mx-auto flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg,#FBBF24,#FB923C)' }}>
                        <FiUsers className="text-white text-xl" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white">Admin Panel</h1>
                        <p className="text-yellow-100 text-sm font-semibold">Manage all content</p>
                    </div>
                </div>
            </div>

            <div className="pt-6 pb-16 px-4 sm:px-6 max-w-6xl mx-auto">

                {/* Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto hide-scroll">
                    {TABS.map(t => (
                        <button key={t.id} onClick={() => { setTab(t.id); setMsg(''); setErr('') }}
                            className="flex-shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                            style={{
                                background: tab === t.id ? 'linear-gradient(135deg,#A855F7,#F43F8E)' : '#FFFFFF',
                                color: tab === t.id ? 'white' : '#6B7280',
                                border: `2px solid ${tab === t.id ? '#A855F7' : '#E9D5FF'}`,
                            }}>
                            {t.label}
                        </button>
                    ))}
                </div>

                {(msg || err) && <div className="border-2 px-4 py-3 rounded-2xl mb-4 text-sm font-semibold" style={msg ? { background: '#DCFCE7', borderColor: '#86EFAC', color: '#166534' } : { background: '#FEE2E2', borderColor: '#FCA5A5', color: '#991B1B' }}>{msg || err}</div>}

                {loading ? <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kids-purple" /></div> : (
                    <>
                        {/* Dashboard */}
                        {tab === 'dashboard' && stats && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                {[
                                    { label: 'Users', val: stats.total_users, icon: FiUsers, c: 'from-blue-500 to-cyan-500' },
                                    { label: 'Stories', val: stats.total_stories, icon: FiBook, c: 'from-orange-500 to-red-500' },
                                    { label: 'Riddles', val: stats.total_riddles || riddles.length, icon: FiBookOpen, c: 'from-purple-500 to-pink-500' },
                                    { label: 'Quizzes', val: stats.total_quizzes, icon: FiHelpCircle, c: 'from-teal-500 to-green-500' },
                                    { label: 'Transactions', val: stats.total_transactions, icon: FiDollarSign, c: 'from-yellow-500 to-orange-500' },
                                    { label: 'Paid', val: stats.total_paid, icon: FiDollarSign, c: 'from-green-500 to-emerald-500' },
                                ].map(({ label, val, icon: Icon, c }) => (
                                    <div key={label} className="glass rounded-xl p-4 text-center">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${c} flex items-center justify-center mx-auto mb-2`}><Icon className="text-white" /></div>
                                        <p className="text-2xl font-black" style={{ color: '#2D1B69' }}>{val}</p>
                                        <p className="text-xs text-gray-500 font-semibold">{label}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Users */}
                        {tab === 'users' && (
                            <div>
                                {/* Add User form */}
                                <div className="glass rounded-xl p-5 mb-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiUserPlus className="text-kids-purple" />Add New User</h3>
                                        <button onClick={() => setShowAddUser(v => !v)} className="text-purple-500 hover:text-purple-700 text-sm font-bold transition-colors">
                                            {showAddUser ? 'Cancel ✕' : '+ Expand'}
                                        </button>
                                    </div>
                                    {showAddUser && (
                                        <form onSubmit={handleCreateUser} className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <input placeholder="Username *" required value={newUserForm.username}
                                                onChange={e => setNewUserForm({ ...newUserForm, username: e.target.value })}
                                                className="input-field" />
                                            <input type="password" placeholder="Password *" required value={newUserForm.password}
                                                onChange={e => setNewUserForm({ ...newUserForm, password: e.target.value })}
                                                className="input-field" />
                                            <select value={newUserForm.role} onChange={e => setNewUserForm({ ...newUserForm, role: e.target.value })} className="input-field">
                                                <option value="parent">Parent</option>
                                                <option value="kid">Kid</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                            <button type="submit" className="btn-primary sm:col-span-3 sm:w-auto flex items-center gap-2 justify-center">
                                                <FiUserPlus /> Create User
                                            </button>
                                        </form>
                                    )}
                                </div>

                                {/* Edit User Modal */}
                                {editingUser && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(76,29,149,0.5)', backdropFilter: 'blur(8px)' }} onClick={() => setEditingUser(null)}>
                                        <div className="w-full max-w-md rounded-2xl p-6 shadow-2xl" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }} onClick={e => e.stopPropagation()}>
                                            <div className="flex items-center justify-between mb-5">
                                                <h3 className="font-black text-lg" style={{ color: '#2D1B69' }}>Edit User: {editingUser.username}</h3>
                                                <button onClick={() => setEditingUser(null)} className="p-2 rounded-xl hover:bg-purple-50" style={{ color: '#A855F7' }}><FiX /></button>
                                            </div>
                                            {/* Subscription status display */}
                                            <div className="rounded-xl p-4 mb-4 space-y-2 text-sm" style={{ background: '#F3E8FF' }}>
                                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Points</span><span className="font-black" style={{ color: '#A855F7' }}>{editingUser.points || 0}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Payment Status</span><span className="font-bold" style={{ color: editingUser.subscription_status === 'active' ? '#22C55E' : '#FBBF24' }}>{editingUser.subscription_status || 'No subscription'}</span></div>
                                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Current Plan</span><span className="font-bold" style={{ color: '#2D1B69' }}>{editingUser.subscription || '—'}</span></div>
                                            </div>
                                            <form onSubmit={saveUser} className="space-y-3">
                                                <div>
                                                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block font-bold">Role</label>
                                                    <select value={editForm.role} onChange={e => setEditForm({ ...editForm, role: e.target.value })} className="input-field">
                                                        <option value="kid">Kid</option>
                                                        <option value="parent">Parent</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block font-bold">Subscription Status</label>
                                                    <select value={editForm.subscription_status} onChange={e => setEditForm({ ...editForm, subscription_status: e.target.value })} className="input-field">
                                                        <option value="inactive">Inactive</option>
                                                        <option value="active">Active</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block font-bold">Plan (optional)</label>
                                                    <select value={editForm.subscription} onChange={e => setEditForm({ ...editForm, subscription: e.target.value })} className="input-field">
                                                        <option value="">None</option>
                                                        <option value="single">Single</option>
                                                        <option value="family">Family</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-gray-500 text-xs uppercase tracking-wider mb-1 block font-bold">New Password (leave blank to keep)</label>
                                                    <input type="password" placeholder="New password..." value={editForm.password} onChange={e => setEditForm({ ...editForm, password: e.target.value })} className="input-field" />
                                                </div>
                                                <div className="flex gap-3 pt-2">
                                                    <button type="submit" className="btn-primary flex-1">Save Changes</button>
                                                    <button type="button" onClick={() => setEditingUser(null)} className="btn-secondary flex-1">Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                )}
                                <div className="rounded-xl overflow-x-auto" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm min-w-[640px]">
                                        <thead><tr className="border-b-2 border-purple-100">
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">#</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Username</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Role</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Points</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Plan</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Payment</th>
                                            <th className="px-4 py-3"></th>
                                        </tr></thead>
                                        <tbody>
                                            {users.map((u, i) => (
                                                <tr key={u.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}>
                                                    <td className="px-4 py-3 text-gray-400 font-semibold">{i + 1}</td>
                                                    <td className="px-4 py-3 font-bold" style={{ color: '#2D1B69' }}>{u.username}</td>
                                                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : u.role === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                                                    <td className="px-4 py-3 font-black" style={{ color: '#A855F7' }}>{u.role === 'admin' ? '—' : (u.points || 0)}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs font-semibold">{u.subscription || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {u.subscription_status === 'active' ? '✅ Active' : '⭕ Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditUser(u)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit user"><FiEdit2 size={13} /></button>
                                                            <button onClick={() => delUser(u.id, u.username)} className="text-red-400 hover:text-red-600 p-1" title="Delete user"><FiTrash2 size={13} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}


                        {/* Stories */}
                        {tab === 'stories' && (
                            <div>
                                <form onSubmit={addStory} className="glass rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <h3 className="col-span-full font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Story</h3>
                                    {[['title', 'Title *', true], ['category', 'Category (Moral/Bedtime/Animal/Mythology)', false], ['audio_file', 'Audio URL', false], ['image', 'Image URL', false], ['description', 'Description', false]].map(([k, ph, req]) => (
                                        <input key={k} placeholder={ph} required={req} value={storyForm[k]} onChange={e => setStoryForm({ ...storyForm, [k]: e.target.value })} className="input-field" />
                                    ))}
                                    <textarea placeholder="Full story text" value={storyForm.full_text} onChange={e => setStoryForm({ ...storyForm, full_text: e.target.value })} className="input-field col-span-full h-24 resize-none" />
                                    <button type="submit" className="btn-primary col-span-full sm:w-auto"><FiPlus />Add Story</button>
                                </form>
                                <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm"><thead><tr className="border-b-2 border-purple-100"><th className="text-left px-4 py-3 text-gray-500 font-bold">Title</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Category</th><th className="px-4 py-3"></th></tr></thead>
                                        <tbody>{stories.map(s => (<tr key={s.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}><td className="px-4 py-3 font-semibold" style={{ color: '#2D1B69' }}>{s.title}</td><td className="px-4 py-3 text-gray-500">{s.category}</td><td className="px-4 py-3"><button onClick={() => delStory(s.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></td></tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Riddles */}
                        {tab === 'riddles' && (
                            <div>
                                <form onSubmit={addRiddle} className="glass rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <h3 className="col-span-full font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Riddle</h3>
                                    <input placeholder="Question *" required value={riddleForm.question} onChange={e => setRiddleForm({ ...riddleForm, question: e.target.value })} className="input-field sm:col-span-2" />
                                    <input placeholder="Answer *" required value={riddleForm.answer} onChange={e => setRiddleForm({ ...riddleForm, answer: e.target.value })} className="input-field" />
                                    <input placeholder="Hint (optional)" value={riddleForm.hint} onChange={e => setRiddleForm({ ...riddleForm, hint: e.target.value })} className="input-field" />
                                    <select value={riddleForm.category} onChange={e => setRiddleForm({ ...riddleForm, category: e.target.value })} className="input-field">
                                        {['General', 'Animals', 'Nature', 'Food', 'Science'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={riddleForm.difficulty} onChange={e => setRiddleForm({ ...riddleForm, difficulty: e.target.value })} className="input-field">
                                        {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input placeholder="Emoji (e.g. 🧩)" value={riddleForm.emoji} onChange={e => setRiddleForm({ ...riddleForm, emoji: e.target.value })} className="input-field" />
                                    <button type="submit" className="btn-primary sm:col-span-2"><FiPlus /> Add Riddle</button>
                                </form>
                                <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b-2 border-purple-100"><th className="text-left px-4 py-3 text-gray-500 font-bold">Question</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Answer</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Category</th><th className="px-4 py-3"></th></tr></thead>
                                        <tbody>{riddles.map(r => (<tr key={r.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}><td className="px-4 py-3 font-semibold" style={{ color: '#2D1B69' }}>{r.question}</td><td className="px-4 py-3 text-gray-600">{r.answer}</td><td className="px-4 py-3 text-gray-500">{r.category}</td><td className="px-4 py-3"><button onClick={() => delRiddle(r.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></td></tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Quizzes */}
                        {tab === 'quizzes' && (
                            <div>
                                <form onSubmit={addQuiz} className="glass rounded-xl p-5 mb-6 space-y-3">
                                    <h3 className="font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Quiz Question</h3>
                                    <input placeholder="Question *" required value={quizForm.question} onChange={e => setQuizForm({ ...quizForm, question: e.target.value })} className="input-field" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[0, 1, 2, 3].map(i => (
                                            <input key={i} placeholder={`Option ${i + 1}`} value={quizForm.options[i]} onChange={e => { const o = [...quizForm.options]; o[i] = e.target.value; setQuizForm({ ...quizForm, options: o }) }} className="input-field" />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Correct Answer" required value={quizForm.answer} onChange={e => setQuizForm({ ...quizForm, answer: e.target.value })} className="input-field" />
                                        <select value={quizForm.category} onChange={e => setQuizForm({ ...quizForm, category: e.target.value })} className="input-field">
                                            {['Moral', 'Bedtime', 'Animal', 'Mythology', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary"><FiPlus />Add Question</button>
                                </form>
                                <div className="space-y-2">
                                    {quizzes.map(q => (
                                        <div key={q.id} className="glass rounded-xl px-4 py-3 flex justify-between items-center">
                                            <div><p className="text-sm font-semibold" style={{ color: '#2D1B69' }}>{q.question}</p><p className="text-gray-500 text-xs">{q.category} • Answer: {q.answer}</p></div>
                                            <button onClick={() => delQuiz(q.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Games */}
                        {tab === 'games' && (
                            <div className="space-y-4">
                                {/* Add Game Form */}
                                <div className="glass rounded-2xl p-5">
                                    <h3 className="font-black mb-3 flex items-center gap-2" style={{ color: '#2D1B69' }}><span>➕</span> Add Game</h3>
                                    <form onSubmit={addGame} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input placeholder="Game Name *" value={gameForm.label} onChange={e => setGameForm(f => ({ ...f, label: e.target.value }))} className="input-field" required />
                                        <input placeholder="Emoji (e.g. 🫧)" value={gameForm.emoji} onChange={e => setGameForm(f => ({ ...f, emoji: e.target.value }))} className="input-field" />
                                        <input placeholder="Short description" value={gameForm.desc} onChange={e => setGameForm(f => ({ ...f, desc: e.target.value }))} className="input-field sm:col-span-2" />
                                        <select value={gameForm.builtin_id} onChange={e => setGameForm(f => ({ ...f, builtin_id: e.target.value }))} className="input-field">
                                            <option value="">— Link to built-in game (optional) —</option>
                                            <option value="bubble">🫧 Bubble Pop</option>
                                            <option value="race">🐎 Animal Race</option>
                                            <option value="number">🔢 Number Order</option>
                                            <option value="color">🎨 Color Match</option>
                                            <option value="memory">🃏 Emoji Memory</option>
                                            <option value="star">⭐ Star Catcher</option>
                                            <option value="math">➕ Math Race</option>
                                            <option value="balloon">🎈 Balloon Burst</option>
                                            <option value="word">📝 Word Scramble</option>
                                            <option value="mole">🐹 Whack-a-Mole</option>
                                        </select>
                                        <select value={gameForm.color} onChange={e => setGameForm(f => ({ ...f, color: e.target.value }))} className="input-field">
                                            <option value="from-purple-500 to-blue-500">Purple → Blue</option>
                                            <option value="from-green-400 to-teal-500">Green → Teal</option>
                                            <option value="from-pink-500 to-rose-500">Pink → Rose</option>
                                            <option value="from-orange-400 to-amber-500">Orange → Amber</option>
                                            <option value="from-sky-400 to-cyan-400">Sky → Cyan</option>
                                            <option value="from-violet-500 to-purple-600">Violet → Purple</option>
                                            <option value="from-lime-500 to-green-600">Lime → Green</option>
                                            <option value="from-fuchsia-500 to-pink-500">Fuchsia → Pink</option>
                                        </select>
                                        <button type="submit" className="sm:col-span-2 btn-primary">Add Game</button>
                                    </form>
                                </div>

                                {/* Games List */}
                                <div className="glass rounded-xl overflow-hidden">
                                    {games.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">No custom games added yet. Use the form above to add games.</div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b border-white/10">
                                                {['Emoji', 'Name', 'Description', 'Built-in', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-3 py-3 text-gray-400">{h}</th>)}
                                            </tr></thead>
                                            <tbody>{games.map(g => (
                                                <tr key={g.id} className="border-b border-white/5 hover:bg-white/5">
                                                    <td className="px-3 py-3 text-2xl">{g.emoji}</td>
                                                    <td className="px-3 py-3 text-white font-medium">{g.label}</td>
                                                    <td className="px-3 py-3 text-gray-400 max-w-xs truncate">{g.desc || '—'}</td>
                                                    <td className="px-3 py-3 text-gray-400 text-xs">{g.builtin_id || '—'}</td>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => toggleGame(g.id)} className={`text-xs px-2 py-0.5 rounded-full ${g.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                                            {g.active ? 'Active' : 'Hidden'}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => deleteGame(g.id, g.label)} className="text-red-400 hover:text-red-300 p-1"><FiTrash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="glass rounded-xl p-4 text-sm text-gray-400">
                                    <p className="font-semibold text-white mb-1">ℹ️ How it works</p>
                                    <p>Games you add here appear in the <strong className="text-white">🎮 Games</strong> page for all users. Link to a <strong className="text-white">Built-in game</strong> to make it open the real interactive game. Toggle <strong className="text-white">Active/Hidden</strong> to show or hide a game without deleting it.</p>
                                </div>
                                <div className="rounded-xl overflow-x-auto" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm min-w-[640px]">
                                        <thead><tr className="border-b-2 border-purple-100">
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">#</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Username</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Role</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Points</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Plan</th>
                                            <th className="text-left px-4 py-3 text-gray-500 font-bold">Payment</th>
                                            <th className="px-4 py-3"></th>
                                        </tr></thead>
                                        <tbody>
                                            {users.map((u, i) => (
                                                <tr key={u.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}>
                                                    <td className="px-4 py-3 text-gray-400 font-semibold">{i + 1}</td>
                                                    <td className="px-4 py-3 font-bold" style={{ color: '#2D1B69' }}>{u.username}</td>
                                                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : u.role === 'parent' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{u.role}</span></td>
                                                    <td className="px-4 py-3 font-black" style={{ color: '#A855F7' }}>{u.role === 'admin' ? '—' : (u.points || 0)}</td>
                                                    <td className="px-4 py-3 text-gray-500 text-xs font-semibold">{u.subscription || '—'}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${u.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {u.subscription_status === 'active' ? '✅ Active' : '⭕ Inactive'}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <button onClick={() => openEditUser(u)} className="text-blue-500 hover:text-blue-700 p-1" title="Edit user"><FiEdit2 size={13} /></button>
                                                            <button onClick={() => delUser(u.id, u.username)} className="text-red-400 hover:text-red-600 p-1" title="Delete user"><FiTrash2 size={13} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}


                        {/* Stories */}
                        {tab === 'stories' && (
                            <div>
                                <form onSubmit={addStory} className="rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="col-span-full font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Story</h3>
                                    {[['title', 'Title *', true], ['category', 'Category (Moral/Bedtime/Animal/Mythology)', false], ['audio_file', 'Audio URL', false], ['image', 'Image URL', false], ['description', 'Description', false]].map(([k, ph, req]) => (
                                        <input key={k} placeholder={ph} required={req} value={storyForm[k]} onChange={e => setStoryForm({ ...storyForm, [k]: e.target.value })} className="input-field" />
                                    ))}
                                    <textarea placeholder="Full story text" value={storyForm.full_text} onChange={e => setStoryForm({ ...storyForm, full_text: e.target.value })} className="input-field col-span-full h-24 resize-none" />
                                    <button type="submit" className="btn-primary col-span-full sm:w-auto"><FiPlus />Add Story</button>
                                </form>
                                <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm"><thead><tr className="border-b-2 border-purple-100"><th className="text-left px-4 py-3 text-gray-500 font-bold">Title</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Category</th><th className="px-4 py-3"></th></tr></thead>
                                        <tbody>{stories.map(s => (<tr key={s.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}><td className="px-4 py-3 font-semibold" style={{ color: '#2D1B69' }}>{s.title}</td><td className="px-4 py-3 text-gray-500">{s.category}</td><td className="px-4 py-3"><button onClick={() => delStory(s.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></td></tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Riddles */}
                        {tab === 'riddles' && (
                            <div>
                                <form onSubmit={addRiddle} className="rounded-xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="col-span-full font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Riddle</h3>
                                    <input placeholder="Question *" required value={riddleForm.question} onChange={e => setRiddleForm({ ...riddleForm, question: e.target.value })} className="input-field sm:col-span-2" />
                                    <input placeholder="Answer *" required value={riddleForm.answer} onChange={e => setRiddleForm({ ...riddleForm, answer: e.target.value })} className="input-field" />
                                    <input placeholder="Hint (optional)" value={riddleForm.hint} onChange={e => setRiddleForm({ ...riddleForm, hint: e.target.value })} className="input-field" />
                                    <select value={riddleForm.category} onChange={e => setRiddleForm({ ...riddleForm, category: e.target.value })} className="input-field">
                                        {['General', 'Animals', 'Nature', 'Food', 'Science'].map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={riddleForm.difficulty} onChange={e => setRiddleForm({ ...riddleForm, difficulty: e.target.value })} className="input-field">
                                        {['Easy', 'Medium', 'Hard'].map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    <input placeholder="Emoji (e.g. 🧩)" value={riddleForm.emoji} onChange={e => setRiddleForm({ ...riddleForm, emoji: e.target.value })} className="input-field" />
                                    <button type="submit" className="btn-primary sm:col-span-2"><FiPlus /> Add Riddle</button>
                                </form>
                                <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <table className="w-full text-sm">
                                        <thead><tr className="border-b-2 border-purple-100"><th className="text-left px-4 py-3 text-gray-500 font-bold">Question</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Answer</th><th className="text-left px-4 py-3 text-gray-500 font-bold">Category</th><th className="px-4 py-3"></th></tr></thead>
                                        <tbody>{riddles.map(r => (<tr key={r.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}><td className="px-4 py-3 font-semibold" style={{ color: '#2D1B69' }}>{r.question}</td><td className="px-4 py-3 text-gray-600">{r.answer}</td><td className="px-4 py-3 text-gray-500">{r.category}</td><td className="px-4 py-3"><button onClick={() => delRiddle(r.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button></td></tr>))}</tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Quizzes */}
                        {tab === 'quizzes' && (
                            <div>
                                <form onSubmit={addQuiz} className="rounded-xl p-5 mb-6 space-y-3" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="font-black flex items-center gap-2" style={{ color: '#2D1B69' }}><FiPlus className="text-kids-purple" />Add Quiz Question</h3>
                                    <input placeholder="Question *" required value={quizForm.question} onChange={e => setQuizForm({ ...quizForm, question: e.target.value })} className="input-field" />
                                    <div className="grid grid-cols-2 gap-3">
                                        {[0, 1, 2, 3].map(i => (
                                            <input key={i} placeholder={`Option ${i + 1}`} value={quizForm.options[i]} onChange={e => { const o = [...quizForm.options]; o[i] = e.target.value; setQuizForm({ ...quizForm, options: o }) }} className="input-field" />
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Correct Answer" required value={quizForm.answer} onChange={e => setQuizForm({ ...quizForm, answer: e.target.value })} className="input-field" />
                                        <select value={quizForm.category} onChange={e => setQuizForm({ ...quizForm, category: e.target.value })} className="input-field">
                                            {['Moral', 'Bedtime', 'Animal', 'Mythology', 'General'].map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <button type="submit" className="btn-primary"><FiPlus />Add Question</button>
                                </form>
                                <div className="space-y-2">
                                    {quizzes.map(q => (
                                        <div key={q.id} className="rounded-xl px-4 py-3 flex justify-between items-center" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                            <div><p className="text-sm font-semibold" style={{ color: '#2D1B69' }}>{q.question}</p><p className="text-gray-500 text-xs">{q.category} • Answer: {q.answer}</p></div>
                                            <button onClick={() => delQuiz(q.id)} className="text-red-400 hover:text-red-600"><FiTrash2 size={14} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Games */}
                        {tab === 'games' && (
                            <div className="space-y-4">
                                {/* Add Game Form */}
                                <div className="rounded-2xl p-5" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <h3 className="font-black mb-3 flex items-center gap-2" style={{ color: '#2D1B69' }}><span>➕</span> Add Game</h3>
                                    <form onSubmit={addGame} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <input placeholder="Game Name *" value={gameForm.label} onChange={e => setGameForm(f => ({ ...f, label: e.target.value }))} className="input-field" required />
                                        <input placeholder="Emoji (e.g. 🫧)" value={gameForm.emoji} onChange={e => setGameForm(f => ({ ...f, emoji: e.target.value }))} className="input-field" />
                                        <input placeholder="Short description" value={gameForm.desc} onChange={e => setGameForm(f => ({ ...f, desc: e.target.value }))} className="input-field sm:col-span-2" />
                                        <select value={gameForm.builtin_id} onChange={e => setGameForm(f => ({ ...f, builtin_id: e.target.value }))} className="input-field">
                                            <option value="">— Link to built-in game (optional) —</option>
                                            <option value="bubble">🫧 Bubble Pop</option>
                                            <option value="race">🐎 Animal Race</option>
                                            <option value="number">🔢 Number Order</option>
                                            <option value="color">🎨 Color Match</option>
                                            <option value="memory">🃏 Emoji Memory</option>
                                            <option value="star">⭐ Star Catcher</option>
                                            <option value="math">➕ Math Race</option>
                                            <option value="balloon">🎈 Balloon Burst</option>
                                            <option value="word">📝 Word Scramble</option>
                                            <option value="mole">🐹 Whack-a-Mole</option>
                                        </select>
                                        <select value={gameForm.color} onChange={e => setGameForm(f => ({ ...f, color: e.target.value }))} className="input-field">
                                            <option value="from-purple-500 to-blue-500">Purple → Blue</option>
                                            <option value="from-green-400 to-teal-500">Green → Teal</option>
                                            <option value="from-pink-500 to-rose-500">Pink → Rose</option>
                                            <option value="from-orange-400 to-amber-500">Orange → Amber</option>
                                            <option value="from-sky-400 to-cyan-400">Sky → Cyan</option>
                                            <option value="from-violet-500 to-purple-600">Violet → Purple</option>
                                            <option value="from-lime-500 to-green-600">Lime → Green</option>
                                            <option value="from-fuchsia-500 to-pink-500">Fuchsia → Pink</option>
                                        </select>
                                        <button type="submit" className="sm:col-span-2 btn-primary">Add Game</button>
                                    </form>
                                </div>

                                {/* Games List */}
                                <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    {games.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500">No custom games added yet. Use the form above to add games.</div>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead><tr className="border-b-2 border-purple-100">
                                                {['Emoji', 'Name', 'Description', 'Built-in', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-3 py-3 text-gray-500 font-bold">{h}</th>)}
                                            </tr></thead>
                                            <tbody>{games.map(g => (
                                                <tr key={g.id} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}>
                                                    <td className="px-3 py-3 text-2xl">{g.emoji}</td>
                                                    <td className="px-3 py-3 font-semibold" style={{ color: '#2D1B69' }}>{g.label}</td>
                                                    <td className="px-3 py-3 text-gray-600 max-w-xs truncate">{g.desc || '—'}</td>
                                                    <td className="px-3 py-3 text-gray-500 text-xs">{g.builtin_id || '—'}</td>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => toggleGame(g.id)} className={`text-xs px-2 py-0.5 rounded-full font-bold ${g.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                            {g.active ? 'Active' : 'Hidden'}
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-3">
                                                        <button onClick={() => deleteGame(g.id, g.label)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}</tbody>
                                        </table>
                                    )}
                                </div>

                                <div className="rounded-xl p-4 text-sm text-gray-600" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                    <p className="font-semibold text-kids-purple mb-1">ℹ️ How it works</p>
                                    <p>Games you add here appear in the <strong className="text-kids-purple">🎮 Games</strong> page for all users. Link to a <strong className="text-kids-purple">Built-in game</strong> to make it open the real interactive game. Toggle <strong className="text-kids-purple">Active/Hidden</strong> to show or hide a game without deleting it.</p>
                                </div>
                            </div>
                        )}

                        {/* Payments */}
                        {tab === 'payments' && (
                            <div className="rounded-xl overflow-hidden" style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}>
                                <table className="w-full text-sm"><thead><tr className="border-b-2 border-purple-100">
                                    {['TXN ID', 'User', 'Plan', 'Amount', 'Provider', 'Status', 'Date'].map(h => <th key={h} className="text-left px-3 py-3 text-gray-500 font-bold">{h}</th>)}
                                </tr></thead>
                                    <tbody>{payments.map((t, i) => (
                                        <tr key={i} className="hover:bg-purple-50" style={{ borderBottom: '1px solid #F3E8FF' }}>
                                            <td className="px-3 py-3 font-mono text-xs" style={{ color: '#A855F7' }}>{t.transaction_id}</td>
                                            <td className="px-3 py-3 text-gray-600">{t.user_id?.slice(-6)}</td>
                                            <td className="px-3 py-3 font-semibold" style={{ color: '#2D1B69' }}>{t.plan}</td>
                                            <td className="px-3 py-3 font-semibold" style={{ color: '#2D1B69' }}>₹{t.amount}</td>
                                            <td className="px-3 py-3 text-gray-500">{t.provider}</td>
                                            <td className="px-3 py-3"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${t.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span></td>
                                            <td className="px-3 py-3 text-gray-400 text-xs">{t.created_at?.slice(0, 10)}</td>
                                        </tr>
                                    ))}</tbody>
                                </table>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
