import { useEffect, useRef, useState } from 'react'
import { FiX } from 'react-icons/fi'
import { completeStory } from '../services/api'

export default function StoryModal({ story, onClose }) {
    const [speaking, setSpeaking] = useState(false)
    const startTime = useRef(Date.now())

    // Auto-log completion after staying ≥60 s
    useEffect(() => {
        return () => {
            if (Date.now() - startTime.current > 60000) {
                completeStory(story.id).catch(() => { })
            }
        }
    }, [story.id])

    // Stop speech on unmount
    useEffect(() => {
        return () => window.speechSynthesis?.cancel()
    }, [])

    const fullText = story.full_text || story.description || 'No text available.'

    function handleTTS() {
        if (!window.speechSynthesis) return alert('Your browser does not support text-to-speech.')

        if (speaking) {
            window.speechSynthesis.cancel()
            setSpeaking(false)
            return
        }

        const utterance = new SpeechSynthesisUtterance(fullText)
        utterance.rate = 0.88
        utterance.pitch = 1.05
        utterance.lang = 'en-US'

        const voices = window.speechSynthesis.getVoices()
        const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Female'))
            || voices.find(v => v.lang === 'en-US')
        if (preferred) utterance.voice = preferred

        utterance.onend = () => setSpeaking(false)
        utterance.onerror = () => setSpeaking(false)

        window.speechSynthesis.speak(utterance)
        setSpeaking(true)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(76,29,149,0.5)', backdropFilter: 'blur(8px)' }}
            onClick={onClose}>
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl rounded-3xl overflow-hidden"
                style={{ background: '#FFFFFF', border: '2px solid #E9D5FF' }}
                onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                    style={{ borderBottom: '2px solid #F3E8FF', background: 'linear-gradient(135deg,#F3E8FF,#FCE7F3)' }}>
                    <div>
                        <h2 className="font-black text-xl leading-tight" style={{ color: '#2D1B69' }}>{story.title}</h2>
                        <p className="text-purple-500 text-xs font-semibold mt-0.5">{story.category}</p>
                    </div>
                    <button onClick={onClose}
                        className="p-2 rounded-xl transition-all hover:scale-110"
                        style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                        <FiX size={20} />
                    </button>
                </div>

                {/* Story Image */}
                {story.image && (
                    <div className="h-40 overflow-hidden flex-shrink-0">
                        <img src={story.image} alt={story.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Listen button */}
                <div className="flex items-center gap-3 px-6 py-3 flex-shrink-0"
                    style={{ borderBottom: '2px solid #F3E8FF' }}>
                    <button onClick={handleTTS}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-md text-white"
                        style={{
                            background: speaking
                                ? '#EF4444'
                                : 'linear-gradient(135deg,#A855F7,#F43F8E)',
                            animation: speaking ? 'pulse 1.5s ease-in-out infinite' : 'none',
                        }}>
                        {speaking ? '⏹ Stop Listening' : '🔊 Listen to Story'}
                    </button>
                    {speaking && (
                        <span className="text-purple-500 text-xs font-semibold animate-pulse">Reading aloud…</span>
                    )}
                </div>

                {/* Story Text */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <p className="text-base leading-relaxed whitespace-pre-wrap font-medium" style={{ color: '#374151' }}>{fullText}</p>
                </div>
            </div>
        </div>
    )
}
