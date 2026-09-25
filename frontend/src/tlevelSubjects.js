// Every T-Level subject, grouped by route, from tlevels.gov.uk/students/subjects
// (checked 24 September 2026). `page` is the subject's page on tlevels.gov.uk.
// Social Care and Sport start in 2028 so they have `comingIn` instead.
// `pathway` links a route to one of our five pathways.

const GOV_SUBJECTS = "https://www.tlevels.gov.uk/students/subjects/";

export const T_LEVEL_ROUTES = [
  {
    name: "Agriculture, Environmental and Animal Care",
    subjects: [
      { name: "Agriculture, Land Management and Production", page: "agriculture-land-management-production" },
      { name: "Animal Care and Management", page: "animal-care-management" },
    ],
  },
  {
    name: "Business and Administration",
    pathway: "business",
    subjects: [{ name: "Management and Administration", page: "management-administration" }],
  },
  {
    name: "Construction",
    subjects: [
      { name: "Building Services Engineering for Construction", page: "building-services-engineering" },
      { name: "Design, Surveying and Planning for Construction", page: "design-surveying-planning" },
    ],
  },
  {
    name: "Creative and Design",
    pathway: "media",
    subjects: [
      { name: "Craft and Design", page: "craft-design" },
      { name: "Media, Broadcast and Production", page: "media-broadcast-production" },
    ],
  },
  {
    name: "Digital",
    pathway: "digital",
    subjects: [
      { name: "Digital Data Analytics", page: "digital-data-analytics" },
      { name: "Digital Software Development", page: "digital-software-development" },
      { name: "Digital Support and Security", page: "digital-support-security" },
    ],
  },
  {
    name: "Education and Early Years",
    subjects: [{ name: "Education and Early Years", page: "education" }],
  },
  {
    name: "Engineering and Manufacturing",
    pathway: "engineering",
    subjects: [
      {
        name: "Design and Development for Engineering and Manufacturing",
        page: "design-development-engineering",
      },
      {
        name: "Maintenance, Installation and Repair for Engineering and Manufacturing",
        page: "maintenance-installation-repair",
      },
      {
        name: "Engineering, Manufacturing, Processing and Control",
        page: "engineering-manufacturing-processing-control",
      },
    ],
  },
  {
    name: "Health and Science",
    subjects: [
      { name: "Health", page: "health" },
      { name: "Science", page: "science" },
      { name: "Social Care", comingIn: "September 2028" },
    ],
  },
  {
    name: "Legal, Finance and Accounting",
    pathway: "finance",
    subjects: [
      { name: "Accounting", page: "accounting" },
      { name: "Finance", page: "finance", note: "Last enrolments September 2026" },
      { name: "Legal Services", page: "legal-services" },
    ],
  },
  {
    name: "Sales, Marketing and Procurement",
    subjects: [{ name: "Marketing", page: "marketing" }],
  },
  {
    name: "Sport",
    subjects: [{ name: "Sport", comingIn: "September 2028" }],
  },
];

/** The full address of a subject's page on tlevels.gov.uk. */
export function subjectPage(subject) {
  return GOV_SUBJECTS + subject.page;
}

/** The names of the subjects running today (20), for the homepage. */
export const T_LEVEL_SUBJECTS = T_LEVEL_ROUTES.flatMap((route) =>
  route.subjects.filter((subject) => !subject.comingIn).map((subject) => subject.name),
);
