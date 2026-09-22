// Copy and data for the Help page. Everything here points at a real service or
// a page that exists on this site. Nothing promises a feature we have not
// built, and no contact details are invented.

/** Free, national services a student or parent can use today. */
export const SERVICES = [
  {
    title: "Find a T Level near you",
    text: "The official finder takes a postcode or town and a subject, and lists the schools and colleges running it.",
    linkText: "Find a T Level on tlevels.gov.uk",
    href: "https://www.tlevels.gov.uk/students/find",
  },
  {
    title: "Free careers advice",
    text: "The National Careers Service is free and impartial, and open to anyone aged 13 and over. You can call 0800 100 900 or use their webchat.",
    linkText: "National Careers Service",
    href: "https://nationalcareers.service.gov.uk/",
  },
  {
    title: "Help with travel and equipment",
    text: "The 16 to 19 Bursary Fund can cover travel, books, equipment and specialist clothing. You apply through your school or college, not through this site.",
    linkText: "16 to 19 Bursary Fund guidance",
    href: "https://www.gov.uk/government/publications/16-to-19-bursary-fund-guidance/16-to-19-bursary-fund-guide-2025-to-2026",
  },
  {
    title: "The rules on industry placements",
    text: "If you want to know exactly what a placement has to include, the Department for Education guidance is the source everything else is based on.",
    linkText: "Industry placement guidance",
    href: "https://www.gov.uk/government/publications/t-level-industry-placements-guidance-for-providers/t-level-industry-placements-guidance-for-education-providers",
  },
];

/** Questions worth asking before you pick a provider. */
export const PROVIDER_QUESTIONS = [
  "Which T Levels do you actually run, and which specialisms within them?",
  "Do you find the industry placement for me, or am I expected to find it?",
  "Which employers have taken your students on placement before?",
  "How is the placement arranged, as a block, one day a week, or a mix?",
  "What are your entry requirements, and do you accept a GCSE resit alongside?",
  "What support is there if I have additional needs or a disability?",
  "What happens if a placement falls through part way through the year?",
];

/** Where to go on this site, by what the person is trying to do. */
export const SITE_ROUTES = [
  { to: "/about", label: "I want to understand what a T Level is", detail: "About T-Levels" },
  {
    to: "/t-levels-at-amazon",
    label: "I want to know what an Amazon placement involves",
    detail: "T-Levels at Amazon",
  },
  { to: "/resources", label: "I am looking for guides and packs", detail: "T-Level Resources" },
  {
    to: "/register",
    label: "I want to register my interest with Amazon",
    detail: "Sign up",
  },
  { to: "/login", label: "I already have an account", detail: "Login" },
];
