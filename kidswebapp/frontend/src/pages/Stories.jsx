import { useEffect, useState } from 'react'
import { getStories } from '../services/api'
import StoryCard from '../components/StoryCard'
import { FiSearch } from 'react-icons/fi'

const CATEGORIES = ['All', 'Moral', 'Bedtime', 'Animal', 'Mythology', 'Adventure', 'Fantasy']

export default function Stories() {
    const [stories, setStories] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [cat, setCat] = useState('All')

    useEffect(() => {
        getStories().then(r => setStories(r.data)).catch(console.error).finally(() => setLoading(false))
    }, [])

    const categories = ['All', ...new Set(stories.map(s => s.category).filter(Boolean))]
    const filtered = stories.filter(s => {
        const matchCat = cat === 'All' || s.category === cat
        const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
            (s.description || '').toLowerCase().includes(search.toLowerCase())
        return matchCat && matchSearch
    })

    return (
        <div className="min-h-screen pb-16" style={{ background: '#FFF0F8' }}>

            {/* Hero */}
            <div className="relative overflow-hidden pt-20 pb-8 px-6"
                style={{ background: 'linear-gradient(135deg,#FB923C 0%,#F43F8E 50%,#A855F7 100%)' }}>
                {['📚', '📖', '🌟', '📝', '✨', '🌈'].map((em, i) => (
                    <span key={i} className="absolute text-2xl animate-float select-none opacity-30"
                        style={{ top: `${10 + (i * 13) % 70}%`, left: `${(i * 15) % 88}%`, animationDelay: `${i * 0.4}s` }}>{em}</span>
                ))}
                <div className="relative max-w-7xl mx-auto">
                    <h1 className="text-4xl font-black text-white mb-1">📖 Stories</h1>
                    <p className="text-orange-100 font-semibold">Explore magical stories for every mood!</p>
                </div>
            </div>

            <div className="pt-6 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

                {/* Search + Category filter */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                        <input type="text" placeholder="Search stories..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            className="input-field pl-10" />
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto hide-scroll pb-1">
                        {categories.map(c => (
                            <button key={c} onClick={() => setCat(c)}
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
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-kids-purple" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-20 text-gray-400">
                        <p className="text-5xl mb-4">📭</p>
                        <p className="text-lg font-semibold">No stories found</p>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-500 text-sm font-semibold mb-4">{filtered.length} stories found</p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                            {filtered.map((story, i) => <StoryCard key={story.id} story={story} index={i} />)}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}
