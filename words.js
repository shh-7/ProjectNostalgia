// Curated Nostalgia & Classic Categories with Hints for Project Nostalgia
// Unified dictionary for Client & Offline / P2P WebRTC play

const NOSTALGIA_WORDS = {
    nostalgia: {
        name: "📼 90s & 2000s Nostalgia",
        items: [
            { word: "TAMAGOTCHI", hint: "Iconic Japanese handheld digital egg pet from 1996" },
            { word: "WALKMAN", hint: "Sony's revolutionary portable cassette player" },
            { word: "GAMEBOY", hint: "Nintendo's 8-bit handheld that came bundled with Tetris" },
            { word: "CASSETTE", hint: "Magnetic tape audio format you wound with a pencil" },
            { word: "DIALUP", hint: "Internet that screeched through the home telephone line" },
            { word: "BLOCKBUSTER", hint: "Neighborhood video rental store where you 'Be Kind, Rewind'" },
            { word: "ROLLERBLADES", hint: "Inline skates that were huge in 90s street culture" },
            { word: "POKEMON", hint: "Gotta catch 'em all! Pocket monsters craze" },
            { word: "SLINKY", hint: "Spring toy that walks down stairs alone or in pairs" },
            { word: "MINICLIP", hint: "Beloved website for flash games during school computer lab" },
            { word: "NICKELODEON", hint: "TV channel famous for orange splats and green slime" },
            { word: "DISCMAN", hint: "Portable CD player that skipped every time you ran" },
            { word: "NINTENDO", hint: "64-bit console with a three-pronged controller" },
            { word: "BOOMBOX", hint: "Heavy portable cassette stereo carried on shoulders" },
            { word: "FLOPPY DISK", hint: "The 3.5-inch plastic square that held 1.44 MB of data" },
            { word: "LUNCHBOX", hint: "Metal container featuring cartoons with a matching thermos" },
            { word: "CHUCK E CHEESE", hint: "Arcade and pizza palace where a mouse played guitar" },
            { word: "PLAYSTATION", hint: "Sony's 1994 console with the legendary startup chime" },
            { word: "VIEW MASTER", hint: "Stereoscopic 3D toy using reels with circular slides" },
            { word: "FUTURAMA", hint: "Animated sci-fi comedy about a 1999 pizza delivery boy" },
            { word: "LAVA LAMP", hint: "Groovy hypnotic liquid lamp popular in bedrooms" },
            { word: "POLLY POCKET", hint: "Microscopic doll that lived inside a compact case" }
        ]
    },
    videogames: {
        name: "🕹️ Classic Video Games",
        items: [
            { word: "PACMAN", hint: "Yellow pellet-chomper avoiding Blinky, Pinky, Inky & Clyde" },
            { word: "TETRIS", hint: "Addictive falling tetromino puzzle created in the Soviet Union" },
            { word: "SUPER MARIO", hint: "Mushroom Kingdom plumber rescuing Princess Peach" },
            { word: "ZELDA", hint: "Hyrule hero Link wielding the Master Sword against Ganon" },
            { word: "SONIC", hint: "Blue hedgehog collecting golden rings at supersonic speed" },
            { word: "DONKEY KONG", hint: "Classic arcade gorilla throwing barrels at Jumpman" },
            { word: "METROID", hint: "Bounty hunter Samus Aran exploring alien planet Zebes" },
            { word: "DOOM", hint: "1993 pioneer FPS featuring the iconic BFG9000 on Mars" },
            { word: "SPACE INVADERS", hint: "1978 arcade phenomenon where aliens march down screen" },
            { word: "STREET FIGHTER", hint: "Ryu and Ken throwing Hadoukens in the arcade" },
            { word: "MEGA MAN", hint: "Capcom's blue bomber defeating Robot Masters for powers" },
            { word: "MORTAL KOMBAT", hint: "Brutal fighting game famous for 'FINISH HIM!' fatalities" },
            { word: "FROGGER", hint: "Amphibian dodging heavy traffic and jumping on floating logs" },
            { word: "PONG", hint: "Atari's historic 1972 table tennis arcade machine" },
            { word: "CONTRA", hint: "Run-and-gun arcade game that popularized the Konami Code" },
            { word: "CRASH BANDICOOT", hint: "Spinning marsupial smashing Wumpa fruit crates" },
            { word: "SPYRO", hint: "Purple dragon gliding through worlds to rescue elders" },
            { word: "DUCK HUNT", hint: "NES light gun shooter with a laughing hunting dog" },
            { word: "GOLDENEYE", hint: "Legendary N64 4-player splitscreen Bond multiplayer" },
            { word: "HALF LIFE", hint: "Gordon Freeman with a crowbar in Black Mesa research" }
        ]
    },
    cartoons: {
        name: "📺 Cartoons & Movies",
        items: [
            { word: "SCOOBY DOO", hint: "Mystery Inc.'s cowardly Great Dane who loves Scooby Snacks" },
            { word: "TOM AND JERRY", hint: "Cat and mouse duo engaged in eternal chaotic rivalry" },
            { word: "SPONGEBOB", hint: "Yellow sea sponge who lives in a pineapple under the sea" },
            { word: "THE LION KING", hint: "Simba learning the Circle of Life and 'Hakuna Matata'" },
            { word: "ALADDIN", hint: "Street urchin who finds a magic lamp with a blue Genie" },
            { word: "TOY STORY", hint: "Woody and Buzz Lightyear discovering friendship" },
            { word: "JURASSIC PARK", hint: "Theme park where prehistoric clones break loose" },
            { word: "THE MATRIX", hint: "Neo choosing between the blue pill and the red pill" },
            { word: "BACK TO THE FUTURE", hint: "Marty McFly and Doc Brown traveling in a DeLorean" },
            { word: "STAR WARS", hint: "Epic galactic conflict with Jedi, Sith, and lightsabers" },
            { word: "GHOSTBUSTERS", hint: "Who you gonna call when ectoplasm invades NYC?" },
            { word: "POWERPUFF GIRLS", hint: "Sugar, spice, and chemical X created Blossom, Bubbles & Buttercup" },
            { word: "DEXTERS LAB", hint: "Boy genius whose secret laboratory is ruined by sister Dee Dee" },
            { word: "DUCK TALES", hint: "Scrooge McDuck swimming in a vault of gold coins" },
            { word: "RUGRATS", hint: "Tommy Pickles and toddler squad on imaginary adventures" },
            { word: "FLINTSTONES", hint: "Modern Stone Age family in the town of Bedrock" },
            { word: "LOONEY TUNES", hint: "'What's up, doc?' featuring Bugs Bunny and Daffy Duck" }
        ]
    },
    tech: {
        name: "💾 Retro Tech & Computing",
        items: [
            { word: "JAVASCRIPT", hint: "Programming language created in 10 days in 1995" },
            { word: "COMPUTER", hint: "Electronic brain running on silicon microprocessors" },
            { word: "ALGORITHM", hint: "Step-by-step mathematical recipe to solve a problem" },
            { word: "INTERNET", hint: "Global network of interconnected information servers" },
            { word: "KEYBOARD", hint: "Clicky mechanical typing apparatus with QWERTY layout" },
            { word: "MONITOR", hint: "Heavy CRT glass tube screen emitting a warm hum" },
            { word: "HARD DRIVE", hint: "Spinning magnetic platters storing your computer files" },
            { word: "TERMINAL", hint: "Text-only command interface for power users" },
            { word: "FLOPPY", hint: "Square magnetic diskette used to boot games from DOS" },
            { word: "WEBCAM", hint: "Grainy 240p eyeball camera for MSN Messenger video calls" },
            { word: "WINDOWS", hint: "Operating system made famous by Windows 95 and Solitaire" },
            { word: "LINUX", hint: "Open source penguin OS kernel created by Linus Torvalds" },
            { word: "PIXEL ART", hint: "Hand-placed digital squares creating beautiful retro art" },
            { word: "MOTHERBOARD", hint: "Main printed circuit board connecting all internal hardware" },
            { word: "PROGRAMMING", hint: "The craft of turning logic into executable software" },
            { word: "MAINFRAME", hint: "Room-sized computing powerhouse from early digital days" }
        ]
    },
    animals: {
        name: "🐾 Animals & Nature",
        items: [
            { word: "ELEPHANT", hint: "Gentle giant with a long trunk and remarkable memory" },
            { word: "CHAMELEON", hint: "Reptile with independently moving eyes that changes colors" },
            { word: "PENGUIN", hint: "Flightless aquatic bird dressed in a sleek natural tuxedo" },
            { word: "KANGAROO", hint: "Australian marsupial that hops and carries joeys in pouches" },
            { word: "FLAMINGO", hint: "Pink wading bird that famously stands on a single leg" },
            { word: "CHEETAH", hint: "The fastest land mammal capable of accelerating to 70 mph" },
            { word: "GIRAFFE", hint: "Tallest living terrestrial animal with an elongated neck" },
            { word: "DOLPHIN", hint: "Highly intelligent aquatic mammal using echolocation" },
            { word: "OCTOPUS", hint: "Eight-armed ocean genius with three hearts and blue blood" },
            { word: "PLATYPUS", hint: "Semi-aquatic egg-laying mammal with a duck-like bill" },
            { word: "HEDGEHOG", hint: "Small spiny woodland critter that curls into a prickly ball" },
            { word: "BUTTERFLY", hint: "Winged beauty that emerges transformed from a chrysalis" }
        ]
    },
    treats: {
        name: "🍭 Childhood Treats & Snacks",
        items: [
            { word: "DUNKAROOS", hint: "Kangaroo cookies dipped in sweet rainbow sprinkle frosting" },
            { word: "POP TARTS", hint: "Toaster pastries filled with fruit jelly and hard icing" },
            { word: "FUN DIP", hint: "Sugar stick dipped directly into fruit-flavored candy powders" },
            { word: "RING POP", hint: "Wearable lollipop gem that turned your fingers sticky" },
            { word: "CAPRI SUN", hint: "Silver foil juice pouch with the impossible-to-poke straw" },
            { word: "BUBBLE TAPE", hint: "Six feet of bubble gum rolled inside a plastic clam shell" },
            { word: "FRUIT ROLL UP", hint: "Stretchy sheet of fruit candy that left temporary tongue tattoos" },
            { word: "PUSH POP", hint: "Cylindrical candy you pushed up from the bottom with your finger" },
            { word: "WONDER BALL", hint: "Chocolate sphere hiding candy characters and stickers inside" },
            { word: "PIXY STIX", hint: "Paper straw filled with sweet and tart sugar candy powder" }
        ]
    }
};

