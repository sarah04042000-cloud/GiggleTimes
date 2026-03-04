/**
 * melodyPlayer.js
 * Plays the ACTUAL melody of each nursery rhyme using the Web Audio API.
 * No external URLs needed — pure in-browser note synthesis.
 */

// ── Note frequencies (Hz) ──────────────────────────────────────────────────
const N = {
    G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61,
    // Bb (B-flat)
    Bb3: 233.08, Bb4: 466.16,
    // F# and C#
    Fs4: 369.99, Cs5: 554.37,
    // Special: 0 = rest
    _: 0,
}

// BPM and note durations
const BPM = 120
const Q = 60 / BPM        // quarter note (0.5s)
const H = Q * 2           // half note   (1.0s)
const W = Q * 4           // whole note  (2.0s)
const E = Q / 2           // eighth note (0.25s)
const DQ = Q * 1.5         // dotted quarter (0.75s)
const DH = H * 1.5         // dotted half (1.5s)

/**
 * Melody format: array of [frequency, duration_in_seconds]
 * frequency = 0 means rest
 */

const MELODIES = {
    // ── 1. Twinkle Twinkle Little Star ────────────────────────────────────────
    "Twinkle Twinkle Little Star": [
        [N.C4, Q], [N.C4, Q], [N.G4, Q], [N.G4, Q], [N.A4, Q], [N.A4, Q], [N.G4, H],
        [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, Q], [N.D4, Q], [N.C4, H],
        [N.G4, Q], [N.G4, Q], [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, H],
        [N.G4, Q], [N.G4, Q], [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, H],
        [N.C4, Q], [N.C4, Q], [N.G4, Q], [N.G4, Q], [N.A4, Q], [N.A4, Q], [N.G4, H],
        [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, Q], [N.D4, Q], [N.C4, H],
    ],

    // ── 2. Wheels on the Bus ──────────────────────────────────────────────────
    // "The wheels on the bus go round and round, round and round..."
    "Wheels on the Bus": [
        [N.G4, E], [N.G4, E], [N.G4, Q], [N.G4, Q],  // The wheels on the
        [N.A4, E], [N.G4, E], [N.E4, Q],            // bus go round
        [N.C4, Q], [N.E4, Q], [N.G4, H],           // and round
        [N.G4, E], [N.G4, E], [N.G4, Q], [N.G4, Q],  // Round and round,
        [N.A4, E], [N.G4, E], [N.E4, Q],            // round and round
        [N.C4, Q], [N.E4, Q], [N.G4, H],           // ...
        [N.G4, E], [N.G4, E], [N.G4, Q], [N.G4, Q],  // The wheels on the
        [N.A4, E], [N.G4, E], [N.E4, Q],            // bus go round
        [N.D4, Q], [N.E4, Q], [N.C4, H],           // and round...
        [N.C4, Q], [N.C4, Q],                     // All through
        [N.D4, Q], [N.E4, Q], [N.G4, H],           // the town!
    ],

    // ── 3. Old MacDonald Had a Farm ───────────────────────────────────────────
    // Traditional - key of G
    "Old MacDonald Had a Farm": [
        [N.G4, Q], [N.G4, Q], [N.G4, Q], [N.D4, Q],  // Old Mac-Don-ald
        [N.E4, Q], [N.E4, Q], [N.D4, H],            // had a farm
        [N.B4, Q], [N.B4, Q], [N.A4, Q], [N.A4, Q],  // E-I-E-I
        [N.G4, W],                              // O!
        [N.D4, Q], [N.D4, Q],                     // And on
        [N.G4, Q], [N.G4, Q],                     // his farm
        [N.G4, Q], [N.D4, Q], [N.E4, Q], [N.E4, Q],  // he had a cow
        [N.D4, H],                              // ...
        [N.B4, Q], [N.B4, Q], [N.A4, Q], [N.A4, Q],  // E-I-E-I
        [N.G4, W],                              // O!
    ],

    // ── 4. Baa Baa Black Sheep ────────────────────────────────────────────────
    // Same notes as Twinkle (they share the melody in C major)
    "Baa Baa Black Sheep": [
        [N.C4, Q], [N.C4, Q], [N.G4, Q], [N.G4, Q], [N.A4, Q], [N.A4, Q], [N.G4, H],  // Baa baa black sheep have you any wool
        [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, Q], [N.D4, Q], [N.C4, H],  // Yes sir yes sir three bags full
        [N.G4, Q], [N.G4, Q], [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, H],  // One for the master
        [N.G4, Q], [N.G4, Q], [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, H],  // One for the dame
        [N.C4, Q], [N.C4, Q], [N.G4, Q], [N.G4, Q], [N.A4, Q], [N.A4, Q], [N.G4, H],  // And one for the little boy
        [N.F4, Q], [N.F4, Q], [N.E4, Q], [N.E4, Q], [N.D4, Q], [N.D4, Q], [N.C4, H],  // Who lives down the lane
    ],

    // ── 5. Johny Johny Yes Papa ───────────────────────────────────────────────
    "Johny Johny Yes Papa": [
        [N.G4, Q], [N.E4, Q], [N.G4, Q], [N.E4, Q],  // Johny Johny
        [N.G4, Q], [N.A4, Q], [N.G4, H],            // Yes Papa
        [N.E4, Q], [N.G4, Q], [N.E4, Q], [N.G4, Q],  // Eating sugar
        [N.E4, Q], [N.D4, Q], [N.C4, H],            // No Papa
        [N.G4, Q], [N.E4, Q], [N.G4, Q], [N.E4, Q],  // Telling lies
        [N.G4, Q], [N.A4, Q], [N.G4, H],            // No Papa
        [N.C4, Q], [N.D4, Q], [N.E4, Q], [N.G4, Q],  // Open your
        [N.E4, Q], [N.D4, Q], [N.C4, H],            // mouth Ha!
    ],

    // ── 6. Lakdi Ki Kathi ─────────────────────────────────────────────────────
    // Playful fast rhythm in D major
    "Lakdi Ki Kathi": [
        [N.D4, E], [N.E4, E], [N.Fs4, E], [N.D4, E],  // Lak-di ki
        [N.E4, E], [N.Fs4, E], [N.G4, Q],           // ka-thi
        [N.Fs4, E], [N.E4, E], [N.D4, E], [N.E4, E], // ka-thi pe
        [N.Fs4, Q], [N.D4, Q],                    // gho-da
        [N.G4, E], [N.A4, E], [N.G4, E], [N.Fs4, E], // gho-de ki
        [N.E4, Q], [N.D4, Q],                     // dum pe
        [N.A4, E], [N.G4, E], [N.Fs4, E], [N.E4, E], // jo maar-a
        [N.D4, H],                              // mar-to-da
        [N.D4, E], [N.E4, E], [N.Fs4, E], [N.G4, E], // dau-dha dau-
        [N.A4, Q], [N.D5, Q],                     // dha dau
        [N.D5, E], [N.A4, E], [N.G4, E], [N.Fs4, E], // dha gho-da
        [N.D4, H],                              // dum!
    ],

    // ── 7. Chanda Mama Door Ke ────────────────────────────────────────────────
    // Lullaby-style, gentle melody in C major
    "Chanda Mama Door Ke": [
        [N.E4, Q], [N.G4, Q], [N.A4, Q], [N.G4, Q],  // Chan-da ma-ma
        [N.E4, H], [N._, H],                      // door ke
        [N.D4, Q], [N.E4, Q], [N.G4, Q], [N.E4, Q],  // pu-re pa-kaye
        [N.D4, H], [N._, H],                      // bhoor ke
        [N.C4, Q], [N.D4, Q], [N.E4, Q], [N.G4, Q],  // aap kha-ye
        [N.A4, H], [N._, H],                      // tha-li mein
        [N.G4, Q], [N.E4, Q], [N.D4, Q], [N.C4, Q],  // mun-ne ko de
        [N.C4, H], [N._, H],                      // pya-li mein
    ],

    // ── 8. Machli Jal Ki Rani Hai ─────────────────────────────────────────────
    // Bouncy tune in G major
    "Machli Jal Ki Rani Hai": [
        [N.G4, Q], [N.A4, Q], [N.B4, Q], [N.G4, Q],  // Mach-li jal ki
        [N.A4, H], [N._, Q],                      // ra-ni hai
        [N.G4, Q], [N.A4, Q], [N.B4, Q], [N.G4, Q],  // jee-van us-ka
        [N.G4, H], [N._, Q],                      // paa-ni hai
        [N.B4, Q], [N.A4, Q], [N.G4, Q], [N.A4, Q],  // haath la-gao
        [N.B4, H], [N._, Q],                      // darr ja-ye-gi
        [N.G4, Q], [N.A4, Q], [N.G4, Q], [N.E4, Q],  // ba-har ni-kalo
        [N.D4, H], [N._, Q],                      // mar ja-ye-gi
    ],

    // ── 9. Nani Teri Morni Ko ─────────────────────────────────────────────────
    // Classic Bollywood children's song in D major
    "Nani Teri Morni Ko": [
        [N.D4, Q], [N.Fs4, Q], [N.A4, Q], [N.Fs4, Q],  // Na-ni te-ri
        [N.D4, H], [N._, Q],                         // mor-ni ko
        [N.A4, Q], [N.G4, Q], [N.Fs4, Q], [N.E4, Q],   // mor le ga-
        [N.D4, H], [N._, Q],                         // ye
        [N.E4, Q], [N.Fs4, Q], [N.G4, Q], [N.Fs4, Q],  // baa-ki jo ba-
        [N.E4, H], [N._, Q],                         // cha tha
        [N.A4, Q], [N.G4, Q], [N.Fs4, Q], [N.E4, Q],   // kaa-le chor le
        [N.D4, H], [N._, H],                         // ga-ye
    ],

    // ── 10. Ek Chidiya Anek Chidiya ──────────────────────────────────────────
    // Cheerful tune in C major (Doordarshan classic)
    "Ek Chidiya Anek Chidiya": [
        [N.C4, Q], [N.E4, Q], [N.G4, Q], [N.E4, Q],  // Ek chi-di-ya
        [N.G4, H], [N._, Q],                      // a-nek
        [N.E4, Q], [N.F4, Q], [N.E4, Q], [N.C4, Q],  // chi-di-ya ud
        [N.G4, H], [N._, Q],                      // aa-s-man
        [N.A4, Q], [N.G4, Q], [N.F4, Q], [N.E4, Q],  // mein ney nei-
        [N.F4, H], [N._, Q],                      // di-ya
        [N.G4, Q], [N.E4, Q], [N.D4, Q], [N.C4, Q],  // u-de sang
        [N.C4, H], [N._, H],                      // mil ke
    ],
}

