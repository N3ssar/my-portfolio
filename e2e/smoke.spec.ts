import { expect, test } from "@playwright/test";

// Planets drift on desktop. Reduced motion keeps them still, so clicks land where expected.
test.use({ reducedMotion: "reduce" });

test.describe("pages load in both languages", () => {
  for (const [locale, dir, title] of [
    ["en", "ltr", "Hi, I'm Muhammad."],
    ["ar", "rtl", "أهلاً، أنا محمد."],
  ] as const) {
    test(`/${locale} has dir="${dir}" and a visible hero`, async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.getByRole("heading", { level: 1 })).toContainText(title);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("the hero is in the server-rendered HTML, visible without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    expect(await heading.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
    await context.close();
  });
});

test.describe("projects", () => {
  test("selecting a planet updates the card", async ({ page }) => {
    await page.goto("/en");
    const projects = page.locator("#projects");
    await projects.getByRole("button", { name: "Kanban Board", exact: true }).click();
    await expect(projects.getByRole("button", { name: "Kanban Board", exact: true })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(projects.locator("li:not([hidden]) h3")).toHaveText(["Kanban Board"]);
  });

  test("the list view toggle works with the keyboard", async ({ page }) => {
    await page.goto("/en");
    const projects = page.locator("#projects");
    const toggle = projects.getByRole("button", { name: "List view" });
    await toggle.focus();
    await page.keyboard.press("Enter");
    await expect(projects.getByRole("button", { name: "Map view" })).toBeFocused();
    await expect(projects.locator("li.group:not([hidden])")).toHaveCount(7);
  });
});

test("a Used in button in the skills card selects the project", async ({ page }) => {
  await page.goto("/en");
  const skills = page.locator("#skills");
  await skills.locator("li:not([hidden]) article").getByRole("button", { name: "Kanban Board" }).click();
  await expect(
    page.locator("#projects").getByRole("button", { name: "Kanban Board", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#project-kanban")).toBeFocused();
});

test("/en/fast renders the top projects", async ({ page }) => {
  await page.goto("/en/fast");
  await expect(page.getByRole("heading", { name: "Top projects" })).toBeVisible();
  for (const name of ["Nabd Masr", "Around The World", "NoteNest"]) {
    await expect(page.getByRole("heading", { name, level: 3 })).toBeVisible();
  }
});

test("the contact form shows inline errors on an empty submit", async ({ page }) => {
  let apiCalled = false;
  await page.route("**/api/contact", (route) => {
    apiCalled = true;
    return route.fulfill({ status: 200, json: { ok: true } });
  });
  await page.goto("/en");
  const form = page.locator("#contact form");
  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form.getByText("Enter your name first")).toBeVisible();
  await expect(form.getByText("Add an email or number so I can reply")).toBeVisible();
  await expect(form.getByText("Write a short message first (at least 10 characters)")).toBeVisible();
  await expect(form.getByLabel("Your name")).toBeFocused();
  expect(apiCalled).toBe(false);
});