function getNostalgiaCategories() {
    return Object.keys(NOSTALGIA_WORDS).map(key => ({
        key,
        name: NOSTALGIA_WORDS[key].name,
        count: NOSTALGIA_WORDS[key].items.length
    }));
}

function getRandomNostalgiaWord(categoryKey = "random") {
    let selectedCategory = categoryKey;
    const keys = Object.keys(NOSTALGIA_WORDS);

    if (categoryKey === "random" || !NOSTALGIA_WORDS[categoryKey]) {
        selectedCategory = keys[Math.floor(Math.random() * keys.length)];
    }

    const items = NOSTALGIA_WORDS[selectedCategory].items;
    const item = items[Math.floor(Math.random() * items.length)];

    return {
        word: item.word.toUpperCase(),
        hint: item.hint,
        categoryKey: selectedCategory,
        categoryName: NOSTALGIA_WORDS[selectedCategory].name
    };
}

function getNostalgiaClues(word, difficulty = "normal") {
    const lettersOnly = word.replace(/[^A-Z]/g, "");
    let count = 0;

    if (difficulty === "easy") {
        count = lettersOnly.length > 8 ? 3 : lettersOnly.length > 4 ? 2 : 1;
    } else if (difficulty === "normal") {
        count = lettersOnly.length > 9 ? 2 : lettersOnly.length > 5 ? 1 : 0;
    } else {
        count = 0;
    }

    const uniqueLetters = Array.from(new Set(lettersOnly.split("")));
    const revealedLetters = [];

    while (revealedLetters.length < count && uniqueLetters.length > 0) {
        const randIndex = Math.floor(Math.random() * uniqueLetters.length);
        revealedLetters.push(uniqueLetters.splice(randIndex, 1)[0]);
    }

    return revealedLetters;
}

function getClientDailyWord() {
    const today = new Date();
    const dateSeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();

    const allItems = [];
    Object.keys(NOSTALGIA_WORDS).forEach(cat => {
        NOSTALGIA_WORDS[cat].items.forEach(item => {
            allItems.push({
                ...item,
                categoryName: NOSTALGIA_WORDS[cat].name,
                categoryKey: cat
            });
        });
    });

    const index = Math.abs(dateSeed) % allItems.length;
    const item = allItems[index];

    return {
        word: item.word.toUpperCase(),
        hint: item.hint,
        categoryKey: item.categoryKey,
        categoryName: item.categoryName,
        dateString: today.toISOString().split("T")[0]
    };
}

// Global attachment
window.NostalgiaWords = {
    WORD_BANK: NOSTALGIA_WORDS,
    getCategories: getNostalgiaCategories,
    getRandomWord: getRandomNostalgiaWord,
    getStartingClues: getNostalgiaClues,
    getDailyWord: getClientDailyWord
};
