// Copy and data for the About T-Level page. Kept out of the components so the
// wording can be edited without touching any logic (same idea as labels.js).
//
// Every figure below was checked against a primary source in September 2026.
// The sources are listed in SOURCES at the bottom of this file and shown at
// the foot of the page, so a marker can follow any number back to gov.uk,
// UCAS or Amazon. Re-check before submission: the placement minimum, the
// UCAS points, the bursary amount and the number of T-Level subjects are the
// ones most likely to move.

/** The three steps from GCSEs to an Amazon placement (the design doc's numbered route). */
export const ROUTE_STEPS = [
  {
    number: "01",
    icon: "signpost",
    title: "Pick a subject",
    text: "Around 20 to choose from. Two years, full time, at a school or college.",
  },
  {
    number: "02",
    icon: "book",
    title: "Learn it",
    text: "1,100 to 1,300 hours of lessons: the basics of your industry, then a specialism.",
  },
  {
    number: "03",
    icon: "briefcase",
    title: "Work",
    text: "At least 315 hours with an employer, about 45 days. This is where Amazon comes in.",
  },
];

/**
 * The split between learning and working, drawn as a bar on the About page.
 * About 80 percent in lessons, about 20 percent on placement (DfE guidance).
 */
export const TIME_SPLIT = [
  { icon: "book", share: 80, label: "Learning", detail: "about 80% of the course" },
  { icon: "briefcase", share: 20, label: "Placement", detail: "at least 315 hours" },
];

/** How the industry placement actually runs, from the DfE provider guidance. */
export const PLACEMENT_FACTS = [
  {
    icon: "tools",
    title: "Real work",
    text: "Tasks the employer needs doing. Not shadowing.",
  },
  {
    icon: "calendar",
    title: "Your timetable",
    text: "A day or two a week, a block of weeks, or a mix.",
  },
  {
    icon: "building",
    title: "One or two employers",
    text: "Usually one. No more than two without a good reason.",
  },
  {
    icon: "coin",
    title: "Pay varies",
    text: "Not guaranteed. Some employers pay or cover travel. Ask first.",
  },
];

/** How a T-Level is graded, and what each grade is worth in UCAS points. */
export const GRADES = [
  { grade: "Distinction*", points: "168" },
  { grade: "Distinction", points: "144" },
  { grade: "Merit", points: "120" },
  { grade: "Pass, with C or above in the core", points: "96" },
  { grade: "Pass, with D or E in the core", points: "72" },
];

/** Who a T-Level suits. Honest about the trade-offs. */
export const AUDIENCE_POINTS = [
  { icon: "person", text: "You are 16 to 19 and finishing your GCSEs, or changing course." },
  { icon: "target", text: "You know roughly which industry you want to work in." },
  { icon: "tools", text: "You learn best by doing." },
  { icon: "gradcap", text: "You want a qualification employers trust, and university still open." },
  {
    icon: "split",
    text: "You are happy to focus on one area for two years. Want to keep lots of subjects? A levels may suit you better.",
  },
];

/** Why people take one. Short, concrete, no filler. */
export const BENEFITS = [
  { icon: "briefcase", title: "Real work", text: "At least 315 hours inside a working team." },
  {
    icon: "gradcap",
    title: "Same size as three A levels",
    text: "It carries UCAS points, so university stays open.",
  },
  { icon: "building", title: "Built with employers", text: "Employers helped write what you learn." },
  {
    icon: "arrows",
    title: "Three ways on",
    text: "A skilled job, a higher apprenticeship, or university.",
  },
];

/** What it costs, and the help that exists (16 to 19 Bursary Fund guide). */
export const COST_POINTS = [
  { icon: "tag", title: "The course is free", text: "If you are 16 to 18 and in full-time education." },
  {
    icon: "bus",
    title: "Help with costs",
    text: "The 16 to 19 Bursary can cover travel, books, equipment and specialist clothing.",
  },
  {
    icon: "coin",
    title: "Up to £1,200 a year",
    text: "For students in care, care leavers and some students on certain benefits.",
  },
  {
    icon: "question",
    title: "Ask your college",
    text: "Anyone else can ask for a discretionary bursary. It cannot cover rent or bills.",
  },
];

/**
 * The five pathways Amazon offers, matching the Pathway records in
 * backend/content/fixtures/pathways.json so the names and slugs stay the same
 * across the site.
 *
 * amazonStatus says what Amazon has publicly confirmed for that pathway.
 * TEAM NOTE: the Finance T-Level takes its last enrolments in September 2026.
 * Accounting carries on, so the finance pathway is not dead, but the copy
 * should not promise a Finance T-Level to anyone starting after that.
 * TEAM NOTE: Finance is null on purpose. Amazon's own page names digital,
 * creative, business and engineering, and does not mention finance. Ask the
 * Emerging Talent contact before we claim a finance placement exists.
 */
