// Copy and data for the T-Levels at Amazon page. Same idea as aboutContent.js:
// the wording lives here, the components stay about behaviour.
//
// Everything below comes from Amazon's own T Level Placements page or the
// Department for Education employer case study on Amazon, both listed in
// AMAZON_SOURCES. Nothing here is invented. If a claim cannot be traced to one
// of those two, it should not go on this page.

/** The opening facts about the placement itself. */
export const PLACEMENT_SHAPE = [
  {
    title: "Nine weeks, embedded",
    text: "You join a team for a nine week placement. Amazon's T Level lead describes students as completely embedded: you learn the tools, you understand how the place works, and you contribute.",
  },
  {
    title: "Fifteen day stints in the skills hubs",
    text: "Part of the programme runs from Amazon's skills hubs, in blocks of fifteen days, rather than all of it sitting at one desk.",
  },
  {
    title: "Group projects for good causes",
    text: "Alongside team work there are group projects built around charitable causes, so you work with the other students too.",
  },
  {
    title: "Individual team challenges",
    text: "You also take on challenges set by the team you are placed with, which is where the technical side of your T Level gets used.",
  },
];

/** The support wrapped around each student. */
export const SUPPORT = [
  {
    title: "A buddy",
    text: "Someone close to your level to ask the small questions, the ones that feel too obvious to raise in a meeting.",
  },
  {
    title: "A mentor",
    text: "Someone more senior who guides the work and helps you see how the role fits the wider business.",
  },
  {
    title: "A placement manager",
    text: "The person responsible for the placement itself, who keeps it on track with your school or college.",
  },
];

/** How a student actually ends up on one. */
export const ROUTE_IN = [
  {
    number: "01",
    title: "Be on a T Level",
    text: "The programme is for 16 to 18 year old T Level students. You need to be enrolled on the course first, so the school or college comes before the placement.",
  },
  {
    number: "02",
    title: "Your provider makes contact",
    text: "Placements are arranged between Amazon and your school or college, not applied for directly. Amazon asks interested schools and colleges to get in touch.",
  },
  {
    number: "03",
    title: "Register your interest here",
    text: "Tell us which pathway you are interested in and we will pass it to the Amazon Emerging Talent team. It is not an application, it is how they know you exist.",
  },
];

/**
 * How the programme has grown, from the Department for Education case study.
 * Each figure is tied to its year on purpose, so the page never reads as a
 * claim about right now.
 */
export const GROWTH = [
  { year: "2023", value: "6", caption: "students on placement in the first year" },
  { year: "2024", value: "24", caption: "students, four times the first year" },
  { year: "2025", value: "50", caption: "placements Amazon planned to offer" },
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
