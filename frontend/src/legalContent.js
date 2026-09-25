// Words for the Terms, Privacy, Cookie and Data Rights pages.
// TEAM: these are drafts, not legal advice. Get them checked before going live,
// and fill in the TODOs (how long data is kept).
// Each page is a list of sections: { heading, paragraphs, points }.

const DRAFT_NOTE =
  "T-SMILE is a student project, made for the Amazon Emerging Talent Digital T-Level programme. It is not an official Amazon website.";

export const TERMS = {
  label: "Legal",
  title: "Terms of Service",
  updated: "September 2026",
  intro: DRAFT_NOTE,
  sections: [
    {
      heading: "Using the site",
      paragraphs: [
        "Anyone can read every page, open every resource, take the quizzes and talk to Smiley without an account. A free account lets you ask and answer in the Community.",
        "You need to be 16 or over to create an account.",
      ],
    },
    {
      heading: "Your account",
      points: [
        "Keep your password to yourself.",
        "Give true details when you sign up or register your interest.",
        "You can switch your account off at any time from your Profile.",
      ],
    },
    {
      heading: "Be kind",
      points: [
        "Do not post anything rude, hurtful or illegal in forms, in the chat or in the Community.",
        "Do not try to break the site or get at other people's data.",
        "We may switch off accounts that break these rules.",
      ],
    },
    {
      heading: "Our information",
      paragraphs: [
        "We check facts against gov.uk, UCAS and Amazon, and list our sources on each page. Things change, so always check with your school or college before you decide.",
        "Smiley, the assistant, can make mistakes. It is a helper, not advice.",
      ],
    },
    {
      heading: "Amazon's name",
      paragraphs: [
        "\"Amazon\" and its logo belong to Amazon.com, Inc. or its affiliates. We use them to describe Amazon's T-Level placements.",
      ],
    },
  ],
};

export const PRIVACY = {
  label: "Legal",
  title: "Privacy Policy",
  updated: "September 2026",
  intro: DRAFT_NOTE,
  sections: [
    {
      heading: "Who looks after your data",
      paragraphs: [
        "The T-SMILE student team. You can reach us through the Contact us page.",
      ],
    },
    {
      heading: "What we collect, and why",
      points: [
        "Register interest: your name, email, whether you are a student, parent or teacher, a pathway and an optional message. So the Amazon Emerging Talent team can see you are interested and get in touch.",
        "An account: a username, a password (stored scrambled, never readable), your role and pathway. Later, if you add them, your name, email and phone number. So you can sign in, ask and answer in the Community, and keep your settings on any device.",
        "Accessibility settings: text size, contrast, theme and similar choices. So the site looks the way you set it.",
        "Chat with Smiley: questions Smiley has to look up, and its replies. So Smiley can follow the conversation. Questions it answers by itself stay in your browser.",
        "Community posts: the questions and answers you post, shown with your username. So other visitors can read them and reply.",
        "Feedback and contact messages: your message, and your email if you give it. So we can fix things and reply.",
      ],
    },
    {
      heading: "Who sees it",
      points: [
        "The T-SMILE team, and Amazon Emerging Talent staff for interest forms.",
        "Anthropic, the company whose AI writes some of Smiley's replies. Questions Smiley cannot answer by itself are sent to them to get an answer.",
        "The company hosting the site (Railway for the preview, Amazon Web Services later).",
        "Nobody else. We do not sell data or use it for adverts.",
      ],
    },
    {
      heading: "How long we keep it",
      paragraphs: [
        // TODO (team): set a real time for each kind of data before launch.
        "We have not set this yet, and will before the site goes live. Until then, ask us and we will delete your data.",
      ],
    },
    {
      heading: "Under 18",
      paragraphs: [
        "Many of our visitors are under 18, so we only ask for what we need. We never ask for your address, date of birth or school on a form.",
      ],
    },
    {
      heading: "Your rights",
      paragraphs: [
        "You can see, correct or delete your data, and more. The Data Rights page explains how.",
      ],
    },
  ],
};

export const COOKIES = {
  label: "Legal",
  title: "Cookie Policy",
  updated: "September 2026",
  intro: "We only use cookies the site needs to work. No tracking, no adverts, no analytics.",
  sections: [
    {
      heading: "Cookies",
      points: [
        "sessionid: keeps you signed in, and lets Smiley remember your chat. Lasts two weeks, or until you sign out.",
        "csrftoken: stops other websites sending forms as you. Lasts up to a year.",
      ],
      paragraphs: [
        "The site cannot work safely without these, so the law does not ask us for a cookie banner.",
      ],
    },
    {
      heading: "Saved in your browser",
      paragraphs: ["These are not cookies, and never leave your device."],
      points: [
        "Your accessibility settings and the language you chose, so they stay when you come back.",
        "Whether Smiley has already said hello, until you close the tab.",
      ],
    },
    {
      heading: "Clearing them",
      paragraphs: [
        "You can delete cookies and saved data in your browser settings. You will be signed out, and your settings will go back to normal.",
      ],
    },
  ],
};

export const DATA_RIGHTS = {
  label: "Legal",
  title: "GDPR and your data rights",
  updated: "September 2026",
  intro: "UK law (UK GDPR) gives you rights over your data. They are free to use.",
  sections: [
    {
      heading: "Your rights",
      points: [
        "See it: ask for a copy of the data we hold about you.",
        "Fix it: ask us to correct anything wrong.",
        "Delete it: ask us to remove your data.",
        "Limit it: ask us to stop using it for a while.",
        "Take it: ask for your data in a file you can use elsewhere.",
        "Object: tell us to stop using it.",
      ],
    },
    {
      heading: "How to ask",
      paragraphs: [
        "Use the Contact us form and say which right you want to use. We may ask you to confirm it is you. We will reply within one month.",
        "You can also correct your details, or switch your account off, yourself from your Profile.",
      ],
    },
    {
      heading: "Not happy?",
      paragraphs: [
        "You can complain to the Information Commissioner's Office (ICO), which looks after data protection in the UK.",
      ],
      link: { href: "https://ico.org.uk/make-a-complaint/", text: "Make a complaint to the ICO" },
    },
  ],
};
