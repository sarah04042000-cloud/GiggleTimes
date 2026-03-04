import { useState } from 'react'
import { FiBookOpen, FiHeart } from 'react-icons/fi'
import { toggleStoryFavorite } from '../services/api'
import StoryModal from './StoryModal'

const CAT_COLORS = {
    Moral: 'bg-orange-100 text-orange-700',
    Bedtime: 'bg-indigo-100 text-indigo-700',
    Animal: 'bg-green-100 text-green-700',
    Mythology: 'bg-purple-100 text-purple-700',
    Adventure: 'bg-yellow-100 text-yellow-700',
    Fantasy: 'bg-pink-100 text-pink-700',
    default: 'bg-blue-100 text-blue-700',
}

export default function StoryCard({ story, index = 0 }) {
    const [modalOpen, setModalOpen] = useState(false)
    const [favorited, setFavorited] = useState(false)
    const badge = CAT_COLORS[story.category] || CAT_COLORS.default

    async function handleFavorite(e) {
        e.stopPropagation()
        try { const r = await toggleStoryFavorite(story.id); setFavorited(r.data.favorited) } catch { }
    }

    return (
        <>
            <div className="card group relative w-44 sm:w-52 flex-shrink-0 cursor-pointer"
                onClick={() => setModalOpen(true)}
                style={{ animation: `fadeIn 0.4s ease ${index * 40}ms both` }}>

                {/* Thumbnail */}
                <div className="relative overflow-hidden h-36 sm:h-40">
                    <img
                        src={story.image || `https://picsum.photos/seed/${story.id}/300/200`}
                        alt={story.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={e => { e.target.src = `https://picsum.photos/seed/${index + 10}/300/200` }} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Category badge */}
                    <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-0.5 rounded-full ${badge}`}>
                        {story.category}
                    </span>

                    {/* Favorite */}
                    <button onClick={handleFavorite}
                        className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/80 transition-colors ${favorited ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}>
                        <FiHeart size={11} fill={favorited ? 'currentColor' : 'none'} />
                    </button>

                    {/* Read overlay on hover */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white/80 border-2 border-purple-400 flex items-center justify-center shadow-lg">
                            <FiBookOpen className="text-purple-600 text-lg" />
                        </div>
                    </div>
                </div>

                {/* Info */}
                <div className="p-3">
                    <h3 className="text-sm font-bold leading-tight line-clamp-2 mb-3" style={{ color: '#2D1B69' }}>{story.title}</h3>
                    <button
                        onClick={e => { e.stopPropagation(); setModalOpen(true) }}
                        className="w-full flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl transition-all text-white"
                        style={{ background: 'linear-gradient(135deg,#A855F7,#F43F8E)' }}>
                        <FiBookOpen size={11} /> Read Story
                    </button>
                </div>
            </div>

            {modalOpen && <StoryModal story={story} onClose={() => setModalOpen(false)} />}
        </>
    )
}
