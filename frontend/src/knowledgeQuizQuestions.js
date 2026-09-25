// Questions for the quiz at /quiz. Every answer has its source written next to it
// (mostly aboutContent.js), so the quiz never teaches something wrong.

export const KNOWLEDGE_QUESTIONS = [
  {
    id: "placement-length",
    question: "How long is a T-Level industry placement?",
    options: ["At least 315 hours, roughly 45 days", "Two weeks", "One full year", "There isn't one"],
    correctAnswer: "At least 315 hours, roughly 45 days",
    explanation:
      "At least 315 hours, roughly 45 days. Amazon runs its placements as a nine week block.",
    // Source: FAQS "How long is the industry placement?" in aboutContent.js
  },
  {
    id: "a-levels",
    question: "A T-Level is broadly the same size as how many A levels?",
    options: ["One", "Two", "Three", "Five"],
    correctAnswer: "Three",
    explanation:
      "Three. A T-Level carries UCAS points too, so university stays open to you.",
    // Source: BENEFITS "Counts like three A levels" in aboutContent.js
  },
  {
    id: "apprenticeship",
    question: "What is the main difference between a T-Level and an apprenticeship?",
    options: [
      "A T-Level is mostly study, an apprenticeship is mostly paid work",
      "They are the same thing",
      "A T-Level is mostly paid work, an apprenticeship is mostly study",
      "Only an apprenticeship includes time with an employer",
    ],
    correctAnswer: "A T-Level is mostly study, an apprenticeship is mostly paid work",
    explanation:
      "They are the other way round. A T-Level is about 80 percent study, with an industry " +
      "placement of at least 315 hours making up the rest.",
    // Source: FAQS "Is a T-Level the same as an apprenticeship?" in aboutContent.js
  },
  {
    id: "digital-pathway",
    question: "Which pathway covers the Digital Software Development T-Level?",
    options: ["Digital", "Business", "Engineering", "Media"],
    correctAnswer: "Digital",
    explanation:
      "Digital. It also covers Digital Data Analytics and Digital Support and Security.",
    // Source: PATHWAYS (digital) in aboutContent.js
  },
  {
    id: "business-pathway",
    question: "Which pathway covers the Management and Administration T-Level?",
    options: ["Business", "Finance", "Media", "Digital"],
    correctAnswer: "Business",
    explanation: "Business. Its summary on the site is keeping teams and operations running.",
    // Source: PATHWAYS (business) in aboutContent.js
  },
  {
    id: "amazon-support",
    question: "Who looks after you on an Amazon placement?",
    options: [
      "A buddy, a mentor and a placement manager",
      "Nobody, you work on your own",
      "Only your teacher",
      "A different manager every day",
    ],
    correctAnswer: "A buddy, a mentor and a placement manager",
    explanation:
      "Every student gets a buddy, a mentor and a placement manager, so there is always " +
      "someone to ask.",
    // Source: AMAZON_PROGRAMME "Three people looking after you" in aboutContent.js
  },
  {
    id: "account-needed",
    question: "Do you need an account to use the T-SMILE resources library?",
    options: [
      "No, but some resources need a free account to open",
      "Yes, for everything",
      "No, everything is open to everyone",
      "Only if you are a teacher",
    ],
    correctAnswer: "No, everything is open to everyone",
    explanation:
      "Anyone can browse the library and open everything in it. A free account is for asking " +
      "and answering in the Community, and keeping your settings.",
    // Source: backend/content/fixtures/resources.json, where every resource is
    // free, and the Community's sign-in rules in backend/community/views.py
  },
];
