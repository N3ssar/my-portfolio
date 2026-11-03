import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// Providers are mocked: no real email or Telegram message is ever sent.
const sendEmailMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendEmailMock };
  },
}));
const fetchMock = vi.fn();

const { POST } = await import("@/app/api/contact/route");

let ipCounter = 0;

function request(body: unknown, ip = `203.0.113.${++ipCounter}`) {
  return new Request("http://localhost/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

const valid = {
  name: "Sara Ahmed",
  contact: "sara@acme.com",
  message: "We'd love to chat about a junior role.",
  website: "",
  locale: "en",
};

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("CONTACT_TO_EMAIL", "owner@example.com");
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:test-token");
  vi.stubEnv("TELEGRAM_CHAT_ID", "42");
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "");
  sendEmailMock.mockResolvedValue({ data: { id: "email-1" }, error: null, headers: null });
  fetchMock.mockResolvedValue(new Response("{}", { status: 200 }));
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  sendEmailMock.mockReset();
  fetchMock.mockReset();
});

describe("POST /api/contact", () => {
  it("delivers by email and Telegram and returns 200", async () => {
    const response = await POST(request(valid));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });

    expect(sendEmailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Portfolio <onboarding@resend.dev>",
        to: "owner@example.com",
        subject: "New message from Sara Ahmed",
        text: expect.stringContaining(valid.message),
      }),
    );
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bot123:test-token/sendMessage");
    const body = JSON.parse(init.body);
    expect(body.chat_id).toBe("42");
    expect(body.parse_mode).toBeUndefined();
  });

  it("returns 200 for a filled honeypot and sends nothing", async () => {
    const response = await POST(request({ ...valid, website: "spam.example" }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 413 for a body over 5 KB and sends nothing", async () => {
    const response = await POST(request({ ...valid, message: "x".repeat(6000) }));
    expect(response.status).toBe(413);
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid input or broken JSON", async () => {
    expect((await POST(request({ ...valid, message: "short" }))).status).toBe(400);
    expect((await POST(request("{not json"))).status).toBe(400);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

  it("still returns 200 when one channel fails", async () => {
    sendEmailMock.mockResolvedValue({
      data: null,
      error: { name: "validation_error", message: "bad", statusCode: 422 },
      headers: null,
    });
    expect((await POST(request(valid))).status).toBe(200);

    sendEmailMock.mockResolvedValue({ data: { id: "email-2" }, error: null, headers: null });
    fetchMock.mockRejectedValue(new Error("network down"));
    expect((await POST(request(valid))).status).toBe(200);
  });

  it("returns 502 with no provider details when both channels fail", async () => {
    sendEmailMock.mockRejectedValue(new Error("Resend secret detail re_test_key"));
    fetchMock.mockResolvedValue(new Response("Unauthorized", { status: 401 }));

    const response = await POST(request(valid));
    expect(response.status).toBe(502);
    const text = await response.text();
    expect(JSON.parse(text)).toEqual({ ok: false });
    expect(text).not.toMatch(/re_test_key|test-token|Resend|Telegram|401/);
  });

  it("returns 502 when no provider is configured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    expect((await POST(request(valid))).status).toBe(502);
    expect(sendEmailMock).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("allows 3 requests per IP, then returns 429", async () => {
    const ip = "198.51.100.7";
    for (let i = 0; i < 3; i++) {
      expect((await POST(request(valid, ip))).status).toBe(200);
    }
    expect((await POST(request(valid, ip))).status).toBe(429);
    expect((await POST(request(valid, "198.51.100.8"))).status).toBe(200);
  });

  it("refuses messages in production when Upstash is not configured", async () => {
    vi.stubEnv("NODE_ENV", "production");
    expect((await POST(request(valid))).status).toBe(503);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });
});