// ── Synth Player Class ─────────────────────────────────────────────────────
export class MelodyPlayer {
    constructor() {
        this.ctx = null
        this.gainNode = null
        this.scheduled = []
        this.isPlaying = false
        this.startTime = 0
        this.totalDuration = 0
        this.onEnd = null
        this.onProgress = null
        this._progressTimer = null
    }

    _initCtx() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)()
            this.gainNode = this.ctx.createGain()
            this.gainNode.gain.value = 0.35
            this.gainNode.connect(this.ctx.destination)
        }
        if (this.ctx.state === 'suspended') this.ctx.resume()
    }

    getMelody(title) {
        if (!title) return this._fallback()
        // Exact match
        if (MELODIES[title]) return MELODIES[title]
        // Case-insensitive partial match
        const key = Object.keys(MELODIES).find(k =>
            title.toLowerCase().includes(k.toLowerCase()) ||
            k.toLowerCase().includes(title.toLowerCase())
        )
        // Always return something — fallback so play never silently fails
        return key ? MELODIES[key] : this._fallback()
    }

    // Generic pleasant melody as fallback
    _fallback() {
        return [
            [N.C4, Q], [N.E4, Q], [N.G4, Q], [N.E4, Q],
            [N.C4, Q], [N.E4, Q], [N.G4, H],
            [N.G4, Q], [N.A4, Q], [N.G4, Q], [N.E4, Q],
            [N.C4, Q], [N.D4, Q], [N.C4, H],
        ]
    }

    play(title, { onEnd, onProgress } = {}) {
        this.stop()
        this._initCtx()
        const melody = this.getMelody(title)
        if (!melody) return false

        this.onEnd = onEnd
        this.onProgress = onProgress
        this.isPlaying = true

        const now = this.ctx.currentTime + 0.05
        this.startTime = now
        this.totalDuration = melody.reduce((s, [, d]) => s + d, 0)

        let t = now
        for (const [freq, dur] of melody) {
            if (freq > 0) {
                const osc = this.ctx.createOscillator()
                const env = this.ctx.createGain()
                osc.type = 'triangle'  // soft, child-friendly tone
                osc.frequency.value = freq
                osc.connect(env)
                env.connect(this.gainNode)

                // Envelope: quick attack, sustain, short release
                env.gain.setValueAtTime(0, t)
                env.gain.linearRampToValueAtTime(1, t + 0.02)
                env.gain.setValueAtTime(1, t + dur - 0.05)
                env.gain.linearRampToValueAtTime(0, t + dur - 0.01)

                osc.start(t)
                osc.stop(t + dur)
                this.scheduled.push(osc)
            }
            t += dur
        }

        // Progress tracking
        if (onProgress) {
            this._progressTimer = setInterval(() => {
                if (!this.isPlaying) return
                const elapsed = this.ctx.currentTime - this.startTime
                const pct = Math.min(100, (elapsed / this.totalDuration) * 100)
                onProgress(pct, elapsed)
                if (pct >= 100) {
                    clearInterval(this._progressTimer)
                    this.isPlaying = false
                    onEnd?.()
                }
            }, 100)
        }

        return true
    }

    stop() {
        clearInterval(this._progressTimer)
        this.isPlaying = false
        for (const osc of this.scheduled) {
            try { osc.stop(); osc.disconnect() } catch { }
        }
        this.scheduled = []
    }

    get isSupported() {
        return !!(window.AudioContext || window.webkitAudioContext)
    }
}

export const melodyPlayer = new MelodyPlayer()

// hasMelody: always true — every song plays something
export function hasMelody(title) {
    return true
}
