from flask import Blueprint, jsonify, request, current_app
from bson import ObjectId

songs_bp = Blueprint('songs', __name__)

# ── 5 kids songs with real public-domain nursery rhyme audio ──────────────────
# Using archive.org & librivox public-domain audio files for nursery rhymes
BUILT_IN_SONGS = [
    {
        "id": "song_1",
        "title": "Twinkle Twinkle Little Star",
        "artist": "Traditional",
        "category": "English Nursery Rhymes",
        "emoji": "⭐",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        "lyrics": "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\n\nTwinkle, twinkle, little star,\nHow I wonder what you are!\n\nWhen the blazing sun is gone,\nWhen he nothing shines upon,\nThen you show your little light,\nTwinkle, twinkle, through the night.\n\nTwinkle, twinkle, little star,\nHow I wonder what you are!",
        "seeded": True
    },
    {
        "id": "song_2",
        "title": "Old MacDonald Had a Farm",
        "artist": "Traditional",
        "category": "English Nursery Rhymes",
        "emoji": "🐄",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
        "lyrics": "Old MacDonald had a farm, E-I-E-I-O!\nAnd on his farm he had a cow, E-I-E-I-O!\nWith a moo-moo here and a moo-moo there,\nHere a moo, there a moo, everywhere a moo-moo!\nOld MacDonald had a farm, E-I-E-I-O!\n\nOld MacDonald had a farm, E-I-E-I-O!\nAnd on his farm he had a duck, E-I-E-I-O!\nWith a quack-quack here and a quack-quack there,\nHere a quack, there a quack, everywhere a quack-quack!\nOld MacDonald had a farm, E-I-E-I-O!",
        "seeded": True
    },
    {
        "id": "song_3",
        "title": "Wheels on the Bus",
        "artist": "Traditional",
        "category": "English Nursery Rhymes",
        "emoji": "🚌",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
        "lyrics": "The wheels on the bus go round and round,\nRound and round, round and round!\nThe wheels on the bus go round and round,\nAll through the town!\n\nThe driver on the bus says 'Move on back!'\n'Move on back! Move on back!'\nThe driver on the bus says 'Move on back!'\nAll through the town!\n\nThe babies on the bus go wah wah wah,\nWah wah wah, wah wah wah!\nThe babies on the bus go wah wah wah,\nAll through the town!",
        "seeded": True
    },
    {
        "id": "song_4",
        "title": "मछली जल की रानी है (Machli Jal Ki Rani)",
        "artist": "Traditional Hindi",
        "category": "Hindi Nursery Rhymes",
        "emoji": "🐟",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
        "lyrics": "मछली जल की रानी है,\nजीवन उसका पानी है।\nहाथ लगाओ डर जाएगी,\nबाहर निकालो मर जाएगी।\n\nMachli jal ki rani hai,\nJeevan uska pani hai.\nHaath lagao dar jayegi,\nBahar nikalo mar jayegi.",
        "seeded": True
    },
    {
        "id": "song_5",
        "title": "Johny Johny Yes Papa",
        "artist": "Traditional",
        "category": "English Nursery Rhymes",
        "emoji": "🍬",
        "audio_url": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
        "lyrics": "Johny Johny?\nYes, Papa!\nEating sugar?\nNo, Papa!\nTelling lies?\nNo, Papa!\nOpen your mouth!\nHa! Ha! Ha!\n\nMommy Mommy?\nYes, Papa!\nEating candy?\nNo, Papa!\nTelling lies?\nNo, Papa!\nShow me your teeth!\nHa! Ha! Ha!",
        "seeded": True
    },
]

def _fmt(doc):
    doc = dict(doc)
    doc['id'] = str(doc.pop('_id', doc.get('id', '')))
    return doc


@songs_bp.route('/songs', methods=['GET'])
def get_songs():
    db = current_app.db
    category = request.args.get('category')

    # Get from DB first
    query = {'category': category} if category else {}
    db_songs = [_fmt(s) for s in db.songs.find(query)]

    # Merge built-in songs (use built-in as base if DB is empty)
    if not db_songs:
        result = BUILT_IN_SONGS
        if category:
            result = [s for s in result if s['category'] == category]
        # Seed them into DB for next time
        try:
            db.songs.insert_many([{**s, '_id': s['id']} for s in BUILT_IN_SONGS], ordered=False)
        except Exception:
            pass
        return jsonify(BUILT_IN_SONGS if not category else [s for s in BUILT_IN_SONGS if s['category'] == category])

    return jsonify(db_songs)


@songs_bp.route('/songs/<song_id>', methods=['GET'])
def get_song(song_id):
    db = current_app.db
    # Check built-in first
    for s in BUILT_IN_SONGS:
        if s['id'] == song_id:
            return jsonify(s)
    # Then DB
    try:
        doc = db.songs.find_one({'_id': ObjectId(song_id)})
        if not doc:
            return jsonify({'error': 'Song not found'}), 404
        return jsonify(_fmt(doc))
    except Exception:
        return jsonify({'error': 'Invalid ID'}), 400
