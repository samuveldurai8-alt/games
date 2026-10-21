import { GameDefinition, AvatarOption } from '../types';

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: 'bunny', emoji: '🐰', label: 'Bunny', bgGradient: 'from-pink-200 to-rose-300' },
  { id: 'cat', emoji: '🐱', label: 'Mochi Cat', bgGradient: 'from-purple-200 to-pink-200' },
  { id: 'bear', emoji: '🐻', label: 'Honey Bear', bgGradient: 'from-amber-200 to-orange-200' },
  { id: 'fox', emoji: '🦊', label: 'Little Fox', bgGradient: 'from-orange-200 to-rose-200' },
  { id: 'penguin', emoji: '🐧', label: 'Penguin', bgGradient: 'from-sky-200 to-indigo-200' },
  { id: 'puppy', emoji: '🐶', label: 'Puppy', bgGradient: 'from-amber-100 to-pink-200' },
  { id: 'panda', emoji: '🐼', label: 'Panda', bgGradient: 'from-slate-200 to-pink-200' },
  { id: 'chick', emoji: '🐥', label: 'Chick', bgGradient: 'from-yellow-200 to-amber-200' },
];

export const GAME_CATALOG: GameDefinition[] = [
  {
    id: 'tictactoe',
    title: 'Tic-Tac-Toe',
    subtitle: 'Classic Hearts & Kisses (X / O)',
    description: 'Alternating turns on a 3x3 board. Best of three rounds with celebratory win highlights.',
    category: 'competitive',
    categoryName: 'Competitive',
    iconName: 'Grid',
    estimatedMinutes: 3,
    mode: 'turn_based',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
  },
  {
    id: 'connectfour',
    title: 'Connect Four',
    subtitle: 'Drop Your Discs with Love',
    description: '7-column by 6-row gravity board. Connect four tokens horizontally, vertically or diagonally!',
    category: 'competitive',
    categoryName: 'Competitive',
    iconName: 'CircleDot',
    estimatedMinutes: 5,
    mode: 'turn_based',
    badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-300'
  },
  {
    id: 'rps',
    title: 'Rock, Paper, Scissors',
    subtitle: 'Simultaneous Secret Battle',
    description: 'Choose privately, reveal simultaneously! Best of 5 rounds with instant score tracking.',
    category: 'competitive',
    categoryName: 'Competitive',
    iconName: 'Sparkles',
    estimatedMinutes: 2,
    mode: 'simultaneous',
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  {
    id: 'truthordare',
    title: 'Truth or Dare',
    subtitle: 'Romantic, Deep & Playful',
    description: 'Hundreds of questions across Cute, Flirty, Deep, Romantic, Funny, and Random decks, plus spin-the-bottle!',
    category: 'truth_or_dare',
    categoryName: 'Truth & Dare',
    iconName: 'Flame',
    estimatedMinutes: 10,
    mode: 'turn_based',
    badgeColor: 'bg-red-100 text-red-700 border-red-300'
  },
  {
    id: 'thisorthat',
    title: 'This or That',
    subtitle: 'Do Our Tastes Align?',
    description: 'Over 200 couple dilemmas. Pick your choice secretly, then reveal if your hearts match!',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'Split',
    estimatedMinutes: 5,
    mode: 'simultaneous',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  {
    id: 'swipematch',
    title: 'Swipe Match',
    subtitle: 'Couple Habit Yes / No',
    description: 'Swipe Right for Yes, Left for No. Reveal your synchronized match percentage and fun commentary!',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'HeartHandshake',
    estimatedMinutes: 6,
    mode: 'simultaneous',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
  },
  {
    id: 'howwelldoyouknowme',
    title: 'How Well Do You Know Me?',
    subtitle: 'Secret Answer & Prediction',
    description: 'One person answers a personal question secretly, the other tries to guess correctly.',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'UserCheck',
    estimatedMinutes: 8,
    mode: 'turn_based',
    badgeColor: 'bg-violet-100 text-violet-700 border-violet-300'
  },
  {
    id: 'mysterycards',
    title: 'Mystery Card Deck',
    subtitle: 'Flip & Reveal Fate',
    description: 'Pick face-down romantic cards with flip animations to uncover playful couple secrets and tasks.',
    category: 'mystery',
    categoryName: 'Mystery Cards',
    iconName: 'Layers',
    estimatedMinutes: 7,
    mode: 'turn_based',
    badgeColor: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-300'
  },
  {
    id: 'mindreader',
    title: 'Mind Reader',
    subtitle: 'Guess What They Would Pick',
    description: 'See a fun scenario with 4 choices. Predict what your partner will pick while they choose!',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'BrainCircuit',
    estimatedMinutes: 6,
    mode: 'simultaneous',
    badgeColor: 'bg-blue-100 text-blue-700 border-blue-300'
  },
  {
    id: 'memorymatch',
    title: 'Memory Match',
    subtitle: 'Sweet Emoji Pairs',
    description: 'Turn-based shared card grid. Uncover matching couple symbols and race for the highest score.',
    category: 'memory_and_mind',
    categoryName: 'Memory & Mind',
    iconName: 'Sparkle',
    estimatedMinutes: 5,
    mode: 'turn_based',
    badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-300'
  },
  {
    id: 'quicktap',
    title: 'Quick Tap Race',
    subtitle: 'Synchronized Reaction Test',
    description: 'Wait for the random countdown signal! First person to tap the heart wins the round.',
    category: 'quick_challenge',
    categoryName: 'Quick Challenge',
    iconName: 'Zap',
    estimatedMinutes: 3,
    mode: 'simultaneous',
    badgeColor: 'bg-amber-100 text-amber-700 border-amber-300'
  },
  {
    id: 'wouldyourather',
    title: 'Would You Rather?',
    subtitle: 'Tough & Romantic Choices',
    description: 'Both pick between two intriguing scenarios, reveal answers, and share cute explanations.',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'HelpCircle',
    estimatedMinutes: 6,
    mode: 'simultaneous',
    badgeColor: 'bg-teal-100 text-teal-700 border-teal-300'
  },
  {
    id: 'couplequiz',
    title: 'Couple Quiz',
    subtitle: 'Trivia & Shared Memories',
    description: 'Romantic multiple-choice questions testing how intimately you notice the small things.',
    category: 'compatibility',
    categoryName: 'Compatibility',
    iconName: 'Award',
    estimatedMinutes: 7,
    mode: 'simultaneous',
    badgeColor: 'bg-pink-100 text-pink-700 border-pink-300'
  },
  {
    id: 'emojidecoder',
    title: 'Emoji Decoder',
    subtitle: 'Guess the Movie, Date or Idiom',
    description: 'Decode romantic phrases, famous date tropes, and love movie titles represented solely by emojis.',
    category: 'memory_and_mind',
    categoryName: 'Memory & Mind',
    iconName: 'SmilePlus',
    estimatedMinutes: 6,
    mode: 'turn_based',
    badgeColor: 'bg-yellow-100 text-yellow-700 border-yellow-300'
  },
  {
    id: 'couplequest',
    title: 'Couple Quest',
    subtitle: 'Branching Cooperative Adventure',
    description: 'Embark together on Sakura Journey, Cozy Mountain Cabin, or Midnight Starlight Café stories.',
    category: 'coop_adventure',
    categoryName: 'Cooperative Adventure',
    iconName: 'Compass',
    estimatedMinutes: 12,
    mode: 'coop',
    badgeColor: 'bg-purple-100 text-purple-700 border-purple-300'
  },
  {
    id: 'dreamdate',
    title: 'Dream Date Builder',
    subtitle: 'Craft Your Perfect Fantasy Day',
    description: 'Collaborate on destinations, evening vibes, outfits, food, and music. Save it to your memories!',
    category: 'coop_adventure',
    categoryName: 'Cooperative Adventure',
    iconName: 'CalendarHeart',
    estimatedMinutes: 8,
    mode: 'coop',
    badgeColor: 'bg-rose-100 text-rose-700 border-rose-300'
  }
];

// ==========================================
// MASSIVE QUESTION BANKS WITH DEEP & FLIRTY DECKS
// ==========================================

export const TRUTH_OR_DARE_DATA = {
  truth: {
    flirty: [
      "What is something I wear that instantly drives your mind wild?",
      "What is your absolute favorite spot on your body to be kissed by me?",
      "If we were alone in a candlelit room right now with no distractions, what would you whisper in my ear?",
      "What is the most enticing fantasy you have ever had about the two of us?",
      "What is the biggest physical turn-on that I do completely effortlessly?",
      "Have you ever had a dream about me that made you wake up blushing? What happened?",
      "What is the most irresistible thing about my lips, eyes, or neck?",
      "If you could have me kiss you right now for 60 continuous seconds, where would each second go?",
      "What outfit or sleepwear of mine do you secretly wish I wore more often?",
      "What is something playful or naughty you have wanted to try with me but felt shy to bring up?",
      "What kind of touch from me gives you instant goosebumps down your spine?",
      "If you had to describe our sexual chemistry using only three vivid words, what would they be?",
      "What is the most seductive compliment anyone could give you, and how would you want me to deliver it?",
      "What went through your head the first time we ever kissed?",
      "Do you prefer slow, tender, romantic kisses or breathless, passionate, pulling-close kisses?",
      "What is a secret romantic or sensual urge you often get when we are simply watching a movie together?",
      "What scent or perfume on me makes you want to pull me closer and never let go?",
      "If I were a dessert, how would you savor me tonight?",
      "What is the most daring place you have ever daydreamed about stealing a passionate kiss with me?",
      "What is your favorite romantic time of night to be tangled together in sheets?"
    ],
    romantic: [
      "What was the exact moment you realized you were genuinely falling head-over-heels for me?",
      "What does my embrace feel like when the rest of the world feels overwhelming?",
      "What is the most romantic memory we have shared that still gives you butterfly flutters?",
      "If you wrote a song about our journey together, what would the chorus be about?",
      "What is something small I do every day that makes you fall in love with me all over again?",
      "If we could run away together to an isolated cliffside villa tonight, what is the first thing we'd do?",
      "What is your favorite memory of us kissing in the rain, cold, or dark?",
      "What is a love note or message I sent you that you still have saved or reread?",
      "What is your favorite thing about waking up beside me in the morning?",
      "How has our relationship changed the way you view true romance and partnership?",
      "What romantic movie scene reminds you most of our unspoken connection?",
      "What is a romantic tradition or ritual you want us to keep alive until we are eighty?",
      "What is the most touching sacrifice or gesture you've ever seen me make for you?",
      "What is one promise about our future together that you hold dearest to your heart?",
      "If our love had a distinct aroma, what would it smell like (e.g., rain, vanilla, fresh cedar, sweet berries)?"
    ],
    deep: [
      "What is your deepest vulnerability or insecurity that you only feel safe revealing to me?",
      "In what ways do you feel we balance each other's emotional wounds and strengths?",
      "What has loving me taught you about your own capacity for empathy and patience?",
      "What is a quiet fear you carry about the future that you haven't put into words yet?",
      "When do you feel most understood and emotionally nurtured by me?",
      "What is a personal dream of yours that you want me to help you protect and accomplish?",
      "What was a difficult moment in your life where you felt our bond become unbreakable?",
      "What is something you deeply admire about the way I handle adversity or stress?",
      "How do you define the difference between ordinary attraction and our soul connection?",
      "If you could ask me any question about my innermost thoughts with zero hesitation, what would it be?",
      "What part of your childhood or past do you think shaped how you show love today?",
      "What is the most profound lesson our relationship has taught you so far?",
      "What makes our bond feel irreplaceable compared to anyone else you've ever known?",
      "What is an unspoken goal you have for where we will be emotionally in five years?",
      "When you think of home, what about me comes to your mind first?"
    ],
    cute: [
      "What was your very first thought the first time you ever laid eyes on me?",
      "What is the most adorable quirk or habit that I do without noticing?",
      "If we were trapped together in an elevator for 4 hours, what silly game would we play?",
      "What is your absolute favorite physical feature of mine?",
      "What is the sweetest dream you have ever had about the two of us?",
      "What song instantly reminds you of me the second it starts playing?",
      "If we were an animal couple, what cute animals would we be?",
      "What is the most comforting thing I say or do when you are having a rough day?",
      "What is your favorite memory of us laughing until our stomachs hurt?",
      "If you could freeze one moment in time with me, which one would it be?",
      "What is something small I do that makes your heart skip a beat?",
      "What is your favorite nickname for me, even if you rarely say it aloud?",
      "If you could borrow any item of my clothing forever, what would it be?",
      "What is the best hug you remember receiving from me?",
      "What is something silly you secretly hope we do together soon?",
      "What is one photo of us that you treasure the most on your phone?",
      "What food always makes you think of our time together?",
      "If you had to describe our relationship in exactly three words, what are they?",
      "What is your favorite lazy Sunday activity for us?",
      "What outfit of mine is your secret favorite?"
    ],
    funny: [
      "What is the most embarrassing thing you've done in front of me that you thought you hid?",
      "If we got arrested together, what ridiculous reason would it most likely be for?",
      "What is something I do that mildly drives you crazy in the most endearing way?",
      "If you had to swap bodies with me for 24 hours, what is the first mischievous thing you'd do?",
      "What is the worst meal you've ever eaten or cooked for me?",
      "If our relationship was a meme, which one would it be right now?",
      "What is a harmless lie you told me early on just to impress me?",
      "Who would survive longer in a zombie apocalypse: you or me?",
      "What is the most ridiculous argument we have ever had over something totally minor?",
      "What cartoon character does my morning bedhead resemble the most?",
      "If I were a dessert, what dessert would I be and why?",
      "What is the silliest thing you have caught yourself daydreaming about me?",
      "What is your guilty pleasure TV show that you secretly want us to binge?",
      "Who takes longer getting ready when we go out for dinner?",
      "What is the most dramatic reaction I have had to something completely trivial?"
    ],
    random: [
      "If we started a podcast together, what would the topic be?",
      "What would our superhero duo name and superpowers be?",
      "If we won a million dollars tomorrow, what is the first crazy thing we'd buy?",
      "What era of history would we have been funniest living in as a couple?",
      "If we opened a little bakery or café together, what would we name it?",
      "Which fictional universe would we thrive in the most as partners?",
      "If you could give me any magical ability for one week, what would it be?",
      "What board game creates the most competitive tension between us?",
      "If we were stranded on a tropical island, what single luxury item would you want?",
      "What theme song should play whenever we walk into a room together?"
    ]
  },
  dare: {
    flirty: [
      "Whisper into my ear (or record a sultry voice note) describing exactly what you want to do to me the next time we're alone.",
      "Send a selfie right now giving your most seductive gaze, bite your lip, and text it to me.",
      "Close your eyes and let me describe in vivid detail where my next kiss on you will land.",
      "Take 30 seconds to trace your fingers gently along my jawline or arm, maintaining intense eye contact.",
      "Give me a passionate kiss (or blow me a cinematic slow-motion kiss) that lasts at least 15 uninterrupted seconds.",
      "Tell me in a low whisper the exact thought that made you blush the most while looking at me recently.",
      "Give me a slow, soothing neck or shoulder massage for the next two minutes without speaking a word.",
      "Write a flirtatious 2-line poem about my lips and read it with your sweetest, deepest voice.",
      "Describe the outfit you want to see me wearing on our next private evening together.",
      "Whisper three secrets into my ear: one romantic, one bold, and one deliciously flirty."
    ],
    romantic: [
      "Look directly into my eyes (or camera) and tell me 3 heartfelt reasons why you cherish me more than anyone.",
      "Write a short, heartfelt 3-sentence love letter and send it to me right this second.",
      "Tell me the story of our first date or first meeting as if it were a grand fairy tale.",
      "Describe in vivid detail the dream morning you want us to wake up to together.",
      "Pick a song right now and dedicate it to me as our official track for tonight.",
      "Take a picture of where your heart is right now and text it with a sweet caption.",
      "Make a romantic pinky-promise that we must fulfill on our next trip together."
    ],
    cute: [
      "Send me a voice message speaking in your cutest cartoon voice declaring your love.",
      "Close your eyes and let me guide you to touch 3 mystery items around your room.",
      "Draw a cute portrait of me on paper or your screen in under 60 seconds and show me!",
      "Serenade me with 30 seconds of any song you choose, singing with full drama.",
      "Send a cute selfie making a heart shape with your hands over your face.",
      "Spell out my name or 'LOVE' using whatever snacks or small objects are nearby.",
      "Make up a sweet 4-line rhyming poem about my smile right now on the spot.",
      "Blow me 5 different animated virtual kisses over video/call with sound effects!",
      "Give your pillow a dramatic romantic hug pretending it is me.",
      "Change your chat emoji status to a crown or heart dedicated to me for the day."
    ],
    funny: [
      "Do your best impression of me when I get hungry or sleepy.",
      "Talk with an exaggerated royal accent for the next two rounds of the game.",
      "Show me the absolute funniest or weirdest photo saved in your camera roll.",
      "Do a 15-second catwalk dance in your room like you are on Paris Fashion Week.",
      "Try to lick your elbow while looking directly into the camera.",
      "Speak only in whispers and sound effects for the next 3 minutes.",
      "Recite the alphabet backward starting from Z until you mess up.",
      "Put on a pair of sunglasses indoors and act like a bodyguard protecting me.",
      "Send a funny voice memo acting like a passionate restaurant waiter describing our next date."
    ]
  }
};

export const THIS_OR_THAT_PAIRS = [
  // Flirty & Romantic Intimacy
  { a: "Forehead Kisses & Soft Whispers", b: "Passionate Neck Kisses in the Dark", cat: "Romance" },
  { a: "Tangled in Sheets on Rainy Mornings", b: "Late Night Balcony Cuddles Under Starlight", cat: "Romance" },
  { a: "Spontaneous Slow Dance in Kitchen", b: "Stealing Kisses in Crowded Elevator", cat: "Romance" },
  { a: "Whispering Secrets in Bed", b: "Holding Hands Tightly Under the Table", cat: "Romance" },
  { a: "Waking Up to Surprise Gentle Massages", b: "Waking Up to Breakfast in Bed with Flowers", cat: "Romance" },
  { a: "Intense Unbroken Eye Contact", b: "Sweet Playful Smirks & Teasing", cat: "Flirty" },
  { a: "Skin-to-Skin Cuddles All Night", b: "Wrapped in a Heavy Shared Duvet", cat: "Flirty" },
  { a: "Sharing a Steamy Bubble Bath with Wine", b: "Heated Hot Tub Under the Midnight Stars", cat: "Flirty" },
  { a: "Pulling Me Close by the Waist", b: "Running Your Fingers Through My Hair", cat: "Flirty" },
  { a: "Biting My Lower Lip Softly", b: "Tracing Your Finger Along My Collarbone", cat: "Flirty" },

  // Food & Dates
  { a: "Cozy Breakfast in Bed", b: "Late Night Starlight Dinner", cat: "Dates" },
  { a: "Street Food Night Market", b: "Fancy Candlelit Restaurant", cat: "Dates" },
  { a: "Cooking Together with Music & Wine", b: "Ordering Delivery & Movie Marathon", cat: "Food" },
  { a: "Sweet Fluffy Souffle Pancakes", b: "Crispy Savory Belgian Waffles", cat: "Food" },
  { a: "Warm Matcha Latte", b: "Rich Hot Cocoa with Marshmallows", cat: "Food" },
  { a: "Picnic in the Sakura Blossom Park", b: "Rooftop Cocktails at Golden Sunset", cat: "Dates" },
  { a: "Sharing One Giant Milkshake with Two Straws", b: "Getting Two Distinct Artisanal Flavors", cat: "Food" },
  { a: "Baking Fresh Cookies from Scratch", b: "Eating Raw Sweet Cookie Dough Together", cat: "Food" },
  { a: "Binge-Watching Our Favorite Series", b: "Marathon of 90s Romantic Comedies", cat: "Dates" },
  { a: "Amusement Park Rollercoasters & Funnel Cake", b: "Calm Botanical Garden Walk Hand-in-Hand", cat: "Dates" },
  { a: "Sunrise Coffee on a Mist-Covered Balcony", b: "Midnight Gelato Run in Pajamas", cat: "Dates" },
  { a: "Omakase Sushi Date Night", b: "Italian Pasta, Truffles & Fresh Garlic Bread", cat: "Food" },
  { a: "Campfire S'mores Under the Milky Way", b: "Indoor Fireplace Cuddles with Hot Cider", cat: "Dates" },
  { a: "Arcade Claw Machine Battles & High Scores", b: "Intimate Board Games by Flickering Candlelight", cat: "Dates" },
  { a: "Fresh French Bakery Croissants & Espresso", b: "Rich Belgian Chocolate Fondue with Strawberries", cat: "Food" },

  // Lifestyle & Travel
  { a: "Secluded Cabin in Snowy Mountains", b: "Overwater Bungalow on a Turquoise Beach", cat: "Travel" },
  { a: "Spontaneous Road Trip with No Map or Plans", b: "Meticulously Curated Luxury City Escape", cat: "Travel" },
  { a: "Early Bird Morning Walks with Fresh Air", b: "Night Owl Stargazing until 3 AM", cat: "Lifestyle" },
  { a: "Rainy Afternoon Listening to Thunder in Bed", b: "Sunny Afternoon in a Double Hammock", cat: "Lifestyle" },
  { a: "Adopting an Affectionate Golden Retriever", b: "Adopting a Playful Fluffy Cuddle Kitten", cat: "Lifestyle" },
  { a: "Intimate Live Acoustic Concert", b: "Cozy Vinyl Record Listening by Lamp Light", cat: "Lifestyle" },
  { a: "Exploring Tokyo Neon Alleys & Ramen Shops", b: "Wandering Paris Cobblestone Streets & Cafés", cat: "Travel" },
  { a: "Matching Silk Couple Pajamas", b: "Stealing My Oversized Soft Hoodie", cat: "Lifestyle" },
  { a: "Camping in a Tent by a Mirror Lake", b: "Glamping with King-Sized Bed & Fairy Lights", cat: "Travel" },
  { a: "Natural Onsen Hot Springs in Winter Snow", b: "Cliffside Infinity Pool at Pink Sunset", cat: "Travel" },
  { a: "Silent Reading Together in the Same Room", b: "Talking for Hours About Everything until 4 AM", cat: "Lifestyle" },
  { a: "Hosting a Lively Dinner with Best Friends", b: "Just the Two of Us All Weekend with Phones Off", cat: "Lifestyle" },
  { a: "Modern Art Gallery & Museum Afternoon", b: "Aquarium Tunnel Walking Under Manta Rays", cat: "Dates" },
  { a: "Road Trip Sing-Alongs at the Top of Our Lungs", b: "Chilling to Ambient Lo-Fi & Ocean Sounds", cat: "Lifestyle" },

  // Deep & Future
  { a: "Living in a Sleek Downtown High-Rise Loft", b: "Living in a Quiet Country Stone Cottage with Gardens", cat: "Future" },
  { a: "A Big Fairy Tale Wedding with Everyone", b: "An Intimate Cliffside Elopement with Just Us Two", cat: "Future" },
  { a: "Building an Impressive LEGO Architecture Set", b: "Painting Oil Canvases of Each Other", cat: "Dates" },
  { a: "One Giant Shared Weighted Blanket", b: "Two Separate Ultra-Cozy Fluffy Blankets", cat: "Lifestyle" },
  { a: "Calling on the Phone to Hear Each Other's Breath", b: "Sending 50 Cute TikToks, Memes & Voice Notes", cat: "Lifestyle" },
  { a: "Sweet Soft Morning Kisses Before Speaking", b: "Sleepy Goodnight Whispers Right Next to Your Ear", cat: "Romance" },
  { a: "Knowing What the Other is Thinking Silently", b: "Expressing Love Through Unfiltered Words", cat: "Deep" }
];

export const SWIPE_MATCH_PROMPTS = [
  "I would gladly share my last bite of dessert with you every single time.",
  "Forehead kisses and lingering neck kisses are the purest form of affection.",
  "Spontaneous midnight drives with zero destination are peak romance.",
  "I secretly love when you wear my clothes or borrow my jackets.",
  "Watching a movie in total comfortable silence is better than talking through it.",
  "We should definitely book a private cabin in the woods with an outdoor hot tub.",
  "Couples should have at least one special song that belongs completely to them.",
  "I fall asleep significantly faster when I am curled up in your arms.",
  "Surprise romantic getaways beat scheduled vacations every single time.",
  "Dancing foolishly together in the kitchen while food is cooking is elite tier romance.",
  "I am definitely the more dramatic one when I feel sleepy or exhausted.",
  "We would make an unstoppable duo in a high-stakes escape room challenge.",
  "Subtle PDA like fingers interlinked and warm cheek kisses is charming, never annoying.",
  "Late night conversations after 1 AM are where real souls meet.",
  "I would gladly let you pick the entire music playlist for an 8-hour road trip.",
  "Sleeping with the window cracked open during cool rainy nights is pure bliss.",
  "Couples should definitely have secret hand gestures or codewords in public.",
  "I have reread our old chat messages late at night just to smile to myself.",
  "Breakfast food served for late-night dinner is top-tier comfort.",
  "We need to take a hands-on pottery or pasta-making class together soon.",
  "I would happily let you win a board game if I knew you had a rough day.",
  "Bingeing an entire season together under a huge blanket is a perfect Saturday.",
  "A sunset picnic with wine and fruit beats an overly formal restaurant date.",
  "You are genuinely the very first person I want to text whenever anything happens.",
  "We should bury a sentimental time capsule with photos and letters to open in 5 years.",
  "I can almost always tell when something is on your mind before you speak.",
  "Stealing sweet kisses while waiting at red lights is an absolute requirement.",
  "Having a private ritual where we recap our favorite moment of the day builds true intimacy.",
  "Whispering compliments in each other's ears in public makes hearts race.",
  "I would love to wake up with you to the sound of ocean waves crashing outside.",
  "Taking long showers or baths together with candlelight is ultimate relaxation.",
  "Planning our future travels together gets me more excited than anything else."
];

export const WOULD_YOU_RATHER_PROMPTS = [
  { a: "Relive our absolute favorite day together once every single year", b: "Travel to 10 brand new exotic countries we have never set foot in" },
  { a: "Receive a surprise handwritten wax-sealed love letter every week", b: "Wake up to a surprise gourmet breakfast in bed every Sunday" },
  { a: "Be snowbound in a cozy firelit mountain cabin together for a week", b: "Be marooned in a private luxury overwater beach villa in Bora Bora" },
  { a: "Always have matching vintage lockets with each other's pictures", b: "Have custom engraved secret promise rings that only we understand" },
  { a: "Have our own private velvet-seated home theater room", b: "Have a rooftop glass conservatory with an astronomy telescope" },
  { a: "Never have to do dishes or clean the house again forever", b: "Never have to cook or stress about what to make for dinner" },
  { a: "Hear me softly sing you to sleep with your favorite acoustic song", b: "Have me read you enchanting bedtime fairy tales by fairy lights" },
  { a: "Have our minds telepathically linked for 1 hour so we know everything", b: "Swap bodies for 24 hours to feel love completely from the other's view" },
  { a: "Spend two weeks in Kyoto during peak pink cherry blossom season", b: "Watch the glowing emerald Northern Lights from a heated glass igloo" },
  { a: "Be able to teleport into each other's embrace instantly at any moment", b: "Have an unlimited lifetime budget dedicated exclusively to our date nights" },
  { a: "Slow dance together barefoot under a sudden warm summer downpour", b: "Watch shooting stars wrapped in a heated cashmere blanket on a cliff" },
  { a: "Have a private Michelin-starred chef cook us a 7-course feast", b: "Cook a playful, chaotic dinner together with wine, music and flour on our faces" },
  { a: "Spend a whole day in bed cuddling, talking, and kissing with phones off", b: "Embark on an adrenaline-filled day of theme parks and rooftop adventures" },
  { a: "Have an unspoken bond where we always know what the other desires", b: "Have endless deep conversations every evening that never run dry" },
  { a: "Wake up together every day to golden sunrise over a tranquil lake", b: "Fall asleep together every night to the glow of city skylines and neon lights" },
  { a: "Have a secret couples code word that means 'Kiss me right now'", b: "Have a private couple song that plays automatically whenever we enter a room" }
];

export const HOW_WELL_DO_YOU_KNOW_ME_QUESTIONS = [
  {
    question: "What is my absolute go-to comfort food when I'm stressed, sad, or exhausted?",
    options: ["Cheesy Pizza & Garlic Dip", "Steaming Hot Ramen / Noodle Soup", "Decadent Ice Cream & Brownies", "Crispy Loaded Burgers & Golden Fries"]
  },
  {
    question: "If I could pack one suitcase and fly out tonight, where is my ultimate romantic escape?",
    options: ["Kyoto & Tokyo, Japan (Sakura & Shrines)", "Amalfi Coast, Italy (Cliffside & Pasta)", "Santorini, Greece (White Villas & Sunsets)", "Swiss Alps (Snow Cabins & Hot Cocoa)"]
  },
  {
    question: "What is my secret superpower in our relationship?",
    options: ["Making you burst out laughing when upset", "Remembering tiny details you mentioned weeks ago", "Giving the warmest, most calming hugs", "Always finding the best cozy food or shows"]
  },
  {
    question: "What is my biggest pet peeve when we are out in public?",
    options: ["People walking agonizingly slow in groups", "Chewing loudly or poor table manners", "Aggressive drivers & road rage", "People being dismissive or rude to servers"]
  },
  {
    question: "When I have a free afternoon with zero work or responsibilities, I most want to:",
    options: ["Take a long uninterrupted cozy nap", "Scroll videos and discover cute things", "Listen to music, write, or daydream", "Snack comfortably and binge my favorite comfort series"]
  },
  {
    question: "What genre of entertainment captures my heart the quickest?",
    options: ["Romantic Comedies & Sweet Slice-of-Life", "Thrilling True Crime & Psychological Mysteries", "Immersive High Fantasy & Sci-Fi Epics", "Hearty Sitcoms & Stand-Up Comedy"]
  },
  {
    question: "How do I feel most deeply loved and validated by you?",
    options: ["Heartfelt words of affirmation & unexpected texts", "Physical affection, holding hands & tight cuddles", "Quality undistracted time with phones tucked away", "Thoughtful acts of service & taking care of small tasks"]
  },
  {
    question: "What is my true morning personality before having coffee or tea?",
    options: ["Silent zombie, please don't ask me questions yet", "Soft, sleepy bear that just wants ten more minutes of snuggles", "Awake instantly and scrolling through notifications", "Bouncing around with sudden bursts of morning energy"]
  },
  {
    question: "What kind of romantic gesture melts my heart instantly?",
    options: ["A handwritten letter tucked into my bag secretly", "Bringing my favorite snack or drink without being asked", "Pulling me into an unexpected tight embrace from behind", "Planning an entire surprise evening without me having to decide"]
  },
  {
    question: "What is my favorite physical feature of yours to admire?",
    options: ["Your expressive eyes when you smile genuinely", "Your lips and the way you kiss me", "Your hands and the way they fit into mine", "Your captivating laugh and the sound of your voice"]
  },
  {
    question: "If I'm having a rough day, what is the best way to help me reset?",
    options: ["Give me space for an hour, then bring a warm treat", "Hold me tightly and let me vent without offering solutions", "Distract me with humor, memes, and silliness", "Take me outside for a peaceful walk under fresh air"]
  },
  {
    question: "What is my dream evening aesthetic with you?",
    options: ["Dim ambient fairy lights, vinyl records, and wine", "Stargazing from a rooftop wrapped in a shared blanket", "Pajamas, plush pillows, pizza, and gaming together", "Dressing up elegantly for a cocktail lounge and city walk"]
  }
];

export const MIND_READER_SCENARIOS = [
  {
    scenario: "We walk into a world-class French pastry shop with an unbelievable display. Which treat am I ordering?",
    options: ["Warm Flaky Almond Croissant", "Gooey Glazed Cinnamon Roll with Cream Cheese", "Rich Dark Chocolate Ganache Truffle Tart", "Fresh Sweet Strawberry & Vanilla Choux"]
  },
  {
    scenario: "It is Friday night, torrential rain outside with thunder. What is my fantasy activity with you?",
    options: ["Building a giant blanket fort with pillows & movie marathon", "Cooking an elaborate warm pasta dinner with jazz & red wine", "Playing competitive video or board games in our pajamas", "Taking a steaming hot candlelit bubble bath together"]
  },
  {
    scenario: "If I could instantly master any creative art form overnight, which would I pick?",
    options: ["Playing romantic piano or acoustic guitar effortlessly", "Painting breathtaking watercolor landscape portraits", "Speaking five romance languages with a flawless accent", "Culinary mastery of world-class gourmet desserts"]
  },
  {
    scenario: "Which season mirrors the core essence of my personality?",
    options: ["Spring (Gentle breeze, pastel blossoms, fresh hope)", "Summer (Golden hour warmth, vibrant laughter, ocean sunsets)", "Autumn (Cozy oversized sweaters, falling leaves, pumpkin spice)", "Winter (Crisp quiet snow, fireside blankets, hot cocoa)"]
  },
  {
    scenario: "If we welcomed an adorable rescue pet into our home tomorrow, what name would I pick first?",
    options: ["Mochi / Boba (Sweet & bouncy)", "Peanut / Nugget (Cheeky & playful)", "Luna / Starlight (Dreamy & mysterious)", "Milo / Oliver (Classic & sophisticated)"]
  },
  {
    scenario: "If you could grant me one superpower for 24 hours, which one would I choose?",
    options: ["Teleportation anywhere on earth instantly with you", "Mind reading to know everyone's true kind thoughts", "Time travel to visit any historic romantic era", "Flying freely through clouds and starlight together"]
  },
  {
    scenario: "Where would I most want us to spend an unforgettable anniversary?",
    options: ["A private castle hotel in the Scottish Highlands", "A luxury seaside villa on the Amalfi Coast with a yacht", "A traditional wooden Ryokan in Kyoto with private onsen", "A glass rooftop dome beneath the Finnish Aurora Borealis"]
  },
  {
    scenario: "What would be my absolute favorite surprise date planned by you?",
    options: ["A secret stargazing picnic with my favorite foods and a telescope", "Tickets to see my dream musical or concert followed by rooftop drinks", "A scenic helicopter or hot air balloon ride over mountains at sunset", "A fully curated 'pamper day' with spa, massages, and candlelit dinner"]
  }
];

export const COUPLE_QUIZ_QUESTIONS = [
  {
    question: "Which sensory experience is most intimately tied to romance and nostalgia?",
    options: ["Scent (perfume, gentle rain, fresh cedar blossoms)", "Touch (tender hands, skin warmth, slow neck kisses)", "Sound (their breathless laugh, acoustic melody, sleepy whispers)", "Sight (their eyes catching sunlight, shy blushing smile)"]
  },
  {
    question: "What single quality makes a romantic partnership feel truly like home?",
    options: ["Total emotional safety to be goofy, flawed, and vulnerable", "Never feeling the need to put on a mask or pretend to be someone else", "Peaceful shared silence where no words are needed to feel complete", "Knowing without question that you have an unwavering teammate in life"]
  },
  {
    question: "What is the sweetest, most romantic way to open the morning together?",
    options: ["Soft, sleepy forehead kisses before either of you opens eyes", "Surprise coffee or warm tea brought to bed with a sweet note", "Sharing the first genuine, belly-laugh chuckle of the day", "Fifteen extra minutes of intertwined, silent spooning snuggles"]
  },
  {
    question: "What is the most healing remedy when life deals a rough, exhausting blow?",
    options: ["Your favorite comfort meal, dimmed lights, and an easy movie", "A long, firm, silent embrace where you can release all tension", "Venting freely without interruption while being lovingly validated", "Leaving the house together for a peaceful stroll under tall trees"]
  },
  {
    question: "What builds the deepest long-term emotional intimacy between lovers?",
    options: ["Expressing gratitude for the tiny everyday kindnesses", "Navigating disagreements with gentle words instead of defensiveness", "Keeping the flirty, playful spark alive regardless of routine", "Dreaming and setting shared ambitions for the future together"]
  },
  {
    question: "What is the ultimate definition of romantic chemistry?",
    options: ["Effortless conversation where hours vanish like minutes", "An electric physical pull whenever you are within arm's reach", "Shared sense of humor where a single glance makes both burst out laughing", "An innate telepathy where you always know what the other needs"]
  },
  {
    question: "When reminiscing on the earliest days of our romance, what stands out most?",
    options: ["The nervous butterflies right before seeing each other", "The thrill of the first lingering kiss and not wanting to pull away", "Staying up until dawn talking about everything and nothing", "The realization that this person was completely different from anyone else"]
  },
  {
    question: "Which romantic love language brings the most comfort during times of stress?",
    options: ["Warm, reassuring hugs and gentle back rubs", "Affirming words reminding you of your strength and worth", "Making everyday burdens lighter by quietly helping out", "Setting aside sacred quality time where the world is shut out"]
  }
];

export const EMOJI_DECODER_PUZZLES = [
  {
    emojis: "🚢 ❄️ 💔 🚪 🌊",
    answer: "Titanic",
    hint: "Epic romance & tragedy on an icy ocean voyage",
    category: "Movie"
  },
  {
    emojis: "👸 👠 🕛 🎃 🏰",
    answer: "Cinderella",
    hint: "Glass slipper lost before midnight",
    category: "Fairy Tale"
  },
  {
    emojis: "🦁 👑 🌅 🐗 🦝",
    answer: "The Lion King",
    hint: "Circle of Life in the Pride Lands",
    category: "Movie"
  },
  {
    emojis: "🌹 🥀 👹 📚 💛",
    answer: "Beauty and the Beast",
    hint: "Tale as old as time, enchanted castle",
    category: "Movie"
  },
  {
    emojis: "🌧️ ☔ 💃 🕺 🎶",
    answer: "Singin in the Rain",
    hint: "Dancing with an umbrella in downpour",
    category: "Classic"
  },
  {
    emojis: "☕ 🥐 🗼 🥖 💌",
    answer: "Paris Date",
    hint: "Romantic breakfast near the Eiffel Tower",
    category: "Couple Date"
  },
  {
    emojis: "🍿 🎟️ 🎬 🥤 💑",
    answer: "Movie Night Date",
    hint: "Cinema snacks and holding hands in dark theater",
    category: "Couple Date"
  },
  {
    emojis: "⛺ 🌲 🔥 🍢 🌌",
    answer: "Campfire Stargazing",
    hint: "Roasting marshmallows under the Milky Way",
    category: "Adventure"
  },
  {
    emojis: "🧺 🍓 🍾 🥪 🌳",
    answer: "Park Picnic Date",
    hint: "Blanket, fruits and sandwiches on sunny grass",
    category: "Couple Date"
  },
  {
    emojis: "✈️ 🧳 🌴 🍹 🏖️",
    answer: "Tropical Vacation",
    hint: "Sun, palms, suitcases and coconut drinks",
    category: "Travel"
  },
  {
    emojis: "💍 🏔️ 🌋 🧝 🧙",
    answer: "Lord of the Rings",
    hint: "One ring to rule them all in Middle-earth",
    category: "Fantasy Movie"
  },
  {
    emojis: "🏎️ 🏁 🏆 ⛽ 💨",
    answer: "Fast and Furious",
    hint: "Street racing and family bonds",
    category: "Action Movie"
  }
];

export const MYSTERY_CARD_PROMPTS = [
  { title: "Sweet Confession", text: "Name one tiny habit of mine that makes you melt inside every time you see it.", icon: "Heart" },
  { title: "Time Travel", text: "If we could travel back to the day we met, what would you say to past-you?", icon: "Clock" },
  { title: "Dream Destination", text: "Describe our first morning waking up in our dream vacation city in vivid detail.", icon: "Compass" },
  { title: "Secret Wish", text: "What is one little romantic surprise you have always wanted to receive from me?", icon: "Sparkles" },
  { title: "Song of Us", text: "Sing or recite three lines from a song that captures how you feel about me right now.", icon: "Music" },
  { title: "Silly Challenge", text: "Give me your best impression of how I act when I'm being playfully stubborn.", icon: "Smile" },
  { title: "Sensual Whisper", text: "Whisper 5 things you find irresistible about my smile or body in under 15 seconds!", icon: "Flame" },
  { title: "Future Glance", text: "Describe what our cozy living room and balcony look like in 10 years.", icon: "Home" },
  { title: "Telepathy", text: "Close your eyes, think of a number between 1 and 10. Let's see if our minds match!", icon: "Eye" },
  { title: "Butterfly Kiss", text: "Give me gentle butterfly kisses with your eyelashes, or blow three delicate kisses.", icon: "Heart" },
  { title: "Romantic Oath", text: "Make a spontaneous promise about how you will treat me on our next date night.", icon: "Award" },
  { title: "Secret Turn-On", text: "Confess one subtle gesture I do that instantly triggers your romantic attraction.", icon: "Flame" }
];

export const COUPLE_QUEST_STORY = {
  title: "The Sakura Starlight Journey",
  chapters: [
    {
      id: "ch1",
      title: "Chapter 1: The Whispering Sakura Path",
      narrative: "The evening breeze carries pink cherry blossom petals down a quiet stone pathway in Kyoto. You and your partner stand at a crossroads as dusk paints the sky in shades of lilac and soft rose. Ahead, two distinct lanterns glow:",
      choices: [
        { id: "opt_a", text: "Follow the lantern trail leading toward the ancient Zen Tea Garden", outcome: "You discover a hidden wooden pavilion where warm jasmine tea is steeping by paper lanterns." },
        { id: "opt_b", text: "Take the wooden bridge crossing over the koi pond toward the Bamboo Grove", outcome: "The gentle rustling bamboo stalks glow with hundred of tiny bioluminescent fireflies." }
      ]
    },
    {
      id: "ch2",
      title: "Chapter 2: The Mystery Lantern Puzzle",
      narrative: "As you step into the enchanted space, an antique carved wooden box awaits on an altar. To unlock it together, both of you must touch your hands to the twin carvings:",
      choices: [
        { id: "opt_a", text: "Channel the Harmony of the Moon (gentle calm & trust)", outcome: "The box clicks open with a gentle chime, revealing two glowing celestial charms that bind your luck." },
        { id: "opt_b", text: "Channel the Spark of the Sun (vibrant passion & laughter)", outcome: "The carvings ignite with golden sparkles, revealing two crystal fortune scrolls blessed with endless joy." }
      ]
    },
    {
      id: "ch3",
      title: "Chapter 3: The Starlight Observation Tower",
      narrative: "Climbing a winding spiral staircase, you reach the highest terrace overlooking the entire glowing valley. The night sky is crystal clear, filled with constellations and falling meteors. It's time to make your shared wish:",
      choices: [
        { id: "opt_a", text: "Wish for endless travels and adventures across the globe together", outcome: "A brilliant shooting star streaks across the zenith, sealing your promise of worldwide exploration." },
        { id: "opt_b", text: "Wish for a warm, cozy sanctuary filled with peace, laughter and love", outcome: "A warm gentle breeze envelopes the two of you, filling your hearts with an unbreakable serene warmth." }
      ]
    }
  ]
};

export const DREAM_DATE_OPTIONS = {
  destinations: [
    { id: "kyoto", name: "Kyoto Sakura Gardens", desc: "Private tea house under falling pink blossoms", icon: "🌸" },
    { id: "paris", name: "Parisian Rooftop Terrace", desc: "Sunset view of the Eiffel Tower with string lights", icon: "🗼" },
    { id: "maldives", name: "Maldives Overwater Hammock", desc: "Crystal turquoise waves & bioluminescent plankton", icon: "🏝️" },
    { id: "swiss_alps", name: "Swiss Alps Heated Cabin", desc: "Snow falling outside while a fireplace roars inside", icon: "🏔️" },
    { id: "amalfi", name: "Amalfi Coast Cliffside Villa", desc: "Lemon groves, ocean breeze and vintage convertible ride", icon: "🍋" }
  ],
  vibes: [
    { id: "cozy", name: "Cozy & Intimate", desc: "Blankets, soft whispers and gentle acoustic music", icon: "🕯️" },
    { id: "glamorous", name: "Fancy & Elegant", desc: "Dressing to the nines, champagne and royal treatment", icon: "🥂" },
    { id: "playful", name: "Playful & Adventurous", desc: "Laughing, exploring hidden alleys and spontaneous stops", icon: "🎡" },
    { id: "dreamy", name: "Dreamy & Fairy Tale", desc: "Fairy lights, stargazing and romantic surprises", icon: "✨" }
  ],
  foods: [
    { id: "tasting", name: "7-Course Chef Tasting Menu", desc: "Handmade pastas, fresh delicacies and paired wines", icon: "🍷" },
    { id: "picnic", name: "Gourmet Sunset Picnic", desc: "Artisanal cheeses, fresh berries, macarons & bubbly", icon: "🧺" },
    { id: "cooking", name: "Cooking Together with Music", desc: "Homemade woodfired pizza, laughter & flour on our noses", icon: "🍕" },
    { id: "dessert_crawl", name: "Midnight Dessert Safari", desc: "Churros, crepes, gelato and decadent hot chocolate", icon: "🍫" }
  ],
  nightActivities: [
    { id: "stargazing", name: "Stargazing under Heavy Blankets", desc: "Looking for shooting stars while cuddled up", icon: "🌌" },
    { id: "slow_dance", name: "Slow Dancing under Fairy Lights", desc: "Swaying together to our favorite slow songs", icon: "💃" },
    { id: "night_swim", name: "Midnight Heated Pool Dip", desc: "Floating weightlessly under the moonlight", icon: "🏊" },
    { id: "deep_talk", name: "Balcony Deep Talks until 4 AM", desc: "Sharing our deepest dreams over warm drinks", icon: "☕" }
  ]
};
