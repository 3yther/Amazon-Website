// Everything Smiley can answer by itself, without the AI.
//
// Two kinds of topic:
//
// FACTS answer with the site's own checked copy, read straight from
//   aboutContent.js, amazonContent.js and helpContent.js (or their
//   translations). Smiley can never disagree with the pages, because it is
//   reading the same words. Nothing here is written from memory.
//
// CHAT is small talk and the odd easter egg: greetings, thanks, jokes, "are
//   you a robot", "do a flip". Scripted, in the translation files under
//   smiley.chat, so it works in every language.
//
// Each topic:
//   id        also the chip label key: smiley.topics.<id>
//   patterns  ways of asking it (see scoreTopic in match.js)
//   also      words that make a match more certain
//   maxWords  only match short messages ("hi", not "hi, what is a T Level")
//   related   topics offered as chips underneath the answer
//   reply(ctx) -> { text, chips, mood, motion, link }
//
// ctx = { t, about, amazon, help, now } where about/amazon/help are the
// content modules in the visitor's language.

// --- words people use -------------------------------------------------------

const TLEVEL = ["tlevel"];
const WHAT = ["what", "which", "explain", "tell me", "describe", "info", "information", "mean", "definition"];
const PLACEMENT = ["placement", "industry placement", "work placement", "on placement"];
const HOW_LONG = ["how long", "long", "length", "duration", "how many hours", "hours", "days", "weeks", "how much time"];
const AMAZON = ["amazon", "amazons"];
const PAID = ["paid", "wage", "wages", "salary", "earn", "get paid", "pay me", "payment", "money for it"];
const COST = ["cost", "costs", "fee", "fees", "free", "price", "pay for", "have to pay", "expensive", "afford"];
const UNIVERSITY = ["university", "ucas", "degree", "tariff", "points"];
const ASSESS = ["assessed", "assessment", "exam", "exams", "graded", "grading", "marked", "coursework", "occupational specialism", "core"];
const GET_IN = ["get", "apply", "join", "application", "how do i", "how can i", "sign up for", "chance"];

// --- helpers ------------------------------------------------------------------

/** "Title: text" for each card, one per line (the chat keeps line breaks). */
function cards(items) {
  return items.map((item) => `${item.title}: ${item.text}`).join("\n");
}

function faq(about, id) {
  return about.FAQS.find((entry) => entry.id === id)?.answer ?? "";
}

function topicChip(t, id) {
  return { label: t(`smiley.topics.${id}`), action: { type: "topic", id } };
}

function linkChip(t, labelKey, to) {
  return { label: t(labelKey), action: { type: "link", to } };
}

function pathway(about, slug) {
  return about.PATHWAYS.find((entry) => entry.slug === slug);
}

const PATHWAY_WORDS = {
  digital: ["digital", "computing", "computer", "coding", "code", "programming", "software", "tech", "technology", "data", "cyber", "cyber security"],
  business: ["business", "admin", "administration", "management", "office", "operations"],
  media: ["media", "film", "filming", "broadcast", "broadcasting", "creative", "video", "editing", "tv", "radio"],
  finance: ["finance", "financial", "accounting", "accountancy", "accountant", "banking"],
  engineering: ["engineering", "engineer", "manufacturing", "mechanical", "electrical", "maintenance", "machines"],
};

function pathwayTopic(slug) {
  return {
    id: `pathway-${slug}`,
    kind: "fact",
    patterns: [
      [PATHWAY_WORDS[slug], ["pathway", "tlevel", "placement", "course", "route", "what", "tell me", "about"]],
      [PATHWAY_WORDS[slug]],
    ],
    related: ["amazonPathways", "pathwaysList", "amazonPlacement"],
    reply: ({ t, about }) => {
      const entry = pathway(about, slug);
      const amazon = entry.amazonStatus ?? t("smiley.answers.amazonNotConfirmed");
      return {
        text: t("smiley.answers.pathway", {
          name: entry.name,
          summary: entry.summary,
          tLevels: entry.tLevels.join(", "),
          placement: entry.placement,
          suits: entry.suits,
          amazon,
        }),
        chips: [linkChip(t, "smiley.links.pathways", "/pathways")],
      };
    },
  };
}

