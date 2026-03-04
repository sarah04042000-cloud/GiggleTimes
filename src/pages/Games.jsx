import { useState, useEffect, useRef, useCallback } from 'react'

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 1 — BUBBLE POP 🫧
   Bubbles float up. Click them before they escape!
───────────────────────────────────────────────────────────────────────────── */
function BubblePop({ onClose }) {
    const [bubbles, setBubbles] = useState([])
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [started, setStarted] = useState(false)
    const [missed, setMissed] = useState(0)
    const idRef = useRef(0)

    const spawnBubble = useCallback(() => {
        const id = ++idRef.current
        const colors = ['#a78bfa', '#f472b6', '#34d399', '#fbbf24', '#60a5fa', '#f87171', '#fb923c']
        setBubbles(b => [...b, {
            id, x: 5 + Math.random() * 88,
            size: 40 + Math.random() * 40,
            color: colors[Math.floor(Math.random() * colors.length)],
            speed: 30 + Math.random() * 40,
            emoji: ['🫧', '⭐', '💎', '🌈', '🎈', '🍭', '✨'][Math.floor(Math.random() * 7)]
        }])
    }, [])

    useEffect(() => {
        if (!started) return
        const spawn = setInterval(spawnBubble, 900)
        const timer = setInterval(() => {
            setTimeLeft(t => { if (t <= 1) { clearInterval(spawn); clearInterval(timer) } return t - 1 })
        }, 1000)
        return () => { clearInterval(spawn); clearInterval(timer) }
    }, [started, spawnBubble])

    function popBubble(id) {
        setBubbles(b => b.filter(x => x.id !== id))
        setScore(s => s + 10)
    }

    function bubbleGone(id) {
        setBubbles(b => b.filter(x => x.id !== id))
        setMissed(m => m + 1)
    }

    const done = timeLeft <= 0

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🫧 Bubble Pop</h2>
                <div className="flex gap-4 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className={`font-bold ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-white'}`}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className="game-arena relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#0f0c29,#302b63,#24243e)' }}>
                {!started && !done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="text-6xl">🫧</div>
                        <p className="text-white text-xl font-bold">Pop the bubbles!</p>
                        <p className="text-gray-400 text-sm">Click bubbles before they escape. 30 seconds!</p>
                        <button onClick={() => setStarted(true)} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                )}
                {done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                        <div className="text-6xl">{score >= 100 ? '🏆' : score >= 50 ? '⭐' : '🎮'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-gray-400 text-sm">Missed: {missed} bubbles</p>
                        <button onClick={() => { setScore(0); setTimeLeft(30); setMissed(0); setBubbles([]); setStarted(true) }} className="btn-primary">Play Again</button>
                    </div>
                )}
                {started && !done && bubbles.map(b => (
                    <div key={b.id}
                        onClick={() => popBubble(b.id)}
                        onAnimationEnd={() => bubbleGone(b.id)}
                        className="absolute cursor-pointer select-none flex items-center justify-center font-bold hover:scale-110 transition-transform"
                        style={{
                            left: `${b.x}%`, bottom: -60, width: b.size, height: b.size,
                            borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, white, ${b.color})`,
                            animation: `floatUp ${b.speed}s linear forwards`,
                            fontSize: b.size * 0.4, border: `2px solid ${b.color}aa`,
                            boxShadow: `0 0 15px ${b.color}80`
                        }}>
                        {b.emoji}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 2 — ANIMAL RACE 🐎
   Tap rapidly to make your animal run faster than the AI!
───────────────────────────────────────────────────────────────────────────── */
function AnimalRace({ onClose }) {
    const [playerPos, setPlayerPos] = useState(0)
    const [cpuPos, setCpuPos] = useState(0)
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(null)
    const [taps, setTaps] = useState(0)
    const cpuRef = useRef(null)
    const FINISH = 95

    function start() { setPlayerPos(0); setCpuPos(0); setDone(null); setTaps(0); setStarted(true) }

    useEffect(() => {
        if (!started || done) return
        cpuRef.current = setInterval(() => {
            setCpuPos(p => {
                const next = p + (1.5 + Math.random() * 1.5)
                if (next >= FINISH) { clearInterval(cpuRef.current); setDone('cpu'); return FINISH }
                return next
            })
        }, 100)
        return () => clearInterval(cpuRef.current)
    }, [started, done])

    function tap() {
        if (!started || done) return
        setTaps(t => t + 1)
        setPlayerPos(p => {
            const next = p + 3.5
            if (next >= FINISH) { clearInterval(cpuRef.current); setDone('player'); return FINISH }
            return next
        })
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🐎 Animal Race</h2>
                <span className="text-yellow-300 font-bold">Taps: {taps}</span>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-6 px-8" style={{ background: 'linear-gradient(135deg,#11998e,#38ef7d)' }}>
                {!started ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🦁</div>
                        <p className="text-white text-xl font-bold text-center">Tap as fast as you can to win the race!</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Start Race!</button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{done === 'player' ? '🏆' : '😅'}</div>
                        <p className="text-white text-2xl font-black">{done === 'player' ? 'You Win! 🎉' : 'CPU Won! Try Again!'}</p>
                        <button onClick={start} className="btn-primary">Race Again!</button>
                    </div>
                ) : (
                    <>
                        {/* Tracks */}
                        <div className="w-full max-w-md space-y-4">
                            {/* Player track */}
                            <div className="glass rounded-full h-12 relative overflow-hidden">
                                <div className="absolute left-2 top-1 h-10 flex items-center text-xs text-white font-bold">YOU 🦁</div>
                                <div className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-75" style={{ left: `${playerPos}%` }}>🦁</div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-300 text-lg">🏁</div>
                            </div>
                            {/* CPU track */}
                            <div className="glass rounded-full h-12 relative overflow-hidden">
                                <div className="absolute left-2 top-1 h-10 flex items-center text-xs text-white font-bold">CPU 🐎</div>
                                <div className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-100" style={{ left: `${cpuPos}%` }}>🐎</div>
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-300 text-lg">🏁</div>
                            </div>
                        </div>
                        <button onClick={tap}
                            className="w-40 h-40 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-5xl font-black shadow-2xl active:scale-95 transform transition select-none"
                            style={{ WebkitTapHighlightColor: 'transparent' }}>
                            👆 TAP!
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 3 — NUMBER ORDER 🔢
   Click numbers 1–15 in order as fast as possible!
───────────────────────────────────────────────────────────────────────────── */
function NumberOrder({ onClose }) {
    const COUNT = 15
    const makeNumbers = () => {
        const arr = Array.from({ length: COUNT }, (_, i) => ({ n: i + 1, x: 5 + Math.random() * 80, y: 5 + Math.random() * 80, color: `hsl(${(i * 24) % 360},80%,60%)` }))
        return arr.sort(() => Math.random() - 0.5)
    }
    const [nums, setNums] = useState(makeNumbers)
    const [next, setNext] = useState(1)
    const [startTime, setStartTime] = useState(null)
    const [elapsed, setElapsed] = useState(0)
    const [done, setDone] = useState(false)
    const [best, setBest] = useState(() => Number(localStorage.getItem('numorder_best') || 0))

    useEffect(() => {
        if (!startTime || done) return
        const t = setInterval(() => setElapsed(Date.now() - startTime), 100)
        return () => clearInterval(t)
    }, [startTime, done])

    function click(n) {
        if (n !== next) return
        if (!startTime) setStartTime(Date.now())
        if (n === COUNT) {
            const ms = Date.now() - startTime
            setDone(true)
            const newElapsed = ms
            setElapsed(newElapsed)
            if (!best || ms < best) { setBest(ms); localStorage.setItem('numorder_best', ms) }
        }
        setNext(n + 1)
        setNums(prev => prev.filter(x => x.n !== n))
    }

    function restart() { setNums(makeNumbers()); setNext(1); setStartTime(null); setElapsed(0); setDone(false) }

    const sec = (elapsed / 1000).toFixed(1)

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🔢 Number Order</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-white font-bold">Next: <span className="text-yellow-300">{next}</span></span>
                    <span className="text-gray-300">{sec}s</span>
                </div>
            </div>
            <div className="game-arena relative" style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)' }}>
                {done ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                        <div className="text-6xl">🎉</div>
                        <p className="text-white text-2xl font-black">Done in {sec}s!</p>
                        {best && <p className="text-yellow-300 text-sm">Best: {(best / 1000).toFixed(1)}s</p>}
                        <button onClick={restart} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        <p className="absolute top-3 left-0 right-0 text-center text-gray-400 text-sm">Tap numbers 1 → {COUNT} in order</p>
                        {nums.map(({ n, x, y, color }) => (
                            <button key={n} onClick={() => click(n)}
                                className="absolute w-12 h-12 rounded-full font-black text-white text-lg flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
                                style={{ left: `${x}%`, top: `${y}%`, background: color, boxShadow: `0 0 15px ${color}80`, opacity: n < next ? 0.3 : 1 }}>
                                {n}
                            </button>
                        ))}
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 4 — COLOR MATCH 🎨
   A color name appears — click the MATCHING color button!
───────────────────────────────────────────────────────────────────────────── */
const COLORS_DEF = [
    { name: 'Red', hex: '#ef4444' }, { name: 'Blue', hex: '#3b82f6' },
    { name: 'Green', hex: '#22c55e' }, { name: 'Yellow', hex: '#eab308' },
    { name: 'Purple', hex: '#a855f7' }, { name: 'Orange', hex: '#f97316' },
    { name: 'Pink', hex: '#ec4899' }, { name: 'Cyan', hex: '#06b6d4' },
]
function ColorMatch({ onClose }) {
    const randColor = () => COLORS_DEF[Math.floor(Math.random() * COLORS_DEF.length)]
    const [target, setTarget] = useState(randColor)
    const [options, setOptions] = useState(() => shuffle([...COLORS_DEF].slice(0, 6)))
    const [score, setScore] = useState(0)
    const [wrong, setWrong] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [started, setStarted] = useState(false)
    const [flash, setFlash] = useState(null)

    function shuffle(arr) { return arr.sort(() => Math.random() - 0.5) }

    function next() {
        const t = randColor()
        setTarget(t)
        const others = COLORS_DEF.filter(c => c.name !== t.name).sort(() => Math.random() - 0.5).slice(0, 3)
        setOptions(shuffle([t, ...others]))
    }

    useEffect(() => {
        if (!started) return
        const t = setInterval(() => setTimeLeft(v => { if (v <= 1) clearInterval(t); return v - 1 }), 1000)
        return () => clearInterval(t)
    }, [started])

    function guess(name) {
        if (timeLeft <= 0) return
        if (name === target.name) { setFlash('correct'); setScore(s => s + 10); setTimeout(() => { setFlash(null); next() }, 400) }
        else { setFlash('wrong'); setWrong(w => w + 1); setTimeout(() => setFlash(null), 400) }
    }

    const done = timeLeft <= 0

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🎨 Color Match</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className={timeLeft <= 5 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className={`game-arena flex flex-col items-center justify-center gap-8 transition-colors ${flash === 'correct' ? 'bg-green-900/30' : flash === 'wrong' ? 'bg-red-900/30' : ''}`}
                style={{ background: 'linear-gradient(135deg,#232526,#414345)' }}>
                {!started ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🎨</div>
                        <p className="text-white text-xl font-bold text-center">Click the color that matches the text!</p>
                        <button onClick={() => setStarted(true)} className="btn-primary text-lg px-8 py-3">Play!</button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{score >= 100 ? '🏆' : '🎨'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-gray-400 text-sm">Wrong: {wrong}</p>
                        <button onClick={() => { setScore(0); setWrong(0); setTimeLeft(30); next(); setStarted(true) }} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <p className="text-gray-400 text-sm mb-2">Find this color:</p>
                            <p className="text-5xl font-black" style={{ color: target.hex, textShadow: `0 0 20px ${target.hex}` }}>{target.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                            {options.map(c => (
                                <button key={c.name} onClick={() => guess(c.name)}
                                    className="h-16 rounded-2xl text-white font-bold text-sm shadow-lg hover:scale-105 active:scale-95 transition-transform border-2 border-white/20"
                                    style={{ background: c.hex, boxShadow: `0 4px 20px ${c.hex}60` }}>
                                    {c.name}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 5 — EMOJI MEMORY 🃏
   Flip cards to find matching emoji pairs!
───────────────────────────────────────────────────────────────────────────── */
const EMOJIS = ['🐶', '🐱', '🐼', '🦊', '🐸', '🦁', '🐨', '🐮']
function EmojiMemory({ onClose }) {
    const makeCards = () => [...EMOJIS, ...EMOJIS].map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false })).sort(() => Math.random() - 0.5)
    const [cards, setCards] = useState(makeCards)
    const [selected, setSelected] = useState([])
    const [moves, setMoves] = useState(0)
    const [locked, setLocked] = useState(false)
    const [won, setWon] = useState(false)

    function flip(id) {
        if (locked || selected.length === 2) return
        const card = cards.find(c => c.id === id)
        if (!card || card.flipped || card.matched) return
        const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
        const newSelected = [...selected, { id, emoji: card.emoji }]
        setCards(newCards)
        setSelected(newSelected)
        if (newSelected.length === 2) {
            setMoves(m => m + 1)
            setLocked(true)
            setTimeout(() => {
                const [a, b] = newSelected
                setCards(prev => prev.map(c =>
                    c.id === a.id || c.id === b.id
                        ? { ...c, matched: a.emoji === b.emoji, flipped: a.emoji === b.emoji }
                        : c
                ))
                if (a.emoji !== b.emoji) {
                    setTimeout(() => setCards(prev => prev.map(c =>
                        c.id === a.id || c.id === b.id ? { ...c, flipped: false } : c
                    )), 400)
                } else {
                    setCards(prev => {
                        const updated = prev.map(c =>
                            c.id === a.id || c.id === b.id ? { ...c, matched: true, flipped: true } : c
                        )
                        if (updated.every(c => c.matched)) setWon(true)
                        return updated
                    })
                }
                setSelected([])
                setLocked(false)
            }, 700)
        }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🃏 Emoji Memory</h2>
                <span className="text-white text-sm">Moves: <span className="text-yellow-300 font-bold">{moves}</span></span>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg,#667eea,#764ba2)' }}>
                {won ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🎉</div>
                        <p className="text-white text-2xl font-black">You matched all pairs!</p>
                        <p className="text-gray-200 text-sm">In {moves} moves</p>
                        <button onClick={() => { setCards(makeCards()); setSelected([]); setMoves(0); setWon(false); setLocked(false) }} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-2 p-4">
                        {cards.map(card => (
                            <button key={card.id} onClick={() => flip(card.id)}
                                className={`w-14 h-14 rounded-xl text-2xl flex items-center justify-center transition-all duration-300 border-2 ${card.matched ? 'bg-green-500/30 border-green-400 scale-95' : card.flipped ? 'bg-white/20 border-white/60' : 'bg-white/10 border-white/20 hover:bg-white/20 hover:scale-105'}`}>
                                {card.flipped || card.matched ? card.emoji : '❓'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 6 — STAR CATCHER ⭐
   Move the basket left/right to catch falling stars. Avoid the bombs!
───────────────────────────────────────────────────────────────────────────── */
function StarCatcher({ onClose }) {
    const [basketX, setBasketX] = useState(50)
    const [items, setItems] = useState([])
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(false)
    const idRef = useRef(0)
    const basketRef = useRef(50)
    const scoreRef = useRef(0)
    const livesRef = useRef(3)

    function start() { setBasketX(50); setItems([]); setScore(0); setLives(3); livesRef.current = 3; scoreRef.current = 0; basketRef.current = 50; setDone(false); setStarted(true) }

    function move(dir) {
        setBasketX(x => {
            const next = Math.max(5, Math.min(90, x + dir * 8))
            basketRef.current = next
            return next
        })
    }

    useEffect(() => {
        if (!started || done) return
        const spawn = setInterval(() => {
            const isBomb = Math.random() < 0.25
            setItems(prev => [...prev, { id: ++idRef.current, x: 5 + Math.random() * 85, y: 0, isBomb, emoji: isBomb ? '💣' : ['⭐', '💎', '🌟', '✨'][Math.floor(Math.random() * 4)], speed: 1.5 + Math.random() * 2 }])
        }, 1000)
        const loop = setInterval(() => {
            setItems(prev => {
                const updated = prev.map(item => ({ ...item, y: item.y + item.speed }))
                const alive = updated.filter(item => {
                    if (item.y > 90) {
                        const bx = basketRef.current
                        if (item.x >= bx - 10 && item.x <= bx + 10) {
                            if (item.isBomb) {
                                livesRef.current -= 1
                                setLives(livesRef.current)
                                if (livesRef.current <= 0) setDone(true)
                            } else {
                                scoreRef.current += 10
                                setScore(scoreRef.current)
                            }
                        }
                        return false
                    }
                    return true
                })
                return alive
            })
        }, 50)
        return () => { clearInterval(spawn); clearInterval(loop) }
    }, [started, done])

    const heartArr = [1, 2, 3]

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">⭐ Star Catcher</h2>
                <div className="flex gap-3 text-sm items-center">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span>{heartArr.map(i => <span key={i}>{i <= lives ? '❤️' : '🖤'}</span>)}</span>
                </div>
            </div>
            <div className="game-arena relative" style={{ background: 'linear-gradient(180deg,#000428,#004e92)' }}>
                {!started ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="text-6xl">⭐</div>
                        <p className="text-white text-xl font-bold text-center">Catch stars, avoid bombs!</p>
                        <p className="text-gray-400 text-sm">Use the ← → buttons below</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                ) : done ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                        <div className="text-6xl">💥</div>
                        <p className="text-white text-2xl font-black">Game Over!</p>
                        <p className="text-yellow-300 text-lg">Score: {score}</p>
                        <button onClick={start} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        {items.map(item => (
                            <div key={item.id} className="absolute text-2xl select-none pointer-events-none"
                                style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%,-50%)' }}>
                                {item.emoji}
                            </div>
                        ))}
                        <div className="absolute text-3xl" style={{ left: `${basketX}%`, top: '88%', transform: 'translateX(-50%)' }}>🧺</div>
                    </>
                )}
            </div>
            {started && !done && (
                <div className="flex gap-4 justify-center py-3 bg-black/30">
                    <button onClick={() => move(-1)} className="w-16 h-16 rounded-full bg-white/20 text-white text-2xl font-black active:bg-white/40 transition border border-white/30">◀</button>
                    <button onClick={() => move(1)} className="w-16 h-16 rounded-full bg-white/20 text-white text-2xl font-black active:bg-white/40 transition border border-white/30">▶</button>
                </div>
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 7 — MATH RACE ➕
   Simple maths — answer before time runs out!
───────────────────────────────────────────────────────────────────────────── */
function MathRace({ onClose }) {
    function makeQ() {
        const ops = ['+', '-', '×']
        const op = ops[Math.floor(Math.random() * ops.length)]
        let a, b, ans
        if (op === '+') { a = Math.floor(Math.random() * 20) + 1; b = Math.floor(Math.random() * 20) + 1; ans = a + b }
        else if (op === '-') { a = Math.floor(Math.random() * 20) + 10; b = Math.floor(Math.random() * a) + 1; ans = a - b }
        else { a = Math.floor(Math.random() * 10) + 1; b = Math.floor(Math.random() * 10) + 1; ans = a * b }
        const wrongs = new Set()
        while (wrongs.size < 3) { const w = ans + (Math.floor(Math.random() * 10) - 5); if (w !== ans && w > 0) wrongs.add(w) }
        return { question: `${a} ${op} ${b} = ?`, ans, options: [...wrongs, ans].sort(() => Math.random() - 0.5) }
    }
    const [q, setQ] = useState(makeQ)
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [timeLeft, setTimeLeft] = useState(8)
    const [flash, setFlash] = useState(null)
    const [totalQ, setTotalQ] = useState(0)
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(false)
    const [quizTimeLeft, setQuizTimeLeft] = useState(60)

    useEffect(() => {
        if (!started || done) return
        const t = setInterval(() => {
            setTimeLeft(v => {
                if (v <= 1) { setFlash('timeout'); setStreak(0); setTimeout(() => { setFlash(null); setQ(makeQ()); setTimeLeft(8) }, 600); return 8 }
                return v - 1
            })
        }, 1000)
        return () => clearInterval(t)
    }, [started, done, q])

    useEffect(() => {
        if (!started || done) return
        const t = setInterval(() => setQuizTimeLeft(v => { if (v <= 1) { setDone(true); return 0 } return v - 1 }), 1000)
        return () => clearInterval(t)
    }, [started, done])

    function guess(ans) {
        if (done) return
        if (ans === q.ans) {
            setFlash('correct'); setScore(s => s + 10 + streak * 2); setStreak(s => s + 1)
        } else {
            setFlash('wrong'); setStreak(0)
        }
        setTotalQ(n => n + 1)
        setTimeout(() => { setFlash(null); setQ(makeQ()); setTimeLeft(8) }, 400)
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">➕ Math Race</h2>
                <div className="flex gap-3 text-sm items-center">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    {streak >= 3 && <span className="text-orange-400 font-bold">🔥x{streak}</span>}
                    <span className={quizTimeLeft <= 10 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {quizTimeLeft}s</span>
                </div>
            </div>
            <div className={`game-arena flex flex-col items-center justify-center gap-6 transition-colors ${flash === 'correct' ? 'bg-green-900/20' : flash === 'wrong' ? 'bg-red-900/20' : flash === 'timeout' ? 'bg-orange-900/20' : ''}`}
                style={{ background: 'linear-gradient(135deg,#1a1a2e,#16213e)' }}>
                {!started ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🧮</div>
                        <p className="text-white text-xl font-bold text-center">Solve as many sums as you can in 60 seconds!</p>
                        <button onClick={() => setStarted(true)} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{score >= 100 ? '🏆' : '🧮'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-gray-400 text-sm">{totalQ} questions answered</p>
                        <button onClick={() => { setScore(0); setStreak(0); setTotalQ(0); setQ(makeQ()); setTimeLeft(8); setQuizTimeLeft(60); setDone(false) }} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        <div className="flex w-full max-w-xs justify-end">
                            <div className="h-2 bg-white/10 rounded-full flex-1">
                                <div className="h-full bg-green-400 rounded-full transition-all" style={{ width: `${(timeLeft / 8) * 100}%`, background: timeLeft <= 3 ? '#ef4444' : '#22c55e' }} />
                            </div>
                        </div>
                        <div className="glass rounded-2xl px-8 py-6 text-center">
                            <p className="text-4xl font-black text-white">{q.question}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 w-full max-w-xs">
                            {q.options.map((opt, i) => (
                                <button key={i} onClick={() => guess(opt)}
                                    className="h-16 rounded-2xl bg-white/10 hover:bg-kids-purple text-white text-xl font-black border border-white/20 hover:border-kids-purple transition-all active:scale-95">
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 8 — BALLOON BURST 🎈
   Balloons fall – pop them by clicking before they hit the ground!
───────────────────────────────────────────────────────────────────────────── */
function BalloonBurst({ onClose }) {
    const [balloons, setBalloons] = useState([])
    const [score, setScore] = useState(0)
    const [missed, setMissed] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [started, setStarted] = useState(false)
    const idRef = useRef(0)
    const BALLOON_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#ec4899']

    useEffect(() => {
        if (!started || timeLeft <= 0) return
        const spawn = setInterval(() => {
            setBalloons(b => [...b, {
                id: ++idRef.current, x: 5 + Math.random() * 88,
                color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
                size: 35 + Math.random() * 30,
                speed: 4 + Math.random() * 4,
            }])
        }, 800)
        const timer = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(spawn); clearInterval(timer) } return t - 1 }), 1000)
        return () => { clearInterval(spawn); clearInterval(timer) }
    }, [started, timeLeft])

    function pop(id) { setBalloons(b => b.filter(x => x.id !== id)); setScore(s => s + 10) }
    function gone(id) { setBalloons(b => b.filter(x => x.id !== id)); setMissed(m => m + 1) }
    const done = timeLeft <= 0

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🎈 Balloon Burst</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className={timeLeft <= 5 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className="game-arena relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#0093E9,#80D0C7)' }}>
                {!started && !done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="text-6xl">🎈</div>
                        <p className="text-white text-xl font-bold">Pop the falling balloons!</p>
                        <button onClick={() => setStarted(true)} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                )}
                {done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/40">
                        <div className="text-6xl">{score >= 150 ? '🏆' : score >= 80 ? '⭐' : '🎈'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-white/70 text-sm">Missed: {missed}</p>
                        <button onClick={() => { setScore(0); setMissed(0); setTimeLeft(30); setBalloons([]); setStarted(true) }} className="btn-primary">Play Again</button>
                    </div>
                )}
                {balloons.map(b => (
                    <div key={b.id}
                        onClick={() => pop(b.id)}
                        onAnimationEnd={() => gone(b.id)}
                        className="absolute cursor-pointer select-none hover:scale-125 transition-transform"
                        style={{
                            left: `${b.x}%`, top: '-80px', width: b.size, height: b.size * 1.2,
                            animation: `fallDown ${b.speed}s linear forwards`,
                        }}>
                        <div style={{ width: b.size, height: b.size, borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%', background: `radial-gradient(circle at 35% 35%, white, ${b.color})`, boxShadow: `0 0 10px ${b.color}80` }} />
                        <div style={{ width: 1, height: 10, background: '#888', margin: '0 auto' }} />
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 9 — WORD SCRAMBLE 📝
   Unscramble the animal/fruit word!
───────────────────────────────────────────────────────────────────────────── */
const WORDS = [
    { word: 'CAT', hint: '🐱 A furry pet' }, { word: 'DOG', hint: '🐶 Man\'s best friend' },
    { word: 'FISH', hint: '🐟 Lives in water' }, { word: 'BIRD', hint: '🐦 Has wings' },
    { word: 'LION', hint: '🦁 King of jungle' }, { word: 'FROG', hint: '🐸 Jumps a lot' },
    { word: 'BEAR', hint: '🐻 Loves honey' }, { word: 'DUCK', hint: '🦆 Says quack' },
    { word: 'CRAB', hint: '🦀 Has claws' }, { word: 'WOLF', hint: '🐺 Howls at moon' },
    { word: 'APPLE', hint: '🍎 Red fruit' }, { word: 'MANGO', hint: '🥭 Tropical fruit' },
    { word: 'GRAPE', hint: '🍇 Grows in bunches' }, { word: 'LEMON', hint: '🍋 Sour citrus' },
    { word: 'TIGER', hint: '🐯 Has orange stripes' },
]
function WordScramble({ onClose }) {
    function scramble(w) { const a = [...w]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; }; return a.join('') }
    function nextWord() {
        const w = WORDS[Math.floor(Math.random() * WORDS.length)]
        let sc = scramble(w.word)
        while (sc === w.word) sc = scramble(w.word)
        return { ...w, scrambled: sc }
    }
    const [current, setCurrent] = useState(nextWord)
    const [input, setInput] = useState('')
    const [score, setScore] = useState(0)
    const [msg, setMsg] = useState('')
    const [streak, setStreak] = useState(0)

    function check() {
        if (input.toUpperCase() === current.word) {
            setMsg('✅ Correct! +10' + (streak >= 2 ? ` Streak x${streak + 1}!` : ''))
            setScore(s => s + 10 + streak * 5)
            setStreak(s => s + 1)
        } else {
            setMsg(`❌ It was "${current.word}"`)
            setStreak(0)
        }
        setInput('')
        setTimeout(() => { setMsg(''); setCurrent(nextWord()) }, 1200)
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">📝 Word Scramble</h2>
                <div className="flex gap-3 text-sm items-center">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    {streak >= 2 && <span className="text-orange-400 font-bold">🔥x{streak}</span>}
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'linear-gradient(135deg,#f093fb,#f5576c)' }}>
                <p className="text-white/80 text-sm">{current.hint}</p>
                <div className="flex gap-2">
                    {current.scrambled.split('').map((ch, i) => (
                        <div key={i} className="w-10 h-10 rounded-xl bg-white/20 text-white text-xl font-black flex items-center justify-center border border-white/40">{ch}</div>
                    ))}
                </div>
                {msg ? (
                    <p className="text-white text-xl font-bold">{msg}</p>
                ) : (
                    <div className="flex flex-col items-center gap-3 w-full max-w-xs">
                        <input
                            value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && check()}
                            placeholder="Type your answer..." maxLength={10}
                            className="input-field w-full text-center text-lg font-bold uppercase tracking-widest" autoFocus />
                        <button onClick={check} disabled={!input.trim()} className="btn-primary w-full disabled:opacity-40">Check Answer</button>
                        <button onClick={() => { setMsg(''); setCurrent(nextWord()); setInput('') }} className="text-white/60 text-sm underline">Skip</button>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 10 — WHACK-A-MOLE 🐹
   Click the animals as they pop out of holes!
───────────────────────────────────────────────────────────────────────────── */
function WhackAMole({ onClose }) {
    const HOLES = 9
    const ANIMALS = ['🐹', '🐸', '🐭', '🐰', '🦊', '🐻', '🐨', '🐮', '🐷']
    const [active, setActive] = useState(Array(HOLES).fill(false))
    const [score, setScore] = useState(0)
    const [missed, setMissed] = useState(0)
    const [timeLeft, setTimeLeft] = useState(30)
    const [started, setStarted] = useState(false)
    const timersRef = useRef([])

    function start() { setActive(Array(HOLES).fill(false)); setScore(0); setMissed(0); setTimeLeft(30); setStarted(true) }

    function popHole(i) {
        if (timersRef.current[i]) clearTimeout(timersRef.current[i])
        setActive(a => { const n = [...a]; n[i] = true; return n })
        const dur = 1000 + Math.random() * 1000
        timersRef.current[i] = setTimeout(() => {
            setActive(a => { const n = [...a]; if (n[i]) setMissed(m => m + 1); n[i] = false; return n })
        }, dur)
    }

    useEffect(() => {
        if (!started || timeLeft <= 0) return
        const spawn = setInterval(() => {
            const avail = active.map((a, i) => !a ? i : -1).filter(i => i >= 0)
            if (avail.length > 0) popHole(avail[Math.floor(Math.random() * avail.length)])
        }, 700)
        const timer = setInterval(() => setTimeLeft(t => { if (t <= 1) { clearInterval(spawn); clearInterval(timer) } return t - 1 }), 1000)
        return () => { clearInterval(spawn); clearInterval(timer) }
    }, [started, timeLeft]) // eslint-disable-line

    function whack(i) {
        if (!active[i]) return
        if (timersRef.current[i]) clearTimeout(timersRef.current[i])
        setActive(a => { const n = [...a]; n[i] = false; return n })
        setScore(s => s + 10)
    }

    const done = timeLeft <= 0

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🐹 Whack-a-Mole</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className={timeLeft <= 5 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-4" style={{ background: 'linear-gradient(135deg,#56ab2f,#a8e063)' }}>
                {!started ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🐹</div>
                        <p className="text-white text-xl font-bold text-center">Tap the animals when they pop up!</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{score >= 150 ? '🏆' : score >= 80 ? '⭐' : '🐹'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-white/70 text-sm">Missed: {missed}</p>
                        <button onClick={start} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-3 p-4">
                        {active.map((isUp, i) => (
                            <button key={i} onClick={() => whack(i)}
                                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl transition-all duration-150 border-4 ${isUp ? 'bg-yellow-300 border-yellow-400 scale-110 shadow-lg' : 'bg-amber-900/60 border-amber-800'}`}
                                style={{ transform: isUp ? 'translateY(-8px) scale(1.1)' : 'translateY(0)' }}>
                                {isUp ? ANIMALS[i] : '🕳️'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 11 — TYPING SPEED ⌨️
   Type the shown word as fast as possible!
───────────────────────────────────────────────────────────────────────────── */
const TYPING_WORDS = ['CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'FISH', 'BIRD', 'TREE', 'RAIN', 'BOOK', 'JUMP', 'PLAY', 'SING', 'LOVE', 'BLUE', 'KING', 'FROG', 'DUCK', 'LION', 'BEAR']
function TypingSpeed({ onClose }) {
    const [wordIdx, setWordIdx] = useState(0)
    const [input, setInput] = useState('')
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(45)
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(false)
    const [words, setWords] = useState(() => [...TYPING_WORDS].sort(() => Math.random() - 0.5))
    const current = words[wordIdx % words.length]

    useEffect(() => {
        if (!started || done) return
        const t = setInterval(() => setTimeLeft(v => { if (v <= 1) { setDone(true); return 0 } return v - 1 }), 1000)
        return () => clearInterval(t)
    }, [started, done])

    function onType(val) {
        setInput(val)
        if (val.toUpperCase() === current) {
            setScore(s => s + 10)
            setWordIdx(i => i + 1)
            setInput('')
        }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">⌨️ Typing Speed</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className={timeLeft <= 10 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-6 px-6" style={{ background: 'linear-gradient(135deg,#2d1b69,#11998e)' }}>
                {!started ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">⌨️</div>
                        <p className="text-white text-xl font-bold text-center">Type the words as fast as you can in 45 seconds!</p>
                        <button onClick={() => setStarted(true)} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                ) : done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{score >= 100 ? '🏆' : '⌨️'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-gray-400 text-sm">{score / 10} words typed!</p>
                        <button onClick={() => { setScore(0); setWordIdx(0); setTimeLeft(45); setInput(''); setDone(false); setWords([...TYPING_WORDS].sort(() => Math.random() - 0.5)) }} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        <div className="glass rounded-2xl px-12 py-6 text-center">
                            <p className="text-5xl font-black text-white tracking-widest">{current}</p>
                        </div>
                        <input value={input} onChange={e => onType(e.target.value.toUpperCase())}
                            placeholder="Type here..." autoFocus
                            className="input-field text-center text-2xl font-bold uppercase tracking-widest w-full max-w-xs" />
                        <p className="text-gray-400 text-sm">Words typed: {Math.floor(score / 10)}</p>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 12 — FIND THE ODD 🔍
   Find the emoji that doesn't belong in the group!
───────────────────────────────────────────────────────────────────────────── */
const ODD_SETS = [
    { group: ['🐶', '🐱', '🐰', '🚗', '🦊'], odd: '🚗' },
    { group: ['🍎', '🍊', '🍋', '🍇', '⚽'], odd: '⚽' },
    { group: ['🌸', '🌺', '🌹', '🌻', '🏀'], odd: '🏀' },
    { group: ['✈️', '🚂', '🚗', '🚢', '🎂'], odd: '🎂' },
    { group: ['📚', '📖', '📝', '🖊️', '🎸'], odd: '🎸' },
    { group: ['🌙', '⭐', '☀️', '🌟', '🐸'], odd: '🐸' },
    { group: ['🎵', '🎤', '🥁', '🎸', '🐘'], odd: '🐘' },
    { group: ['🏠', '🏰', '🏯', '🕌', '🐬'], odd: '🐬' },
]
function FindOdd({ onClose }) {
    const rand = () => ODD_SETS[Math.floor(Math.random() * ODD_SETS.length)]
    const [current, setCurrent] = useState(rand)
    const [shuffled, setShuffled] = useState(() => [...rand().group].sort(() => Math.random() - 0.5))
    const [score, setScore] = useState(0)
    const [msg, setMsg] = useState('')
    const [wrong, setWrong] = useState(0)

    function newQ() {
        const q = rand()
        setCurrent(q)
        setShuffled([...q.group].sort(() => Math.random() - 0.5))
    }

    function guess(emoji) {
        if (emoji === current.odd) {
            setMsg('✅ Correct! +10')
            setScore(s => s + 10)
        } else {
            setMsg('❌ Wrong! Try again next time')
            setWrong(w => w + 1)
        }
        setTimeout(() => { setMsg(''); newQ() }, 900)
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🔍 Find the Odd</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className="text-red-400 text-sm">❌ {wrong}</span>
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-8 px-6" style={{ background: 'linear-gradient(135deg,#f7971e,#ffd200)' }}>
                {msg ? (
                    <p className="text-white text-2xl font-black">{msg}</p>
                ) : (
                    <>
                        <p className="text-white text-xl font-bold text-center">Which one doesn't belong?</p>
                        <div className="flex gap-4 flex-wrap justify-center">
                            {shuffled.map((e, i) => (
                                <button key={i} onClick={() => guess(e)}
                                    className="w-20 h-20 rounded-2xl bg-white/20 hover:bg-white/40 border-2 border-white/30 text-5xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg">
                                    {e}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 13 — REACTION TIME ⚡
   Tap the screen as fast as possible when it turns green!
───────────────────────────────────────────────────────────────────────────── */
function ReactionTime({ onClose }) {
    const [phase, setPhase] = useState('idle') // idle | waiting | ready | done
    const [reaction, setReaction] = useState(null)
    const [best, setBest] = useState(() => Number(localStorage.getItem('reaction_best') || 0))
    const startRef = useRef(null)
    const timerRef = useRef(null)

    function begin() {
        setPhase('waiting')
        setReaction(null)
        const delay = 2000 + Math.random() * 3000
        timerRef.current = setTimeout(() => { setPhase('ready'); startRef.current = Date.now() }, delay)
    }

    function tap() {
        if (phase === 'idle' || phase === 'done') { begin(); return }
        if (phase === 'waiting') { clearTimeout(timerRef.current); setPhase('idle'); setReaction(-1); return }
        const ms = Date.now() - startRef.current
        setReaction(ms)
        setPhase('done')
        if (!best || ms < best) { setBest(ms); localStorage.setItem('reaction_best', ms) }
    }

    const bg = phase === 'ready' ? '#22c55e' : phase === 'waiting' ? '#ef4444' : '#1f1f2e'

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">⚡ Reaction Time</h2>
                {best > 0 && <span className="text-yellow-300 text-sm font-bold">Best: {best}ms</span>}
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-6 cursor-pointer select-none"
                style={{ background: bg, transition: 'background 0.1s' }} onClick={tap}>
                {phase === 'idle' && (
                    <div className="flex flex-col items-center gap-5">
                        <div className="text-6xl">⚡</div>
                        <p className="text-white text-2xl font-black text-center">Tap when GREEN!</p>
                        <p className="text-white/70 text-sm">Tap anywhere to start</p>
                    </div>
                )}
                {phase === 'waiting' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl animate-pulse">🔴</div>
                        <p className="text-white text-2xl font-bold">Wait for green...</p>
                        <p className="text-white/60 text-sm">(Tap now = FAIL!)</p>
                    </div>
                )}
                {phase === 'ready' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🟢</div>
                        <p className="text-white text-4xl font-black">TAP NOW!</p>
                    </div>
                )}
                {phase === 'done' && (
                    <div className="flex flex-col items-center gap-4">
                        {reaction === -1 ? (
                            <><div className="text-6xl">😅</div><p className="text-white text-2xl font-black">Too early! -10 points</p></>
                        ) : (
                            <><div className="text-6xl">{reaction < 200 ? '🚀' : reaction < 400 ? '⚡' : '🐢'}</div>
                                <p className="text-white text-3xl font-black">{reaction}ms</p>
                                <p className="text-white/70">{reaction < 200 ? 'Lightning fast!' : reaction < 400 ? 'Great reaction!' : 'Keep practicing!'}</p></>
                        )}
                        <p className="text-white/60 text-sm mt-2">Tap to play again</p>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 14 — SIMON SAYS 🟦
   Repeat the colour sequence!
───────────────────────────────────────────────────────────────────────────── */
const SIMON_COLORS = [
    { id: 'red', bg: '#ef4444', active: '#fca5a5' },
    { id: 'blue', bg: '#3b82f6', active: '#93c5fd' },
    { id: 'green', bg: '#22c55e', active: '#86efac' },
    { id: 'yellow', bg: '#eab308', active: '#fde047' },
]
function SimonSays({ onClose }) {
    const [sequence, setSequence] = useState([])
    const [playerSeq, setPlayerSeq] = useState([])
    const [active, setActive] = useState(null)
    const [phase, setPhase] = useState('start') // start | showing | input | fail
    const [level, setLevel] = useState(0)

    function startGame() {
        const first = SIMON_COLORS[Math.floor(Math.random() * 4)].id
        const seq = [first]
        setSequence(seq)
        setPlayerSeq([])
        setLevel(1)
        showSequence(seq)
    }

    async function showSequence(seq) {
        setPhase('showing')
        await new Promise(r => setTimeout(r, 500))
        for (const c of seq) {
            setActive(c)
            await new Promise(r => setTimeout(r, 600))
            setActive(null)
            await new Promise(r => setTimeout(r, 200))
        }
        setPhase('input')
    }

    function playerTap(colorId) {
        if (phase !== 'input') return
        const newSeq = [...playerSeq, colorId]
        setPlayerSeq(newSeq)
        const idx = newSeq.length - 1
        if (colorId !== sequence[idx]) { setPhase('fail'); return }
        if (newSeq.length === sequence.length) {
            const nextSeq = [...sequence, SIMON_COLORS[Math.floor(Math.random() * 4)].id]
            setSequence(nextSeq)
            setPlayerSeq([])
            setLevel(l => l + 1)
            setTimeout(() => showSequence(nextSeq), 700)
        }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🟦 Simon Says</h2>
                <span className="text-yellow-300 font-bold">Level {level}</span>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-8" style={{ background: 'linear-gradient(135deg,#0f2027,#203a43,#2c5364)' }}>
                {phase === 'start' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🟦</div>
                        <p className="text-white text-xl font-bold text-center">Repeat the colour sequence!</p>
                        <button onClick={startGame} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                )}
                {phase === 'fail' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">💥</div>
                        <p className="text-white text-2xl font-black">Wrong! Level {level}</p>
                        <button onClick={() => { setLevel(0); setPhase('start') }} className="btn-primary">Try Again</button>
                    </div>
                )}
                {(phase === 'showing' || phase === 'input') && (
                    <>
                        <p className="text-white text-sm font-semibold">{phase === 'showing' ? '👀 Watch carefully...' : '👆 Your turn!'}</p>
                        <div className="grid grid-cols-2 gap-4">
                            {SIMON_COLORS.map(c => (
                                <button key={c.id} onClick={() => playerTap(c.id)}
                                    className="w-28 h-28 rounded-2xl transition-all duration-150 border-4 border-white/20 shadow-lg hover:scale-105 active:scale-95"
                                    style={{ background: active === c.id ? c.active : c.bg, boxShadow: active === c.id ? `0 0 30px ${c.active}` : 'none' }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 15 — ALPHABET HUNT 🔤
   Find and tap all the A's (or any given letter) hiding among others!
───────────────────────────────────────────────────────────────────────────── */
function AlphabetHunt({ onClose }) {
    const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    function makeGrid(target) {
        const others = LETTERS.replace(target, '').split('')
        const cells = Array(25).fill(null).map(() => others[Math.floor(Math.random() * others.length)])
        const count = 3 + Math.floor(Math.random() * 5)
        const positions = new Set()
        while (positions.size < count) positions.add(Math.floor(Math.random() * 25))
        positions.forEach(p => { cells[p] = target })
        return cells
    }
    const [target] = useState(() => LETTERS[Math.floor(Math.random() * 26)])
    const [grid, setGrid] = useState(() => makeGrid(LETTERS[Math.floor(Math.random() * 26)]))
    const [score, setScore] = useState(0)
    const [missed, setMissed] = useState(0)
    const [round, setRound] = useState(1)
    const [msg, setMsg] = useState('')
    const [currentTarget, setCurrentTarget] = useState(() => LETTERS[Math.floor(Math.random() * 26)])

    function tap(i) {
        if (grid[i] === currentTarget) {
            const newGrid = [...grid]
            newGrid[i] = '✓'
            setGrid(newGrid)
            setScore(s => s + 10)
        } else {
            setMissed(m => m + 1)
            setMsg('❌')
            setTimeout(() => setMsg(''), 400)
        }
        if (grid.filter(c => c === currentTarget).length <= 1) {
            setTimeout(() => {
                const t = LETTERS[Math.floor(Math.random() * 26)]
                setCurrentTarget(t)
                setGrid(makeGrid(t))
                setRound(r => r + 1)
            }, 500)
        }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🔤 Alphabet Hunt</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className="text-white">Round {round}</span>
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-5 px-4" style={{ background: 'linear-gradient(135deg,#0d0d2b,#1a1a5e)' }}>
                <div className="text-center">
                    <p className="text-gray-400 text-sm mb-1">Find all the letter:</p>
                    <p className="text-6xl font-black text-yellow-300 drop-shadow-lg">{currentTarget}</p>
                    {msg && <p className="text-red-400 text-xl font-bold mt-1">{msg}</p>}
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {grid.map((cell, i) => (
                        <button key={i} onClick={() => tap(i)}
                            className={`w-12 h-12 rounded-xl text-lg font-black border-2 transition-all hover:scale-110 active:scale-95 ${cell === '✓' ? 'bg-green-500/30 border-green-400 text-green-400' :
                                    cell === currentTarget ? 'bg-white/10 border-white/20 text-yellow-200 hover:bg-yellow-400/20' :
                                        'bg-white/5 border-white/10 text-gray-300 hover:bg-white/15'
                                }`}>
                            {cell}
                        </button>
                    ))}
                </div>
                <p className="text-gray-500 text-xs">Missed: {missed}</p>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 16 — PATTERN MEMORY 🎯
   Memorize and repeat the button pattern!
───────────────────────────────────────────────────────────────────────────── */
function PatternMemory({ onClose }) {
    const BUTTONS = ['🔴', '🔵', '🟢', '🟡', '🟣', '⚪']
    const [sequence, setSequence] = useState([])
    const [input, setInput] = useState([])
    const [showing, setShowing] = useState(false)
    const [activeIdx, setActiveIdx] = useState(-1)
    const [gamePhase, setGamePhase] = useState('start')
    const [level, setLevel] = useState(0)

    async function startRound(seq) {
        setGamePhase('show')
        setShowing(true)
        setInput([])
        await new Promise(r => setTimeout(r, 300))
        for (let i = 0; i < seq.length; i++) {
            setActiveIdx(i)
            await new Promise(r => setTimeout(r, 700))
            setActiveIdx(-1)
            await new Promise(r => setTimeout(r, 200))
        }
        setShowing(false)
        setGamePhase('input')
    }

    function start() {
        const seq = [Math.floor(Math.random() * 6)]
        setSequence(seq)
        setLevel(1)
        startRound(seq)
    }

    function tap(idx) {
        if (gamePhase !== 'input') return
        const newInput = [...input, idx]
        setInput(newInput)
        if (idx !== sequence[newInput.length - 1]) { setGamePhase('fail'); return }
        if (newInput.length === sequence.length) {
            const next = [...sequence, Math.floor(Math.random() * 6)]
            setSequence(next)
            setLevel(l => l + 1)
            setTimeout(() => startRound(next), 500)
        }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🎯 Pattern Memory</h2>
                <span className="text-yellow-300 font-bold">Level {level}</span>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-8" style={{ background: 'linear-gradient(135deg,#16213e,#0f3460)' }}>
                {gamePhase === 'start' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🎯</div>
                        <p className="text-white text-xl font-bold text-center">Memorize the pattern and repeat it!</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                )}
                {gamePhase === 'fail' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">💥</div>
                        <p className="text-white text-2xl font-black">Wrong! You reached level {level}</p>
                        <button onClick={() => { setLevel(0); setGamePhase('start') }} className="btn-primary">Try Again</button>
                    </div>
                )}
                {(gamePhase === 'show' || gamePhase === 'input') && (
                    <>
                        <p className="text-white text-sm">{gamePhase === 'show' ? '👀 Memorize...' : '👆 Repeat the pattern!'}</p>
                        <div className="grid grid-cols-3 gap-3">
                            {BUTTONS.map((btn, i) => (
                                <button key={i} onClick={() => tap(i)}
                                    className={`w-20 h-20 rounded-2xl text-3xl font-black border-4 transition-all duration-150 flex items-center justify-center ${showing && sequence[activeIdx] === i ? 'scale-110 border-white shadow-2xl brightness-150' : 'border-white/20 hover:scale-105 active:scale-95'
                                        }`}
                                    style={{ background: showing && sequence[activeIdx] === i ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)' }}>
                                    {btn}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 17 — COUNTDOWN BLAST 🚀
   Click the countdown target exactly on 0!
───────────────────────────────────────────────────────────────────────────── */
function CountdownBlast({ onClose }) {
    const [count, setCount] = useState(5)
    const [running, setRunning] = useState(false)
    const [result, setResult] = useState(null)
    const [score, setScore] = useState(0)
    const [round, setRound] = useState(0)
    const intervalRef = useRef(null)
    const countRef = useRef(5)

    function start() {
        countRef.current = 5
        setCount(5)
        setResult(null)
        setRunning(true)
        setRound(r => r + 1)
        intervalRef.current = setInterval(() => {
            countRef.current -= 1
            setCount(countRef.current)
            if (countRef.current <= -3) {
                clearInterval(intervalRef.current)
                setRunning(false)
                setResult('miss')
            }
        }, 1000)
    }

    function blast() {
        if (!running) return
        clearInterval(intervalRef.current)
        setRunning(false)
        const c = countRef.current
        if (c === 0) { setScore(s => s + 30); setResult('perfect') }
        else if (c === 1 || c === -1) { setScore(s => s + 15); setResult('close') }
        else { setResult('miss') }
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🚀 Countdown Blast</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span className="text-white">Round {round}</span>
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-8" style={{ background: 'linear-gradient(180deg,#000000,#1a0533,#300060)' }}>
                {!running && result === null && round === 0 ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">🚀</div>
                        <p className="text-white text-xl font-bold text-center">Tap BLAST exactly when the counter hits 0!</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Ready?</button>
                    </div>
                ) : result ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{result === 'perfect' ? '🎯' : result === 'close' ? '⭐' : '💥'}</div>
                        <p className="text-white text-2xl font-black">{result === 'perfect' ? 'PERFECT! +30' : result === 'close' ? 'Close! +15' : 'Missed!'}</p>
                        <button onClick={start} className="btn-primary">Next Round</button>
                    </div>
                ) : (
                    <>
                        <div className="text-9xl font-black text-white tabular-nums" style={{ textShadow: count <= 1 ? '0 0 40px #f97316' : '0 0 20px white' }}>
                            {count}
                        </div>
                        <button onClick={blast}
                            className="w-40 h-40 rounded-full bg-gradient-to-br from-orange-500 to-red-600 text-white text-3xl font-black shadow-2xl active:scale-95 transform transition"
                            style={{ WebkitTapHighlightColor: 'transparent' }}>
                            🚀 BLAST!
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 18 — COIN FLIP 🪙
   Predict heads or tails — win streaks for bonus points!
───────────────────────────────────────────────────────────────────────────── */
function CoinFlip({ onClose }) {
    const [score, setScore] = useState(0)
    const [streak, setStreak] = useState(0)
    const [spinning, setSpinning] = useState(false)
    const [result, setResult] = useState(null)
    const [chosen, setChosen] = useState(null)
    const [msg, setMsg] = useState('')

    function flip(choice) {
        if (spinning) return
        setChosen(choice)
        setSpinning(true)
        setResult(null)
        setMsg('')
        setTimeout(() => {
            const r = Math.random() < 0.5 ? 'heads' : 'tails'
            setResult(r)
            setSpinning(false)
            if (r === choice) {
                const newStreak = streak + 1
                setStreak(newStreak)
                const pts = 10 + (newStreak > 1 ? (newStreak - 1) * 5 : 0)
                setScore(s => s + pts)
                setMsg(`✅ Correct! +${pts} ${newStreak > 2 ? `🔥x${newStreak}` : ''}`)
            } else {
                setStreak(0)
                setMsg('❌ Wrong!')
            }
        }, 1000)
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🪙 Coin Flip</h2>
                <div className="flex gap-3 text-sm">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    {streak > 1 && <span className="text-orange-400 font-bold">🔥x{streak}</span>}
                </div>
            </div>
            <div className="game-arena flex flex-col items-center justify-center gap-8" style={{ background: 'linear-gradient(135deg,#c79100,#3d2b00)' }}>
                <div className={`text-8xl transition-all duration-500 ${spinning ? 'animate-spin' : ''}`}>
                    {spinning ? '🪙' : result === 'heads' ? '👑' : result === 'tails' ? '🦅' : '🪙'}
                </div>
                {msg && <p className="text-white text-xl font-black">{msg}</p>}
                <p className="text-white text-lg font-bold">Choose your prediction:</p>
                <div className="flex gap-6">
                    <button onClick={() => flip('heads')} disabled={spinning}
                        className="px-8 py-4 rounded-2xl bg-yellow-500/30 border-2 border-yellow-400 text-white font-black text-lg hover:bg-yellow-500/50 active:scale-95 transition-all disabled:opacity-50">
                        👑 Heads
                    </button>
                    <button onClick={() => flip('tails')} disabled={spinning}
                        className="px-8 py-4 rounded-2xl bg-yellow-500/30 border-2 border-yellow-400 text-white font-black text-lg hover:bg-yellow-500/50 active:scale-95 transition-all disabled:opacity-50">
                        🦅 Tails
                    </button>
                </div>
                <p className="text-white/50 text-sm">Streak bonus starts at 2+ in a row!</p>
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 19 — FRUIT SLICER 🍉
   Tap the fruits before they fall! Avoid the bombs!
───────────────────────────────────────────────────────────────────────────── */
function FruitSlicer({ onClose }) {
    const FRUITS = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍍', '🥝']
    const [items, setItems] = useState([])
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [started, setStarted] = useState(false)
    const [done, setDone] = useState(false)
    const [timeLeft, setTimeLeft] = useState(35)
    const idRef = useRef(0)
    const livesRef = useRef(3)

    function start() { setItems([]); setScore(0); setLives(3); livesRef.current = 3; setDone(false); setTimeLeft(35); setStarted(true) }

    useEffect(() => {
        if (!started || done) return
        const spawn = setInterval(() => {
            const isBomb = Math.random() < 0.2
            setItems(prev => [...prev, {
                id: ++idRef.current,
                x: 5 + Math.random() * 80,
                isBomb,
                emoji: isBomb ? '💣' : FRUITS[Math.floor(Math.random() * FRUITS.length)],
                speed: 3 + Math.random() * 3,
            }])
        }, 750)
        const timer = setInterval(() => setTimeLeft(t => { if (t <= 1) { setDone(true); return 0 } return t - 1 }), 1000)
        return () => { clearInterval(spawn); clearInterval(timer) }
    }, [started, done])

    function slice(id, isBomb) {
        setItems(prev => prev.filter(i => i.id !== id))
        if (isBomb) {
            livesRef.current -= 1
            setLives(livesRef.current)
            if (livesRef.current <= 0) setDone(true)
        } else {
            setScore(s => s + 10)
        }
    }

    function gone(id, isBomb) {
        setItems(prev => prev.filter(i => i.id !== id))
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">🍉 Fruit Slicer</h2>
                <div className="flex gap-3 text-sm items-center">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span>{[1, 2, 3].map(i => <span key={i}>{i <= lives ? '❤️' : '🖤'}</span>)}</span>
                    <span className={timeLeft <= 8 ? 'text-red-400 animate-pulse font-bold' : 'text-white'}>⏱ {timeLeft}s</span>
                </div>
            </div>
            <div className="game-arena relative overflow-hidden" style={{ background: 'linear-gradient(180deg,#1a0533,#0d2137)' }}>
                {!started && !done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="text-6xl">🍉</div>
                        <p className="text-white text-xl font-bold">Slice the fruits! Avoid bombs!</p>
                        <button onClick={start} className="btn-primary text-lg px-8 py-3">Start!</button>
                    </div>
                )}
                {done && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10 bg-black/40">
                        <div className="text-6xl">{score >= 150 ? '🏆' : '🍉'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <button onClick={start} className="btn-primary">Play Again</button>
                    </div>
                )}
                {items.map(item => (
                    <div key={item.id}
                        onClick={() => slice(item.id, item.isBomb)}
                        onAnimationEnd={() => gone(item.id, item.isBomb)}
                        className="absolute cursor-pointer select-none text-4xl hover:scale-125 transition-transform"
                        style={{
                            left: `${item.x}%`, top: '-60px',
                            animation: `fallDown ${item.speed}s linear forwards`,
                            transform: 'translate(-50%, 0)'
                        }}>
                        {item.emoji}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME 20 — TRUE OR FALSE ❓
   Answer fun true/false questions for kids!
───────────────────────────────────────────────────────────────────────────── */
const TRUE_FALSE_QS = [
    { q: 'The sun rises in the East', a: true },
    { q: 'Elephants can fly', a: false },
    { q: 'Fish live in water', a: true },
    { q: 'The Moon is bigger than the Sun', a: false },
    { q: 'Bats are blind', a: false },
    { q: 'A caterpillar becomes a butterfly', a: true },
    { q: 'Lions are herbivores', a: false },
    { q: 'Penguins live in the Arctic', a: false },
    { q: 'Honey never expires', a: true },
    { q: 'Sharks are mammals', a: false },
    { q: 'The Amazon is the longest river', a: false },
    { q: 'Sound travels faster than light', a: false },
    { q: 'Humans have 206 bones', a: true },
    { q: 'Frogs are amphibians', a: true },
    { q: 'The Earth is flat', a: false },
    { q: 'Spiders have 8 legs', a: true },
    { q: 'The Great Wall is visible from space', a: false },
    { q: 'A group of lions is called a pride', a: true },
    { q: 'Iron is heavier than gold', a: false },
    { q: 'Plants make food from sunlight', a: true },
]
function TrueFalse({ onClose }) {
    const [qs] = useState(() => [...TRUE_FALSE_QS].sort(() => Math.random() - 0.5))
    const [idx, setIdx] = useState(0)
    const [score, setScore] = useState(0)
    const [lives, setLives] = useState(3)
    const [done, setDone] = useState(false)
    const [flash, setFlash] = useState(null)
    const current = qs[idx]

    function answer(val) {
        if (val === current.a) { setFlash('correct'); setScore(s => s + 10) }
        else { setFlash('wrong'); const l = lives - 1; setLives(l); if (l <= 0) { setDone(true); return } }
        setTimeout(() => {
            setFlash(null)
            if (idx + 1 >= qs.length) setDone(true)
            else setIdx(i => i + 1)
        }, 600)
    }

    return (
        <div className="game-overlay">
            <div className="game-header">
                <button onClick={onClose} className="game-close">✕</button>
                <h2 className="text-white font-black text-xl">❓ True or False</h2>
                <div className="flex gap-3 text-sm items-center">
                    <span className="text-yellow-300 font-bold">⭐ {score}</span>
                    <span>{[1, 2, 3].map(i => <span key={i}>{i <= lives ? '❤️' : '🖤'}</span>)}</span>
                </div>
            </div>
            <div className={`game-arena flex flex-col items-center justify-center gap-8 px-6 transition-colors ${flash === 'correct' ? 'bg-green-900/30' : flash === 'wrong' ? 'bg-red-900/30' : ''}`}
                style={{ background: 'linear-gradient(135deg,#1d1d2e,#2d1456)' }}>
                {done ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-6xl">{score >= 150 ? '🏆' : '🎉'}</div>
                        <p className="text-white text-2xl font-black">Score: {score}</p>
                        <p className="text-gray-400 text-sm">{idx + 1} questions answered</p>
                        <button onClick={() => { setIdx(0); setScore(0); setLives(3); setDone(false); setFlash(null) }} className="btn-primary">Play Again</button>
                    </div>
                ) : (
                    <>
                        <p className="text-gray-400 text-sm">{idx + 1} / {qs.length}</p>
                        <div className="glass rounded-2xl px-6 py-8 text-center max-w-sm w-full">
                            <p className="text-2xl font-bold text-white leading-snug">{current.q}</p>
                        </div>
                        <div className="flex gap-5">
                            <button onClick={() => answer(true)}
                                className="px-10 py-5 rounded-2xl bg-green-500/30 border-2 border-green-400 text-white font-black text-2xl hover:bg-green-500/50 active:scale-95 transition-all shadow-lg">
                                ✅ TRUE
                            </button>
                            <button onClick={() => answer(false)}
                                className="px-10 py-5 rounded-2xl bg-red-500/30 border-2 border-red-400 text-white font-black text-2xl hover:bg-red-500/50 active:scale-95 transition-all shadow-lg">
                                ❌ FALSE
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────────
   GAME HUB — Main page with all 20 game cards
───────────────────────────────────────────────────────────────────────────── */
const GAMES = [
    { id: 'bubble', label: 'Bubble Pop', emoji: '🫧', desc: 'Click bubbles before they escape!', color: 'from-purple-500 to-blue-500', component: BubblePop },
    { id: 'race', label: 'Animal Race', emoji: '🐎', desc: 'Tap fast to win the race!', color: 'from-green-400 to-teal-500', component: AnimalRace },
    { id: 'number', label: 'Number Order', emoji: '🔢', desc: 'Click numbers 1–15 in order!', color: 'from-blue-600 to-indigo-500', component: NumberOrder },
    { id: 'color', label: 'Color Match', emoji: '🎨', desc: 'Find the right color fast!', color: 'from-pink-500 to-rose-500', component: ColorMatch },
    { id: 'memory', label: 'Emoji Memory', emoji: '🃏', desc: 'Flip cards to find pairs!', color: 'from-violet-500 to-purple-600', component: EmojiMemory },
    { id: 'star', label: 'Star Catcher', emoji: '⭐', desc: 'Catch stars, dodge bombs!', color: 'from-blue-800 to-blue-500', component: StarCatcher },
    { id: 'math', label: 'Math Race', emoji: '➕', desc: 'Solve sums as fast as possible!', color: 'from-orange-400 to-amber-500', component: MathRace },
    { id: 'balloon', label: 'Balloon Burst', emoji: '🎈', desc: 'Pop falling balloons for points!', color: 'from-sky-400 to-cyan-400', component: BalloonBurst },
    { id: 'word', label: 'Word Scramble', emoji: '📝', desc: 'Unscramble the hidden word!', color: 'from-fuchsia-500 to-pink-500', component: WordScramble },
    { id: 'mole', label: 'Whack-a-Mole', emoji: '🐹', desc: 'Whack the animals as they pop up!', color: 'from-lime-500 to-green-600', component: WhackAMole },
    { id: 'typing', label: 'Typing Speed', emoji: '⌨️', desc: 'Type words as fast as you can!', color: 'from-teal-500 to-emerald-600', component: TypingSpeed },
    { id: 'odd', label: 'Find the Odd', emoji: '🔍', desc: "Spot the emoji that doesn't belong!", color: 'from-yellow-400 to-orange-500', component: FindOdd },
    { id: 'reaction', label: 'Reaction Time', emoji: '⚡', desc: 'Tap when it turns green!', color: 'from-green-600 to-lime-500', component: ReactionTime },
    { id: 'simon', label: 'Simon Says', emoji: '🟦', desc: 'Repeat the colour sequence!', color: 'from-blue-500 to-cyan-600', component: SimonSays },
    { id: 'alpha', label: 'Alphabet Hunt', emoji: '🔤', desc: 'Find the hidden letters!', color: 'from-indigo-600 to-purple-700', component: AlphabetHunt },
    { id: 'pattern', label: 'Pattern Memory', emoji: '🎯', desc: 'Memorize and repeat the buttons!', color: 'from-slate-500 to-blue-700', component: PatternMemory },
    { id: 'countdown', label: 'Countdown Blast', emoji: '🚀', desc: 'Tap exactly when timer hits 0!', color: 'from-red-600 to-orange-700', component: CountdownBlast },
    { id: 'coin', label: 'Coin Flip', emoji: '🪙', desc: 'Predict heads or tails for streaks!', color: 'from-yellow-600 to-amber-700', component: CoinFlip },
    { id: 'fruit', label: 'Fruit Slicer', emoji: '🍉', desc: 'Slice fruits, avoid bombs!', color: 'from-red-400 to-pink-600', component: FruitSlicer },
    { id: 'truefalse', label: 'True or False', emoji: '❓', desc: 'Answer fun true/false facts!', color: 'from-purple-600 to-violet-700', component: TrueFalse },
]

export default function Games() {
    const [active, setActive] = useState(null)
    const GameComponent = active ? GAMES.find(g => g.id === active)?.component : null

    return (
        <>
            {/* Inject keyframes */}
            <style>{`
                @keyframes floatUp   { from { transform:translateY(0)   } to { transform:translateY(-110vh) } }
                @keyframes fallDown  { from { transform:translateY(0)   } to { transform:translateY(110vh)  } }
                .game-overlay  { position:fixed; inset:0; z-index:100; display:flex; flex-direction:column; background:#0f0f0f; }
                .game-header   { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(255,255,255,0.05); border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink:0; }
                .game-close    { width:32px; height:32px; border-radius:50%; background:rgba(255,255,255,0.1); color:white; font-weight:bold; border:none; cursor:pointer; }
                .game-arena    { flex:1; overflow:hidden; }
            `}</style>

            {GameComponent && <GameComponent onClose={() => setActive(null)} />}

            <div className="min-h-screen bg-kids-bg pt-24 pb-12 px-4 sm:px-6 max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white mb-1">🎮 Mini Games</h1>
                    <p className="text-gray-400">20 fun games for kids! Tap any to play.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {GAMES.map(game => (
                        <button key={game.id} onClick={() => setActive(game.id)}
                            className="group glass rounded-2xl p-4 text-left hover:scale-105 active:scale-95 transition-all duration-200 border border-white/10 hover:border-white/30 cursor-pointer">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                                {game.emoji}
                            </div>
                            <p className="text-white font-bold text-sm mb-1">{game.label}</p>
                            <p className="text-gray-400 text-xs leading-tight">{game.desc}</p>
                        </button>
                    ))}
                </div>

                <div className="mt-8 glass rounded-2xl p-4 flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                        <p className="text-white font-semibold text-sm">Tips</p>
                        <p className="text-gray-400 text-xs">Games earn fun points! Tap any card to start. Use ← → buttons for Star Catcher on mobile.</p>
                    </div>
                </div>
            </div>
        </>
    )
}
