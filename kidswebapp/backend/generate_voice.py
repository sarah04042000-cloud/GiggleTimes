"""
generate_voice.py — Generates voice audio files for 20 nursery rhymes
using Windows built-in Text-to-Speech (pyttsx3). No internet needed.
Run: python generate_voice.py
"""
import os, sys

try:
    import pyttsx3
except ImportError:
    print("Installing pyttsx3...")
    os.system(f"{sys.executable} -m pip install pyttsx3")
    import pyttsx3

OUT_DIR = os.path.join(os.path.dirname(__file__), "static", "audio")
os.makedirs(OUT_DIR, exist_ok=True)

engine = pyttsx3.init()

# Use a nice voice — try Microsoft Zira (female, child-friendly) on Windows
voices = engine.getProperty('voices')
for v in voices:
    if 'zira' in v.name.lower() or 'female' in v.name.lower() or 'hazel' in v.name.lower():
        engine.setProperty('voice', v.id)
        print(f"  Using voice: {v.name}")
        break

engine.setProperty('rate', 130)    # slightly slower, clearer for kids
engine.setProperty('volume', 1.0)

LYRICS = {
    "voice_01.wav": "Twinkle, twinkle, little star, How I wonder what you are! Up above the world so high, Like a diamond in the sky. Twinkle, twinkle, little star, How I wonder what you are!",
    "voice_02.wav": "If you're happy and you know it, clap your hands! Clap clap! If you're happy and you know it, clap your hands! Clap clap! If you're happy and you know it, then your face will surely show it! If you're happy and you know it, clap your hands!",
    "voice_03.wav": "Old MacDonald had a farm, E I E I O! And on his farm he had a cow, E I E I O! With a moo moo here and a moo moo there, here a moo, there a moo, everywhere a moo moo! Old MacDonald had a farm, E I E I O!",
    "voice_04.wav": "Baby shark, doo doo doo doo doo doo. Baby shark! Mommy shark, doo doo doo doo doo doo. Mommy shark! Daddy shark, doo doo doo doo doo doo. Daddy shark! Grandma shark, doo doo doo doo doo doo. Grandma shark!",
    "voice_05.wav": "The wheels on the bus go round and round, round and round, round and round! The wheels on the bus go round and round, all through the town! The wipers on the bus go swish swish swish, all through the town! The horn on the bus goes beep beep beep, all through the town!",
    "voice_06.wav": "Row, row, row your boat, gently down the stream. Merrily, merrily, merrily, merrily, life is but a dream! Row, row, row your boat, gently down the stream. If you see a crocodile, don't forget to scream!",
    "voice_07.wav": "Humpty Dumpty sat on a wall. Humpty Dumpty had a great fall. All the king's horses and all the king's men couldn't put Humpty together again!",
    "voice_08.wav": "Jack and Jill went up the hill to fetch a pail of water. Jack fell down and broke his crown, and Jill came tumbling after! Up Jack got and home did trot, as fast as he could caper. He went to bed to mend his head with vinegar and brown paper.",
    "voice_09.wav": "Baa baa black sheep, have you any wool? Yes sir, yes sir, three bags full! One for the master, one for the dame, and one for the little boy who lives down the lane! Baa baa black sheep, have you any wool? Yes sir, yes sir, three bags full!",
    "voice_10.wav": "Johnny Johnny! Yes Papa? Eating sugar? No Papa! Telling lies? No Papa! Open your mouth! Ha ha ha! Johnny Johnny! Yes Papa? Eating candy? No Papa! Telling lies? No Papa! Open your mouth! Ha ha ha!",
    "voice_11.wav": "Mary had a little lamb, little lamb, little lamb! Mary had a little lamb, its fleece was white as snow! And everywhere that Mary went, Mary went, Mary went! Everywhere that Mary went, the lamb was sure to go! It followed her to school one day, which was against the rule. It made the children laugh and play to see a lamb at school!",
    "voice_12.wav": "Incy Wincy Spider climbed up the water spout. Down came the rain and washed the spider out! Out came the sunshine and dried up all the rain. And Incy Wincy Spider climbed up the spout again!",
    "voice_13.wav": "Head, shoulders, knees and toes, knees and toes! Head, shoulders, knees and toes, knees and toes! And eyes and ears and mouth and nose! Head, shoulders, knees and toes, knees and toes!",
    "voice_14.wav": "Five little ducks went out one day, over the hills and far away. Mother duck said quack quack quack quack! But only four little ducks came back. Four little ducks went out one day. Three little ducks. Two little ducks. One little duck went out one day, and all five little ducks came back!",
    "voice_15.wav": "One, two, three, four, five! Once I caught a fish alive! Six, seven, eight, nine, ten! Then I let it go again! Why did you let it go? Because it bit my finger so! Which finger did it bite? This little finger on my right!",
    "voice_16.wav": "A B C D E F G! H I J K L M N O P! Q R S! T U V! W X! Y and Z! Now I know my ABCs! Next time won't you sing with me?",
    "voice_17.wav": "Rain rain go away, come again another day! Little Johnny wants to play, rain rain go away! All the children want to play, rain rain go away!",
    "voice_18.wav": "Hickory dickory dock, the mouse ran up the clock. The clock struck one, the mouse ran down! Hickory dickory dock! Hickory dickory dock, the clock struck two, the mouse said Boo! Hickory dickory dock!",
    "voice_19.wav": "Little Bo Peep has lost her sheep and doesn't know where to find them. Leave them alone and they'll come home, bringing their tails behind them!",
    "voice_20.wav": "Ding dong bell, pussy's in the well! Who put her in? Little Johnny Flynn! Who pulled her out? Little Tommy Stout! What a naughty boy was that to try to drown poor pussy cat!",
}

print("Generating voice audio files using Windows Text-to-Speech...")
for filename, text in LYRICS.items():
    path = os.path.join(OUT_DIR, filename)
    engine.save_to_file(text, path)
    engine.runAndWait()
    print(f"  ✓ {filename}")

print(f"\n[OK] All voice files written to {OUT_DIR}")
