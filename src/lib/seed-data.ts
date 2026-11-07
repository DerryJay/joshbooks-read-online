import type { Book, Category } from './catalogue';

export const SEED_CATEGORIES: Category[] = [
  {
    "id": "adventure",
    "name": "Adventure",
    "description": "Adventure titles in the JoshBooks collection"
  },
  {
    "id": "biography",
    "name": "Biography",
    "description": "Biography titles in the JoshBooks collection"
  },
  {
    "id": "business",
    "name": "Business",
    "description": "Business titles in the JoshBooks collection"
  },
  {
    "id": "children-s",
    "name": "Children's",
    "description": "Children's titles in the JoshBooks collection"
  },
  {
    "id": "classics",
    "name": "Classics",
    "description": "Classics titles in the JoshBooks collection"
  },
  {
    "id": "education",
    "name": "Education",
    "description": "Education titles in the JoshBooks collection"
  },
  {
    "id": "fiction",
    "name": "Fiction",
    "description": "Fiction titles in the JoshBooks collection"
  },
  {
    "id": "gothic",
    "name": "Gothic",
    "description": "Gothic titles in the JoshBooks collection"
  },
  {
    "id": "history",
    "name": "History",
    "description": "History titles in the JoshBooks collection"
  },
  {
    "id": "literature",
    "name": "Literature",
    "description": "Literature titles in the JoshBooks collection"
  },
  {
    "id": "mystery",
    "name": "Mystery",
    "description": "Mystery titles in the JoshBooks collection"
  },
  {
    "id": "other",
    "name": "Other",
    "description": "Other titles in the JoshBooks collection"
  },
  {
    "id": "philosophy",
    "name": "Philosophy",
    "description": "Philosophy titles in the JoshBooks collection"
  },
  {
    "id": "poetry",
    "name": "Poetry",
    "description": "Poetry titles in the JoshBooks collection"
  },
  {
    "id": "science",
    "name": "Science",
    "description": "Science titles in the JoshBooks collection"
  },
  {
    "id": "science-fiction",
    "name": "Science Fiction",
    "description": "Science Fiction titles in the JoshBooks collection"
  },
  {
    "id": "technology",
    "name": "Technology",
    "description": "Technology titles in the JoshBooks collection"
  }
];

