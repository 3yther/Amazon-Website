// Questions for the knowledge check at /quiz.
//
// This is a different quiz from the "Is a T Level right for me?" one on the
// About page. That one is a self assessment with no right answers, so there is
// nothing for the assistant to help with. This one has right answers and an
// explanation for each, which is what lets the assistant offer to go through a
// question somebody gets wrong.
//
// EVERY ANSWER HERE IS CHECKED AGAINST SOMETHING IN THIS REPO, and the source
// is written next to it. Nothing is written from memory, for the same reason
// the assistant is not allowed to make facts up: a quiz that teaches the wrong
// thing is worse than no quiz.
//
// TEAM: please add questions once the T Level copy lands on main. The obvious
// ones to add are the placement length, what OS and ESP stand for, and which
// T Levels Amazon takes students for. All four are content gaps at the moment
// (run `python manage.py check_chat_facts` in backend/), so they are left out
// here rather than guessed at.

export const KNOWLEDGE_QUESTIONS = [
  {
    id: "pathway-count",
    question: "How many T Level pathways does T-SMILE cover?",
    options: ["Three", "Four", "Five", "Eight"],
    correctAnswer: "Five",
    explanation:
      "Five: Digital, Business, Media, Finance and Engineering. Each one groups the " +
      "T Levels that lead to similar work.",
    // Source: backend/content/fixtures/pathways.json
  },
  {
    id: "digital-pathway",
    question: "Which pathway covers Digital Production, Design and Development?",
    options: ["Digital", "Business", "Engineering", "Media"],
    correctAnswer: "Digital",
    explanation:
      "The Digital pathway. It also covers Digital Support and Services, and Digital " +
      "Business Services.",
    // Source: the Digital pathway description in pathways.json
  },
  {
    id: "business-pathway",
    question: "Which pathway covers the Management and Administration T Level?",
    options: ["Business", "Finance", "Media", "Digital"],
    correctAnswer: "Business",
    explanation:
      "Business. Its summary on the site is keeping teams and operations running.",
    // Source: the Business pathway description in pathways.json
  },
  {
    id: "engineering-pathway",
    question: "Which pathway covers the Engineering and Manufacturing T Levels?",
    options: ["Engineering", "Digital", "Finance", "Business"],
    correctAnswer: "Engineering",
    explanation: "Engineering: designing, building and maintaining systems.",
    // Source: the Engineering pathway description in pathways.json
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
