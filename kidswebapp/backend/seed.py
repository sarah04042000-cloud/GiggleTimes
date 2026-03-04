# -*- coding: utf-8 -*-
import os, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pymongo import MongoClient
from dotenv import load_dotenv
from utils.auth_utils import hash_password

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/kids_audio_app")
DB_NAME   = os.getenv("MONGO_DB_NAME", "kids_audio_app")
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=15000)
client.admin.command("ping")
db = client[DB_NAME]

# Clear old data
db.users.delete_many({"username": {"$in": ["demo_parent","demo_kid","demo_admin"]}})
db.stories.delete_many({"seeded": True})
db.songs.delete_many({"seeded": True})
db.quizzes.delete_many({"seeded": True})
db.riddles.delete_many({"seeded": True})

# Users
db.users.insert_many([
    {"username":"demo_parent","password_hash":hash_password("parent123"),"role":"parent","points":0,"badges":[],"quizzes_taken":0,"stories_completed":[]},
    {"username":"demo_kid",   "password_hash":hash_password("kid123"),   "role":"kid",   "points":0,"badges":[],"quizzes_taken":0,"stories_completed":[]},
    {"username":"demo_admin", "password_hash":hash_password("admin123"), "role":"admin", "points":0,"badges":[],"quizzes_taken":0,"stories_completed":[]},
])
print("[OK] 3 users")

AUDIO = [
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
]

IMG = [
    "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=400",
    "https://images.unsplash.com/photo-1448375240586-882707db888b?w=400",
    "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400",
    "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=400",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400",
    "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=400",
    "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400",
    "https://images.unsplash.com/photo-1444492417251-9c84a5fa18e0?w=400",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400",
    "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=400",
]