// --- facts ----------------------------------------------------------------------

const FACTS = [
  {
    id: "whatIsTLevel",
    patterns: [[TLEVEL, WHAT], [TLEVEL]],
    related: ["placementLength", "tlevelVsApprenticeship", "whoSuits"],
    reply: ({ t, about }) => ({
      text: `${t("smiley.answers.whatIsTLevel")}\n${about.ROUTE_STEPS.map((step) => `${step.title}: ${step.text}`).join("\n")}`,
      chips: [linkChip(t, "smiley.links.about", "/about")],
    }),
  },
  {
    id: "courseLength",
    patterns: [[TLEVEL, ["how long", "how many years", "years", "long is"]]],
    related: ["classroomHours", "placementLength"],
    reply: ({ about }) => ({ text: about.ROUTE_STEPS[0].text }),
  },
  {
    id: "classroomHours",
    patterns: [[["lessons", "classroom", "teaching", "study", "studying", "learning", "college"], ["hours", "how much", "how long", "percent"]]],
    related: ["placementLength", "tlevelAssessment"],
    reply: ({ about }) => ({
      text: `${about.ROUTE_STEPS[1].text}\n${about.TIME_SPLIT.map((part) => `${part.label}: ${part.detail}.`).join("\n")}`,
    }),
  },
  {
    id: "placementLength",
    patterns: [[PLACEMENT, HOW_LONG], [["315", "45 days", "nine weeks", "9 weeks"]]],
    also: ["tlevel"],
    related: ["placementPay", "placementHow", "amazonPlacement"],
    reply: ({ about }) => ({ text: faq(about, "placement") }),
  },
  {
    id: "placementHow",
    patterns: [
      [PLACEMENT, ["how does", "work", "what is", "what happens", "what do i do", "like", "involve"]],
      [PLACEMENT, ["timetable", "schedule", "days a week", "block", "arranged", "part time"]],
    ],
    related: ["placementLength", "placementPay", "placementEmployers"],
    reply: ({ about }) => ({ text: cards(about.PLACEMENT_FACTS) }),
  },
  {
    id: "placementEmployers",
    patterns: [[["employer", "employers", "company", "companies", "more than one", "two"], PLACEMENT]],
    related: ["placementHow", "amazonPlacement"],
    reply: ({ about }) => ({ text: `${about.PLACEMENT_FACTS[2].title}: ${about.PLACEMENT_FACTS[2].text}` }),
  },
  {
    id: "placementPay",
    patterns: [[PAID, PLACEMENT], [["pay"], PLACEMENT], [PAID]],
    related: ["tlevelCost", "bursary"],
    reply: ({ about }) => ({ text: faq(about, "paid") }),
  },
  {
    id: "tlevelCost",
    patterns: [[COST, TLEVEL], [COST, ["course", "college", "it"]], [COST]],
    related: ["bursary", "placementPay"],
    reply: ({ about }) => ({ text: `${about.COST_POINTS[0].title}. ${about.COST_POINTS[0].text}` }),
  },
  {
    id: "bursary",
    patterns: [
      [["bursary", "bursaries", "grant", "financial help", "help with money", "money help"]],
      [["travel", "bus", "train", "transport", "equipment", "books", "kit", "uniform", "clothing", "laptop"], ["help", "cover", "pay", "money", "cost"]],
    ],
    related: ["tlevelCost", "placementPay"],
    reply: ({ about }) => ({ text: cards(about.COST_POINTS.slice(1)) }),
  },
  {
    id: "entryRequirements",
    patterns: [
      [["entry requirement", "entry requirements", "requirements", "entry"]],
      [["gcse", "grades", "qualifications", "results"], ["need", "require", "required", "get in", "get onto", "enough", "what"]],
      [["can i do", "can i get", "am i eligible", "eligible", "qualify"], TLEVEL],
    ],
    related: ["notReady", "whoSuits", "nearYou"],
    reply: ({ about }) => ({ text: faq(about, "entry") }),
  },
  {
    id: "tlevelVsApprenticeship",
    patterns: [[["apprenticeship"], ["difference", "different", "same", "vs", "versus", "compare", "or", "like", "better"]], [["apprenticeship"]]],
    related: ["whatIsTLevel", "placementPay"],
    reply: ({ about }) => ({ text: faq(about, "apprenticeship") }),
  },
  {
    id: "tlevelVsALevels",
    patterns: [[["alevel"], ["tlevel", "compare", "same", "difference", "vs", "versus", "or", "size", "equal", "equivalent"]], [["alevel"]]],
    related: ["university", "whoSuits"],
    reply: ({ about }) => ({ text: `${about.BENEFITS[1].title}. ${about.BENEFITS[1].text}` }),
  },
  {
    id: "subjects",
    patterns: [
      [["subject", "subjects", "courses", "routes", "options"], ["choose", "pick", "available", "there", "list", "offer", "what", "which", "how many"]],
      [["which tlevel", "what tlevel", "what tlevels", "which tlevels"]],
    ],
    related: ["pathwaysList", "nearYou"],
    reply: ({ about }) => ({ text: faq(about, "choice") }),
  },
  {
    id: "tlevelAssessment",
    patterns: [[ASSESS, TLEVEL], [ASSESS]],
    related: ["university", "tlevelFail"],
    reply: ({ about }) => ({ text: faq(about, "assessed") }),
  },
  {
    id: "university",
    patterns: [[UNIVERSITY, ["go", "get into", "still", "can i", "count", "worth", "how many", "apply"]], [UNIVERSITY]],
    related: ["tlevelVsALevels", "tlevelAssessment"],
    reply: ({ about }) => ({ text: faq(about, "university") }),
  },
  {
    id: "tlevelFail",
    patterns: [[["fail", "failed", "failing", "dont pass", "do not pass", "not pass", "resit", "retake"]]],
    related: ["tlevelAssessment", "notReady"],
    reply: ({ about }) => ({ text: faq(about, "fail") }),
  },
  {
    id: "notReady",
    patterns: [[["not ready", "foundation", "foundation year", "level 2", "not good enough", "struggle with maths", "struggle with english"]]],
    related: ["entryRequirements", "whoSuits"],
    reply: ({ about }) => ({ text: faq(about, "not-ready") }),
  },
  {
    id: "alongside",
    patterns: [[["alongside", "other qualification", "other qualifications", "another qualification", "extra qualification", "as well as", "same time", "combine"]]],
    related: ["tlevelVsALevels"],
    reply: ({ about }) => ({ text: faq(about, "alongside") }),
  },
  {
    id: "whoSuits",
    patterns: [
      [["suit", "suits", "right for me", "for me", "should i", "good fit", "who is it for", "who are they for", "who can", "is it worth"]],
    ],
    related: ["tlevelBenefits", "whatIsTLevel"],
    reply: ({ t, about }) => ({
      text: `${t("smiley.answers.whoSuits")}\n${about.AUDIENCE_POINTS.map((point) => point.text).join("\n")}\n${t("smiley.answers.decideWithAdult")}`,
      chips: [linkChip(t, "smiley.links.quiz", "/quiz")],
    }),
  },
  {
    id: "tlevelBenefits",
    patterns: [[["why", "benefit", "benefits", "advantages", "good about", "point of", "pros", "worth"], TLEVEL], [["benefits", "advantages", "pros"]]],
    related: ["whoSuits", "university"],
    reply: ({ about }) => ({ text: cards(about.BENEFITS) }),
  },
  // --- Amazon ---------------------------------------------------------------------
  {
    id: "amazonPlacement",
    patterns: [
      [AMAZON, PLACEMENT],
      [AMAZON, ["like", "what", "involve", "do", "happens", "work", "day", "week"]],
      [AMAZON],
    ],
    // Beats the general "how does a placement work" when Amazon is named.
    also: ["like", "what", "involve"],
    related: ["amazonSupport", "amazonHowToGet", "amazonPathways"],
    reply: ({ t, amazon }) => ({
      text: cards(amazon.PLACEMENT_SHAPE),
      chips: [linkChip(t, "smiley.links.amazon", "/t-levels-at-amazon")],
    }),
  },
  {
    id: "amazonSupport",
    patterns: [
      [["buddy", "mentor", "placement manager", "support", "look after", "looks after", "who helps", "help me", "on my own", "alone"], AMAZON],
      [["buddy", "mentor", "placement manager"]],
    ],
    related: ["amazonPlacement", "amazonHowToGet"],
    reply: ({ amazon }) => ({ text: cards(amazon.SUPPORT) }),
  },
  {
    id: "amazonHowToGet",
    patterns: [[GET_IN, AMAZON], [["apply", "application", "applying"], PLACEMENT]],
    // "How do I get a placement at Amazon" is about getting in, not what it is like.
    also: ["placement", "apply", "get a"],
    related: ["registerInterest", "amazonPlacement"],
    reply: ({ t, amazon }) => ({
      text: amazon.ROUTE_IN.map((step) => `${step.title}: ${step.text}`).join("\n"),
      chips: [linkChip(t, "smiley.links.registerInterest", "/register-interest")],
    }),
  },
  {
    id: "amazonPathways",
    patterns: [[AMAZON, ["pathway", "pathways", "which", "areas", "subjects", "tlevels", "offer"]]],
    related: ["pathway-digital", "amazonPlacement", "amazonHowToGet"],
    reply: ({ t, about }) => ({
      text: `${t("smiley.answers.amazonPathways")}\n${about.PATHWAYS.map(
        (entry) => `${entry.name}: ${entry.amazonStatus ?? t("smiley.answers.amazonNotConfirmed")}`,
      ).join("\n")}`,
    }),
  },
  {
    id: "amazonGrowth",
    patterns: [[AMAZON, ["how many", "students", "numbers", "places", "spaces", "grown", "growing", "big"]]],
    related: ["amazonPlacement", "amazonHowToGet"],
    reply: ({ amazon }) => ({
      text: amazon.GROWTH.map((year) => `${year.year}: ${year.value} ${year.caption}.`).join("\n"),
    }),
  },
  {
    id: "registerInterest",
    patterns: [[["register"], ["interest"]], [["expression of interest", "register interest", "register my interest"]]],
    related: ["amazonHowToGet", "account"],
    reply: ({ t, amazon }) => ({
      text: `${amazon.ROUTE_IN[2].title}: ${amazon.ROUTE_IN[2].text}`,
      chips: [linkChip(t, "smiley.links.registerInterest", "/register-interest")],
    }),
  },
  // --- pathways -----------------------------------------------------------------------
  {
    id: "pathwaysList",
    patterns: [[["pathway", "pathways"], ["what", "which", "list", "all", "are there", "options"]], [["pathways"]]],
    related: ["pathway-digital", "pathway-business", "pathway-media", "pathway-finance", "pathway-engineering"],
    reply: ({ t, about }) => ({
      text: `${t("smiley.answers.pathwaysList")}\n${about.PATHWAYS.map((entry) => `${entry.name}: ${entry.summary}`).join("\n")}`,
    }),
  },
  pathwayTopic("digital"),
  pathwayTopic("business"),
  pathwayTopic("media"),
  pathwayTopic("finance"),
  pathwayTopic("engineering"),
  // --- finding your way ------------------------------------------------------------
  {
    id: "nearYou",
    patterns: [
      [["near me", "near you", "nearby", "local", "in my area", "where can i study", "which college", "colleges near", "find a college", "find a tlevel", "postcode", "where can i do"]],
    ],
    // Beats the general "what is a T Level" when somebody is looking for one.
    also: ["where", "find", "near"],
    related: ["providerQuestions", "entryRequirements"],
    reply: ({ t, help }) => ({
      text: `${help.SERVICES[0].title}. ${help.SERVICES[0].text}`,
      chips: [linkChip(t, "smiley.links.nearYou", "/t-level-near-you")],
    }),
  },
  {
    id: "providerQuestions",
    patterns: [[["what should i ask", "questions to ask", "what to ask", "ask my college", "ask the college", "choosing a college", "pick a college", "choose a college"]]],
    related: ["nearYou"],
    reply: ({ t, help }) => ({ text: `${t("smiley.answers.providerQuestions")}\n${help.PROVIDER_QUESTIONS.join("\n")}` }),
  },
  {
    id: "careersAdvice",
    patterns: [[["careers advice", "careers adviser", "career advice", "careers service", "careers advisor", "advice about my future", "careers"]]],
    related: ["whoSuits"],
    reply: ({ help }) => ({ text: `${help.SERVICES[1].title}. ${help.SERVICES[1].text}` }),
  },
  {
    id: "resources",
    patterns: [[["resources", "guides", "guide", "packs", "downloads", "materials", "worksheets", "documents", "videos"]]],
    related: ["account", "community"],
    reply: ({ t }) => ({
      text: t("smiley.answers.resources"),
      chips: [linkChip(t, "smiley.links.resources", "/resources")],
    }),
  },
  {
    id: "quiz",
    patterns: [[["quiz", "test myself", "test my knowledge", "questions to practise"]]],
    related: ["whoSuits"],
    reply: ({ t }) => ({ text: t("smiley.answers.quiz"), chips: [linkChip(t, "smiley.links.quiz", "/quiz")] }),
  },
  {
    id: "community",
    patterns: [[["community", "forum", "ask other", "other students", "ask people", "ask someone", "real people"]]],
    related: ["resources"],
    reply: ({ t }) => ({ text: t("smiley.answers.community"), chips: [linkChip(t, "smiley.links.community", "/community")] }),
  },
  {
    id: "account",
    patterns: [[["account", "sign up", "signup", "log in", "login", "password", "profile"]]],
    related: ["resources", "registerInterest"],
    reply: ({ t }) => ({
      text: t("smiley.answers.account"),
      chips: [linkChip(t, "smiley.links.register", "/register"), linkChip(t, "smiley.links.login", "/login")],
    }),
  },
  {
    id: "contact",
    patterns: [[["contact", "email you", "talk to a person", "real person", "speak to someone", "complain", "complaint", "report a problem", "report an issue"]]],
    related: ["community"],
    reply: ({ t }) => ({ text: t("smiley.answers.contact"), chips: [linkChip(t, "smiley.links.contact", "/contact")] }),
  },
  {
    id: "accessibility",
    patterns: [[["dark mode", "font size", "bigger text", "text size", "high contrast", "reduce motion", "read aloud", "text to speech", "accessibility", "screen reader"]]],
    related: ["language"],
    reply: ({ t }) => ({ text: t("smiley.answers.accessibility"), chips: [linkChip(t, "smiley.links.accessibility", "/accessibility")] }),
  },
  {
    id: "language",
    patterns: [[["language", "languages", "translate", "translation", "polish", "romanian", "punjabi", "panjabi", "urdu", "portuguese", "spanish", "arabic", "bengali", "gujarati"]]],
    related: ["accessibility"],
    reply: ({ t }) => ({ text: t("smiley.answers.language") }),
  },
  {
    id: "privacy",
    patterns: [[["privacy", "personal data", "gdpr", "what do you store", "what do you save", "do you save", "do you store", "cookies", "tracking", "track me"]]],
    related: ["contact"],
    reply: ({ t }) => ({ text: t("smiley.answers.privacy"), chips: [linkChip(t, "smiley.links.privacy", "/privacy")] }),
  },
  // --- honest gaps: things the team has not confirmed -------------------------------
  {
    id: "whatIsOS",
    patterns: [[["os", "o s"], ["stand", "stands", "mean", "means", "meaning", "what is", "short for"]]],
    related: ["tlevelAssessment", "community"],
    reply: ({ t }) => ({ text: t("smiley.answers.acronymGap", { acronym: "OS" }), mood: "thinking" }),
  },
  {
    id: "whatIsESP",
    patterns: [[["esp", "e s p", "employer set project"]]],
    related: ["tlevelAssessment", "community"],
    reply: ({ t }) => ({ text: t("smiley.answers.acronymGap", { acronym: "ESP" }), mood: "thinking" }),
  },
].map((topic) => ({ kind: "fact", ...topic }));

