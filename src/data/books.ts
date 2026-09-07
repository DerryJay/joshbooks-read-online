import coverFrankenstein from "@/assets/cover-frankenstein.jpg";
import coverLeaves from "@/assets/cover-leaves.jpg";
import coverAround from "@/assets/cover-around.jpg";
import coverThusSpoke from "@/assets/cover-thus-spoke.jpg";
import coverPride from "@/assets/cover-pride.jpg";
import coverTimeMachine from "@/assets/cover-time-machine.jpg";
import coverDracula from "@/assets/cover-dracula.jpg";
import coverSherlock from "@/assets/cover-sherlock.jpg";
import coverAlice from "@/assets/cover-alice.jpg";

/**
 * Local catalogue for the JoshBooks demo.
 * All titles are public-domain works; reading content is a labelled excerpt.
 * This module is the single data source, so it can later be swapped for an API
 * or database call without touching the UI components.
 */
export type Book = {
  id: string;
  title: string;
  author: string;
  category: string;
  year: string;
  publisher: string;
  pagesLabel: string;
  language: string;
  shortDescription: string;
  description: string;
  cover: string;
  featured?: boolean;
  /** Optional PDF/document file served from /public. The reader falls back to
   * the text pages below (and shows a clear notice) when it is missing. */
  documentUrl?: string;
  /** Each entry is one page in the reader. */
  pages: string[][];
};


