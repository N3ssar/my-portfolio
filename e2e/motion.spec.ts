import { expect, test } from "@playwright/test";

test.describe("with motion allowed", () => {
  test.use({ reducedMotion: "no-preference" });

  test("the hero h1 only rises: it is never transparent, so LCP is not delayed", async ({ page }) => {
    await page.goto("/en");
    const h1 = page.getByRole("heading", { level: 1 });
    const animatedProperties = await h1.evaluate((el) =>
      el.getAnimations().flatMap((animation) =>
        (animation.effect as KeyframeEffect).getKeyframes().flatMap((frame) => Object.keys(frame)),
      ),
    );
    expect(animatedProperties).not.toContain("opacity");
    expect(await h1.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("the hero runs one CSS sequence with no blur, and the countdown waits for the card", async ({ page }) => {
    // Notes when the countdown first shows, measured on the page clock.
    await page.addInitScript(() => {
      new MutationObserver((_, observer) => {
        if (document.querySelector("main section .text-accent")?.textContent === "T-3") {
          (window as unknown as { countdownAt: number }).countdownAt = performance.now();
          observer.disconnect();
        }
      }).observe(document, { subtree: true, childList: true, characterData: true });
    });
    await page.goto("/en");
    const hero = page.locator("main section").first();
    const sequence = await hero.evaluate((el) =>
      el.getAnimations({ subtree: true }).map((animation) => {
        const effect = animation.effect as KeyframeEffect;
        return {
          name: (animation as CSSAnimation).animationName,
          delay: effect.getTiming().delay,
          properties: [...new Set(effect.getKeyframes().flatMap((frame) => Object.keys(frame)))],
        };
      }),
    );
    expect(sequence.map(({ name, delay }) => `${name}@${delay}`)).toEqual([
      "hero-rise@0",
      "hero-rise@0",
      "hero-fade-up@120",
      "hero-fade-up@220",
      "hero-fade-up@220",
      "hero-from-end@320",
    ]);
    expect(sequence.flatMap(({ properties }) => properties)).not.toContain("filter");

    const cardEnd = await page.locator(".hero-card").evaluate((el) => {
      const animation = el.getAnimations()[0];
      const timing = animation.effect!.getComputedTiming();
      return Number(animation.startTime) + Number(timing.endTime);
    });
    await expect.poll(() => page.evaluate(() => (window as unknown as { countdownAt?: number }).countdownAt)).toBeDefined();
    const countdownAt = await page.evaluate(() => (window as unknown as { countdownAt: number }).countdownAt);
    expect(countdownAt).toBeGreaterThanOrEqual(cardEnd - 20);
  });

  test("a newly selected project card fades in, and the screenshot dialog scales in", async ({ page }) => {
    await page.goto("/en");
    const projects = page.locator("#projects");
    // Let the section finish its entrance first (the endless planet drift aside).
    await projects.scrollIntoViewIfNeeded();
    await expect(projects).toHaveClass(/reveal-in/);
    await projects.evaluate((el) =>
      Promise.all(
        el
          .getAnimations({ subtree: true })
          .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
          .map((animation) => animation.finished),
      ),
    );
    // Hovering the map pauses the planet drift, so the click lands on a still planet.
    await projects.locator("[dir=ltr]").hover();
    await projects.getByRole("button", { name: "CalTrack", exact: true }).click();
    const card = page.locator("#project-caltrack");
    // Declared styles, not running animations: under load these short runs can end before they are read.
    expect(await card.evaluate((el) => getComputedStyle(el).animationName)).toBe("fade-in");

    await card.getByRole("button", { name: "CalTrack: Screenshots 1" }).click();
    const dialog = card.locator("dialog");
    const dialogTransitions = await dialog.evaluate((el) => getComputedStyle(el).transitionProperty.split(", "));
    expect(dialogTransitions).toEqual(expect.arrayContaining(["opacity", "transform"]));
    await expect.poll(() => dialog.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  test("a section below the fold fades in once it is scrolled into view", async ({ page }) => {
    await page.goto("/en");
    const about = page.locator("#about");
    await expect(about).toHaveClass(/reveal-pending/);
    await about.scrollIntoViewIfNeeded();
    await expect(about).toHaveClass(/reveal-in/);
    await expect(about).not.toHaveClass(/reveal-pending/);
    await expect.poll(() => about.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });
});

test.describe("map entrances", () => {
  test.use({ reducedMotion: "no-preference" });

  const animationName = (el: Element) => getComputedStyle(el).animationName;

  test("the Projects map draws its rings, scales in the sun and pops in the planets", async ({ page }) => {
    await page.goto("/en");
    const projects = page.locator("#projects");
    await projects.scrollIntoViewIfNeeded();
    await expect(projects).toHaveClass(/reveal-in/);
    expect(await projects.locator(".orbit-ring").first().evaluate(animationName)).toBe("draw");
    expect(await projects.locator(".sun-enter").evaluate(animationName)).toBe("pop");
    expect(await projects.locator(".planet-pop").first().evaluate(animationName)).toBe("pop");
    expect(await projects.locator("h2 .mask-line > span").evaluate(animationName)).toBe("mask-up");
  });

  test("the Skills map draws its lines and fades in its stars", async ({ page }) => {
    await page.goto("/en");
    const skills = page.locator("#skills");
    await skills.scrollIntoViewIfNeeded();
    await expect(skills).toHaveClass(/reveal-in/);
    expect(await skills.locator(".edge-line").first().evaluate(animationName)).toBe("draw");
    expect(await skills.locator(".star-pop").first().evaluate(animationName)).toBe("fade-in");
    expect(await skills.locator("li[data-stagger]").first().evaluate(animationName)).toBe("reveal");
  });

  test("Fast mode reveals its sections like the main page", async ({ page }) => {
    await page.goto("/en/fast");
    expect(await page.getByRole("heading", { level: 1 }).evaluate(animationName)).toBe("hero-rise");
    const sections = page.locator("[data-reveal]");
    expect(await page.locator("[data-reveal].reveal-pending").count()).toBeGreaterThan(0);
    for (const section of await sections.all()) await section.scrollIntoViewIfNeeded();
    await expect(page.locator("[data-reveal].reveal-pending")).toHaveCount(0);
  });
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false, reducedMotion: "no-preference" });

  test("the hero entrance still runs: it is CSS, not JavaScript", async ({ page }) => {
    await page.goto("/en");
    expect(await page.getByRole("heading", { level: 1 }).evaluate((el) => getComputedStyle(el).animationName)).toBe(
      "hero-rise",
    );
    await expect.poll(() => page.locator(".hero-card").evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
  });

  for (const path of ["/en", "/en/fast"]) {
    test(`every section and heading on ${path} is fully visible`, async ({ page }) => {
      await page.goto(path);
      expect(await page.locator(".reveal-pending").count()).toBe(0);
      const hidden = await page.evaluate(() =>
        [...document.querySelectorAll("[data-reveal], h2 .mask-line > span")].filter(
          (el) => getComputedStyle(el).opacity !== "1",
        ).length,
      );
      expect(hidden).toBe(0);
    });
  }
});

test.describe("with reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("nothing is hidden and nothing animates", async ({ page }) => {
    await page.goto("/en");
    await page.waitForLoadState("networkidle");
    expect(await page.locator(".reveal-pending").count()).toBe(0);
    const running = await page.evaluate(() =>
      document.getAnimations().map((animation) => (animation as CSSAnimation).animationName ?? "transition"),
    );
    expect(running).toEqual([]);
    for (const id of ["projects", "skills", "right-now", "about", "contact"]) {
      expect(await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    }
  });
});