export const SEED_BOOKS: Book[] = [
  {
    "id": "frankenstein",
    "title": "Frankenstein",
    "author": "Mary Shelley",
    "category": "Gothic",
    "categoryId": "gothic",
    "year": "1818",
    "publisher": "Lackington, Hughes, Harding, Mavor & Jones, London",
    "pagesLabel": "280 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "A young natural philosopher gives life to a creature — and cannot bear what he has made.",
    "description": "Mary Shelley's Frankenstein; or, The Modern Prometheus follows Victor Frankenstein from a boyhood of restless curiosity to the night his creature opens its eyes. Told through letters and confessions, it remains the founding work of science fiction and a study of responsibility abandoned.",
    "cover": "/covers/cover-frankenstein.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 5,
    "pages": [
      [
        "Letter I — To Mrs. Saville, England. St. Petersburgh, Dec. 11th, 17—.",
        "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday; and my first task is to assure my dear sister of my welfare, and increasing confidence in the success of my undertaking.",
        "I am already far north of London; and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves, and fills me with delight. Do you understand this feeling?"
      ],
      [
        "This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid.",
        "I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight. There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour."
      ],
      [
        "Chapter 1. I am by birth a Genevese; and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics; and my father had filled several public situations with honour and reputation.",
        "He was respected by all who knew him, for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; a variety of circumstances had prevented his marrying early."
      ],
      [
        "No human being could have passed a happier childhood than myself. My parents were possessed by the very spirit of kindness and indulgence. We felt that they were not the tyrants to rule our lot according to their caprice, but the agents and creators of all the many delights which we enjoyed.",
        "It was my temper to avoid a crowd, and to attach myself fervently to a few. I was indifferent, therefore, to my school-fellows in general; but I united myself in the bonds of the closest friendship to one among them."
      ],
      [
        "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.",
        "It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open.",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "leaves-of-grass",
    "title": "Leaves of Grass",
    "author": "Walt Whitman",
    "category": "Poetry",
    "categoryId": "poetry",
    "year": "1855",
    "publisher": "Printed for the author, Brooklyn, New York",
    "pagesLabel": "95 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "Whitman's expansive American song, first printed and set by the poet himself.",
    "description": "Leaves of Grass began as a slim volume of twelve untitled poems and grew across a lifetime of revisions. Its long, breathing lines broke with received metre and made room for the ordinary body, the street, the ferry, and the grass underfoot.",
    "cover": "/covers/cover-leaves.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 4,
    "pages": [
      [
        "Song of Myself, 1.",
        "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you.",
        "I loafe and invite my soul, I lean and loafe at my ease observing a spear of summer grass."
      ],
      [
        "My tongue, every atom of my blood, form'd from this soil, this air, born here of parents born here from parents the same, and their parents the same, I, now thirty-seven years old in perfect health begin, hoping to cease not till death.",
        "Creeds and schools in abeyance, retiring back a while sufficed at what they are, but never forgotten, I harbor for good or bad, I permit to speak at every hazard, nature without check with original energy."
      ],
      [
        "Song of Myself, 6.",
        "A child said What is the grass? fetching it to me with full hands; how could I answer the child? I do not know what it is any more than he.",
        "I guess it must be the flag of my disposition, out of hopeful green stuff woven. Or I guess it is the handkerchief of the Lord, a scented gift and remembrancer designedly dropt."
      ],
      [
        "I too am not a bit tamed, I too am untranslatable, I sound my barbaric yawp over the roofs of the world.",
        "The last scud of day holds back for me, it flings my likeness after the rest and true as any on the shadow'd wilds, it coaxes me to the vapor and the dusk.",
        "You will hardly know who I am or what I mean, but I shall be good health to you nevertheless.",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "around-the-world",
    "title": "Around the World in Eighty Days",
    "author": "Jules Verne",
    "category": "Adventure",
    "categoryId": "adventure",
    "year": "1873",
    "publisher": "Pierre-Jules Hetzel, Paris",
    "pagesLabel": "255 pages (excerpt in reader)",
    "language": "English (translated)",
    "shortDescription": "A punctual English gentleman wagers his fortune on circling the globe in eighty days.",
    "description": "Phileas Fogg leaves the Reform Club on a wager and drags his new valet Passepartout across steamers, railways, and elephants. Verne turns timetables into suspense, and the whole journey rests on a single missing day.",
    "cover": "/covers/cover-around.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 4,
    "pages": [
      [
        "Chapter I — In which Phileas Fogg and Passepartout accept each other, the one as master, the other as man.",
        "Mr. Phileas Fogg lived, in 1872, at No. 7, Saville Row, Burlington Gardens, the house in which Sheridan died in 1814. He was one of the most noticeable members of the Reform Club, though he seemed always to avoid attracting attention.",
        "He was not lavish, nor, on the contrary, avaricious; for, whenever he knew that money was needed for a noble, useful, or benevolent purpose, he supplied it quietly and sometimes anonymously."
      ],
      [
        "Phileas Fogg was not known to have either wife or children, which may happen to the most honest people; either relatives or near friends, which is certainly more unusual. He lived alone in his house in Saville Row, whither none penetrated.",
        "His only pastimes were to read the papers and play whist. He often won at this game, which, as a silent one, harmonised with his nature; but his winnings never went into his purse, being reserved as a fund for his charities."
      ],
      [
        "\"I will bet four thousand pounds,\" said Fogg, \"that the tour of the world can be made in eighty days or less; in nineteen hundred and twenty hours, or a hundred and fifteen thousand two hundred minutes. Do you accept?\"",
        "\"We accept,\" replied Messrs. Stuart, Fallentin, Sullivan, Flanagan, and Ralph, after consulting each other.",
        "\"Good,\" said Mr. Fogg. \"The train leaves for Dover at a quarter before nine. I will take it.\""
      ],
      [
        "Passepartout was thunderstruck. His master, so methodical, so precise, setting out to cross the world with a carpet-bag and no trunk at all.",
        "\"We have no trunk?\" he asked. \"No. Only a carpet-bag, with two shirts and three pairs of stockings for me, and the same for you. We will buy our clothes on the way.\"",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "thus-spoke-zarathustra",
    "title": "Thus Spoke Zarathustra",
    "author": "Friedrich Nietzsche",
    "category": "Philosophy",
    "categoryId": "philosophy",
    "year": "1883",
    "publisher": "Ernst Schmeitzner, Chemnitz",
    "pagesLabel": "340 pages (excerpt in reader)",
    "language": "English (translated)",
    "shortDescription": "A hermit comes down from the mountain with a gift nobody asked for.",
    "description": "Written as a sequence of speeches and parables, Thus Spoke Zarathustra follows a solitary teacher who leaves ten years of mountain silence to address the marketplace. It is Nietzsche at his most literary, and his most argued-over.",
    "cover": "/covers/cover-thus-spoke.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 4,
    "pages": [
      [
        "Zarathustra's Prologue, 1.",
        "When Zarathustra was thirty years old, he left his home and the lake of his home, and went into the mountains. There he enjoyed his spirit and his solitude, and for ten years did not weary of it.",
        "But at last his heart changed, and one morning he rose with the rosy dawn, went before the sun, and spake thus unto it:"
      ],
      [
        "\"Thou great star! What would be thy happiness if thou hadst not those for whom thou shinest? Ten years hast thou climbed hither unto my cave: thou wouldst have wearied of thy light and of the journey, had it not been for me, mine eagle, and my serpent.\"",
        "\"Lo! I am weary of my wisdom, like the bee that hath gathered too much honey; I need hands outstretched to take it.\""
      ],
      [
        "Zarathustra went down the mountain alone, no one meeting him. When he entered the forest, however, there suddenly stood before him an old man, who had left his holy cot to seek roots.",
        "\"No stranger to me is this wanderer,\" said the old man. \"Many years past by here. Zarathustra he was called; but he hath altered.\""
      ],
      [
        "When Zarathustra arrived at the nearest town which adjoineth the forest, he found many people assembled in the market-place; for it had been announced that a rope-dancer would show himself.",
        "And Zarathustra spake thus unto the people: \"I teach you the overman. Man is something that shall be overcome. What have ye done to overcome him?\"",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "pride-and-prejudice",
    "title": "Pride and Prejudice",
    "author": "Jane Austen",
    "category": "Classics",
    "categoryId": "classics",
    "year": "1813",
    "publisher": "T. Egerton, Whitehall, London",
    "pagesLabel": "310 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "Five sisters, a new neighbour with ten thousand a year, and a great deal of misjudgement.",
    "description": "Elizabeth Bennet's wit meets Mr Darcy's reserve in Austen's most quoted novel. Beneath the drawing-room comedy is a sharp account of money, marriage, and how quickly a first impression hardens into a conviction.",
    "cover": "/covers/cover-pride.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 4,
    "pages": [
      [
        "Chapter 1.",
        "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
        "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters."
      ],
      [
        "\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\"",
        "Mr. Bennet replied that he had not. \"But it is,\" returned she; \"for Mrs. Long has just been here, and she told me all about it.\"",
        "Mr. Bennet made no answer. \"Do not you want to know who has taken it?\" cried his wife impatiently. \"You want to tell me, and I have no objection to hearing it.\""
      ],
      [
        "Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife understand his character.",
        "Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper. The business of her life was to get her daughters married; its solace was visiting and news."
      ],
      [
        "\"She is tolerable; but not handsome enough to tempt me,\" said Mr. Darcy, and Elizabeth remained with no very cordial feelings toward him.",
        "She told the story, however, with great spirit among her friends; for she had a lively, playful disposition, which delighted in anything ridiculous.",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "the-time-machine",
    "title": "The Time Machine",
    "author": "H. G. Wells",
    "category": "Science Fiction",
    "categoryId": "science-fiction",
    "year": "1895",
    "publisher": "William Heinemann, London",
    "pagesLabel": "120 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "An inventor travels to the year 802,701 and finds humanity divided in two.",
    "description": "Over dinner, the Time Traveller explains that time is a fourth dimension — then vanishes into it. Wells's short first novel invented the vocabulary of time travel and used it to argue about class, comfort, and decline.",
    "cover": "/covers/cover-time-machine.jpg",
    "featured": false,
    "createdAt": 1793441647998,
    "pageCount": 4,
    "pages": [
      [
        "Chapter I.",
        "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.",
        "\"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception.\""
      ],
      [
        "\"Can an instantaneous cube exist?\" \"Don't follow you,\" said Filby. \"Can a cube that does not last for any time at all, have a real existence?\"",
        "\"There are really four dimensions, three which we call the three planes of Space, and a fourth, Time. There is, however, a tendency to draw an unreal distinction between the former three dimensions and the latter.\""
      ],
      [
        "\"I've had a most amazing time,\" he said. \"I'm damnably hungry. Tell me — I have been to the future. Save me some mutton. I starve for a bit of meat.\"",
        "So it was that the Time Traveller began his story, and we sat, some in shadow, some in the warm circle of the lamp, and listened without a word."
      ],
      [
        "The great buildings about me stood out clear and distinct, but the moon had set, and the stars were shining. I felt naked in a strange world.",
        "I saw the years pass, the flags of empires rise and fall, and the sun sweep a fiery arc across a sky that never once stood still.",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "dracula",
    "title": "Dracula",
    "author": "Bram Stoker",
    "category": "Gothic",
    "categoryId": "gothic",
    "year": "1897",
    "publisher": "Archibald Constable and Company, London",
    "pagesLabel": "418 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "A solicitor's clerk travels east on business and finds his host is not quite a man.",
    "description": "Assembled from journals, letters, and newspaper cuttings, Dracula sends Jonathan Harker to a castle in the Carpathians and brings its owner back to London. Stoker's patchwork of documents made the vampire modern — and gave the novel its unsettling air of evidence.",
    "cover": "/covers/cover-dracula.jpg",
    "featured": true,
    "createdAt": 1793441647998,
    "pageCount": 5,
    "pages": [
      [
        "Chapter I — Jonathan Harker's Journal (kept in shorthand).",
        "3 May. Bistritz. Left Munich at 8:35 P.M. on 1st May, arriving at Vienna early next morning; should have arrived at 6:46, but train was an hour late.",
        "Buda-Pesth seems a wonderful place, from the glimpse which I got of it from the train and the little I could walk through the streets. I feared to go very far from the station, as we had arrived late and would start as near the correct time as possible."
      ],
      [
        "The impression I had was that we were leaving the West and entering the East; the most western of splendid bridges over the Danube, which is here of noble width and depth, took us among the traditions of Turkish rule.",
        "I read that every known superstition in the world is gathered into the horseshoe of the Carpathians, as if it were the centre of some sort of imaginative whirlpool; if so my stay may be very interesting."
      ],
      [
        "When I got on the coach the driver had not taken his seat, and I saw him talking with the landlady. They were evidently talking of me, for every now and then they looked at me.",
        "Some of them whispered words which I looked up afterwards in my polyglot dictionary — and they meant, so far as I could tell, 'werewolf' and 'vampire'."
      ],
      [
        "Within, stood a tall old man, clean shaven save for a long white moustache, and clad in black from head to foot, without a single speck of colour about him anywhere.",
        "He held in his hand an antique silver lamp, in which the flame burned without chimney or globe of any kind, throwing long quivering shadows as it flickered in the draught of the open door.",
        "\"Welcome to my house! Enter freely and of your own will!\""
      ],
      [
        "I found that the doors were all locked behind me, and that the castle was a veritable prison, and I a prisoner!",
        "When I had written in my diary I put the book and pen in my pocket, and lay down to wait for a sleep that would not come.",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "sherlock-holmes",
    "title": "The Adventures of Sherlock Holmes",
    "author": "Arthur Conan Doyle",
    "category": "Mystery",
    "categoryId": "mystery",
    "year": "1892",
    "publisher": "George Newnes Ltd., London",
    "pagesLabel": "307 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "Twelve cases from Baker Street, narrated by the doctor who kept the notes.",
    "description": "The first collected stories of Sherlock Holmes and Dr Watson, from a scandal in Bohemia to a vanished bridegroom. Each case is short, self-contained, and built on the same trick: the ordinary detail nobody thought to look at twice.",
    "cover": "/covers/cover-sherlock.jpg",
    "featured": true,
    "createdAt": 1793441647998,
    "pageCount": 5,
    "pages": [
      [
        "A Scandal in Bohemia, I.",
        "To Sherlock Holmes she is always the woman. I have seldom heard him mention her under any other name. In his eyes she eclipses and predominates the whole of her sex.",
        "It was not that he felt any emotion akin to love for Irene Adler. All emotions, and that one particularly, were abhorrent to his cold, precise but admirably balanced mind."
      ],
      [
        "\"You have been in Afghanistan, I perceive.\" I was startled. \"How on earth did you know that?\" I asked.",
        "\"You see, but you do not observe. The distinction is clear. For example, you have frequently seen the steps which lead up from the hall to this room. How often? Then how many are there?\"",
        "\"I have no idea.\" \"Quite so! You have not observed. And yet you have seen. That is just my point. Now, I know that there are seventeen steps.\""
      ],
      [
        "\"It is a capital mistake to theorise before you have all the evidence. It biases the judgment.\"",
        "\"I never guess. It is a shocking habit — destructive to the logical faculty. What seems strange to you is only so because you do not follow my train of thought or observe the small facts upon which large inferences may depend.\""
      ],
      [
        "The Red-Headed League. I had called upon my friend, Mr. Sherlock Holmes, one day in the autumn of last year and found him in deep conversation with a very stout, florid-faced elderly gentleman with fiery red hair.",
        "\"You could not possibly have come at a better time, my dear Watson,\" he said cordially. \"I was afraid that you were engaged.\""
      ],
      [
        "\"When you have eliminated all which is impossible, then whatever remains, however improbable, must be the truth.\"",
        "\"Come, Watson, come! The game is afoot. Not a word! Into your clothes and come!\"",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "alice-in-wonderland",
    "title": "Alice's Adventures in Wonderland",
    "author": "Lewis Carroll",
    "category": "Children's",
    "categoryId": "children-s",
    "year": "1865",
    "publisher": "Macmillan and Co., London",
    "pagesLabel": "192 pages (excerpt in reader)",
    "language": "English",
    "shortDescription": "A bored girl follows a hurried rabbit underground and finds the rules have changed.",
    "description": "Carroll's nonsense classic sends Alice down a rabbit hole into a country of croquet-playing queens, riddling hatters, and animals with strong opinions. Beneath the jokes is a small, sharp comedy about logic and the adults who abuse it.",
    "cover": "/covers/cover-alice.jpg",
    "featured": true,
    "createdAt": 1793441647998,
    "pageCount": 5,
    "pages": [
      [
        "Chapter I — Down the Rabbit-Hole.",
        "Alice was beginning to get very tired of sitting by her sister on the bank, and of having nothing to do: once or twice she had peeped into the book her sister was reading, but it had no pictures or conversations in it.",
        "\"And what is the use of a book,\" thought Alice, \"without pictures or conversations?\""
      ],
      [
        "Suddenly a White Rabbit with pink eyes ran close by her. There was nothing so very remarkable in that; nor did Alice think it so very much out of the way to hear the Rabbit say to itself \"Oh dear! Oh dear! I shall be late!\"",
        "But when the Rabbit actually took a watch out of its waistcoat-pocket, and looked at it, and then hurried on, Alice started to her feet."
      ],
      [
        "Either the well was very deep, or she fell very slowly, for she had plenty of time as she went down to look about her and to wonder what was going to happen next.",
        "\"Curiouser and curiouser!\" cried Alice. \"Now I'm opening out like the largest telescope that ever was! Good-bye, feet!\""
      ],
      [
        "\"Would you tell me, please, which way I ought to go from here?\" \"That depends a good deal on where you want to get to,\" said the Cat.",
        "\"I don't much care where—\" said Alice. \"Then it doesn't matter which way you go,\" said the Cat."
      ],
      [
        "\"Off with her head!\" the Queen shouted at the top of her voice. Nobody moved.",
        "\"Who cares for you?\" said Alice, who had grown to her full size by this time. \"You're nothing but a pack of cards!\"",
        "— End of Section —"
      ]
    ]
  },
  {
    "id": "crime-and-punishment-fotm4",
    "title": "Crime and Punishment",
    "author": "Fyodor Dostoevsky",
    "category": "Mystery",
    "categoryId": "mystery",
    "year": "1866",
    "publisher": "The Russian Messenger",
    "pagesLabel": "1020 pages",
    "language": "English",
    "shortDescription": "A broke student in St. Petersburg talks himself into committing murder, thinking he is too smart to feel guilty. Crime and Punishment follows the slow unraveling of a mind that cannot escape what it has done.",
    "description": "A broke student in St. Petersburg talks himself into committing murder, thinking he is too smart to feel guilty. Crime and Punishment follows the slow unraveling of a mind that cannot escape what it has done.",
    "cover": "/covers/cover-frankenstein.jpg",
    "featured": true,
    "createdAt": 1793441647998,
    "pageCount": 1020,
    "pages": [
      [
        "Crime and Punishment by Fyodor Dostoevsky",
        "Translated by Constance Garnett",
        "Part I — Chapter I",
        "On an exceptionally hot evening early in July a young man came out of the garret in which he lodged in S. Place and walked slowly, as though in hesitation, towards K. bridge."
      ],
      [
        "He had successfully avoided meeting his landlady on the stairs. His garret was under the roof of a high, five-storied house and was more like a cupboard than a room. The landlady who provided him with room, dinners, and attendance, lived on the floor below, and every time he went out he was obliged to pass her kitchen, the door of which invariably stood open.",
        "And each time he passed, the young man had a sick, frightened feeling, which made him scowl and feel ashamed. He was hopelessly in debt to his landlady, and was afraid of meeting her."
      ],
      [
        "This was not because he was cowardly and abject, quite the contrary; but for some time past he had been in an overstrained irritable condition, verging on hypochondria. He had become so completely absorbed in himself, and isolated from his fellows, that he dreaded meeting not only his landlady, but anyone at all.",
        "He was crushed by poverty, but the anxieties of his position had of late ceased to weigh upon him. He had given up attending to matters of practical importance; he had lost all desire to do so. Nothing that any landlady could do had a real terror for him."
      ],
      [
        "To be stopped on the stairs, to be forced to listen to her trivial, irrelevant gossip, to pestering demands for payment, threats and complaints, and to rack his brains for excuses, to prevaricate, to lie—no, rather than that, he would creep down the stairs like a cat and slip out unseen.",
        "This evening, however, on coming out into the street, he became acutely aware of his fears. 'I want to attempt a thing like that and am frightened by these trifles,' he thought, with an odd smile."
      ],
      [
        "The heat in the street was terrible: and the airlessness, the bustle and the plaster, scaffolding, bricks, and dust, and that peculiar St. Petersburg stench, so familiar to all who are unable to get out of town in summer—all worked painfully upon the young man's already excited nerves.",
        "The insufferable stench from the pot-houses, which are particularly numerous in that part of the town, and the drunken men whom he met continually, completed the revolting misery of the picture."
      ],
      [
        "An expression of the profoundest disgust gleamed for a moment in the young man's refined face. He was, by the way, exceptionally handsome, above the average in height, slim, well-built, with fine dark eyes and dark brown hair.",
        "Soon he sank into deep thought, or more accurately speaking, into a complete blankness of mind; he walked along not observing what was about him, and not caring to observe it. From time to time he would mutter something, from the habit of talking to himself, to which he had just confessed."
      ],
      [
        "At these moments he would become conscious that his ideas were sometimes in a tangle and that he was very weak; for two days he had scarcely tasted food. He was so badly dressed that even a man accustomed to shabbiness would have been ashamed to be seen in the street in such rags.",
        "In that quarter of the town, however, scarcely any shortcoming in dress would have created surprise. Owing to the proximity of the Hay Market, the number of establishments of bad character, the preponderance of the trading and working class population crowded in these streets and alleys in the heart of Petersburg, types so varied were to be seen in the streets that no figure, however queer, would have caused surprise."
      ],
      [
        "The young man's hat was a tall round one, but worn out with age, full of holes and stains, brimless and bent on one side in a most unseemly fashion. But not shame, but quite another feeling akin to terror had overtaken him.",
        "'I knew it,' he muttered in confusion, 'I thought so! That's the worst of all! Why, a stupid thing like this, the most trivial detail might spoil the whole plan. Yes, of course, the hat is too noticeable... It looks absurd, that's why it's noticeable. With my rags I ought to wear a cap, any sort of old pancake, but not this grotesque thing. Nobody wears such a hat, it would be noticed a mile off, it would be remembered... What matters is that people would remember it afterwards, and that would be evidence against me. In this business one ought to be as little noticeable as possible... Trifles, trifles are what matter! Why, it's just such trifles that always ruin everything...'"
      ],
      [
        "He had not far to go; he knew indeed how many steps it was from the gate of his lodging house: exactly seven hundred and thirty. He had counted them once when he had been lost in his daydreams. At the time he had put no faith in those daydreams and was only tantalising himself with their hideous but daring recklessness.",
        "Now, a month later, he had begun to look at them differently, and, in spite of the monologues in which he jeered at his own impotence and indecision, he had involuntarily come to regard this 'hideous' daydream as an enterprise to be carried out, though he still did not venture to believe in it."
      ],
      [
        "He was even now going to make a rehearsal of his enterprise, and at every step his excitement grew more and more violent. With a sinking heart and a nervous tremor, he went up to a huge house which on one side looked on to the canal, and on the other into the street.",
        "This house was let out in tiny tenements and was inhabited by all sorts of working-people—tailors, locksmiths, cooks, Germans of sort, girls picking up a living as best they could, petty clerks, etc. There was a continual coming and going through the two gates and in the two courtyards of the house. Three or four cab-drivers were standing at each entrance."
      ],
      [
        "The young man was very glad not to meet anyone, and he slipped through the gateway and immediately turned to the right up the staircase. It was a dark and narrow staircase, a 'back' stairs, but he was familiar with it, and the circumstances pleased him; in such darkness even an inquisitive spectator was not to be dreaded.",
        "'If I am so scared now, what would it be if it came to the real thing?' he could not help asking himself as he reached the fourth storey. There his progress was barred by some porters who were moving furniture out of a flat. He knew that the flat had been occupied by a German clerk in the civil service, and his family. This clerk was leaving it, and it was the fourth storey flat in this staircase which would remain vacant."
      ],
      [
        "'So there will be nobody on this landing for a time... that's good to know,' he thought again, and he rang the bell of the old woman's flat. The bell gave a faint tinkle as though it were made of tin, and not of brass.",
        "The little flats in such houses always have bells that ring like that. He had forgotten the sound of that bell, and now its peculiar tinkle seemed to remind him of something and to bring it clearly before him... He started, his nerves were terribly overstrung by this time. After a short pause, the door was opened a tiny crack; the occupant of the flat was looking through the crack with evident suspicion, and only her little eyes gleamed in the darkness."
      ],
      [
        "When she saw at least that there were several people on the landing, she took courage, and opened the door wide. The young man stepped into the dark entry, which was partitioned off from the tiny kitchen. The old woman stood facing him in silence and looking inquiringly at him.",
        "She was a diminutive, withered up old woman of sixty, with sharp malignant eyes and a sharp little nose. Her colourless, somewhat grizzled hair was thickly smeared with oil, and an old flannel rag was tied round her neck. On her shoulders, in spite of the heat, there fluttered a tattered little fur cape, yellow with age. She coughed incessantly."
      ],
      [
        "The young man must have looked at her with a rather peculiar expression, for a gleam of mistrust came into her eyes again. 'Raskolnikov, a student, I came here a month ago,' the young man made haste to mutter, with a half bow, remembering that he ought to be more polite.",
        "'I remember, my good sir, I remember quite well your coming here,' the old woman said distinctly, still keeping her inquiring eyes on his face. 'And here... I am again on the same errand,' Raskolnikov continued, a little disconcerted and surprised at the old woman's mistrust."
      ],
      [
        "'Perhaps she is always like that though, only I did not notice it last time,' he thought with an uneasy feeling. The old woman paused, as if wavering. Then she stepped to one side, and pointing to the door of the room, she said, letting him pass in: 'Step in, sir.'",
        "The tiny room into which the young man walked, with yellow paper on the walls, geraniums and muslin curtains in the windows, was at that moment brightly illuminated by the setting sun. 'So the sun will shine like this then too!' was the thought that flashed through Raskolnikov's mind, and with a rapid glance he scanned everything in the room, trying to remember its position."
      ]
    ]
  }
];