export const PATHWAYS = [
  {
    slug: "digital",
    name: "Digital",
    summary: "Build, run and support technology.",
    tLevels: ["Digital Data Analytics", "Digital Software Development", "Digital Support and Security"],
    placement:
      "You sit with a technical team and work on live tasks: writing and reviewing code, testing, fixing bugs, or keeping systems and users running.",
    suits: "People who like solving a problem and seeing it work straight away.",
    amazonStatus: "Where Amazon's T-Level programme started.",
  },
  {
    slug: "business",
    name: "Business",
    summary: "Keep teams and operations running.",
    tLevels: ["Management and Administration"],
    placement:
      "You support the day to day running of a team: planning, coordinating, handling data and reporting, and keeping processes on track.",
    suits: "People who are organised and like making things run properly.",
    amazonStatus: "Named by Amazon as a pathway it is expanding into.",
  },
  {
    slug: "media",
    name: "Media",
    summary: "Plan, make and publish content.",
    tLevels: ["Media, Broadcast and Production"],
    placement:
      "You help plan and produce content, from filming and editing to publishing, and see how a piece goes from idea to audience.",
    suits: "People who want to make things other people will watch or read.",
    amazonStatus: "Named by Amazon as a creative pathway it is expanding into.",
  },
  {
    slug: "finance",
    name: "Finance",
    summary: "Work with the numbers behind decisions.",
    tLevels: ["Accounting", "Finance, last enrolments September 2026"],
    placement:
      "You work with real figures: tracking spend, checking records, and helping put together the reports a team makes decisions from.",
    suits: "People who are comfortable with numbers and spotting what is off.",
    amazonStatus: null,
  },
  {
    slug: "engineering",
    name: "Engineering",
    summary: "Design, build and maintain systems.",
    tLevels: [
      "Design and Development for Engineering and Manufacturing",
      "Maintenance, Installation and Repair for Engineering and Manufacturing",
      "Engineering, Manufacturing, Processing and Control",
    ],
    placement:
      "You work alongside engineers on equipment and systems: setting up, maintaining, testing and improving how they run.",
    suits: "People who want to understand how a physical thing works, then make it work better.",
    amazonStatus: "Named by Amazon as a pathway it is expanding into.",
  },
];

/** Expandable FAQ. Answers stay short, one idea each. */
export const FAQS = [
  {
    id: "apprenticeship",
    question: "Is a T-Level the same as an apprenticeship?",
    answer:
      "No, they are the other way round. An apprenticeship is mostly paid work with some study. A T-Level is mostly study, about 80 percent, with an industry placement of at least 315 hours making up the rest.",
  },
  {
    id: "entry",
    question: "What GCSEs do I need?",
    answer:
      "Entry requirements are set by each school or college, not nationally. Around four or five GCSEs at grade 4 or above, usually including English and maths, is common. Check with the provider you want to go to.",
  },
  {
    id: "choice",
    question: "Which T-Level subjects can I choose from?",
    answer:
      "Around 20, across routes including digital, engineering, construction, health, science, legal and accounting, media, marketing, agriculture, animal care, education, and craft and design. Sport and Social Care arrive in September 2028. The Finance T-Level takes its last enrolments in September 2026, so Accounting is the one continuing.",
  },
  {
    id: "assessed",
    question: "How am I assessed?",
    answer:
      "Two parts. The core is graded A star to E and covers the knowledge for your industry. The occupational specialism is graded pass, merit or distinction and is the practical side. Both show on your certificate, along with one overall grade.",
  },
  {
    id: "university",
    question: "Can I still go to university?",
    answer:
      "Yes. A Distinction star is worth 168 UCAS points, a Distinction 144, a Merit 120 and a Pass 72 or 96 depending on your core grade. Not every university uses UCAS points though, so check the entry requirements of the course you want.",
  },
  {
    id: "fail",
    question: "What if I do not pass everything?",
    answer:
      "You get a T-Level statement of achievement instead of the full certificate. It lists the parts you did complete, so the work is not lost.",
  },
  {
    id: "placement",
    question: "How long is the industry placement?",
    answer:
      "At least 315 hours, roughly 45 days. It can be one or two days a week, a full-time block, or a mix. Amazon runs its placements as a nine week block.",
  },
  {
    id: "paid",
    question: "Do I get paid on placement?",
    answer:
      "There is no legal requirement for a placement to be paid. Some employers pay, some cover travel or meals, some do neither. Ask your provider what the arrangement is before you start.",
  },
  {
    id: "money",
    question: "Can I get help with travel or equipment?",
    answer:
      "Yes, through the 16 to 19 Bursary Fund. It can cover travel, books, equipment and specialist clothing. Apply through your school or college.",
  },
  {
    id: "not-ready",
    question: "What if I am not ready for a T-Level yet?",
    answer:
      "There is a T-Level Foundation Year, a one year level 2 course that builds up your English, maths, digital skills and work experience first, then moves you onto the T-Level.",
  },
  {
    id: "alongside",
    question: "Can I take other qualifications alongside it?",
    answer:
      "A T-Level is a full time programme broadly the size of three A levels, so it is not usually combined with much else. Some providers allow one extra qualification. Ask yours.",
  },
];