stories = [
    # English Moral Stories
    {"title":"The Honest Woodcutter","category":"Moral","language":"English","description":"A poor woodcutter's honesty is rewarded by the river goddess.","full_text":"Once upon a time, a poor woodcutter lived near a river. One day, his axe slipped from his hands and fell into the deep water. He sat by the river and cried. Suddenly, a river goddess appeared. She showed him a golden axe and asked if it was his. He said no. She showed him a silver axe. Again he said no. Finally she showed his old iron axe, and he eagerly said yes. The goddess was pleased with his honesty and rewarded him with all three axes. His greedy neighbor heard this and threw his own axe into the river on purpose. When the goddess appeared and showed the golden axe, the neighbor immediately claimed it was his. Angry at his dishonesty, the goddess disappeared and left him with no axe at all. Moral: Honesty is always rewarded."},
    {"title":"The Boy Who Cried Wolf","category":"Moral","language":"English","description":"A shepherd boy learns that lying has serious consequences.","full_text":"There was once a young shepherd boy who tended his flock on the hillside near a village. Bored and lonely, he decided to have some fun by shouting 'Wolf! Wolf!' The villagers ran up the hill only to find him laughing. He did this twice more, and each time the villagers came and found no wolf. One day a real wolf did come and began attacking the sheep. The boy cried 'Wolf! Wolf!' but this time no one came. They thought he was tricking them again. The wolf scattered all the sheep. Moral: Nobody believes a liar, even when he tells the truth."},
    {"title":"The Golden Egg","category":"Moral","language":"English","description":"A farmer's greed costs him everything when he kills his golden goose.","full_text":"A farmer had a wonderful goose that laid one golden egg every single day. He and his wife became wealthy selling these eggs. But one day, the farmer grew impatient. He thought, 'Why wait for one egg a day when I can cut her open and get all the eggs at once?' So he did exactly that. But inside the goose there were no golden eggs at all — just ordinary goose parts. He had killed the source of his wealth for nothing. Moral: Greed destroys what it seeks to gain."},
    {"title":"The Ant and the Grasshopper","category":"Moral","language":"English","description":"Hard work in summer prepares us for difficult winters.","full_text":"All summer long, the ant worked hard collecting food and storing it in his home. The grasshopper spent his days singing and dancing in the warm sunshine. When he saw the ant working, he laughed and said, 'Why work so hard? There is plenty of food!' The ant replied, 'I am storing food for winter.' The grasshopper ignored the warning. When winter came, the grasshopper had nothing to eat and was cold and hungry. He begged the ant for food. The ant, who had worked all summer, had plenty to share. Moral: Always be prepared for the future."},
    {"title":"The Lion and the Mouse","category":"Moral","language":"English","description":"Even the smallest creature can help the mightiest.","full_text":"One day, a fierce lion was sleeping in the forest when a little mouse began running over his face. The lion woke up furiously and caught the tiny mouse. The mouse begged for mercy, promising that someday he would repay the kindness. The lion laughed, but let him go. Days later, hunters caught the lion in a net. He roared with all his might but could not escape. The little mouse heard the roar, came running, and began gnawing through the ropes. Soon the lion was free. Moral: No act of kindness is ever too small."},
    {"title":"The Tortoise and the Hare","category":"Moral","language":"English","description":"Slow and steady always wins the race.","full_text":"A hare always bragged about how fast he could run. One day, he challenged the tortoise to a race. Everyone laughed, but the tortoise agreed. Off they ran. The hare zoomed ahead, then decided to take a nap under a shady tree. The tortoise never stopped. He kept walking slowly and steadily. When the hare woke up, he raced to the finish line — but the tortoise was already there, waiting with a smile. Moral: Consistent effort wins over natural talent."},
    {"title":"The Greedy Dog","category":"Moral","language":"English","description":"Greed makes us lose what we already have.","full_text":"A dog found a juicy bone and picked it up in his mouth. Looking down into the water from a bridge, he saw another dog with a bone — his own reflection! Wanting that bone too, he snapped at it. In doing so, he dropped his own bone, which fell into the river and sank. Now he had nothing. Moral: Greed loses what it already has."},
    {"title":"The Clever Crow","category":"Animal","language":"English","description":"A thirsty crow finds a clever way to drink from a tall pot.","full_text":"It was the middle of summer and a crow was desperately thirsty. She spotted a pot, but when she looked inside, the water level was too low to reach. She tried tipping it — too heavy. Then she had an idea. She dropped stones in, one by one. Slowly, the water rose higher and higher. Finally she could drink to her heart's content. Moral: Where there is a will, there is a way."},
    {"title":"The Moon's Lullaby","category":"Bedtime","language":"English","description":"The moon sings little stars to sleep each night.","full_text":"Every evening, when the sun dipped below the mountains, the Moon rose softly into the sky. She had a special job — to sing the little stars to sleep. 'Close your eyes, little lights,' she sang. 'Dream of rainbows and kites.' The youngest star, named Twinkle, always tried to stay awake. 'But I'm not sleepy!' she protested. The Moon smiled and sang even softer, until at last Twinkle's eyes closed and she dreamed of chasing comets."},
    {"title":"The Sleepy Dragon","category":"Bedtime","language":"English","description":"A little dragon who breathes warm air puts the whole village to sleep.","full_text":"In a valley far away lived a small dragon named Ember. Unlike his brothers, Ember breathed warm, golden air that smelled like cinnamon and honey. Every night the village children would gather around Ember and ask for their bedtime breath. He would puff gently, and the warm golden cloud would drift over them. They would yawn, stretch, and fall asleep smiling. One night Ember himself felt sleepy. He breathed out one last warm puff. It rose into the sky and turned into a cloud of stars. 'Goodnight,' he murmured."},
    # Hindi Stories - Moral
    {"title":"ईमानदार लकड़हारा (Imaandaar Lakdahaara)","category":"Hindi Moral","language":"Hindi","description":"एक गरीब लकड़हारे की ईमानदारी उसे बड़ा पुरस्कार दिलाती है।","full_text":"एक गरीब लकड़हारा जंगल में लकड़ी काट रहा था। अचानक उसकी कुल्हाड़ी नदी में गिर गई। वह बहुत दुखी हो गया। तभी नदी की देवी प्रकट हुईं और सोने की कुल्हाड़ी दिखाई। लकड़हारे ने कहा, 'नहीं माँ, यह मेरी नहीं।' फिर चाँदी की कुल्हाड़ी दिखाई, उसने फिर मना किया। जब देवी ने लोहे की कुल्हाड़ी दिखाई, तो लकड़हारे ने खुशी से कहा, 'हाँ, यही मेरी है!' देवी उसकी ईमानदारी से बहुत प्रसन्न हुईं और तीनों कुल्हाड़ियाँ उसे दे दीं। शिक्षा: ईमानदारी सबसे बड़ा गुण है।"},
    {"title":"कौवे की चतुराई (Kauwe Ki Chaturai)","category":"Hindi Moral","language":"Hindi","description":"प्यासे कौवे की समझदारी और धैर्य उसे पानी दिलाती है।","full_text":"गर्मियों के दिन थे। एक प्यासा कौआ पानी खोज रहा था। उसे एक घड़ा मिला जिसमें थोड़ा पानी था, लेकिन इतना कम कि उसकी चोंच नहीं पहुँच सकती थी। कौवे ने सोचा और एक तरकीब निकाली। उसने एक-एक करके कंकड़ घड़े में डाले। धीरे-धीरे पानी ऊपर आता गया और कौवे ने तृप्त होकर पानी पी लिया। शिक्षा: जहाँ चाह, वहाँ राह।"},
    {"title":"लालची कुत्ता (Laalchi Kutta)","category":"Hindi Moral","language":"Hindi","description":"एक कुत्ते की लालच उसे सब कुछ खो देती है।","full_text":"एक कुत्ते को एक हड्डी मिली। वह उसे मुँह में दबाकर चला। रास्ते में एक नदी पर पुल था। जब उसने नीचे देखा, तो उसे पानी में एक और कुत्ता दिखा जिसके मुँह में भी हड्डी थी — असल में वह उसका खुद का प्रतिबिम्ब था। वह उस हड्डी को भी लेना चाहता था। उसने मुँह खोला और भौंका। उसकी हड्डी नदी में गिर गई। अब उसके पास कुछ भी नहीं था। शिक्षा: लालच बुरी बला है।"},
    {"title":"खरगोश और कछुए की दौड़ (Khargosh aur Kachhue Ki Daud)","category":"Hindi Moral","language":"Hindi","description":"धीरे और लगातार चलने वाला कछुआ तेज और घमंडी खरगोश को हरा देता है।","full_text":"एक बार खरगोश और कछुए में दौड़ लगाने की बात हुई। खरगोश बहुत तेज था और उसे कछुए पर हँसी आई। दौड़ शुरू हुई। खरगोश आगे निकल गया और एक पेड़ के नीचे सो गया सोचकर कि कछुआ कभी नहीं पहुँचेगा। लेकिन कछुआ बिना रुके धीरे-धीरे चलता रहा। जब खरगोश जागा, तो कछुआ पहले ही मंजिल पर पहुँच चुका था। शिक्षा: घमंड नहीं, मेहनत काम आती है।"},
    {"title":"शेर और चूहा (Sher aur Chuha)","category":"Hindi Animal","language":"Hindi","description":"एक छोटे चूहे का उपकार राजा शेर की जान बचाता है।","full_text":"एक जंगल में एक बड़ा शेर सो रहा था। एक छोटा चूहा उसके ऊपर से दौड़ा। शेर जाग गया और उसे पकड़ लिया। चूहे ने गिड़गिड़ाकर माफी माँगी और कहा कि वह एक दिन उपकार करेगा। शेर हँसा और उसे छोड़ दिया। कुछ दिन बाद शिकारियों ने शेर को जाल में फँसा लिया। शेर जोर-जोर से दहाड़ा। चूहे ने उसकी आवाज सुनी, आया और रस्सियाँ कुतर दीं। शेर आजाद हो गया। शिक्षा: छोटा उपकार भी बड़ा होता है।"},
    {"title":"चालाक बंदर और मगरमच्छ (Chaalaak Bandar aur Magarmachch)","category":"Hindi Animal","language":"Hindi","description":"एक चालाक बंदर धोखेबाज मगरमच्छ को सबक सिखाता है।","full_text":"नदी के किनारे एक आम के पेड़ पर एक बंदर रहता था। उसकी दोस्ती एक मगरमच्छ से हो गई। बंदर उसे हर दिन आम देता था। लेकिन मगरमच्छ की पत्नी उससे जलती थी। उसने कहा, 'जो इतने मीठे फल खाता है उसका दिल भी मीठा होगा। उसका दिल लाओ।' मगरमच्छ ने बंदर को नदी पार कराने का बहाना किया। बीच नदी में उसने सच बताया। चालाक बंदर बोला, 'मैंने दिल पेड़ पर छोड़ा है, चलो वापस।' मगरमच्छ वापस गया और बंदर पेड़ पर कूद गया। शिक्षा: बुद्धि सबसे बड़ा हथियार है।"},
    {"title":"प्रहलाद की भक्ति (Prahlad Ki Bhakti)","category":"Hindi Mythology","language":"Hindi","description":"भगवान विष्णु के परम भक्त प्रहलाद पर कोई विपदा असर नहीं करती।","full_text":"हिरण्यकशिपु एक अहंकारी राक्षस राजा था जो खुद को भगवान मानता था। लेकिन उसका पुत्र प्रहलाद विष्णु का परम भक्त था। राजा ने प्रहलाद को मारने के अनेक प्रयास किए — पहाड़ से फेंका, हाथियों से कुचलवाया, जहरीले साँप छोड़े — लेकिन विष्णु ने हर बार उसे बचाया। अंत में होलिका ने उसे जलाने की कोशिश की, पर खुद जल गई और प्रहलाद सुरक्षित निकला। भगवान नरसिंह प्रकट हुए और दुष्ट राजा का अंत हुआ। शिक्षा: सच्ची भक्ति सबसे बड़ी शक्ति है।"},
    {"title":"गजराज की मित्रता (Gajraj Ki Mitrata)","category":"Hindi Animal","language":"Hindi","description":"एक हाथी और चूहों की अनोखी दोस्ती दोनों को लाभ पहुँचाती है।","full_text":"एक बार हाथियों का झुंड एक गाँव से गुजरा। रास्ते में उन्होंने चूहों की एक बस्ती को कुचल दिया। चूहों के राजा ने हाथियों के राजा से विनती की कि दूसरा रास्ता चुनें। हाथियों के राजा ने मान लिया। कुछ समय बाद शिकारियों ने हाथियों को जाल में फँसा लिया। चूहों ने याद किया उपकार और रात भर जाल काटा। सुबह सारे हाथी आजाद थे। शिक्षा: मित्रता में उम्र और आकार नहीं देखा जाता।"},
    {"title":"सोने का हिरण (Sone Ka Hiran)","category":"Hindi Mythology","language":"Hindi","description":"माया का रूप धरकर एक असुर राम और सीता को अलग करता है।","full_text":"वनवास के दिनों में एक बार सीता माता ने एक सुनहरे हिरण को देखा। वह बहुत सुंदर था। सीता जी ने राम जी से उसे पकड़ने की इच्छा जताई। राम जी हिरण के पीछे गए। असल में वह हिरण राक्षस मारीच था जो मायावी रूप धरे था। उसने राम की आवाज में लक्ष्मण को पुकारा। लक्ष्मण जी सीता को छोड़कर गए और रावण ने सीता का हरण कर लिया। शिक्षा: माया और लालच से सावधान रहो।"},
    {"title":"बुद्धिमान राजा (Buddhimaan Raja)","category":"Hindi Moral","language":"Hindi","description":"एक न्यायप्रिय राजा अपनी बुद्धि से एक झगड़े का समाधान करता है।","full_text":"एक राज्य में दो व्यापारी थे। एक दिन उनमें से एक ने कहा कि उसने दूसरे को सोने के सिक्के उधार दिए थे। दूसरे ने मना किया। राजा के दरबार में मुकदमा आया। राजा ने दोनों से अलग-अलग बात की। उसने पहले व्यापारी से पूछा, 'तुमने कहाँ पैसे दिए?' उसने एक पेड़ के नीचे का नाम लिया। राजा ने पेड़ को बुलाया। इससे दूसरे व्यापारी को हँसी आई — यह सिद्ध करता था कि वह जानता था कि पेड़ के नीचे लेन-देन हुआ था। राजा ने उससे सिक्के दिलवा दिए। शिक्षा: बुद्धि से हर समस्या हल होती है।"},
    {"title":"सच्चा मित्र (Sachcha Mitra)","category":"Hindi Moral","language":"Hindi","description":"मुसीबत में काम आने वाला ही सच्चा मित्र होता है।","full_text":"दो मित्र जंगल से गुजर रहे थे। एक भालू आया। एक मित्र झट से पेड़ पर चढ़ गया और दूसरे को भूल गया। दूसरा मित्र जमीन पर लेट गया और साँस रोक ली। भालू उसे सूँघकर चला गया क्योंकि वह मृत समझ रहा था। जब भालू गया, पेड़ पर वाले मित्र ने पूछा, 'भालू ने क्या कहा?' दूसरे ने जवाब दिया, 'भालू ने कहा — ऐसे मित्र से दूर रहो जो मुसीबत में साथ छोड़ दे।' शिक्षा: सच्चा मित्र वही जो विपत्ति में काम आए।"},
    {"title":"पंचतंत्र: मूर्ख बातूनी कछुआ (Moorkh Batuni Kachuaa)","category":"Hindi Moral","language":"Hindi","description":"अपनी जुबान न संभालने वाला कछुआ मुसीबत में पड़ता है।","full_text":"एक तालाब में कछुआ और दो हंस रहते थे। गर्मियों में तालाब सूखने लगा। हंसों ने कछुए को दूसरे तालाब ले जाने का सुझाव दिया। उन्होंने एक लकड़ी ली — कछुए ने बीच में मुँह से पकड़ी और दोनों हंसों ने दोनों सिरे पकड़े। उड़ते वक्त नीचे के लोगों ने देखा और हँसने लगे। कछुए ने जवाब देने के लिए मुँह खोला और नीचे गिर गया। शिक्षा: मौके पर चुप रहना बुद्धिमानी है।"},
    {"title":"राजकुमारी और जादुई बाँसुरी (Rajkumari aur Jaadui Baansuri)","category":"Hindi Bedtime","language":"Hindi","description":"एक राजकुमारी की जादुई बाँसुरी पूरे राज्य को सुलाती है।","full_text":"बहुत समय पहले एक राज्य में एक राजकुमारी थी जिसके पास एक जादुई बाँसुरी थी। जब वह बाँसुरी बजाती थी, तो सभी जीव-जंतु और इंसान गहरी नींद में सो जाते थे। एक रात राज्य पर दुश्मनों का हमला हुआ। राजकुमारी ने बाँसुरी बजाई और सारे दुश्मन सो गए। सुबह राजा ने उन्हें बंदी बना लिया। राजकुमारी की बहादुरी की पूरे राज्य में प्रशंसा हुई। शिक्षा: साहस और बुद्धि सबसे बड़े हथियार हैं।"},
    {"title":"तारों की रखवाली (Taaron Ki Rakhwaali)","category":"Hindi Bedtime","language":"Hindi","description":"एक बच्चा हर रात आकाश के तारों की देखभाल करता है।","full_text":"आकाश में बहुत सारे तारे रहते थे। हर रात एक छोटा लड़का राज नदी किनारे बैठता और तारों को गिनता। एक रात एक तारा टूट कर गिरने लगा। राज ने झट से अपनी इच्छा माँगी — तारे को वापस आकाश में भेज दो। तारा रुक गया और वापस जा बैठा अपनी जगह पर। उस रात राज ने देखा कि तारे उसकी तरफ टिमटिमाए जैसे धन्यवाद कर रहे हों।"},
    {"title":"चाँद का टुकड़ा (Chaand Ka Tukda)","category":"Hindi Bedtime","language":"Hindi","description":"एक बच्ची को सपने में चाँद का एक टुकड़ा मिलता है।","full_text":"पिया नाम की एक छोटी लड़की हर रात सोने से पहले छत पर जाती और चाँद से बात करती। एक रात उसे सपने में चाँद खुद आया और उसे अपना एक छोटा टुकड़ा दिया। 'जब भी डर लगे, इसे देखना' — चाँद ने कहा। पिया ने उठकर देखा तो उसके हाथ में एक छोटा पत्थर था जो चाँदनी की तरह चमक रहा था। वह हमेशा उसे अपने पास रखती और कभी डर नहीं लगा।"},
    {"title":"जादुई जंगल (Jaadui Jangal)","category":"Hindi Bedtime","language":"Hindi","description":"एक बच्चा सपने में एक ऐसे जंगल में पहुँचता है जहाँ पेड़ बात करते हैं।","full_text":"रोज रात को आठ साल का आर्यन बिस्तर पर जाते ही जादुई जंगल पहुँच जाता था जहाँ पेड़ हिंदी में बात करते थे। एक पेड़ ने उसे सितारों की कहानी सुनाई, दूसरे ने परियों की। हर रात कोई नई बात सीखता। एक दिन जंगल ने कहा, 'यह जंगल तुम्हारे सपनों में तभी आता है जब तुम दिन भर अच्छे काम करते हो।' उस दिन से आर्यन ने हमेशा अच्छे काम किए। शिक्षा: अच्छे काम करने से मीठे सपने आते हैं।"},
]