// --- chat and easter eggs -----------------------------------------------------------

const JOKES = 6; // smiley.chat.jokes.0 to .5 in the translation files

function chat(id, patterns, extra = {}) {
  return {
    id,
    kind: "chat",
    patterns,
    reply: ({ t }) => ({ text: t(`smiley.chat.${id}`), mood: "happy" }),
    ...extra,
  };
}

const CHAT = [
  chat(
    "greeting",
    [[["hi", "hello", "hey", "hiya", "heya", "yo", "sup", "howdy", "good morning", "good afternoon", "good evening", "morning", "evening"]]],
    { maxWords: 4, related: ["whatIsTLevel", "amazonPlacement", "pathwaysList"] },
  ),
  chat("howAreYou", [[["how are you", "how are u", "how you doing", "hows it going", "how is it going", "you ok", "you alright", "you good"]]], {
    related: ["whatIsTLevel", "amazonPlacement"],
  }),
  chat("thanks", [[["thanks", "thank you", "cheers", "ta", "appreciate it", "thankyou"]]], {
    maxWords: 6,
    related: ["placementLength", "community"],
  }),
  chat("bye", [[["bye", "goodbye", "see you", "see ya", "cya", "gotta go", "got to go", "later"]]], { maxWords: 5 }),
  chat("whoAreYou", [[["who are you", "what are you", "your name", "whats your name", "what is your name", "who is smiley", "introduce yourself"]]], {
    related: ["whatCanYouDo"],
  }),
  chat("areYouBot", [[["are you", "r you"], ["human", "real", "robot", "bot", "ai", "person", "alive", "a computer"]]], {
    related: ["whatCanYouDo"],
  }),
  chat("whoMadeYou", [[["who made you", "who built you", "who created you", "who designed you", "who programmed you", "who coded you", "who owns you", "who invented you"]]], {
    related: ["whatCanYouDo"],
  }),
  chat(
    "whatCanYouDo",
    [[["what can you do", "what do you do", "how do you work", "what can i ask", "what should i ask", "commands", "what do you know"]], [["help"]]],
    { maxWords: 7, related: ["whatIsTLevel", "amazonPlacement", "pathwaysList", "placementLength"] },
  ),
  {
    id: "joke",
    kind: "chat",
    patterns: [[["joke", "jokes", "make me laugh", "something funny", "funny", "cheer me up"]]],
    related: ["joke"],
    reply: ({ t, now }) => ({ text: t(`smiley.chat.jokes.${now.getTime() % JOKES}`), mood: "happy", motion: "hop" }),
  },
  chat("compliment", [[["good bot", "nice bot", "love you", "you are great", "youre great", "you are cool", "youre cool", "you are amazing", "youre amazing", "you are funny", "youre funny", "you are cute", "youre cute", "best bot", "you rock", "well done", "legend", "i like you"]]], {
    reply: ({ t }) => ({ text: t("smiley.chat.compliment"), mood: "happy", motion: "bounce" }),
  }),
  chat("rude", [[["stupid", "dumb", "useless", "rubbish", "hate you", "shut up", "you suck", "idiot", "trash", "annoying", "go away", "fuck", "shit", "crap", "piss off", "wtf", "bastard"]]], {
    related: ["whatIsTLevel", "amazonPlacement", "community"],
    reply: ({ t }) => ({ text: t("smiley.chat.rude"), mood: "sympathetic" }),
  }),
  chat("acknowledge", [[["ok", "okay", "cool", "nice", "great", "alright", "got it", "k", "kk", "fine", "sure", "yes", "yeah", "yep", "no", "nope", "nah", "hmm", "right"]]], {
    maxWords: 2,
    related: ["whatIsTLevel", "amazonPlacement", "pathwaysList"],
  }),
  chat("confused", [[["dont understand", "do not understand", "confused", "what do you mean", "huh", "makes no sense", "not sure what", "i dont get it", "i dont get"]]], {
    related: ["whatIsTLevel", "placementLength", "community"],
    reply: ({ t }) => ({ text: t("smiley.chat.confused"), mood: "sympathetic" }),
  }),
  chat("howOld", [[["how old are you", "your age", "when were you made", "when were you born", "your birthday"]]]),
  chat("favouriteColour", [[["favourite colour", "favorite color", "favourite color", "favorite colour"]]]),
  chat("meaningOfLife", [[["meaning of life", "42"]]], { maxWords: 7 }),
  chat("secret", [[["secret", "fun fact", "tell me something", "did you know"]]], { maxWords: 7 }),
  chat("feelings", [[["are you happy", "are you sad", "do you have feelings", "do you sleep", "do you eat", "are you lonely", "do you dream"]]]),
  chat("sing", [[["sing", "song", "sing me"]]], { maxWords: 5, reply: ({ t }) => ({ text: t("smiley.chat.sing"), mood: "happy", motion: "sway" }) }),
  chat("name", [[["smiley"]]], { maxWords: 3, reply: ({ t }) => ({ text: t("smiley.chat.name"), mood: "happy", motion: "hop" }) }),
  chat("dance", [[["dance", "boogie", "groove", "bust a move"]]], {
    maxWords: 6,
    reply: ({ t }) => ({ text: t("smiley.chat.dance"), mood: "celebrating", motion: "dance" }),
  }),
  chat("flip", [[["flip", "backflip", "somersault", "cartwheel"]]], {
    maxWords: 6,
    reply: ({ t }) => ({ text: t("smiley.chat.flip"), mood: "happy", motion: "flip" }),
  }),
  chat("spin", [[["barrel roll", "spin", "twirl", "turn around"]]], {
    maxWords: 6,
    reply: ({ t }) => ({ text: t("smiley.chat.spin"), mood: "surprised", motion: "spin" }),
  }),
  chat("sleep", [[["go to sleep", "sleep", "nap", "goodnight", "good night", "go to bed", "bedtime"]]], {
    maxWords: 6,
    reply: ({ t }) => ({ text: t("smiley.chat.sleep"), mood: "sleepy", motion: "nap" }),
  }),
  chat("wake", [[["wake up", "wakey", "rise and shine"]]], {
    maxWords: 5,
    reply: ({ t }) => ({ text: t("smiley.chat.wake"), mood: "surprised", motion: "hop" }),
  }),
  chat("beep", [[["beep", "boop", "beep boop"]]], {
    maxWords: 4,
    reply: ({ t }) => ({ text: t("smiley.chat.beep"), mood: "curious", motion: "wiggle" }),
  }),
  chat("outfits", [[["hat", "hats", "outfit", "outfits", "dress up", "costume", "wear"]]], {
    maxWords: 7,
    reply: ({ t }) => ({ text: t("smiley.chat.outfits"), mood: "happy", motion: "outfits" }),
  }),
  chat("time", [[["what time", "the time", "what day", "todays date", "what date"]]], {
    reply: ({ t, now }) => ({
      text: t("smiley.chat.time", {
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        day: now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" }),
      }),
    }),
  }),
];

export const TOPICS = [...FACTS, ...CHAT];

export const TOPICS_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic]));

// Offered when Smiley does not know: the questions people ask most.
export const POPULAR = ["whatIsTLevel", "placementLength", "amazonPlacement", "pathwaysList", "placementPay", "entryRequirements"];

export { topicChip };
