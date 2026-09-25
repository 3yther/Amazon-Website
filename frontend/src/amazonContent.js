// Copy and data for the T-Levels at Amazon page. Same idea as aboutContent.js:
// the wording lives here, the components stay about behaviour.
//
// Everything below comes from Amazon's own T Level Placements page or the
// Department for Education employer case study on Amazon, both listed in
// AMAZON_SOURCES. Nothing here is invented. If a claim cannot be traced to one
// of those two, it should not go on this page.

/** The opening facts about the placement itself. */
export const PLACEMENT_SHAPE = [
  { icon: "clock", title: "Nine weeks", text: "You join a team, learn the tools and do real work." },
  {
    icon: "building",
    title: "Skills hubs",
    text: "Part of it runs in Amazon's skills hubs, in blocks of 15 days.",
  },
  { icon: "heart", title: "Group projects", text: "Work with other students on projects for charities." },
  { icon: "target", title: "Team challenges", text: "Tasks set by your team that use your T-Level skills." },
];

/** The support wrapped around each student. */
export const SUPPORT = [
  { icon: "chat", title: "A buddy", text: "For the small questions." },
  { icon: "person", title: "A mentor", text: "Guides your work and shows you the bigger picture." },
  {
    icon: "clipboard",
    title: "A placement manager",
    text: "Keeps the placement on track with your school or college.",
  },
];

/** How a student actually ends up on one. */
export const ROUTE_IN = [
  {
    number: "01",
    icon: "book",
    title: "Start a T-Level",
    text: "For 16 to 18 year olds already on a T-Level course.",
  },
  {
    number: "02",
    icon: "phone",
    title: "Your college gets in touch",
    text: "Amazon arranges placements with schools and colleges, not with students directly.",
  },
  {
    number: "03",
    icon: "pen",
    title: "Register your interest",
    text: "Tell us your pathway and we pass it to Amazon. It is not an application.",
  },
];

/**
 * How the programme has grown, from the Department for Education case study.
 * Each figure is tied to its year on purpose, so the page never reads as a
 * claim about right now. The bars on the page are drawn from `value`.
 */
export const GROWTH = [
  { year: "2023", value: 6, caption: "students in the first year" },
  { year: "2024", value: 24, caption: "students, four times as many" },
  { year: "2025", value: 50, caption: "placements planned" },
];

/** Where the facts on this page came from. */
export const AMAZON_SOURCES = [
  {
    title: "T Level Placements, About Amazon UK",
    url: "https://www.aboutamazon.co.uk/amazon-for-schools/online-hub-offerings/t-level-placements",
  },
  {
    title: "Amazon: growing a successful industry placement programme, Department for Education",
    url: "https://employers.tlevels.gov.uk/hc/en-gb/articles/22282093518226-Amazon-Growing-a-successful-industry-placement-programme",
  },
];