for i, s in enumerate(stories):
    s["audio_file"] = AUDIO[i % len(AUDIO)]
    s["image"] = IMG[i % len(IMG)]
    s["seeded"] = True

db.stories.insert_many(stories)
print(f"[OK] {len(stories)} stories (10 English + 20 Hindi)")

# Riddles
riddles = [
    # Easy Riddles
    {"question":"I have hands but cannot clap. What am I?","answer":"A clock","hint":"I tell you the time","category":"Objects","difficulty":"Easy","emoji":"🕐"},
    {"question":"I have keys but no locks, I have space but no room. What am I?","answer":"A keyboard","hint":"You type on me","category":"Objects","difficulty":"Easy","emoji":"⌨️"},
    {"question":"I go up but never come down. What am I?","answer":"Your age","hint":"It happens every year on your birthday","category":"Clever","difficulty":"Easy","emoji":"🎂"},
    {"question":"What has a head and a tail but no body?","answer":"A coin","hint":"You use it to buy things","category":"Objects","difficulty":"Easy","emoji":"🪙"},
    {"question":"I am full of holes but still hold water. What am I?","answer":"A sponge","hint":"Used for washing dishes","category":"Objects","difficulty":"Easy","emoji":"🧽"},
    {"question":"The more you take, the more you leave behind. What am I?","answer":"Footsteps","hint":"You make them when you walk","category":"Clever","difficulty":"Easy","emoji":"👣"},
    {"question":"What can run but never walks, has a mouth but never talks?","answer":"A river","hint":"It flows through mountains and valleys","category":"Nature","difficulty":"Easy","emoji":"🌊"},
    {"question":"I am always in front of you but can never be seen. What am I?","answer":"The future","hint":"Tomorrow is part of me","category":"Clever","difficulty":"Easy","emoji":"🔮"},
    {"question":"What has teeth but cannot bite?","answer":"A comb","hint":"Used to fix your hair","category":"Objects","difficulty":"Easy","emoji":"💈"},
    {"question":"I have ears but cannot hear. I have a spine but am not an animal. What am I?","answer":"A book","hint":"You read me!","category":"Objects","difficulty":"Easy","emoji":"📚"},
    # Medium Riddles
    {"question":"What gets wetter the more it dries?","answer":"A towel","hint":"You use it after a bath","category":"Objects","difficulty":"Medium","emoji":"🏊"},
    {"question":"I have cities but no houses, forests but no trees, rivers but no water. What am I?","answer":"A map","hint":"It helps you find your way","category":"Objects","difficulty":"Medium","emoji":"🗺️"},
    {"question":"What can you catch but not throw?","answer":"A cold","hint":"You might sneeze when you have this","category":"Clever","difficulty":"Medium","emoji":"🤧"},
    {"question":"I speak without a mouth and hear without ears. I have no body but come alive with the wind. What am I?","answer":"An echo","hint":"Say something in a cave!","category":"Nature","difficulty":"Medium","emoji":"🏔️"},
    {"question":"What has a bottom at the top?","answer":"Your legs","hint":"Think about what you sit on","category":"Clever","difficulty":"Medium","emoji":"🦵"},
    {"question":"The more you have of it, the less you see. What is it?","answer":"Darkness","hint":"It appears when the lights go out","category":"Nature","difficulty":"Medium","emoji":"🌑"},
    {"question":"What invention lets you look right through a wall?","answer":"A window","hint":"You can see outside from inside through it","category":"Objects","difficulty":"Medium","emoji":"🪟"},
    {"question":"I can be cracked, I can be made, I can be told, I can be played. What am I?","answer":"A joke","hint":"It makes you laugh!","category":"Clever","difficulty":"Medium","emoji":"😂"},
    # Hard Riddles
    {"question":"Feed me and I live. Give me water and I die. What am I?","answer":"Fire","hint":"It keeps you warm in winter","category":"Nature","difficulty":"Hard","emoji":"🔥"},
    {"question":"I am not alive but I grow. I don't have lungs but I need air. I don't have a mouth but water kills me. What am I?","answer":"Fire","hint":"It dances and flickers","category":"Nature","difficulty":"Hard","emoji":"🕯️"},
    # Hindi Paheli
    {"question":"हरा था, मरा नहीं। सूखा था, जला नहीं। (Haraa tha, maraa nahi. Sukha tha, jala nahi.) - What is it?","answer":"पत्ता (Leaf)","hint":"पेड़ पर उगता है (Grows on a tree)","category":"Hindi","difficulty":"Easy","emoji":"🍃"},
    {"question":"ऊँचा-ऊँचा पेड़, मखमली है छाल, मीठे-मीठे फल, लाल-लाल गाल। (Tall tree, soft bark, sweet fruits, red cheeks)","answer":"सेब का पेड़ (Apple tree)","hint":"इसके फल को खाते हैं (We eat its fruits)","category":"Hindi","difficulty":"Easy","emoji":"🍎"},
    {"question":"मैं हमेशा आगे से आता हूँ, कभी पीछे से नहीं। तुम कभी मुझे देख नहीं सकते, पर मैं आता जरूर हूँ। (I always come from the front, never from behind. You can never see me but I always come.)","answer":"भविष्य (Future)","hint":"कल क्या होगा? (What will happen tomorrow?)","category":"Hindi","difficulty":"Medium","emoji":"⏳"},
    {"question":"मेरे पास चार टाँगें हैं लेकिन मैं नहीं चल सकता। लोग मुझ पर बैठते हैं। मैं क्या हूँ? (I have four legs but cannot walk. People sit on me. What am I?)","answer":"कुर्सी (Chair)","hint":"घर में बैठने के लिए (For sitting in a home)","category":"Hindi","difficulty":"Easy","emoji":"🪑"},
    {"question":"एक ऐसी चीज है जो हमेशा बढ़ती है, कभी घटती नहीं। बताओ क्या? (There is something that always grows, never decreases. What is it?)","answer":"उम्र (Age)","hint":"हर साल जन्मदिन आता है (Birthday comes every year)","category":"Hindi","difficulty":"Easy","emoji":"🎈"},
]

