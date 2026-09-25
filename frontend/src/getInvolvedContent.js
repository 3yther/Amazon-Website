// Links for the Get involved page. The words are in i18n/messages under
// getInvolvedPage, keyed by `id`. `to` is a page on this site, `href` is another website.

export const AUDIENCES = [
  {
    id: "students",
    actions: [
      { id: "subjects", to: "/t-levels", icon: "book" },
      { id: "nearYou", to: "/t-level-near-you", icon: "mappin" },
      { id: "interest", to: "/register-interest", icon: "pen" },
      { id: "quiz", to: "/quiz", icon: "question" },
    ],
  },
  {
    id: "parents",
    actions: [
      { id: "about", to: "/about", icon: "info" },
      { id: "parentGuides", to: "/resources", icon: "folder" },
      { id: "bursary", href: "https://www.gov.uk/1619-bursary-fund", icon: "bus" },
    ],
  },
  {
    id: "teachers",
    actions: [
      {
        id: "amazon",
        href: "https://www.aboutamazon.co.uk/amazon-for-schools/online-hub-offerings/t-level-placements",
        icon: "building",
      },
      { id: "classPacks", to: "/resources", icon: "clipboard" },
      {
        id: "guidance",
        href: "https://www.gov.uk/government/publications/t-level-industry-placements-guidance-for-providers/t-level-industry-placements-guidance-for-education-providers",
        icon: "document",
      },
    ],
  },
];

// For everyone, at the bottom of the page.
export const FEEDBACK_ACTION = { id: "feedback", to: "/feedback", icon: "chat" };
