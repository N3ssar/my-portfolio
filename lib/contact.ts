import { z } from "zod";

// Shared by the contact form (inline validation) and the API route.

export const MAX_BODY_BYTES = 5 * 1024;

const CONTROL_CHARACTERS = /[\u0000-\u001F\u007F]/g;
// Messages keep line breaks and tabs.
const CONTROL_CHARACTERS_EXCEPT_WHITESPACE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

const cleaned = (pattern: RegExp) =>
  z.string().transform((value) => value.replace(pattern, "").trim());

export const contactSchema = z.object({
  name: cleaned(CONTROL_CHARACTERS).pipe(z.string().min(2).max(80)),
  // Email or phone number. No strict format, so people can write it their way.
  contact: cleaned(CONTROL_CHARACTERS).pipe(z.string().min(5).max(120)),
  message: cleaned(CONTROL_CHARACTERS_EXCEPT_WHITESPACE).pipe(z.string().min(10).max(1000)),
  // Honeypot: real people never see this field, so it must stay empty.
  website: z.string().max(0).optional(),
  locale: z.enum(["en", "ar"]),
});

export type ContactInput = z.input<typeof contactSchema>;
export type ContactMessage = z.output<typeof contactSchema>;
export type ContactField = "name" | "contact" | "message";

const FIELDS: readonly ContactField[] = ["name", "contact", "message"];

// The visible fields that failed validation, in form order.
export function invalidFields(input: ContactInput): ContactField[] {
  const result = contactSchema.safeParse(input);
  if (result.success) return [];
  const failed = new Set(result.error.issues.map((issue) => issue.path[0]));
  return FIELDS.filter((field) => failed.has(field));
}

export function isHoneypotFilled(body: unknown): boolean {
  if (typeof body !== "object" || body === null || !("website" in body)) return false;
  const { website } = body as { website: unknown };
  return typeof website === "string" ? website.length > 0 : website != null;
}

export function emailText(message: ContactMessage, sentAt: Date): string {
  return [
    `Name: ${message.name}`,
    `Contact: ${message.contact}`,
    `Locale: ${message.locale}`,
    `Sent: ${sentAt.toISOString()}`,
    "",
    message.message,
  ].join("\n");
}

export function telegramText(message: ContactMessage): string {
  return [
    "New portfolio message",
    `Name: ${message.name}`,
    `Contact: ${message.contact}`,
    `Message: ${message.message}`,
  ].join("\n");
}
