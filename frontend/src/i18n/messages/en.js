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

  // The five pathway names, used wherever a pathway is named in the interface.
  pathways: {
    digital: "Digital",
    business: "Business",
    media: "Media",
    finance: "Finance",
    engineering: "Engineering",
  },

  home: {
    title: "T-Levels, with a smile.",
    subheads: {
      general: "Guides, packs and videos for students, parents and schools.",
      teacher: "Ready-made class packs and guides for talking to students about T-Levels.",
      parent: "Clear guides to what T-Levels involve, so you can help your child choose.",
      student: "Guides and prep packs to help you pick a T-Level and get ready for it.",
    },
    browse: "Browse resources",
    stats: {
      title: "T-Levels at a glance",
      tLevels: "Named T-Levels",
      pathways: "Pathways",
      resourceTypes: "Resource types",
      audiences: "Audiences",
    },
    audiences: {
      label: "Who it is for",
      title: "Teachers, parents and students",
      lead: "Pick one to tailor the introduction at the top of the page.",
      selected: "Selected",
      teacher: {
        who: "Teachers and schools",
        title: "Resources ready for your classroom",
        text: "Class packs and guides that introduce T-Levels to your students.",
      },
      parent: {
        who: "Parents and guardians",
        title: "Help them choose with confidence",
        text: "Plain guides to what T-Levels involve and where they lead.",
      },
      student: {
        who: "Students",
        title: "Learn it in class, use it at work",
        text: "Study a subject you care about, with real work experience built in.",
      },
    },
    pathways: {
      label: "Pathways",
      title: "Explore by pathway",
      lead: "Each covers a group of related T-Levels. Pick one to see its resources.",
      digital: "Build, run and support technology.",
      business: "Keep teams and operations running.",
      media: "Plan, make and publish content.",
      finance: "Work with the numbers behind decisions.",
      engineering: "Design, build and maintain systems.",
    },
    steps: {
      label: "How it works",
      title: "Start in four steps",
      level: "Level",
      browse: { title: "Browse resources", text: "Guides, packs and videos for all five pathways.", link: "Browse resources" },
      register: { title: "Register interest", text: "Tell us which pathway you want to explore.", link: "Register interest" },
      hearBack: { title: "Hear back", text: "We review each submission and reply by email." },
      getInvolved: { title: "Get involved", text: "Sign up to ask and answer in the Community, and keep your settings on any device.", link: "Sign up" },
    },
  },

  // The About page's own headings. Its facts come from aboutContent.js.
  about: {
    hero: {
      label: "About T-Levels",
      title: "Two years. One industry. A real placement.",
      lead: "A technical qualification you take after your GCSEs. Mostly learning, part working.",
    },
    what: { label: "How it works", title: "What a T-Level is", split: "How the two years are split" },
    placement: {
      label: "The placement",
      title: "Inside the placement",
      amazonLink: "What a placement at Amazon looks like",
      amazonDetail: "T-Levels at Amazon",
    },
    switcher: {
      label: "Subjects",
      title: "The five pathways at Amazon",
      lead: "Pick one to see what the placement involves.",
      tabs: "Pathways",
      tLevels: "T-Levels in this pathway",
      onPlacement: "On placement",
      suits: "Suits",
      registerIn: "Register interest in {name}",
    },
    photos: "Students, warehouse teams and office teams at work",
    grades: {
      label: "Grades",
      title: "Grades and UCAS points",
      lead: "Your grade earns UCAS points, which count towards university.",
      tableName: "Grades and UCAS points table",
      caption: "T-Level overall grades and the UCAS Tariff points each one is worth",
      grade: "Overall grade",
      points: "UCAS points",
      note: "Not every university uses UCAS points, so check your course. Miss a part and you still get a statement of what you passed.",
    },
    who: { label: "Who it is for", title: "It may suit you if" },
    why: { label: "Why do one", title: "What you get" },
    cost: { label: "Money", title: "What it costs" },
    quiz: {
      label: "Quiz",
      title: "Is a T-Level right for me?",
      lead: "Six questions. There are no wrong answers, and nothing is saved or sent anywhere.",
      progress: "{done} of {total} answered",
      incomplete: "Answer all {total} questions to see your result. You have done {done}.",
      seeResult: "See my result",
      startAgain: "Start again",
      yourResult: "Your result",
      note: "This is a guide to think with, not advice. Talk to a teacher or a careers adviser before you decide.",
    },
    faq: {
      label: "Questions",
      title: "The things people ask",
      lead: "Short answers. Ask Smiley if yours is not here.",
    },
    sources: {
      title: "Sources",
      note: "Checked in September 2026. Entry requirements are set by each school or college, so check with yours.",
    },
  },

  // The T-Levels at Amazon page's own headings. Its facts come from amazonContent.js.
  amazon: {
    hero: {
      label: "Amazon Emerging Talent",
      title: "Nine weeks inside a team.",
      lead: "Amazon takes T-Level students on placement. You join a real team and do real work.",
    },
    shape: { label: "The placement", title: "What the nine weeks look like" },
    support: { label: "Support", title: "Three people looking after you" },
    pathways: {
      label: "Pathways",
      title: "Which subjects Amazon takes",
      leadBefore: "More on each one on the",
      leadLink: "About T-Levels",
      // Starts with a space: a language that ends on the link gives just "."
      leadAfter: " page.",
    },
    route: { label: "Getting one", title: "How to get a placement" },
    growth: { label: "The programme", title: "It is growing", lead: "From six students to 100 in its first three years, with more planned. Figures from the Department for Education." },
    sourcesNote: "Checked in September 2026.",
  },

  // The Help page's own headings. Its services and questions come from helpContent.js.
  help: {
    hero: { label: "Help", title: "Stuck? Start here.", lead: "Pick what you are trying to do." },
    site: { label: "On this site", title: "Where to go" },
    services: { label: "Elsewhere", title: "Free services", lead: "Run by the government, not by us." },
    questions: { label: "Before you choose", title: "Ask your school or college" },
    person: {
      label: "Still stuck",
      title: "Ask a person",
      text: "Talk to your teacher or careers adviser. Or call the National Careers Service free on",
    },
  },

  // The knowledge check at /quiz. The questions themselves are in
  // knowledgeQuizQuestions.js (and its translations).
  quiz: {
    page: {
      label: "Quiz",
      title: "Test what you know",
      lead: "{count} questions about T-Levels, Amazon placements and this site. Nothing is saved, and nobody sees your score.",
    },
    label: "Knowledge check",
    title: "What do you know about T-Levels?",
    lead: "{count} questions, one at a time. Getting one wrong is useful: Smiley will offer to talk it through.",
    scored: "You scored {score} out of {total}",
    doneLead: "Anything you are not sure about, ask Smiley in the corner. It will tell you if it does not know.",
    questionOf: "Question {number} of {total}",
    right: "That is right.",
    wrong: "Not quite. The right answer: {answer}.",
    check: "Check answer",
    seeScore: "See my score",
    next: "Next question",
  },

  faqs: {
    label: "FAQs",
    title: "Questions people ask",
    leadBefore: "Not here? Ask Smiley, or see",
    leadLink: "Help",
    leadAfter: ".",
  },

  pathwaysPage: {
    label: "Learning Pathways",
    title: "Five pathways",
    lead: "Pick one to see the T-Levels in it and what the placement involves.",
  },

  shell: {
    skip: "Skip to content",
    error404: "Error 404",
    notFound: "Page not found",
    toLibrary: "Go to the content library",
  },

  // Browser tab titles, keyed by the English title each route passes to
  // PageTitle in App.jsx.
  titles: {
    Home: "Home",
    "About T-Level": "About T-Level",
    "T-Levels at Amazon": "T-Levels at Amazon",
    "T-Level Resources": "T-Level Resources",
    "Find T-Levels Near You": "Find T-Levels Near You",
    "All T-Levels": "All T-Levels",
    "Get involved": "Get involved",
    Quiz: "Quiz",
    Help: "Help",
    "Register interest": "Register interest",
    "Learning Pathways": "Learning Pathways",
    FAQs: "FAQs",
    Community: "Community",
    "Ask the Community": "Ask the Community",
    "Community question": "Community question",
    "Sign up": "Sign up",
    Login: "Login",
    "Terms of Service": "Terms of Service",
    "Privacy Policy": "Privacy Policy",
    "Cookie Policy": "Cookie Policy",
    "GDPR and data rights": "GDPR and data rights",
    "Accessibility help": "Accessibility help",
    "Report an issue": "Report an issue",
    Accessibility: "Accessibility",
    "Contact us": "Contact us",
    Feedback: "Feedback",
    Submissions: "Submissions",
    "Page not found": "Page not found",
  },

  footer: {
    about: "About",
    aboutText:
      "T-Levels and Amazon placements, explained for students, parents and teachers. A student project for Amazon Emerging Talent, not an official Amazon website.",
    navigation: "Navigation",
    support: "Support",
    legal: "Legal & Compliance",
    connect: "Connect",
    copyright: "© {year} T-SMILE. All rights reserved.",
    links: {
      home: "Home",
      pathways: "Learning Pathways",
      allTLevels: "All T-Levels",
      profile: "Profile",
      resources: "Resources",
      faqs: "FAQs",
      community: "Community",
      contact: "Contact Us",
      reportIssue: "Report an Issue",
      feedback: "Feedback",
      accessibilityHelp: "Accessibility Help",
      terms: "Terms of Service",
      privacy: "Privacy Policy",
      cookies: "Cookie Policy",
      dataRights: "GDPR / Data Rights",
      registerInterest: "Register your interest",
      getInvolved: "Get involved",
      signUp: "Sign up",
    },
  },

  account: {
    menu: "Account",
    menuFor: "Account menu for {name}",
    settings: "Profile & Settings",
    security: "Security Settings",
    contact: "Contact Us",
    submissions: "Submissions",
    signIn: "Sign in",
    signUp: "Sign up",
    signInOrUp: "Sign in or sign up",
    notSignedIn: "Not signed in",
    needAccount: "Sign up to join the Community",
    roles: {
      student: "Student",
      parent: "Parent or guardian",
      teacher: "Teacher or school",
      amazon_staff: "Amazon staff",
    },
  },

  menu: {
    open: "Menu",
    close: "Close menu",
    main: "Main",
    helloUser: "Hello, {name}",
    helloGuest: "Hello, sign in",
    pages: {
      home: "Home",
      about: "About T-Level",
      amazon: "T-Levels at Amazon",
      resources: "T-Level Resources",
      nearYou: "Find T-Levels Near You",
      quiz: "Quiz",
      community: "Community",
      help: "Help",
    },
  },

  login: {
    label: "Account",
    title: "Welcome back",
    lead: "Log in to join the Community and keep your settings on any device.",
    username: "Username",
    password: "Password",
    submitting: "Logging in",
    submit: "Log in",
    noAccount: "No account yet?",
    register: "Register",
  },

  // Shared by the account forms.
  forms: {
    hidePassword: "Hide password",
    showPassword: "Show password",
    panelLine: "Free resources for Amazon’s Digital T-Level pathway.",
  },

  register: {
    title: "Create your account",
    lead: "It takes a minute, and it is free.",
    usernameHint: "Letters, numbers and @ . + - _ only.",
    passwordHint: "At least 8 characters. Not all numbers, not a common password.",
    confirmPassword: "Confirm password",
    accountType: "Account type",
    chooseOne: "Choose one",
    pathway: "Pathway (optional)",
    noPreference: "No preference",
    heardAboutLabel: "Where did you hear about us? (optional)",
    heardAbout: {
      search_engine: "Search engine",
      social_media: "Social media",
      friend_family: "Friend or family",
      advert: "Advert",
      influencer: "Influencer",
      ai: "AI",
      other: "Other",
    },
    overSixteen: "I confirm I am 16 or over.",
    // "I have read and agree to the [Terms and Conditions]." The link sits
    // between termsBefore and termsAfter, so a translation can move it.
    termsBefore: "I have read and agree to the",
    termsLink: "Terms and Conditions",
    termsAfter: ".",
    newTab: "(opens in a new tab)",
    submitting: "Signing up",
    submit: "Sign up",
    haveAccount: "Already registered?",
    errors: {
      overSixteen: "Confirm you are 16 or over to create an account.",
      terms: "Agree to the Terms and Conditions to create an account.",
    },
  },

  registerInterest: {
    label: "Amazon Emerging Talent",
    title: "Register your interest",
    lead: "Want a T-Level placement at Amazon? Tell us which pathway. You do not need an account.",
    fullName: "Full name",
    email: "Email",
    iAmA: "I am a",
    pathway: "Pathway",
    message: "Anything to add? (optional)",
    messageHint: "For example, a question about the placement.",
    consent: "I am happy for the Amazon Emerging Talent team to see these details and contact me.",
    privacyBefore: "See our",
    privacyLink: "Privacy Policy",
    privacyAfter: ".",
    submitting: "Sending",
    submit: "Register interest",
    nextTitle: "What happens next",
    underSixteen: "Under 16? Ask a parent or carer before you send this.",
    box: {
      summary: "Want an Amazon placement? Register your interest",
      text: "No account needed. Tell us your pathway and we pass it to the Amazon Emerging Talent team. Under 16? Ask a parent or carer first.",
    },
    thanks: {
      title: "Thanks, you are on the list",
      lead: "Your interest in the {pathway} pathway has been sent to the Amazon Emerging Talent team.",
      whileYouWait: "While you wait, see",
      placementLink: "what an Amazon placement looks like",
      after: ".",
    },
    errors: {
      fullName: "Enter your full name.",
      email: "Enter an email address in the format name@example.com.",
      userType: "Choose student, parent or teacher.",
      pathway: "Choose a pathway.",
      message: "Keep your message under {limit} characters.",
      consent: "Tick the box so we can share your details with Amazon.",
    },
  },

  // The Community: questions asked and answered by students, parents,
  // teachers and Amazon staff.
  community: {
    label: "Ask and answer",
    title: "Community",
    lead: "Questions about T-Levels and Amazon placements, answered by students, parents, teachers and Amazon staff.",
    notChecked:
      "Answers here are people's own experience and views, not checked facts. For the official picture, see the About and T-Levels at Amazon pages, or ask Smiley.",
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
      tlevels: "T-Levels in general",
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
    role: "T-Level guide",
    roleAi: "T-Level guide, powered by AI",
    landmark: "Assistant",
    open: "Open Smiley, your T-Level guide",
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
      "I'm Smiley, your T-Level guide. Ask me anything about T-Levels or placements at Amazon. " +
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
      home: "Still deciding where to start? I can explain what a T-Level is, or what an Amazon placement looks like.",
      about: "Anything on this page not quite clicking? Ask me and I'll try explaining it another way.",
      amazon: "Curious what an Amazon placement actually involves? Ask away.",
      resources: "Looking for something in particular? Tell me what you need and I'll point you at it.",
      nearYou: "Hunting for a T-Level near you? Ask me anything while you look.",
      quiz: "Stuck on one? Tell me which question and I'll talk it through.",
      help: "Can't find what you need here? Ask me and I'll have a go.",
      community: "Can't find your question here? Ask me first, I might know.",
      register: "Not sure whether you need an account? I can tell you what it unlocks.",
      other: "Still there? Ask me anything about T-Levels and I'll answer if I know it.",
    },

    teasers: {
      hello: "Hi, I'm Smiley! Ask me anything about T-Levels.",
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
      whatIsTLevel: "What is a T-Level?",
      courseLength: "How long is a T-Level?",
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
      whoSuits: "Is a T-Level right for me?",
      tlevelBenefits: "Why take a T-Level?",
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
      nearYou: "Find a T-Level near me",
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
      whatIsTLevel: "Here's a T-Level in three steps:",
      amazonNotConfirmed: "Amazon hasn't confirmed placements in this pathway yet, so I can't promise one.",
      pathway: "{name}: {summary}\nT-Levels: {tLevels}.\nOn placement: {placement}\nGood for: {suits}\nAt Amazon: {amazon}",
      whoSuits: "A T-Level tends to suit you if:",
      decideWithAdult:
        "Only you can decide, so talk it through with a teacher or careers adviser too. The quiz can help you think it over.",
      amazonPathways: "Here's what Amazon has said about each pathway:",
      pathwaysList: "There are five pathways:",
      providerQuestions: "Good questions to ask a school or college:",
      resources: "The Resources page has guides, packs and videos, all free to open.",
      quiz: "The quiz has quick questions about T-Levels, and I'll help with any you get wrong.",
      community:
        "In the Community you can ask a question and other students, parents, teachers and Amazon staff can answer. " +
        "Anything I don't know is a good one to ask there.",
      account:
        "You can browse the site, open every resource and talk to me without an account. A free account lets you ask and answer in the Community, and keeps your settings on any device.",
      contact: "You can reach the T-SMILE team through the Contact page.",
      accessibility:
        "You can change the text size, colours, dark mode, motion and text to speech in the Accessibility settings.",
      language:
        "Yes! Use the language menu under the account button at the top of the page, or the one in the side menu. There are ten languages to choose from.",
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
      about: "About T-Levels",
      amazon: "T-Levels at Amazon",
      pathways: "Learning Pathways",
      registerInterest: "Register interest",
      nearYou: "Find a T-Level near you",
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
      greeting: "Hello! I'm Smiley. Ask me anything about T-Levels or placements at Amazon, or pick a question below.",
      howAreYou: "I'm good, thanks for asking! My aerial's picking up a strong signal today. How can I help?",
      thanks: "You're welcome! Anything else you'd like to know?",
      bye: "Bye for now! I'll be here in the corner if you need me.",
      whoAreYou:
        "I'm Smiley, T-SMILE's guide. I answer questions about T-Levels and placements at Amazon, using only facts the team has checked.",
      areYouBot:
        "I'm a bot, yes. A friendly one, with an aerial. For anything I can't answer, a teacher, a careers adviser or the Community can help.",
      whoMadeYou: "The T-SMILE team built me for the Amazon Emerging Talent T-Level project. I'm the one with the T on my head.",
      whatCanYouDo:
        "I can explain what a T-Level is, how the industry placement works, what an Amazon placement involves, the five pathways, " +
        "costs, entry requirements and more. Ask me in your own words, or tap a question.",
      jokes: [
        "How many hours does it take to change a light bulb on a T-Level? At least 315, but you learn loads.",
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
      meaningOfLife: "42. Although on a T-Level, the magic number is 315. That's the minimum hours on placement.",
      secret: "Here's a secret: the T on my head stands for T-Levels. Don't tell anyone.",
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
        "I'm still here for any T-Level questions whenever you want.",
      personal:
        "Quick tip: you don't need to share personal details like your email, phone number or address with me, and it's safest " +
        "not to. I haven't sent that message anywhere. What would you like to know about T-Levels?",
    },
  },

  legalPage: {
    updated: "Last updated {date}. Draft, to be checked before launch.",
  },

  messageForm: {
    about: "What is it about?",
    email: "Email (optional)",
    emailHint: "Add it if you want a reply.",
    sending: "Sending",
    empty: "Write a message first.",
  },

  contact: {
    label: "Support",
    title: "Contact us",
    leadBefore: "Send the team a message. Something broken? Use",
    leadLink: "Report an issue",
    leadAfter: ".",
    categories: {
      general: "A question or anything else",
      feature: "An idea for the site",
    },
    message: "Your message",
    submit: "Send message",
    sent: "Thanks, your message has reached the team.",
  },

  reportIssue: {
    label: "Support",
    title: "Report an issue",
    lead: "Tell us what went wrong and which page you were on.",
    categories: {
      bug: "Something is broken",
      accessibility: "Something is hard to use or read",
    },
    message: "What happened?",
    submit: "Send report",
    sent: "Thanks, we have your report and will look into it.",
  },

  feedbackPage: {
    label: "Feedback",
    title: "Feedback",
    lead: "Tell us what’s working and what isn’t.",
    category: "Category",
    categories: {
      bug: "Bug report",
      feature: "Feature suggestion",
      general: "General feedback",
      accessibility: "Accessibility issue",
    },
    message: "Message",
    email: "Email (optional)",
    emailHint: "So we can follow up, if you’d like.",
    sending: "Sending",
    submit: "Send feedback",
    thanksTitle: "Thank you",
    thanksLead: "We read every message. Thanks for taking the time.",
  },

  accessibilityHelp: {
    label: "Support",
    title: "Accessibility help",
    lead: "We aim to meet WCAG 2.2 AA, the standard for accessible websites.",
    waysTitle: "Use the site your way",
    ways: {
      settings: "Change text size, contrast, spacing and colours in Accessibility settings.",
      keyboard: "Everything works with a keyboard. Press Tab to move, Enter to choose.",
      skip: "Press Tab once on any page to skip straight to the main content.",
      screenReaders: "Pages are built to work with screen readers such as NVDA and VoiceOver.",
      motion: "Moving words and animations stop if your device is set to reduce motion.",
      speech: "Smiley can read its answers out loud. Switch it on in Accessibility settings.",
    },
    openSettings: "Open Accessibility settings",
    problemTitle: "Something not working for you?",
    problemLead: "Tell us which page and what got in the way, and we will fix it.",
    report: "Report an accessibility issue",
  },

  settings: {
    label: "Settings",
    title: "Accessibility",
    lead: "Change how T-SMILE looks and behaves for you. Signed in, these settings follow you to any device; signed out, they stay on this browser.",
    signInPrompt: "Log in to manage this.",
    tabs: {
      sightLoss: "Sight and vision",
      display: "Display",
      language: "Language",
      security: "Security",
      account: "Account",
    },
    sight: {
      fontSize: "Font size",
      highContrast: "High contrast",
      textSpacing: "Text spacing",
      spacing: {
        normal: "Normal",
        comfortable: "Comfortable",
        relaxed: "Relaxed",
        wide: "Wide",
      },
      colourBlindness: "Colour blindness type",
      colourBlindnessHint: "Tell us how you see colour and the site adjusts its own, so shades that would look alike to you are pulled apart.",
      colours: {
        none: "None",
        protanopia: "Protanopia (red-blind)",
        deuteranopia: "Deuteranopia (green-blind)",
        tritanopia: "Tritanopia (blue-blind)",
      },
      speech: "Read the chat assistant’s replies aloud",
      speechHint: "Speaks Smiley’s answers only, using a voice on this device. The rest of the page is not read aloud yet.",
      reduceMotion: "Reduce motion",
      reduceMotionHint: "Turns off the site’s animations, on top of your system setting.",
    },
    display: {
      theme: "Theme",
      themes: {
        light: "Light",
        dark: "Dark",
        system: "Match system",
      },
      outline: "Focus outline style",
      outlines: {
        default: "Default",
        thick: "Thick",
        dashed: "Dashed",
      },
      background: "Page background",
      backgrounds: {
        white: "White",
        cream: "Cream",
        gray: "Grey",
      },
    },
    security: {
      lastChanged: "Password last changed {date}.",
      changed: "Password changed.",
      current: "Current password",
      new: "New password",
      strength: "Strength: {level}",
      strengths: {
        veryWeak: "Very weak",
        weak: "Weak",
        fair: "Fair",
        good: "Good",
        strong: "Strong",
        veryStrong: "Very strong",
      },
      minLength: "At least 8 characters.",
      confirm: "Confirm new password",
      saving: "Saving",
      submit: "Change password",
    },
    account: {
      saved: "Profile saved.",
      firstName: "First name",
      lastName: "Last name",
      email: "Email",
      phone: "Phone",
      saving: "Saving",
      save: "Save",
      cancel: "Cancel",
      signingOutLabel: "Signing out",
      signingOutText: "Ends this session on this device. Your settings and your account stay exactly as they are.",
      loggingOut: "Logging out",
      logOut: "Log out",
      dangerLabel: "Danger zone",
      dangerText: "Deactivating your account signs you out and disables sign-in until it is reactivated.",
      deactivate: "Deactivate account",
      confirmText: "Enter your password to confirm. This signs you out immediately.",
      password: "Password",
      deactivating: "Deactivating",
      wrongPassword: "Incorrect password.",
    },
  },
};

export default en;