export const books: Book[] = [
  {
    id: "frankenstein",
    title: "Frankenstein",
    author: "Mary Shelley",
    category: "Gothic",
    year: "1818",
    publisher: "Lackington, Hughes, Harding, Mavor & Jones, London",
    pagesLabel: "280 pages (excerpt in reader)",
    language: "English",
    shortDescription:
      "A young natural philosopher gives life to a creature — and cannot bear what he has made.",
    description:
      "Mary Shelley's Frankenstein; or, The Modern Prometheus follows Victor Frankenstein from a boyhood of restless curiosity to the night his creature opens its eyes. Told through letters and confessions, it remains the founding work of science fiction and a study of responsibility abandoned.",
    cover: coverFrankenstein,
    pages: [
      [
        "Letter I — To Mrs. Saville, England. St. Petersburgh, Dec. 11th, 17—.",
        "You will rejoice to hear that no disaster has accompanied the commencement of an enterprise which you have regarded with such evil forebodings. I arrived here yesterday; and my first task is to assure my dear sister of my welfare, and increasing confidence in the success of my undertaking.",
        "I am already far north of London; and as I walk in the streets of Petersburgh, I feel a cold northern breeze play upon my cheeks, which braces my nerves, and fills me with delight. Do you understand this feeling?",
      ],
      [
        "This breeze, which has travelled from the regions towards which I am advancing, gives me a foretaste of those icy climes. Inspirited by this wind of promise, my daydreams become more fervent and vivid.",
        "I try in vain to be persuaded that the pole is the seat of frost and desolation; it ever presents itself to my imagination as the region of beauty and delight. There, Margaret, the sun is for ever visible, its broad disk just skirting the horizon and diffusing a perpetual splendour.",
      ],
      [
        "Chapter 1. I am by birth a Genevese; and my family is one of the most distinguished of that republic. My ancestors had been for many years counsellors and syndics; and my father had filled several public situations with honour and reputation.",
        "He was respected by all who knew him, for his integrity and indefatigable attention to public business. He passed his younger days perpetually occupied by the affairs of his country; a variety of circumstances had prevented his marrying early.",
      ],
      [
        "No human being could have passed a happier childhood than myself. My parents were possessed by the very spirit of kindness and indulgence. We felt that they were not the tyrants to rule our lot according to their caprice, but the agents and creators of all the many delights which we enjoyed.",
        "It was my temper to avoid a crowd, and to attach myself fervently to a few. I was indifferent, therefore, to my school-fellows in general; but I united myself in the bonds of the closest friendship to one among them.",
      ],
      [
        "It was on a dreary night of November that I beheld the accomplishment of my toils. With an anxiety that almost amounted to agony, I collected the instruments of life around me, that I might infuse a spark of being into the lifeless thing that lay at my feet.",
        "It was already one in the morning; the rain pattered dismally against the panes, and my candle was nearly burnt out, when, by the glimmer of the half-extinguished light, I saw the dull yellow eye of the creature open.",
        "— End of demo excerpt —",
      ],
    ],
  },
  {
    id: "leaves-of-grass",
    title: "Leaves of Grass",
    author: "Walt Whitman",
    category: "Poetry",
    year: "1855",
    publisher: "Printed for the author, Brooklyn, New York",
    pagesLabel: "95 pages (excerpt in reader)",
    language: "English",
    shortDescription:
      "Whitman's expansive American song, first printed and set by the poet himself.",
    description:
      "Leaves of Grass began as a slim volume of twelve untitled poems and grew across a lifetime of revisions. Its long, breathing lines broke with received metre and made room for the ordinary body, the street, the ferry, and the grass underfoot.",
    cover: coverLeaves,
    pages: [
      [
        "Song of Myself, 1.",
        "I celebrate myself, and sing myself, and what I assume you shall assume, for every atom belonging to me as good belongs to you.",
        "I loafe and invite my soul, I lean and loafe at my ease observing a spear of summer grass.",
      ],
      [
        "My tongue, every atom of my blood, form'd from this soil, this air, born here of parents born here from parents the same, and their parents the same, I, now thirty-seven years old in perfect health begin, hoping to cease not till death.",
        "Creeds and schools in abeyance, retiring back a while sufficed at what they are, but never forgotten, I harbor for good or bad, I permit to speak at every hazard, nature without check with original energy.",
      ],
      [
        "Song of Myself, 6.",
        "A child said What is the grass? fetching it to me with full hands; how could I answer the child? I do not know what it is any more than he.",
        "I guess it must be the flag of my disposition, out of hopeful green stuff woven. Or I guess it is the handkerchief of the Lord, a scented gift and remembrancer designedly dropt.",
      ],
      [
        "I too am not a bit tamed, I too am untranslatable, I sound my barbaric yawp over the roofs of the world.",
        "The last scud of day holds back for me, it flings my likeness after the rest and true as any on the shadow'd wilds, it coaxes me to the vapor and the dusk.",
        "You will hardly know who I am or what I mean, but I shall be good health to you nevertheless.",
        "— End of demo excerpt —",
      ],
    ],
  },
  {
    id: "around-the-world",
    title: "Around the World in Eighty Days",
    author: "Jules Verne",
    category: "Adventure",
    year: "1873",
    publisher: "Pierre-Jules Hetzel, Paris",
    pagesLabel: "255 pages (excerpt in reader)",
    language: "English (translated)",
    shortDescription:
      "A punctual English gentleman wagers his fortune on circling the globe in eighty days.",
    description:
      "Phileas Fogg leaves the Reform Club on a wager and drags his new valet Passepartout across steamers, railways, and elephants. Verne turns timetables into suspense, and the whole journey rests on a single missing day.",
    cover: coverAround,
    pages: [
      [
        "Chapter I — In which Phileas Fogg and Passepartout accept each other, the one as master, the other as man.",
        "Mr. Phileas Fogg lived, in 1872, at No. 7, Saville Row, Burlington Gardens, the house in which Sheridan died in 1814. He was one of the most noticeable members of the Reform Club, though he seemed always to avoid attracting attention.",
        "He was not lavish, nor, on the contrary, avaricious; for, whenever he knew that money was needed for a noble, useful, or benevolent purpose, he supplied it quietly and sometimes anonymously.",
      ],
      [
        "Phileas Fogg was not known to have either wife or children, which may happen to the most honest people; either relatives or near friends, which is certainly more unusual. He lived alone in his house in Saville Row, whither none penetrated.",
        "His only pastimes were to read the papers and play whist. He often won at this game, which, as a silent one, harmonised with his nature; but his winnings never went into his purse, being reserved as a fund for his charities.",
      ],
      [
        "\"I will bet four thousand pounds,\" said Fogg, \"that the tour of the world can be made in eighty days or less; in nineteen hundred and twenty hours, or a hundred and fifteen thousand two hundred minutes. Do you accept?\"",
        "\"We accept,\" replied Messrs. Stuart, Fallentin, Sullivan, Flanagan, and Ralph, after consulting each other.",
        "\"Good,\" said Mr. Fogg. \"The train leaves for Dover at a quarter before nine. I will take it.\"",
      ],
      [
        "Passepartout was thunderstruck. His master, so methodical, so precise, setting out to cross the world with a carpet-bag and no trunk at all.",
        "\"We have no trunk?\" he asked. \"No. Only a carpet-bag, with two shirts and three pairs of stockings for me, and the same for you. We will buy our clothes on the way.\"",
        "— End of demo excerpt —",
      ],
    ],
  },
  {
    id: "thus-spoke-zarathustra",
    title: "Thus Spoke Zarathustra",
    author: "Friedrich Nietzsche",
    category: "Philosophy",
    year: "1883",
    publisher: "Ernst Schmeitzner, Chemnitz",
    pagesLabel: "340 pages (excerpt in reader)",
    language: "English (translated)",
    shortDescription:
      "A hermit comes down from the mountain with a gift nobody asked for.",
    description:
      "Written as a sequence of speeches and parables, Thus Spoke Zarathustra follows a solitary teacher who leaves ten years of mountain silence to address the marketplace. It is Nietzsche at his most literary, and his most argued-over.",
    cover: coverThusSpoke,
    pages: [
      [
        "Zarathustra's Prologue, 1.",
        "When Zarathustra was thirty years old, he left his home and the lake of his home, and went into the mountains. There he enjoyed his spirit and his solitude, and for ten years did not weary of it.",
        "But at last his heart changed, and one morning he rose with the rosy dawn, went before the sun, and spake thus unto it:",
      ],
      [
        "\"Thou great star! What would be thy happiness if thou hadst not those for whom thou shinest? Ten years hast thou climbed hither unto my cave: thou wouldst have wearied of thy light and of the journey, had it not been for me, mine eagle, and my serpent.\"",
        "\"Lo! I am weary of my wisdom, like the bee that hath gathered too much honey; I need hands outstretched to take it.\"",
      ],
      [
        "Zarathustra went down the mountain alone, no one meeting him. When he entered the forest, however, there suddenly stood before him an old man, who had left his holy cot to seek roots.",
        "\"No stranger to me is this wanderer,\" said the old man. \"Many years past by here. Zarathustra he was called; but he hath altered.\"",
      ],
      [
        "When Zarathustra arrived at the nearest town which adjoineth the forest, he found many people assembled in the market-place; for it had been announced that a rope-dancer would show himself.",
        "And Zarathustra spake thus unto the people: \"I teach you the overman. Man is something that shall be overcome. What have ye done to overcome him?\"",
        "— End of demo excerpt —",
      ],
    ],
  },
  {
    id: "pride-and-prejudice",
    title: "Pride and Prejudice",
    author: "Jane Austen",
    category: "Classics",
    year: "1813",
    publisher: "T. Egerton, Whitehall, London",
    pagesLabel: "310 pages (excerpt in reader)",
    language: "English",
    shortDescription:
      "Five sisters, a new neighbour with ten thousand a year, and a great deal of misjudgement.",
    description:
      "Elizabeth Bennet's wit meets Mr Darcy's reserve in Austen's most quoted novel. Beneath the drawing-room comedy is a sharp account of money, marriage, and how quickly a first impression hardens into a conviction.",
    cover: coverPride,
    pages: [
      [
        "Chapter 1.",
        "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
        "However little known the feelings or views of such a man may be on his first entering a neighbourhood, this truth is so well fixed in the minds of the surrounding families, that he is considered the rightful property of some one or other of their daughters.",
      ],
      [
        "\"My dear Mr. Bennet,\" said his lady to him one day, \"have you heard that Netherfield Park is let at last?\"",
        "Mr. Bennet replied that he had not. \"But it is,\" returned she; \"for Mrs. Long has just been here, and she told me all about it.\"",
        "Mr. Bennet made no answer. \"Do not you want to know who has taken it?\" cried his wife impatiently. \"You want to tell me, and I have no objection to hearing it.\"",
      ],
      [
        "Mr. Bennet was so odd a mixture of quick parts, sarcastic humour, reserve, and caprice, that the experience of three-and-twenty years had been insufficient to make his wife understand his character.",
        "Her mind was less difficult to develop. She was a woman of mean understanding, little information, and uncertain temper. The business of her life was to get her daughters married; its solace was visiting and news.",
      ],
      [
        "\"She is tolerable; but not handsome enough to tempt me,\" said Mr. Darcy, and Elizabeth remained with no very cordial feelings toward him.",
        "She told the story, however, with great spirit among her friends; for she had a lively, playful disposition, which delighted in anything ridiculous.",
        "— End of demo excerpt —",
      ],
    ],
  },
  {
    id: "the-time-machine",
    title: "The Time Machine",
    author: "H. G. Wells",
    category: "Science Fiction",
    year: "1895",
    publisher: "William Heinemann, London",
    pagesLabel: "120 pages (excerpt in reader)",
    language: "English",
    shortDescription:
      "An inventor travels to the year 802,701 and finds humanity divided in two.",
    description:
      "Over dinner, the Time Traveller explains that time is a fourth dimension — then vanishes into it. Wells's short first novel invented the vocabulary of time travel and used it to argue about class, comfort, and decline.",
    cover: coverTimeMachine,
    pages: [
      [
        "Chapter I.",
        "The Time Traveller (for so it will be convenient to speak of him) was expounding a recondite matter to us. His grey eyes shone and twinkled, and his usually pale face was flushed and animated.",
        "\"You must follow me carefully. I shall have to controvert one or two ideas that are almost universally accepted. The geometry, for instance, they taught you at school is founded on a misconception.\"",
      ],
      [
        "\"Can an instantaneous cube exist?\" \"Don't follow you,\" said Filby. \"Can a cube that does not last for any time at all, have a real existence?\"",
        "\"There are really four dimensions, three which we call the three planes of Space, and a fourth, Time. There is, however, a tendency to draw an unreal distinction between the former three dimensions and the latter.\"",
      ],
      [
        "\"I've had a most amazing time,\" he said. \"I'm damnably hungry. Tell me — I have been to the future. Save me some mutton. I starve for a bit of meat.\"",
        "So it was that the Time Traveller began his story, and we sat, some in shadow, some in the warm circle of the lamp, and listened without a word.",
      ],
      [
        "The great buildings about me stood out clear and distinct, but the moon had set, and the stars were shining. I felt naked in a strange world.",
        "I saw the years pass, the flags of empires rise and fall, and the sun sweep a fiery arc across a sky that never once stood still.",
        "— End of demo excerpt —",
      ],
    ],
  },
];

export const categories = [
  "All",
  ...Array.from(new Set(books.map((book) => book.category))).sort(),
];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
