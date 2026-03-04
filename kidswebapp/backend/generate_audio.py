"""
generate_audio.py - Creates musical WAV files for nursery rhymes.
Uses multiple harmonics + ADSR envelope for instrument-like sound (no deps needed).
Run: python generate_audio.py
"""
import wave, struct, math, os

OUT_DIR = os.path.join(os.path.dirname(__file__), "static", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

RATE = 44100  # CD quality
MAX  = 28000

def note_hz(name):
    table = {
        'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196.00,'A3':220.00,'B3':246.94,
        'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.00,'A4':440.00,'B4':493.88,
        'C5':523.25,'D5':587.33,'E5':659.25,'G5':783.99,
        'R':0  # rest
    }
    return table.get(name, 261.63)

def adsr_envelope(i, n, attack=0.08, decay=0.1, sustain=0.75, release=0.15):
    t = i / n
    if t < attack:
        return t / attack
    elif t < attack + decay:
        return 1.0 - (1.0 - sustain) * ((t - attack) / decay)
    elif t < 1.0 - release:
        return sustain
    else:
        return sustain * (1.0 - (t - (1.0 - release)) / release)

def synth_note(freq, duration, wave_type='piano'):
    """Generate a musical note with harmonics and ADSR envelope."""
    n = int(RATE * duration)
    data = []
    for i in range(n):
        t = i / RATE
        env = adsr_envelope(i, n)
        if freq == 0:  # rest
            data.append(0)
            continue
        # Piano-like: fundamental + harmonics with diminishing amplitude
        if wave_type == 'piano':
            s  = 1.00 * math.sin(2 * math.pi * freq * t)
            s += 0.50 * math.sin(2 * math.pi * freq * 2 * t)
            s += 0.25 * math.sin(2 * math.pi * freq * 3 * t)
            s += 0.12 * math.sin(2 * math.pi * freq * 4 * t)
            s += 0.06 * math.sin(2 * math.pi * freq * 5 * t)
            s /= 1.93  # normalize
        else:  # flute-like (softer, fewer harmonics)
            s  = 1.00 * math.sin(2 * math.pi * freq * t)
            s += 0.30 * math.sin(2 * math.pi * freq * 2 * t)
            s += 0.10 * math.sin(2 * math.pi * freq * 3 * t)
            s /= 1.40
        data.append(int(MAX * env * s))
    return struct.pack(f'<{n}h', *data)

def song(notes_timing, bpm=120, wave='piano'):
    """notes_timing: list of ('NOTE', beats)"""
    beat = 60 / bpm
    frames = b''
    for note, beats in notes_timing:
        dur = beats * beat
        frames += synth_note(note_hz(note), dur, wave)
        # tiny gap
        gap = int(RATE * 0.02)
        frames += struct.pack(f'<{gap}h', *([0]*gap))
    return frames

def write(filename, frames, stereo=False):
    path = os.path.join(OUT_DIR, filename)
    with wave.open(path, 'w') as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(RATE)
        f.writeframes(frames)
    return path

# BPM for all songs
BPM = 110

# ─── 20 Nursery Rhyme Melodies ────────────────────────────────────────────────
SONGS = {
    "song_01.wav": ("Twinkle Twinkle Little Star", [
        ('C4',1),('C4',1),('G4',1),('G4',1),('A4',1),('A4',1),('G4',2),
        ('F4',1),('F4',1),('E4',1),('E4',1),('D4',1),('D4',1),('C4',2),
        ('G4',1),('G4',1),('F4',1),('F4',1),('E4',1),('E4',1),('D4',2),
        ('G4',1),('G4',1),('F4',1),('F4',1),('E4',1),('E4',1),('D4',2),
        ('C4',1),('C4',1),('G4',1),('G4',1),('A4',1),('A4',1),('G4',2),
        ('F4',1),('F4',1),('E4',1),('E4',1),('D4',1),('D4',1),('C4',2),
    ]),
    "song_02.wav": ("If You're Happy", [
        ('C4',1),('C4',1),('C4',1),('F4',2),('F4',1),
        ('A4',1),('A4',1),('G4',1),('F4',2),('R',1),
        ('C4',1),('C4',1),('C4',1),('F4',2),('A4',1),
        ('C5',1),('C5',1),('A4',1),('F4',2),('R',1),
        ('F4',1),('F4',1),('F4',1),('F4',1),('F4',1),('E4',1),('F4',2),
        ('G4',1),('G4',1),('G4',1),('G4',1),('G4',1),('F4',1),('G4',2),
    ]),
    "song_03.wav": ("Old MacDonald", [
        ('G4',1),('G4',1),('G4',1),('D4',1),('E4',1),('E4',1),('D4',2),
        ('B4',1),('B4',1),('A4',1),('A4',1),('G4',4),
        ('D4',1),('G4',1),('G4',1),('G4',1),('D4',1),('E4',1),('E4',1),('D4',2),
        ('B4',1),('B4',1),('A4',1),('A4',1),('G4',4),
    ]),
    "song_04.wav": ("Baby Shark", [
        ('C4',1),('C4',1),('C4',1),('E4',1),('G4',2),
        ('C4',1),('C4',1),('C4',1),('E4',1),('G4',2),
        ('C4',1),('C4',1),('C4',1),('E4',1),('G4',2),
        ('C5',2),('B4',1),('A4',1),('G4',4),
        ('E4',1),('E4',1),('E4',1),('G4',1),('B4',2),
        ('E4',1),('E4',1),('E4',1),('G4',1),('B4',2),
        ('E5',2),('D5',1),('C5',1),('B4',4),
    ]),
    "song_05.wav": ("Wheels on the Bus", [
        ('C4',1),('C4',1),('C4',1),('E4',1),('G4',1),('G4',1),('E4',1),('G4',2),
        ('G4',1),('F4',1),('F4',1),('F4',1),('E4',1),('E4',1),('E4',1),('C4',2),
        ('D4',1),('D4',1),('D4',1),('D4',1),('D4',1),('D4',1),('F4',1),('E4',1),('D4',2),
        ('C4',1),('E4',1),('G4',1),('G4',1),('G4',1),('G4',1),('C5',4),
    ]),
    "song_06.wav": ("Row Row Row Your Boat", [
        ('C4',1),('C4',1),('C4',1.5),('D4',0.5),('E4',2),
        ('E4',1.5),('D4',0.5),('E4',1.5),('F4',0.5),('G4',4),
        ('C5',1),('C5',1),('C5',1),('G4',1),('G4',1),('G4',1),('E4',1),('E4',1),('E4',1),
        ('C4',1),('C4',1),('C4',1),
        ('G4',1.5),('F4',0.5),('E4',1.5),('D4',0.5),('C4',4),
    ]),
    "song_07.wav": ("Humpty Dumpty", [
        ('G4',1),('G4',1),('A4',1),('G4',1),('C5',1),('B4',2),
        ('G4',1),('G4',1),('A4',1),('G4',1),('D5',1),('C5',2),
        ('G4',1),('G4',1),('G5',1),('E5',1),('C5',1),('B4',1),('A4',2),
        ('F5',1),('F5',1),('E5',1),('C5',1),('D5',1),('C5',4),
    ]),
    "song_08.wav": ("Jack and Jill", [
        ('C4',1),('E4',1),('G4',1),('E4',1),('G4',1),('A4',1),('G4',2),
        ('E4',1),('G4',1),('F4',1),('E4',1),('D4',1),('C4',4),
        ('C4',1),('E4',1),('G4',1),('E4',1),('A4',1),('G4',1),('F4',2),
        ('F4',1),('E4',1),('D4',1),('C4',1),('E4',1),('G4',1),('C5',4),
    ]),
    "song_09.wav": ("Baa Baa Black Sheep", [
        ('G4',1),('G4',1),('D5',1),('D5',1),('E5',1),('D5',1),('C5',1),('B4',1),
        ('A4',1),('A4',1),('G4',2),
        ('D5',1),('D5',1),('C5',1),('C5',1),('B4',1),('B4',1),('A4',2),
        ('D5',1),('D5',1),('C5',1),('C5',1),('B4',1),('B4',1),('A4',2),
        ('G4',1),('G4',1),('D5',1),('D5',1),('E5',1),('D5',1),('C5',1),('B4',1),
        ('A4',1),('A4',1),('G4',2),
    ]),
    "song_10.wav": ("Johnny Johnny", [
        ('C4',1),('E4',1),('G4',1),('E4',1),('C4',1),('E4',1),('G4',2),
        ('G4',1),('A4',1),('G4',1),('F4',1),('E4',1),('C4',4),
        ('C4',1),('E4',1),('G4',1),('E4',1),('G4',1),('A4',1),('G4',2),
        ('F4',1),('E4',1),('D4',1),('C4',4),
    ]),
    "song_11.wav": ("Mary Had a Little Lamb", [
        ('E4',1),('D4',1),('C4',1),('D4',1),('E4',1),('E4',1),('E4',2),
        ('D4',1),('D4',1),('D4',2),('E4',1),('G4',1),('G4',2),
        ('E4',1),('D4',1),('C4',1),('D4',1),('E4',1),('E4',1),('E4',1),('E4',1),
        ('D4',1),('D4',1),('E4',1),('D4',1),('C4',4),
    ]),
    "song_12.wav": ("Incy Wincy Spider", [
        ('C4',1),('F4',1),('F4',1),('F4',1),('G4',1),('F4',1),('E4',1),('C4',1),
        ('D4',1),('D4',1),('D4',1),('G4',1),('F4',2),('E4',2),
        ('C4',1),('C4',1),('A4',1),('A4',1),('A4',1),('G4',1),('F4',2),
        ('C4',1),('F4',1),('F4',1),('F4',1),('G4',1),('F4',1),('E4',1),('C4',4),
    ]),
    "song_13.wav": ("Head Shoulders Knees Toes", [
        ('C4',1),('E4',1),('E4',1),('E4',1),('G4',1),('G4',1),
        ('A4',1),('A4',1),('G4',2),
        ('F4',1),('F4',1),('E4',1),('E4',1),('D4',2),('C4',2),
        ('C4',1),('E4',1),('G4',1),('G4',1),('A4',1),('C5',1),
        ('B4',1),('A4',1),('G4',2),('C4',4),
    ]),
    "song_14.wav": ("Five Little Ducks", [
        ('G4',1),('A4',1),('G4',1),('F4',1),('E4',1),('D4',1),('C4',2),
        ('G4',1),('A4',1),('G4',1),('F4',1),('E4',1),('D4',2),
        ('E4',1),('F4',1),('E4',1),('D4',1),('C4',4),
        ('G4',1),('A4',1),('G4',1),('E4',1),('G4',1),('A4',1),('G4',4),
    ]),
    "song_15.wav": ("One Two Three Four Five", [
        ('G4',1),('G4',1),('G4',1),('G4',1),('G4',2),('E4',2),
        ('F4',1),('F4',1),('F4',1),('F4',1),('F4',2),('D4',2),
        ('G4',1),('G4',1),('G4',1),('A4',1),('G4',1),('F4',1),('E4',2),
        ('C4',1),('D4',1),('E4',1),('F4',1),('G4',4),
    ]),
    "song_16.wav": ("ABC Song", [
        ('C4',1),('C4',1),('G4',1),('G4',1),('A4',1),('A4',1),('G4',2),
        ('F4',1),('F4',1),('E4',1),('E4',1),('D4',1),('D4',1),('C4',2),
        ('G4',1),('G4',1),('F4',1),('F4',1),('E4',1),('E4',1),('D4',2),
        ('G4',1),('G4',1),('F4',1),('F4',1),('E4',1),('E4',1),('D4',2),
        ('C4',1),('C4',1),('G4',1),('G4',1),('A4',1),('A4',1),('G4',2),
        ('F4',1),('F4',1),('E4',1),('E4',1),('D4',1),('D4',1),('C4',2),
    ]),
    "song_17.wav": ("Rain Rain Go Away", [
        ('B4',1),('A4',1),('G4',1),('A4',1),('B4',1),('B4',1),('B4',2),
        ('A4',1),('A4',1),('A4',2),('B4',1),('D5',1),('D5',2),
        ('B4',1),('A4',1),('G4',1),('A4',1),('B4',1),('B4',1),('B4',1),('B4',1),
        ('A4',1),('A4',1),('B4',1),('A4',1),('G4',4),
    ]),
    "song_18.wav": ("Hickory Dickory Dock", [
        ('D4',1),('D4',1),('A4',2),('A4',1),('G4',1),('F4',1),('E4',1),
        ('D4',4),
        ('D4',1),('D4',1),('A4',1),('A4',1),('G4',1),('A4',1),('G4',1),('F4',1),
        ('E4',4),
        ('F4',1),('F4',1),('G4',1),('G4',1),('A4',2),
        ('E4',1),('F4',1),('G4',1),('A4',1),('D5',4),
    ]),
    "song_19.wav": ("Little Bo Peep", [
        ('G4',1),('A4',1),('G4',1),('E4',1),('G4',2),
        ('A4',1),('G4',1),('E4',1),('C4',2),
        ('D4',1),('E4',1),('F4',1),('G4',1),('A4',1),('B4',1),('G4',2),
        ('A4',1),('B4',1),('C5',1),('A4',1),('G4',4),
    ]),
    "song_20.wav": ("Ding Dong Bell", [
        ('E4',1),('E4',1),('D4',1),('E4',1),('G4',2),
        ('E4',1),('D4',1),('C4',1),('D4',1),('E4',2),('C4',2),
        ('G4',1),('A4',1),('G4',1),('F4',1),('E4',2),
        ('D4',1),('E4',1),('D4',1),('C4',1),('G3',1),('C4',3),
    ]),
}

# Story background (gentle arpeggio)
STORY = [('C4',0.5),('E4',0.5),('G4',0.5),('E4',0.5)] * 12 + \
        [('F4',0.5),('A4',0.5),('C5',0.5),('A4',0.5)] * 8 + \
        [('G4',0.5),('B4',0.5),('D5',0.5),('B4',0.5)] * 8 + \
        [('C4',0.5),('E4',0.5),('G4',0.5),('C5',1)] 

print("Generating musical audio files...")
for filename, (title, notes) in SONGS.items():
    frames = song(notes, BPM)
    write(filename, frames)
    print(f"  ✓ {filename}  ({title})")

write("story_bg.wav", song(STORY, 80, wave='piano'))
print("  ✓ story_bg.wav  (Story background)")

print(f"\n[OK] All {len(SONGS)+1} audio files written to: {OUT_DIR}")