/**
 * The quiz. Each option carries a score, and the scores are added up at the
 * end to pick a result band. It is a guide to think with, not advice, and the
 * result copy says so.
 */
export const QUIZ_QUESTIONS = [
  {
    id: "learning",
    question: "How do you learn best?",
    options: [
      { value: "doing", label: "By doing the thing, then asking why", score: 2 },
      { value: "mix", label: "A bit of both", score: 1 },
      { value: "reading", label: "By reading, writing it up and revising", score: 0 },
    ],
  },
  {
    id: "direction",
    question: "Do you know what kind of work you want?",
    options: [
      { value: "clear", label: "I have a fair idea of the industry", score: 2 },
      { value: "rough", label: "A rough area, not the job", score: 1 },
      { value: "open", label: "No idea yet", score: 0 },
    ],
  },
  {
    id: "placement",
    question: "How do you feel about 45 days in a real workplace?",
    options: [
      { value: "keen", label: "That is the part I want", score: 2 },
      { value: "nervous", label: "Nervous, but up for it", score: 1 },
      { value: "rather-not", label: "I would rather stay in the classroom", score: 0 },
    ],
  },
  {
    id: "assessment",
    question: "Which way of being assessed suits you?",
    options: [
      { value: "project", label: "Exams plus a graded practical specialism", score: 2 },
      { value: "mixed", label: "I do not mind either way", score: 1 },
      { value: "exams", label: "Written exams only", score: 0 },
    ],
  },
  {
    id: "next",
    question: "What do you want to do after the course?",
    options: [
      { value: "work", label: "Skilled work or a degree apprenticeship", score: 2 },
      { value: "both", label: "Keep work and university both open", score: 1 },
      { value: "degree", label: "A degree in something unrelated to this area", score: 0 },
    ],
  },
  {
    id: "commit",
    question: "Are you ready to commit to one subject area for two years?",
    options: [
      { value: "yes", label: "Yes", score: 2 },
      { value: "think-so", label: "I think so", score: 1 },
      { value: "no", label: "I want to keep my options wide", score: 0 },
    ],
  },
];

/** Result bands, checked from the top down against the total score. */
export const QUIZ_RESULTS = [
  {
    minScore: 9,
    heading: "A T-Level looks like a strong fit",
    text: "You want hands-on learning, real workplace time and a clear route into an industry. That is exactly what a T-Level is built for. Next step: look at which of the five pathways fits you, then register your interest with Amazon.",
  },
  {
    minScore: 5,
    heading: "Worth a proper look",
    text: "Some of this suits you and some of it is still open, which is normal at this stage. Read through the pathways and the questions below, and talk it through with a teacher or careers adviser before you decide.",
  },
  {
    minScore: 0,
    heading: "Another route may suit you better",
    text: "From your answers you lean towards classroom learning and keeping several subjects open, which A levels do well. That is a fine answer. If the placement is the part that appeals, it is still worth reading the pathways below.",
  },
];

/**
 * Where the facts on this page came from. Shown at the foot of the page, and
 * doubles as the bibliography entry for the Task 1 write-up.
 */
export const SOURCES = [
  {
    title: "Introduction of T Levels, Department for Education",
    url: "https://www.gov.uk/government/publications/introduction-of-t-levels/introduction-of-t-levels",
  },
  {
    title: "T Level industry placements: guidance for education providers, Department for Education",
    url: "https://www.gov.uk/government/publications/t-level-industry-placements-guidance-for-providers/t-level-industry-placements-guidance-for-education-providers",
  },
  {
    title: "UCAS Tariff points allocated for T Levels, UCAS",
    url: "https://www.ucas.com/corporate/news-and-key-documents/news/ucas-tariff-points-allocated-t-levels",
  },
  {
    title: "16 to 19 Bursary Fund guide, Department for Education",
    url: "https://www.gov.uk/government/publications/16-to-19-bursary-fund-guidance/16-to-19-bursary-fund-guide-2025-to-2026",
  },
  {
    title: "T Level Placements, About Amazon UK",
    url: "https://www.aboutamazon.co.uk/amazon-for-schools/online-hub-offerings/t-level-placements",
  },
  {
    title: "Amazon: growing a successful industry placement programme, Department for Education",
    url: "https://employers.tlevels.gov.uk/hc/en-gb/articles/22282093518226-Amazon-Growing-a-successful-industry-placement-programme",
  },
];
