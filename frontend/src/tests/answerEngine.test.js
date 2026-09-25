import { describe, expect, it } from "vitest";
import * as about from "../aboutContent.js";
import * as amazon from "../amazonContent.js";
import * as help from "../helpContent.js";
import { answerLocally, answerTopic, dontKnow } from "../assistant/answers/answerEngine.js";
import { normalise } from "../assistant/answers/match.js";
import { TOPICS } from "../assistant/answers/topics.js";
import { makeTranslate } from "../i18n/translate.js";

// Smiley's answer engine: what it says without the AI. Every fact it gives
// must be the site's own copy, and every safeguarding message must be caught
// and kept in the browser.

const ctx = {
  t: makeTranslate(),
  about,
  amazon,
  help,
  language: "en",
  now: new Date(2026, 8, 24, 14, 0),
};

const faq = (id) => about.FAQS.find((entry) => entry.id === id).answer;
const ask = (text, context = ctx) => answerLocally(text, context);

describe("facts come from the site's own copy", () => {
  it.each([
    ["How long is the placement?", "placementLength"],
    ["how long is a t-level industry placement", "placementLength"],
    ["do I get paid", "placementPay"],
    ["Is it free?", "tlevelCost"],
    ["what's a T level", "whatIsTLevel"],
    ["Is a T Level the same as an apprenticeship?", "tlevelVsApprenticeship"],
    ["what gcses do i need", "entryRequirements"],
    ["can I still go to uni after", "university"],
    ["what is the amazon placement like", "amazonPlacement"],
    ["who looks after me at amazon", "amazonSupport"],
    ["how do I get a placement at amazon", "amazonHowToGet"],
    ["which pathways does amazon offer", "amazonPathways"],
    ["tell me about the digital pathway", "pathway-digital"],
    ["what if I fail", "tlevelFail"],
    ["how is a t level assessed", "tlevelAssessment"],
    ["where can I find a t level near me", "nearYou"],
    ["help with bus travel costs", "bursary"],
  ])("%s -> %s", (question, topic) => {
    const reply = ask(question);
    expect(reply.id).toBe(topic);
    expect(reply.confident).toBe(true);
    expect(reply.text.length).toBeGreaterThan(10);
  });

  it("quotes the FAQ word for word", () => {
    expect(ask("How long is the placement?").text).toBe(faq("placement"));
    expect(ask("do I get paid on placement").text).toBe(faq("paid"));
    expect(ask("what gcses do i need").text).toBe(faq("entry"));
  });

  it("never promises a Finance placement Amazon has not confirmed", () => {
    expect(ask("finance").text).toContain("hasn't confirmed");
    expect(ask("which pathways does amazon offer").text).toContain("Finance: Amazon hasn't confirmed");
  });

  it("never guesses what an acronym stands for", () => {
    const reply = ask("what does OS stand for");
    expect(reply.id).toBe("whatIsOS");
    expect(reply.text).toContain("won't guess");
    expect(reply.text.toLowerCase()).not.toContain("occupational");
  });

  it("gives every topic a real chip label and a real answer", () => {
    for (const topic of TOPICS) {
      const label = ctx.t(`smiley.topics.${topic.id}`);
      const reply = answerTopic(topic.id, ctx);
      if (topic.kind === "fact") expect(label, topic.id).not.toBe(`smiley.topics.${topic.id}`);
      expect(reply.text, topic.id).toBeTruthy();
      expect(reply.text, topic.id).not.toMatch(/^smiley\./);
    }
  });
});

describe("small talk and easter eggs", () => {
  it.each([
    ["hi", "greeting"],
    ["hello there", "greeting"],
    ["thanks!", "thanks"],
    ["tell me a joke", "joke"],
    ["are you a robot?", "areYouBot"],
    ["who made you", "whoMadeYou"],
    ["do a flip", "flip"],
    ["dance!", "dance"],
    ["do a barrel roll", "spin"],
    ["what is the meaning of life", "meaningOfLife"],
    ["smiley", "name"],
  ])("%s -> %s", (question, topic) => {
    expect(ask(question).id).toBe(topic);
  });

  it("lets a real question win over a greeting", () => {
    expect(ask("hi, how long is the placement?").id).toBe("placementLength");
  });

  it("matches short words as whole words only", () => {
    // "ta" (thanks) must not match "take"; "hi" must not match "his".
    expect(ask("can I take a break")?.id).not.toBe("thanks");
    expect(ask("his placement was good")?.id).not.toBe("greeting");
  });

  it("asks Smiley's body to move for the motion easter eggs", () => {
    expect(ask("do a flip").motion).toBe("flip");
    expect(ask("go to sleep").motion).toBe("nap");
  });
});

describe("safeguarding comes first and stays in the browser", () => {
  it.each([
    ["I want to kill myself", "atRisk"],
    ["i've been self harming", "atRisk"],
    ["I'm being bullied at school, how long is the placement", "harmed"],
    ["someone keeps hurting me", "harmed"],
    ["I'm so stressed I can't cope", "struggling"],
    ["my email is sam@example.com", "personal"],
    ["call me on 07700 900123", "personal"],
    ["my postcode is SW1A 1AA", "personal"],
  ])("%s -> %s", (message, topic) => {
    const reply = ask(message);
    expect(reply.id).toBe(`safety-${topic}`);
    expect(reply.private).toBe(true);
  });

  it("gives the checked support numbers to somebody at risk", () => {
    const text = ask("I want to end my life").text;
    expect(text).toContain("0800 1111");
    expect(text).toContain("85258");
    expect(text).toContain("116 123");
    expect(text).toContain("999");
  });
});

describe("when Smiley does not know", () => {
  it("hands anything unrecognised to the AI", () => {
    expect(ask("xyzzy plugh quux")).toBeNull();
  });

  it("says so honestly and offers what it can answer", () => {
    const reply = dontKnow(ctx);
    expect(reply.text).toContain("rather not guess");
    expect(reply.chips.some((chip) => chip.action.to === "/community")).toBe(true);
    expect(reply.chips.filter((chip) => chip.action.type === "topic").length).toBeGreaterThan(2);
  });
});

describe("other languages", () => {
  it("matches words from the visitor's own language", () => {
    const polish = {
      ...ctx,
      language: "pl",
      t: makeTranslate({ smiley: { keywords: { placementLength: "praktyka, staż" } } }),
    };
    expect(ask("ile trwa praktyka?", polish).id).toBe("placementLength");
  });

  it("prefers the topic more of the question's words belong to", () => {
    const spanish = {
      ...ctx,
      language: "es",
      t: makeTranslate({
        smiley: {
          keywords: { courseLength: "cuánto dura, años", placementLength: "cuánto dura, prácticas" },
        },
      }),
    };
    expect(ask("¿cuánto dura un T Level?", spanish).id).toBe("courseLength");
    expect(ask("¿cuánto dura la parte de prácticas?", spanish).id).toBe("placementLength");
  });

  it("keeps the vowel signs of Indic scripts, so their words match whole", () => {
    const bengali = {
      ...ctx,
      language: "bn",
      t: makeTranslate({ smiley: { keywords: { placementPay: "বেতন" } } }),
    };
    expect(normalise("প্লেসমেন্টে বেতন?")).toBe("প্লেসমেন্টে বেতন");
    expect(ask("প্লেসমেন্টে বেতন পাব?", bengali).id).toBe("placementPay");
  });
});
