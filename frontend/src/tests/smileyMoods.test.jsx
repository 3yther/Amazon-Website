import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useSmiley } from "../assistant/useSmiley.js";

// Smiley's moods, with fake timers so minutes pass in an instant.

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

function smiley() {
  return renderHook(() => useSmiley({ reducedMotion: false }));
}

describe("Smiley's moods", () => {
  it("starts neutral", () => {
    const { result } = smiley();
    expect(result.current.face.mood).toBe("neutral");
  });

  it("thinks while waiting for an answer", () => {
    const { result } = smiley();

    act(() => result.current.setThinking(true));
    expect(result.current.face.mood).toBe("thinking");

    act(() => result.current.setThinking(false));
    expect(result.current.face.mood).toBe("neutral");
  });

  it("gets sleepy after 2 minutes, falls asleep after 3, and wakes up", () => {
    const { result } = smiley();

    act(() => vi.advanceTimersByTime(2 * 60 * 1000 + 4000));
    expect(result.current.face.mood).toBe("sleepy");

    act(() => vi.advanceTimersByTime(60 * 1000));
    expect(result.current.face.mood).toBe("asleep");

    act(() => window.dispatchEvent(new Event("keydown")));
    expect(result.current.face.mood).toBe("surprised");
  });

  it("is curious on hover and shy after 5 seconds of it", () => {
    const { result } = smiley();

    act(() => result.current.hover(true));
    expect(result.current.face.mood).toBe("curious");

    act(() => vi.advanceTimersByTime(5000));
    expect(result.current.face.mood).toBe("shy");
  });

  it("gets dizzy on the 5th quick poke", () => {
    const { result } = smiley();

    for (let i = 0; i < 4; i += 1) act(() => result.current.poke());
    expect(result.current.face.mood).toBe("happy");

    act(() => result.current.poke());
    expect(result.current.face.mood).toBe("dizzy");
  });
});
