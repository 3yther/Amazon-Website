// Words for the Get involved page. `to` is a page on this site, `href` is another website.

export const AUDIENCES = [
  {
    id: "students",
    heading: "Students",
    lead: "Aged 16 to 18, or finishing your GCSEs.",
    actions: [
      { to: "/t-levels", icon: "book", label: "See every T-Level subject", detail: "All T-Levels" },
      {
        to: "/t-level-near-you",
        icon: "mappin",
        label: "Find a school or college near you",
        detail: "Find T-Levels Near You",
      },
      {
        to: "/register-interest",
        icon: "pen",
        label: "Tell Amazon you want a placement",
        detail: "Register interest",
      },
      { to: "/quiz", icon: "question", label: "Test what you know", detail: "Quiz" },
    ],
  },
  {
    id: "parents",
    heading: "Parents and carers",
    lead: "Helping someone decide what comes after GCSEs.",
    actions: [
      { to: "/about", icon: "info", label: "What a T-Level is", detail: "About T-Level" },
      { to: "/resources", icon: "folder", label: "Guides written for parents", detail: "Resources" },
      {
        href: "https://www.gov.uk/1619-bursary-fund",
        icon: "bus",
        label: "Help with travel, books and kit",
        detail: "16 to 19 Bursary, gov.uk",
      },
    ],
  },
  {
    id: "teachers",
    heading: "Teachers and schools",
    lead: "Amazon arranges placements with schools and colleges, not with students directly.",
    actions: [
      {
        href: "https://www.aboutamazon.co.uk/amazon-for-schools/online-hub-offerings/t-level-placements",
        icon: "building",
        label: "Ask Amazon about placements for your students",
        detail: "About Amazon UK",
      },
      { to: "/resources", icon: "clipboard", label: "Class packs and teacher guides", detail: "Resources" },
      {
        href: "https://www.gov.uk/government/publications/t-level-industry-placements-guidance-for-providers/t-level-industry-placements-guidance-for-education-providers",
        icon: "document",
        label: "What a placement must include",
        detail: "Placement guidance, gov.uk",
      },
    ],
  },
];

/** For everyone, at the foot of the page. */
export const FEEDBACK_ACTION = {
  to: "/feedback",
  icon: "chat",
  label: "Tell us what would make this site better",
  detail: "Feedback",
};
