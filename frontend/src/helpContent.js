// Copy and data for the Help page. Everything here points at a real service or
// a page that exists on this site. Nothing promises a feature we have not
// built, and no contact details are invented.

/** Free, national services a student or parent can use today. */
export const SERVICES = [
  {
    icon: "mappin",
    title: "Find a T Level near you",
    text: "Search by postcode and subject.",
    linkText: "Find a T Level on tlevels.gov.uk",
    href: "https://www.tlevels.gov.uk/students/find",
  },
  {
    icon: "chat",
    title: "Free careers advice",
    text: "Call 0800 100 900 or use webchat. For anyone aged 13 and over.",
    linkText: "National Careers Service",
    href: "https://nationalcareers.service.gov.uk/",
  },
  {
    icon: "bus",
    title: "Help with travel and kit",
    text: "The 16 to 19 Bursary. Apply through your school or college.",
    linkText: "16 to 19 Bursary Fund guidance",
    href: "https://www.gov.uk/government/publications/16-to-19-bursary-fund-guidance/16-to-19-bursary-fund-guide-2025-to-2026",
  },
  {
    icon: "document",
    title: "Placement rules",
    text: "The official guidance on what a placement must include.",
    linkText: "Industry placement guidance",
    href: "https://www.gov.uk/government/publications/t-level-industry-placements-guidance-for-providers/t-level-industry-placements-guidance-for-education-providers",
  },
];

/** Questions worth asking before you pick a provider. */
export const PROVIDER_QUESTIONS = [
  "Which T Levels and specialisms do you run?",
  "Do you find my placement, or do I?",
  "Which employers have taken your students?",
  "Is the placement a block, a day a week, or a mix?",
  "What are your entry requirements?",
  "What support is there if I have extra needs?",
];

/** Where to go on this site, by what the person is trying to do. */
export const SITE_ROUTES = [
  { to: "/about", icon: "info", label: "What is a T Level?", detail: "About T-Levels" },
  {
    to: "/t-levels-at-amazon",
    icon: "briefcase",
    label: "What is an Amazon placement like?",
    detail: "T-Levels at Amazon",
  },
  { to: "/resources", icon: "folder", label: "I want guides and packs", detail: "T-Level Resources" },
  {
    to: "/register-interest",
    icon: "pen",
    label: "I want to register my interest",
    detail: "Register interest",
  },
  { to: "/login", icon: "key", label: "I already have an account", detail: "Login" },
];
