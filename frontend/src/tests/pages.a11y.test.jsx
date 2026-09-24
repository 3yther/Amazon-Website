import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import About from "../pages/About.jsx";
import AccessibilityHelp from "../pages/AccessibilityHelp.jsx";
import Contact from "../pages/Contact.jsx";
import Cookies from "../pages/Cookies.jsx";
import DataRights from "../pages/DataRights.jsx";
import Faqs from "../pages/Faqs.jsx";
import GetInvolved from "../pages/GetInvolved.jsx";
import Help from "../pages/Help.jsx";
import TLevels from "../pages/TLevels.jsx";
import NearYou from "../pages/NearYou.jsx";
import Pathways from "../pages/Pathways.jsx";
import Privacy from "../pages/Privacy.jsx";
import RegisterInterest from "../pages/RegisterInterest.jsx";
import ReportIssue from "../pages/ReportIssue.jsx";
import Terms from "../pages/Terms.jsx";
import TLevelsAtAmazon from "../pages/TLevelsAtAmazon.jsx";
import { FAQS } from "../aboutContent.js";
import { expectNoAxeViolations } from "./axe.js";

// Automated WCAG 2.2 AA checks on the three information pages, the same
// engine Lighthouse uses. Each page is wrapped in <main>, the way App.jsx
// shows it, so landmarks are checked as a visitor meets them.
function renderPage(Page) {
  return render(
    <MemoryRouter>
      <main>
        <Page />
      </main>
    </MemoryRouter>,
  );
}

const PAGES = [
  ["About", About],
  ["T-Levels at Amazon", TLevelsAtAmazon],
  ["Help", Help],
  ["Register interest", RegisterInterest],
  ["Learning Pathways", Pathways],
  ["FAQs", Faqs],
  ["Contact us", Contact],
  ["Report an issue", ReportIssue],
  ["Accessibility help", AccessibilityHelp],
  ["Find T-Levels Near You", NearYou],
  ["All T-Levels", TLevels],
  ["Get involved", GetInvolved],
  ["Terms of Service", Terms],
  ["Privacy Policy", Privacy],
  ["Cookie Policy", Cookies],
  ["GDPR and data rights", DataRights],
];

// One page here (Find T-Levels Near You) asks the API for the pathway filter as
// soon as it renders. Answering that here keeps every page in this file
// offline and the same on every run; the page's own behaviour is tested in
// NearYou.test.jsx.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url) => {
      const address = new URL(url, "http://localhost");
      if (address.pathname === "/api/pathways/") {
        return Response.json([{ name: "Digital", slug: "digital", summary: "s", description: "d" }]);
      }
      return Response.json({}, { status: 404 });
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("Accessibility of the information pages", () => {
  it.each(PAGES)("%s has no WCAG 2.2 AA problems axe can find", async (_name, Page) => {
    const { container } = renderPage(Page);
    await expectNoAxeViolations(container);
  });

  it.each(PAGES)("%s has exactly one h1", (_name, Page) => {
    renderPage(Page);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("About still passes with an FAQ answer open and a quiz error showing", async () => {
    // The page changes as people use it, so check it in a used state too.
    const user = userEvent.setup({ delay: null });
    const { container } = renderPage(About);

    await user.click(screen.getByRole("button", { name: FAQS[0].question }));
    await user.click(screen.getByRole("button", { name: "See my result" }));

    await expectNoAxeViolations(container);
  });
});
