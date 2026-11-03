// Server code: only the API route imports this file, so keys never reach the browser.
import { Resend } from "resend";
import { emailText, telegramText, type ContactMessage } from "./contact";

// The onboarding sender only delivers to the email address that owns the Resend account.
const FROM = "Portfolio <onboarding@resend.dev>";

// Errors name the channel and the cause, never a key or token. They are only logged.
export async function sendEmail(message: ContactMessage, sentAt: Date): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) throw new Error("Resend is not configured");

  const { error } = await new Resend(apiKey).emails.send({
    from: FROM,
    to,
    subject: `New message from ${message.name}`,
    text: emailText(message, sentAt),
  });
  if (error) throw new Error(`Resend failed: ${error.name}`);
}

export async function sendTelegram(message: ContactMessage): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("Telegram is not configured");

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text: telegramText(message) }),
  });
  if (!response.ok) throw new Error(`Telegram failed: HTTP ${response.status}`);
}
