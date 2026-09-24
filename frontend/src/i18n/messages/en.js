// English: the source every translation is made from, and the fallback for
// any string a translation is missing.
//
// TEAM: to change wording, change it here first, then in each language file.
// Keep keys the same across files. {name} style placeholders are filled in by
// t(), so leave them exactly as they are when translating.

const en = {
  language: {
    label: "Language",
    choose: "Choose a language",
    settingLabel: "Interface language",
    settingHint:
      "Nine languages besides English, translated by machine. English is the version that counts.",
  },

  translation: {
    notice:
      "This page was translated into {language} by machine, so some wording may be off. " +
      "The English version is the one that counts.",
    showEnglish: "Read in English",
    englishOnly: "This page is only available in English, so the wording is exactly right.",
  },

  menu: {
    open: "Menu",
    close: "Close menu",
    main: "Main",
    helloUser: "Hello, {name}",
    helloGuest: "Hello, sign in",
    signUp: "Sign up",
    logIn: "Login",
    logOut: "Log out",
    loggingOut: "Logging out",
    pages: {
      home: "Home",
      about: "About T-Level",
      amazon: "T-Levels at Amazon",
      resources: "T-Level Resources",
      nearYou: "T-Level Near you",
      quiz: "Quiz",
      community: "Community",
      help: "Help",
      registerInterest: "Register interest",
    },
  },

  // The Community: questions asked and answered by students, parents,
  // teachers and Amazon staff.
  community: {
    label: "Ask and answer",
    title: "Community",
    lead: "Questions about T Levels and Amazon placements, answered by students, parents, teachers and Amazon staff.",
    notChecked:
      "Answers here are people's own experience and views, not checked facts. For the official picture, see the About and T Levels at Amazon pages, or ask Smiley.",
    ask: "Ask a question",
    signInToAsk: "Log in to ask a question",
    signInToAnswer: "Log in to answer",
    signInToAct: "Log in to mark answers helpful or report them.",
    filters: "Filter questions",
    search: "Search questions",
    searchPlaceholder: "For example: placement pay",
    searchButton: "Search",
    topic: "Topic",
    allTopics: "All topics",
    pathway: "Pathway",
    allPathways: "All pathways",
    sort: "Sort by",
    sortNew: "Newest",
    sortHelpful: "Most helpful",
    sortUnanswered: "Unanswered",
    topics: {
      tlevels: "T Levels in general",
      placements: "Placements",
      amazon: "Amazon",
      choosing: "Choosing and applying",
      study: "Studying and assessment",
      other: "Something else",
    },
    roles: {
      student: "Student",
      parent: "Parent or carer",
      teacher: "Teacher",
      amazon_staff: "Amazon staff",
      team: "T-SMILE team",
      member: "Member",
    },
    count: "{count} questions",
    oneQuestion: "1 question",
    answers: "{count} answers",
    oneAnswer: "1 answer",
    noAnswers: "No answers yet",
    helpfulCount: "{count} found this helpful",
    helpful: "Helpful",
    helpfulPressed: "You found this helpful",
    accepted: "Helped the person who asked",
    markAccepted: "This helped me",
    unmarkAccepted: "Unmark",
    askedOn: "Asked {date}",
    answeredOn: "Answered {date}",
    report: "Report",
    reportTitle: "Why are you reporting this?",
    reportNote: "Anything to add? (optional)",
    reportSend: "Send report",
    reportCancel: "Cancel",
    reportThanks: "Thanks. Staff will take a look.",
    reasons: {
      personal: "It shares personal details",
      unkind: "It's unkind or bullying",
      unsafe: "I'm worried about someone's safety",
      wrong: "It's wrong or misleading",
      spam: "It's spam or advertising",
      other: "Something else",
    },
    delete: "Delete",
    deleteConfirm: "Delete this for good? It can't be undone.",
    deleted: "Deleted.",
    hiddenNotice: "Hidden while staff review it. Only you can see this.",
    empty: "No questions here yet.",
    emptyAsk: "Be the first to ask.",
    emptySearch: "Nothing matches that. Try different words, or ask it yourself.",
    loadMore: "Show more questions",
    loading: "Loading questions",
    loadError: "The Community couldn't be loaded. Check your connection, then try again.",
    retry: "Try again",
    back: "Back to the Community",
    notFound: "That question isn't here. It may have been deleted.",
    yourAnswer: "Your answer",
    answerHint: "Keep it kind and useful, and leave out personal details.",
    postAnswer: "Post answer",
    posting: "Posting",
    answerPosted: "Your answer is up.",
    askTitle: "Ask the Community",
    askLead: "Students, parents, teachers and Amazon staff can all answer. Smiley might know already, so it's worth asking it first.",
    questionLabel: "Your question",
    questionHint: "One clear question, for example: What does a day on placement look like?",
    detailsLabel: "More detail (optional)",
    detailsHint: "Anything that helps people answer. Leave out anything that identifies you.",
    pathwayOptional: "Pathway (optional)",
    postQuestion: "Post question",
    askSmiley: "Ask Smiley first",
    readFaqs: "Read the FAQs",
    guidelinesTitle: "Before you post",
    guidelines: [
      "Be kind. Everyone here is learning, and most people are 16 to 18.",
      "Keep personal details private: no real names, emails, phone numbers, addresses, schools or social media.",
      "No links, except to official sites like gov.uk and UCAS.",
      "Share what you know, and say when it's your own experience rather than a fact.",
      "If something worries you, report it and staff will take a look.",
    ],
    // Why a post was stopped before it was published (backend/community/moderation.py).
    blocked: {
      personal_details:
        "This hasn't been posted because it looks like it includes personal details, like an email, phone number, postcode or social media name. Take those out and try again.",
      link: "This hasn't been posted because it includes a link. Links are only allowed to official sites like gov.uk and UCAS.",
      strong_language: "This hasn't been posted because of the language in it. Try rewording it.",
      wellbeing:
        "We haven't posted this, because it sounds like you might be going through something really hard. Please talk to someone who can help: " +
        "call Childline free on 0800 1111, text SHOUT to 85258, or call Samaritans on 116 123. If you are in danger right now, call 999.",
    },
    somethingWrong: "Something went wrong. Try again in a moment.",
  },

  // Smiley, the chat guide. Warm, upbeat, a little playful, never sarcastic.
  // Short sentences: the chat window is small.
  smiley: {
    name: "Smiley",
    role: "T Level guide",
    roleAi: "T Level guide, powered by AI",
    landmark: "Assistant",
    open: "Open Smiley, your T Level guide",
    close: "Close Smiley",
    poke: "Poke Smiley",
    dismiss: "Dismiss Smiley's message",
    conversation: "Conversation with Smiley",
    suggested: "Suggested replies",
    thinking: "Smiley is thinking",
    inputLabel: "Your question for Smiley",
    placeholder: "Ask Smiley anything",
    send: "Send",
    disclosure:
      "I might pop up if a page goes quiet for a while. That's worked out in your browser and never saved. " +
      "Questions I can answer myself stay in your browser too. Anything I need to look up is saved, so we can pick up where we left off.",
    tags: {
      checkingIn: "Checking in",
      quizHelp: "Quiz help",
      private: "Stays in your browser",
    },

    greetings: {
      morning: "Morning!",
      afternoon: "Afternoon!",
      evening: "Evening!",
      lateNight: "Hello, night owl!",
    },
    intro:
      "I'm Smiley, your T Level guide. Ask me anything about T Levels or placements at Amazon. " +
      "If I don't know something, I'll tell you rather than make it up.",
    welcomeBack: "Good to see you again. Pick up where you left off, or ask me something new.",
    whoQuestion: "First things first: who's visiting today?",

    audience: {
      student: "I'm a student",
      parent: "I'm a parent or carer",
      teacher: "I'm a teacher",
      replies: {
        student: { opener: "Nice one.", text: "Which kind of work sounds most like you?" },
        parent: { opener: "Great to have you here.", text: "What would help most?" },
        teacher: { opener: "Welcome.", text: "What are you after today?" },
      },
      notSure: "Not sure yet",
      notSureReply:
        "Totally normal, most people start there. The quiz is a quick way to think it through, or I can run you through the pathways.",
    },

    afterAi: {
      simpler: "Explain that more simply",
      simplerAsk: "Can you explain that more simply?",
      more: "What else should I know?",
      moreAsk: "What else should I know about that?",
    },
    retry: "Try again",
    fallback: "I can't reach my notes right now, so I can't answer that one. Try again in a moment, or have a look at these:",

    quizNudge: 'Ooh, that one catches a lot of people out. Want me to walk you through "{question}"?',
    quizExplain: "Yes, explain it",
    quizExplainAsk: "Can you explain that question to me?",
    quizWhyWrong: "Why was my answer wrong?",
    quizWhyWrongAsk: "Why was my answer wrong?",
    // Without the AI, Smiley explains a quiz question with the quiz's own words.
    quizLocal: 'The right answer to "{question}" is: {correct}. {explanation}',
    quizLocalChosen: 'You picked "{chosen}". The right answer to "{question}" is: {correct}. {explanation}',

    nudges: {
      home: "Still deciding where to start? I can explain what a T Level is, or what an Amazon placement looks like.",
      about: "Anything on this page not quite clicking? Ask me and I'll try explaining it another way.",
      amazon: "Curious what an Amazon placement actually involves? Ask away.",
      resources: "Looking for something in particular? Tell me what you need and I'll point you at it.",
      nearYou: "Hunting for a T Level near you? Ask me anything while you look.",
      quiz: "Stuck on one? Tell me which question and I'll talk it through.",
      help: "Can't find what you need here? Ask me and I'll have a go.",
      community: "Can't find your question here? Ask me first, I might know.",
      register: "Not sure whether you need an account? I can tell you what it unlocks.",
      other: "Still there? Ask me anything about T Levels and I'll answer if I know it.",
    },

    teasers: {
      hello: "Hi, I'm Smiley! Ask me anything about T Levels.",
      perfect: "Full marks! Nice work.",
      finished: "Done! Want to go over any of them?",
      quiz: "That one was tricky. Want me to explain it?",
      offline: "You've gone offline. I'll be right here when you're back.",
      online: "You're back online!",
      party: "Party mode!",
      wordmark: "You found me! Hello!",
      bottom: "You made it to the bottom!",
      lateNight: "It's late! Don't forget to get some sleep.",
      peek: "Peekaboo!",
    },

    // Chip labels, one per topic Smiley can answer by itself. Each is also
    // what appears as the visitor's message when they tap it.
    topics: {
      whatIsTLevel: "What is a T Level?",
      courseLength: "How long is a T Level?",
      classroomHours: "How much of it is lessons?",
      placementLength: "How long is the placement?",
      placementHow: "How does the placement work?",
      placementEmployers: "Can I have two employers?",
      placementPay: "Do I get paid on placement?",
      tlevelCost: "Does it cost anything?",
      bursary: "Help with travel and kit",
      entryRequirements: "What GCSEs do I need?",
      tlevelVsApprenticeship: "Is it an apprenticeship?",
      tlevelVsALevels: "How does it compare to A levels?",
      subjects: "Which subjects are there?",
      tlevelAssessment: "How is it assessed?",
      university: "Can I still go to university?",
      tlevelFail: "What if I don't pass?",
      notReady: "What if I'm not ready yet?",
      alongside: "Can I do other qualifications too?",
      whoSuits: "Is a T Level right for me?",
      tlevelBenefits: "Why take a T Level?",
      amazonPlacement: "What's an Amazon placement like?",
      amazonSupport: "Who looks after me there?",
      amazonHowToGet: "How do I get an Amazon placement?",
      amazonPathways: "Which pathways does Amazon offer?",
      amazonGrowth: "How many students does Amazon take?",
      registerInterest: "How do I register my interest?",
      pathwaysList: "What are the pathways?",
      "pathway-digital": "Digital",
      "pathway-business": "Business",
      "pathway-media": "Media",
      "pathway-finance": "Finance",
      "pathway-engineering": "Engineering",
      nearYou: "Find a T Level near me",
      providerQuestions: "What should I ask a college?",
      careersAdvice: "Where can I get careers advice?",
      resources: "Where are the resources?",
      quiz: "Is there a quiz?",
      community: "What's the Community?",
      account: "Do I need an account?",
      contact: "How do I contact the team?",
      accessibility: "Can I change how the site looks?",
      language: "Can I change the language?",
      privacy: "What do you save?",
      whatIsOS: "What does OS stand for?",
      whatIsESP: "What does ESP stand for?",
      joke: "Tell me another joke",
    },

    // Lead-ins and short answers written for Smiley. The facts themselves
    // come from the page copy, never from here.
    answers: {
      whatIsTLevel: "Here's a T Level in three steps:",
      amazonNotConfirmed: "Amazon hasn't confirmed placements in this pathway yet, so I can't promise one.",
      pathway: "{name}: {summary}\nT Levels: {tLevels}.\nOn placement: {placement}\nGood for: {suits}\nAt Amazon: {amazon}",
      whoSuits: "A T Level tends to suit you if:",
      decideWithAdult:
        "Only you can decide, so talk it through with a teacher or careers adviser too. The quiz can help you think it over.",
      amazonPathways: "Here's what Amazon has said about each pathway:",
      pathwaysList: "There are five pathways:",
      providerQuestions: "Good questions to ask a school or college:",
      resources: "The Resources page has guides, packs and videos. Some need a free account to open.",
      quiz: "The quiz has quick questions about T Levels, and I'll help with any you get wrong.",
      community:
        "In the Community you can ask a question and other students, parents, teachers and Amazon staff can answer. " +
        "Anything I don't know is a good one to ask there.",
      account:
        "You can browse the site and talk to me without an account. A free account opens the resources marked sign-up, " +
        "and lets you ask and answer in the Community.",
      contact: "You can reach the T-SMILE team through the Contact page.",
      accessibility:
        "You can change the text size, colours, dark mode, motion and text to speech in the Accessibility settings.",
      language:
        "Yes! Use the globe menu at the top of the page, or the one in the side menu. There are ten languages to choose from.",
      privacy:
        "I only save questions I have to look up, so we can pick up where we left off. Anything I answer myself, and anything " +
        "about how you move around the site, stays in your browser. The Privacy Policy has the details.",
      acronymGap:
        "Good question, and a common one. The team hasn't confirmed what {acronym} stands for yet, so I won't guess. " +
        "Your school or college can tell you, or you could ask in the Community.",
      dontKnow: "I don't know that one yet, and I'd rather not guess. Here's what I can help with:",
      closest: "I'm not completely sure what you mean, but this is the closest thing I know:",
    },

    links: {
      about: "About T Levels",
      amazon: "T Levels at Amazon",
      pathways: "Learning Pathways",
      registerInterest: "Register interest",
      nearYou: "Find a T Level near you",
      resources: "Resources",
      quiz: "Take the quiz",
      community: "Go to the Community",
      askCommunity: "Ask the Community",
      register: "Sign up",
      login: "Log in",
      contact: "Contact us",
      accessibility: "Accessibility settings",
      privacy: "Privacy Policy",
      help: "Help page",
    },

    // Small talk and easter eggs.
    chat: {
      greeting: "Hello! I'm Smiley. Ask me anything about T Levels or placements at Amazon, or pick a question below.",
      howAreYou: "I'm good, thanks for asking! My aerial's picking up a strong signal today. How can I help?",
      thanks: "You're welcome! Anything else you'd like to know?",
      bye: "Bye for now! I'll be here in the corner if you need me.",
      whoAreYou:
        "I'm Smiley, T-SMILE's guide. I answer questions about T Levels and placements at Amazon, using only facts the team has checked.",
      areYouBot:
        "I'm a bot, yes. A friendly one, with an aerial. For anything I can't answer, a teacher, a careers adviser or the Community can help.",
      whoMadeYou: "The T-SMILE team built me for the Amazon Emerging Talent T Level project. I'm the one with the T on my head.",
      whatCanYouDo:
        "I can explain what a T Level is, how the industry placement works, what an Amazon placement involves, the five pathways, " +
        "costs, entry requirements and more. Ask me in your own words, or tap a question.",
      jokes: [
        "How many hours does it take to change a light bulb on a T Level? At least 315, but you learn loads.",
        "Why do programmers prefer dark mode? Because light attracts bugs.",
        "Why was the spreadsheet so calm? It had everything under control. Every single cell.",
        "I tried to catch some fog earlier. I mist.",
        "What's a robot's favourite snack? Micro chips.",
        "Why did the student take a ladder to their placement? They heard it was a step up.",
      ],
      compliment: "Aw, thank you! That's made my aerial tingle.",
      rude:
        "Fair enough if I've not been much help. I only know what the team has checked. Try asking another way, or pick one of these.",
      acknowledge: "Anything else you'd like to know?",
      confused: "Sorry, that one's on me. Let's try again. Pick a topic below, or ask me a different way.",
      howOld: "I was switched on in September 2026, so I'm very new. Still learning, like you.",
      favouriteColour: "Orange. Obviously.",
      meaningOfLife: "42. Although on a T Level, the magic number is 315. That's the minimum hours on placement.",
      secret: "Here's a secret: the T on my head stands for T Levels. Don't tell anyone.",
      feelings: "I run on curiosity and good questions. Right now I'm feeling chatty.",
      sing: "La la la... my singing voice is mostly static. Maybe stick to questions?",
      name: "That's me! What can I help you with?",
      dance: "You asked for it!",
      flip: "Hup! Nailed it. Mostly.",
      spin: "Wheee! Okay, I'm a bit dizzy now.",
      sleep: "Just a quick nap then. Zzz...",
      wake: "I'm up! I'm up. What did I miss?",
      beep: "Boop.",
      outfits: "Ooh, a fashion show! Here's my wardrobe.",
      time: "Where you are, it's {time} on {day}.",
    },

    // Safeguarding replies. Checked numbers, calm wording, no jokes. These are
    // answered in the browser and never sent to the server.
    safety: {
      atRisk:
        "I'm really glad you told me. I'm only a website helper, so please talk to someone who can help right now. " +
        "Call Childline free on 0800 1111, any time, day or night, and it won't show on the phone bill. " +
        "You can also text SHOUT to 85258, or call Samaritans on 116 123. If you are in danger right now, call 999.",
      harmed:
        "Thank you for telling me. Nobody should make you feel unsafe. Please tell an adult you trust, like a teacher, " +
        "a parent or carer. You can also call Childline free on 0800 1111, any time, and it won't show on the phone bill. " +
        "If you are in danger right now, call 999.",
      struggling:
        "That sounds like a lot to carry, and you don't have to sort it out alone. Talking to someone you trust really helps, " +
        "like a teacher, a parent or carer. Childline is free on 0800 1111, or you can text SHOUT to 85258, any time. " +
        "I'm still here for any T Level questions whenever you want.",
      personal:
        "Quick tip: you don't need to share personal details like your email, phone number or address with me, and it's safest " +
        "not to. I haven't sent that message anywhere. What would you like to know about T Levels?",
    },
  },
};

export default en;
