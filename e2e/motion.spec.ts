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

  test("a newly selected project card fades in, and the screenshot dialog scales in", async ({ page }) => {
    await page.goto("/en");
    const projects = page.locator("#projects");
    // Hovering the map pauses the planet drift, so the click lands on a still planet.
    await projects.locator("[dir=ltr]").hover();
    await projects.getByRole("button", { name: "CalTrack", exact: true }).click();
    const card = page.locator("#project-caltrack");
    const cardAnimations = await card.evaluate((el) =>
      el.getAnimations().map((animation) => (animation as CSSAnimation).animationName),
    );
    expect(cardAnimations).toContain("fade-in");

    await card.getByRole("button", { name: "CalTrack: Screenshots 1" }).click();
    const dialog = card.locator("dialog");
    const dialogTransitions = await dialog.evaluate((el) =>
      el.getAnimations().map((animation) => (animation as CSSTransition).transitionProperty),
    );
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