for r in riddles:
    r["seeded"] = True

db.riddles.insert_many(riddles)
print(f"[OK] {len(riddles)} riddles")

quizzes = [
    {"question":"What does the honest woodcutter refuse?","options":["Golden axe","Silver axe","Iron axe","Copper axe"],"answer":"Golden axe","category":"Moral"},
    {"question":"Why did the boy cry wolf?","options":["A real wolf came","He was bored","He lost a sheep","He was hungry"],"answer":"He was bored","category":"Moral"},
    {"question":"What did the farmer's goose lay?","options":["Silver eggs","Diamond eggs","Golden eggs","Bronze eggs"],"answer":"Golden eggs","category":"Moral"},
    {"question":"Who worked all summer storing food?","options":["Grasshopper","Bee","Ant","Butterfly"],"answer":"Ant","category":"Moral"},
    {"question":"How did the mouse help the lion?","options":["Brought him food","Found him water","Gnawed through the net","Called other animals"],"answer":"Gnawed through the net","category":"Moral"},
    {"question":"Who won the race between the tortoise and the hare?","options":["The hare","The tortoise","They tied","Nobody"],"answer":"The tortoise","category":"Moral"},
    {"question":"What does the Moon sing to help stars sleep?","options":["A lullaby","A folk song","A poem","A rhyme"],"answer":"A lullaby","category":"Bedtime"},
    {"question":"How did the clever crow get water?","options":["Broke the pot","Dropped stones in","Used a straw","Tipped the pot"],"answer":"Dropped stones in","category":"Animal"},
    {"question":"What did little Krishna love to steal?","options":["Sweets","Fruits","Butter","Milk"],"answer":"Butter","category":"Mythology"},
    {"question":"What sacrifice did Eklavya make?","options":["His bow","His right thumb","His eye","His horse"],"answer":"His right thumb","category":"Mythology"},
    # Hindi Quiz
    {"question":"ईमानदार लकड़हारे को क्या मिला? (What did the honest woodcutter receive?)","options":["सोने की कुल्हाड़ी","तीनों कुल्हाड़ियाँ","चाँदी का गहना","धन"],"answer":"तीनों कुल्हाड़ियाँ","category":"Hindi Moral"},
    {"question":"प्यासे कौवे ने पानी पाने के लिए क्या किया? (What did the thirsty crow do to get water?)","options":["घड़ा तोड़ा","पत्थर डाले","चोंच अंदर डाली","किसी और से माँगा"],"answer":"पत्थर डाले","category":"Hindi Moral"},
    {"question":"लालची कुत्ते ने हड्डी क्यों खोई? (Why did the greedy dog lose the bone?)","options":["किसी ने छीनी","नदी में गिरी","खा गया","छुपा दी"],"answer":"नदी में गिरी","category":"Hindi Moral"},
    {"question":"कछुए ने खरगोश को कैसे हराया? (How did the tortoise beat the rabbit?)","options":["तेज दौड़कर","चालाकी से","बिना रुके चलकर","जादू से"],"answer":"बिना रुके चलकर","category":"Hindi Moral"},
    {"question":"चूहे ने शेर को कैसे बचाया? (How did the mouse save the lion?)","options":["दौड़कर लाया","जाल काटा","मदद बुलाई","शिकारी को डराया"],"answer":"जाल काटा","category":"Hindi Animal"},
    {"question":"बंदर ने मगरमच्छ को कैसे बेवकूफ बनाया? (How did the monkey fool the crocodile?)","options":["नाचकर","वापस तट पर गया","पानी में कूदा","पेड़ पर छुप गया"],"answer":"वापस तट पर गया","category":"Hindi Animal"},
    {"question":"होलिका दहन में प्रहलाद के साथ क्या हुआ? (What happened to Prahlad in Holika Dahan?)","options":["वह जल गया","वह सुरक्षित बचा","वह भाग गया","वह सो गया"],"answer":"वह सुरक्षित बचा","category":"Hindi Mythology"},
    {"question":"पहेली: हरा था, मरा नहीं — इसका जवाब क्या है? (Riddle: Haraa tha maraa nahi — what is the answer?)","options":["पत्ता","पेड़","घास","फूल"],"answer":"पत्ता","category":"Hindi Riddles"},
    {"question":"Riddle: What has hands but cannot clap?","options":["A person","A robot","A clock","A puppet"],"answer":"A clock","category":"Riddles"},
    {"question":"Riddle: What gets wetter the more it dries?","options":["A sponge","A towel","A mop","Soap"],"answer":"A towel","category":"Riddles"},
]

for q in quizzes:
    q["seeded"] = True

db.quizzes.insert_many(quizzes)
print(f"[OK] {len(quizzes)} quizzes")

print("\n=== SEEDING COMPLETE ===")
print("Credentials:")
print("  Admin  -> demo_admin  / admin123")
print("  Parent -> demo_parent / parent123")
print("  Kid    -> demo_kid    / kid123")
