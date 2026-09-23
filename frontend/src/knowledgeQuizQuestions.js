// Questions for the knowledge check at /quiz.
//
// This is a different quiz from the "Is a T Level right for me?" one on the
// About page. That one is a self assessment with no right answers, so there is
// nothing for Smiley to help with. This one has right answers and an
// explanation for each, which is what lets Smiley offer to go through a
// question somebody gets wrong.
//
// EVERY ANSWER HERE IS CHECKED AGAINST SOMETHING IN THIS REPO, and the source
// is written next to it. Most come from aboutContent.js, which the team
// checked against gov.uk, UCAS and Amazon. Nothing is written from memory, for
// the same reason Smiley is not allowed to make facts up: a quiz that teaches
// the wrong thing is worse than no quiz.
//
// Still left out on purpose: what OS and ESP stand for, and whether Amazon
// offers Finance placements. Those are content gaps (run
// `python manage.py check_chat_facts` in backend/), so they are not guessed.

export const KNOWLEDGE_QUESTIONS = [
  {
    id: "placement-length",
    question: "How long is a T Level industry placement?",
    options: ["At least 315 hours, roughly 45 days", "Two weeks", "One full year", "There isn't one"],
    correctAnswer: "At least 315 hours, roughly 45 days",
    explanation:
      "At least 315 hours, roughly 45 days. Amazon runs its placements as a nine week block.",
    // Source: FAQS "How long is the industry placement?" in aboutContent.js
  },
  {
    id: "a-levels",
    question: "A T Level is broadly the same size as how many A levels?",
    options: ["One", "Two", "Three", "Five"],
    correctAnswer: "Three",
    explanation:
      "Three. A T Level carries UCAS points too, so university stays open to you.",
    // Source: BENEFITS "Counts like three A levels" in aboutContent.js
  },
  {
    id: "apprenticeship",
    question: "What is the main difference between a T Level and an apprenticeship?",
    options: [
      "A T Level is mostly study, an apprenticeship is mostly paid work",
      "They are the same thing",
      "A T Level is mostly paid work, an apprenticeship is mostly study",
      "Only an apprenticeship includes time with an employer",
    ],
    correctAnswer: "A T Level is mostly study, an apprenticeship is mostly paid work",
    explanation:
      "They are the other way round. A T Level is about 80 percent study, with an industry " +
      "placement of at least 315 hours making up the rest.",
    // Source: FAQS "Is a T Level the same as an apprenticeship?" in aboutContent.js
  },
  {
    id: "digital-pathway",
    question: "Which pathway covers the Digital Software Development T Level?",
    options: ["Digital", "Business", "Engineering", "Media"],
    correctAnswer: "Digital",
    explanation:
      "Digital. It also covers Digital Data Analytics and Digital Support and Security.",
    // Source: PATHWAYS (digital) in aboutContent.js
  },
  {
    id: "business-pathway",
    question: "Which pathway covers the Management and Administration T Level?",
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
    correctAnswer: "No, but some resources need a free account to open",
    explanation:
      "Anyone can browse the library and see what is in it. Items marked sign-up need " +
      "a free account before you can open the file.",
    // Source: ContentItem.access_level in backend/content/models.py, and the
    // locked field in backend/content/serializers.py
  },
];
