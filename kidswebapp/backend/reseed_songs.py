"""
Reseed songs with LOCAL audio + full lyrics.
Run: python reseed_songs.py
"""
from pymongo import MongoClient
from dotenv import load_dotenv
import os

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI", "mongodb://localhost:27017/kidsapp"))
db = client.get_database()

BASE = "http://localhost:5000/audio"

songs = [
    {
        "title": "Twinkle Twinkle Little Star", "artist": "Kids World Band", "category": "Rhymes",
        "audio_file": f"{BASE}/song_01.wav",
        "lyrics": "Twinkle, twinkle, little star,\nHow I wonder what you are!\nUp above the world so high,\nLike a diamond in the sky.\nTwinkle, twinkle, little star,\nHow I wonder what you are!"
    },
    {
        "title": "If You're Happy and You Know It", "artist": "Sunshine Singers", "category": "Rhymes",
        "audio_file": f"{BASE}/song_02.wav",
        "lyrics": "If you're happy and you know it, clap your hands! (clap clap)\nIf you're happy and you know it, clap your hands! (clap clap)\nIf you're happy and you know it, then your face will surely show it,\nIf you're happy and you know it, clap your hands! (clap clap)\n\nIf you're happy and you know it, stomp your feet! (stomp stomp)\nIf you're happy and you know it, shout hooray! (hooray!)"
    },
    {
        "title": "Old MacDonald Had a Farm", "artist": "Rainbow Kids", "category": "Rhymes",
        "audio_file": f"{BASE}/song_03.wav",
        "lyrics": "Old MacDonald had a farm, E-I-E-I-O!\nAnd on his farm he had a cow, E-I-E-I-O!\nWith a moo moo here and a moo moo there,\nHere a moo, there a moo, everywhere a moo moo!\nOld MacDonald had a farm, E-I-E-I-O!\n\nOld MacDonald had a farm, E-I-E-I-O!\nAnd on his farm he had a duck, E-I-E-I-O!\nWith a quack quack here and a quack quack there!"
    },
    {
        "title": "Baby Shark", "artist": "Ocean Friends", "category": "Rhymes",
        "audio_file": f"{BASE}/song_04.wav",
        "lyrics": "Baby shark, doo doo doo doo doo doo,\nBaby shark, doo doo doo doo doo doo,\nBaby shark!\n\nMommy shark, doo doo doo doo doo doo,\nMommy shark, doo doo doo doo doo doo,\nMommy shark!\n\nDaddy shark, doo doo doo doo doo doo,\nDaddy shark, doo doo doo doo doo doo,\nDaddy shark!\n\nGrandma shark, doo doo doo doo doo doo,\nGrandma shark!"
    },
    {
        "title": "The Wheels on the Bus", "artist": "Happy Riders", "category": "Rhymes",
        "audio_file": f"{BASE}/song_05.wav",
        "lyrics": "The wheels on the bus go round and round,\nRound and round, round and round!\nThe wheels on the bus go round and round,\nAll through the town!\n\nThe wipers on the bus go swish swish swish,\nSwish swish swish, swish swish swish!\nThe wipers on the bus go swish swish swish,\nAll through the town!\n\nThe horn on the bus goes beep beep beep,\nAll through the town!"
    },
    {
        "title": "Row Row Row Your Boat", "artist": "Adventure Singers", "category": "Rhymes",
        "audio_file": f"{BASE}/song_06.wav",
        "lyrics": "Row, row, row your boat,\nGently down the stream.\nMerrily, merrily, merrily, merrily,\nLife is but a dream!\n\nRow, row, row your boat,\nGently down the stream.\nIf you see a crocodile,\nDon't forget to scream! Ahhh!"
    },
    {
        "title": "Humpty Dumpty", "artist": "Nursery Pals", "category": "Rhymes",
        "audio_file": f"{BASE}/song_07.wav",
        "lyrics": "Humpty Dumpty sat on a wall,\nHumpty Dumpty had a great fall.\nAll the king's horses and all the king's men\nCouldn't put Humpty together again!"
    },
    {
        "title": "Jack and Jill", "artist": "Nursery Pals", "category": "Rhymes",
        "audio_file": f"{BASE}/song_08.wav",
        "lyrics": "Jack and Jill went up the hill\nTo fetch a pail of water.\nJack fell down and broke his crown,\nAnd Jill came tumbling after!\n\nUp Jack got and home did trot,\nAs fast as he could caper.\nHe went to bed to mend his head\nWith vinegar and brown paper."
    },
    {
        "title": "Baa Baa Black Sheep", "artist": "Farm Friends", "category": "Rhymes",
        "audio_file": f"{BASE}/song_09.wav",
        "lyrics": "Baa baa black sheep, have you any wool?\nYes sir, yes sir, three bags full!\nOne for the master, one for the dame,\nAnd one for the little boy who lives down the lane!\n\nBaa baa black sheep, have you any wool?\nYes sir, yes sir, three bags full!"
    },
    {
        "title": "Johnny Johnny Yes Papa", "artist": "Kids World Band", "category": "Rhymes",
        "audio_file": f"{BASE}/song_10.wav",
        "lyrics": "Johnny Johnny! Yes Papa?\nEating sugar? No Papa!\nTelling lies? No Papa!\nOpen your mouth — Ha ha ha!\n\nJohnny Johnny! Yes Papa?\nEating candy? No Papa!\nTelling lies? No Papa!\nOpen your mouth — Ha ha ha!"
    },
    {
        "title": "Mary Had a Little Lamb", "artist": "Story Singers", "category": "Rhymes",
        "audio_file": f"{BASE}/song_11.wav",
        "lyrics": "Mary had a little lamb,\nLittle lamb, little lamb!\nMary had a little lamb,\nIts fleece was white as snow!\n\nAnd everywhere that Mary went,\nMary went, Mary went!\nAnd everywhere that Mary went,\nThe lamb was sure to go!\n\nIt followed her to school one day,\nWhich was against the rule.\nIt made the children laugh and play\nTo see a lamb at school!"
    },
    {
        "title": "Incy Wincy Spider", "artist": "Bug Buds", "category": "Rhymes",
        "audio_file": f"{BASE}/song_12.wav",
        "lyrics": "Incy Wincy Spider climbed up the water spout.\nDown came the rain and washed the spider out!\nOut came the sunshine and dried up all the rain.\nAnd Incy Wincy Spider climbed up the spout again!\n\nIncy Wincy Spider, how brave you are!\nEven when it rains, you reach up to the stars!"
    },
    {
        "title": "Head Shoulders Knees and Toes", "artist": "Body Beats", "category": "Action Songs",
        "audio_file": f"{BASE}/song_13.wav",
        "lyrics": "Head, shoulders, knees and toes,\nKnees and toes!\nHead, shoulders, knees and toes,\nKnees and toes!\nAnd eyes and ears and mouth and nose!\nHead, shoulders, knees and toes,\nKnees and toes!\n\n(Now faster!)\nHead, shoulders, knees and toes,\nKnees and toes!\nHead, shoulders, knees and toes,\nKnees and toes!"
    },
    {
        "title": "Five Little Ducks", "artist": "Duck Tales Band", "category": "Counting Songs",
        "audio_file": f"{BASE}/song_14.wav",
        "lyrics": "Five little ducks went out one day,\nOver the hills and far away.\nMother duck said, \"Quack quack quack quack!\"\nBut only four little ducks came back.\n\nFour little ducks went out one day...\nThree little ducks...\nTwo little ducks...\nOne little duck went out one day,\nOver the hills and far away.\nMother duck said, \"Quack quack quack quack!\"\nAnd all five little ducks came back!"
    },
    {
        "title": "One Two Three Four Five", "artist": "Number Ninjas", "category": "Counting Songs",
        "audio_file": f"{BASE}/song_15.wav",
        "lyrics": "One, two, three, four, five,\nOnce I caught a fish alive!\nSix, seven, eight, nine, ten,\nThen I let it go again!\n\nWhy did you let it go?\nBecause it bit my finger so!\nWhich finger did it bite?\nThis little finger on my right!"
    },
    {
        "title": "The ABC Song", "artist": "Alphabet Academy", "category": "Learning Songs",
        "audio_file": f"{BASE}/song_16.wav",
        "lyrics": "A B C D E F G,\nH I J K L M N O P,\nQ R S, T U V,\nW X, Y and Z!\nNow I know my ABCs,\nNext time won't you sing with me?\n\nA B C D E F G,\nH I J K L M N O P,\nQ R S, T U V,\nW X, Y and Z!"
    },
    {
        "title": "Rain Rain Go Away", "artist": "Weather Wonders", "category": "Rhymes",
        "audio_file": f"{BASE}/song_17.wav",
        "lyrics": "Rain rain go away,\nCome again another day!\nLittle Johnny wants to play,\nRain rain go away!\n\nRain rain go away,\nCome again another day!\nAll the children want to play,\nRain rain go away!"
    },
    {
        "title": "Hickory Dickory Dock", "artist": "Nursery Pals", "category": "Rhymes",
        "audio_file": f"{BASE}/song_18.wav",
        "lyrics": "Hickory dickory dock,\nThe mouse ran up the clock.\nThe clock struck one,\nThe mouse ran down!\nHickory dickory dock!\n\nHickory dickory dock,\nThe mouse ran up the clock.\nThe clock struck two,\nThe mouse said \"Boo!\"\nHickory dickory dock!"
    },
    {
        "title": "Little Bo Peep", "artist": "Story Singers", "category": "Rhymes",
        "audio_file": f"{BASE}/song_19.wav",
        "lyrics": "Little Bo Peep has lost her sheep\nAnd doesn't know where to find them.\nLeave them alone and they'll come home,\nBringing their tails behind them!\n\nLittle Bo Peep fell fast asleep\nAnd dreamt she heard them bleating.\nBut when she woke, she found it a joke,\nFor they were still a-fleeting."
    },
    {
        "title": "Ding Dong Bell", "artist": "Classic Kids", "category": "Rhymes",
        "audio_file": f"{BASE}/song_20.wav",
        "lyrics": "Ding dong bell, pussy's in the well!\nWho put her in? Little Johnny Flynn!\nWho pulled her out? Little Tommy Stout!\nWhat a naughty boy was that\nTo try to drown poor pussy cat,\nWho never did him any harm,\nAnd killed the mice in his father's barn!"
    },
]

COVERS = [f"https://picsum.photos/seed/song{i}/200/200" for i in range(1, 21)]
for i, s in enumerate(songs):
    s["cover_image"] = COVERS[i]
    s["seeded"] = True

db.songs.delete_many({"seeded": True})
db.songs.insert_many(songs)
print(f"[OK] {len(songs)} songs reseeded with lyrics + local audio")
client.close()
