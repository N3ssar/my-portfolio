import { sendEmail, sendTelegram } from "@/lib/contact-delivery";
import { contactSchema, isHoneypotFilled, MAX_BODY_BYTES } from "@/lib/contact";
import { checkRateLimit } from "@/lib/ratelimit";

const ok = () => Response.json({ ok: true });
const fail = (status: number) => Response.json({ ok: false }, { status });

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_BODY_BYTES) return fail(413);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return fail(413);

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return fail(400);
  }

  // Bots that fill the hidden field get a normal-looking answer, and nothing is sent.
  if (isHoneypotFilled(body)) return ok();

  const limit = await checkRateLimit(clientIp(request));
  if (limit === "unavailable") {
    console.error("Contact form refused a message: Upstash rate limiting is not configured.");
    return fail(503);
  }
  if (limit === "limited") return fail(429);

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) return fail(400);

  const channels = ["email", "telegram"] as const;
  const results = await Promise.allSettled([
    sendEmail(parsed.data, new Date()),
    sendTelegram(parsed.data),
  ]);
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      const reason = result.reason instanceof Error ? result.reason.message : "unknown error";
      console.error(`Contact delivery by ${channels[index]} failed: ${reason}`);
    }
  });

  return results.some(({ status }) => status === "fulfilled") ? ok() : fail(502);
}
