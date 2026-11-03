import { describe, expect, it } from "vitest";
import {
  contactSchema,
  emailText,
  invalidFields,
  isHoneypotFilled,
  telegramText,
} from "@/lib/contact";

const valid = {
  name: "Sara Ahmed",
  contact: "sara@acme.com",
  message: "We'd love to chat about a junior role.",
  locale: "en" as const,
};

describe("contactSchema", () => {
  it("accepts valid input", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
    expect(contactSchema.safeParse({ ...valid, website: "" }).success).toBe(true);
  });

  it.each([
    ["a name that is too short", { name: "S" }, "name"],
    ["a name that is too long", { name: "S".repeat(81) }, "name"],
    ["a contact that is too short", { contact: "1234" }, "contact"],
    ["a contact that is too long", { contact: "1".repeat(121) }, "contact"],
    ["a message that is too short", { message: "Hi there" }, "message"],
    ["a message that is too long", { message: "x".repeat(1001) }, "message"],
  ] as const)("rejects %s", (_, change, field) => {
    expect(invalidFields({ ...valid, ...change })).toEqual([field]);
  });

  it("rejects a filled honeypot and an unknown locale", () => {
    expect(contactSchema.safeParse({ ...valid, website: "spam.example" }).success).toBe(false);
    expect(contactSchema.safeParse({ ...valid, locale: "fr" }).success).toBe(false);
  });

  it("counts length after trimming", () => {
    expect(invalidFields({ ...valid, name: "  S  " })).toEqual(["name"]);
  });

  it("strips control characters from name and contact", () => {
    const result = contactSchema.parse({ ...valid, name: "Sa\u0000ra\u0007", contact: "sara@acme.com\u001B" });
    expect(result.name).toBe("Sara");
    expect(result.contact).toBe("sara@acme.com");
  });

  it("keeps line breaks in the message but strips other control characters", () => {
    const result = contactSchema.parse({ ...valid, message: "Hello there,\nlet's talk.\u0000" });
    expect(result.message).toBe("Hello there,\nlet's talk.");
  });

  it("lists every invalid field in form order", () => {
    expect(invalidFields({ ...valid, message: "", name: "" })).toEqual(["name", "message"]);
  });
});

describe("isHoneypotFilled", () => {
  it("is true only when the hidden field has a value", () => {
    expect(isHoneypotFilled({ website: "x" })).toBe(true);
    expect(isHoneypotFilled({ website: "" })).toBe(false);
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled(null)).toBe(false);
  });
});

describe("message texts", () => {
  const message = contactSchema.parse(valid);

  it("builds a plain email body with an ISO timestamp", () => {
    const text = emailText(message, new Date("2026-11-03T10:00:00Z"));
    expect(text).toContain("Name: Sara Ahmed");
    expect(text).toContain("Contact: sara@acme.com");
    expect(text).toContain("Locale: en");
    expect(text).toContain("Sent: 2026-11-03T10:00:00.000Z");
    expect(text).toContain(valid.message);
  });

  it("builds the Telegram message in the agreed format", () => {
    expect(telegramText(message)).toBe(
      `New portfolio message\nName: Sara Ahmed\nContact: sara@acme.com\nMessage: ${valid.message}`,
    );
  });
});
