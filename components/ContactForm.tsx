"use client";

import { track } from "@vercel/analytics";
import { useRef, useState, type FormEvent } from "react";
import { invalidFields, type ContactField } from "@/lib/contact";
import { CopyButton } from "./CopyButton";

type Status = "idle" | "sending" | "success" | "error" | "rate-limited";

export type ContactFormLabels = {
  name: string;
  contact: string;
  message: string;
  namePh: string;
  contactPh: string;
  messagePh: string;
  send: string;
  sending: string;
  success: string;
  errName: string;
  errContact: string;
  errMessage: string;
  errSend: string;
  errRate: string;
  copy: string;
  copied: string;
};

const FIELDS: { id: ContactField; multiline?: boolean; maxLength: number }[] = [
  { id: "name", maxLength: 80 },
  { id: "contact", maxLength: 120 },
  { id: "message", multiline: true, maxLength: 1000 },
];

export function ContactForm({
  labels,
  email,
  locale,
}: {
  labels: ContactFormLabels;
  email: string;
  locale: "en" | "ar";
}) {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<ContactField[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const errorText: Record<ContactField, string> = {
    name: labels.errName,
    contact: labels.errContact,
    message: labels.errMessage,
  };
  const fieldLabel: Record<ContactField, string> = {
    name: labels.name,
    contact: labels.contact,
    message: labels.message,
  };
  const placeholder: Record<ContactField, string> = {
    name: labels.namePh,
    contact: labels.contactPh,
    message: labels.messagePh,
  };

  function values() {
    const data = new FormData(form.current ?? undefined);
    return {
      name: String(data.get("name") ?? ""),
      contact: String(data.get("contact") ?? ""),
      message: String(data.get("message") ?? ""),
      website: String(data.get("website") ?? ""),
      locale,
    };
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
    const input = values();
    const invalid = invalidFields({ ...input, website: "" });
    setErrors(invalid);
    if (invalid.length > 0) {
      form.current?.querySelector<HTMLElement>(`[name="${invalid[0]}"]`)?.focus();
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (response.ok) {
        setStatus("success");
        track("contact_submit_success");
        setSubmitted(false);
        form.current?.reset();
      } else {
        setStatus(response.status === 429 ? "rate-limited" : "error");
      }
    } catch {
      setStatus("error");
    }
  }

  // After a first submit, errors update as the person fixes each field.
  function revalidate() {
    if (submitted) setErrors(invalidFields({ ...values(), website: "" }));
  }

  return (
    <form ref={form} onSubmit={submit} onChange={revalidate} noValidate className="mt-4 space-y-5">
      {FIELDS.map(({ id, multiline, maxLength }) => {
        const invalid = errors.includes(id);
        const props = {
          id: `contact-${id}`,
          name: id,
          maxLength,
          placeholder: placeholder[id],
          "aria-invalid": invalid,
          "aria-describedby": invalid ? `contact-${id}-error` : undefined,
          className:
            "w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-text placeholder:text-text-muted focus:border-accent aria-invalid:border-danger",
        };
        return (
          <div key={id}>
            <label htmlFor={`contact-${id}`} className="mb-1.5 block text-sm text-text-soft">
              {fieldLabel[id]}
            </label>
            {multiline ? <textarea rows={3} {...props} /> : <input type="text" {...props} />}
            {invalid && (
              <p id={`contact-${id}-error`} className="mt-1.5 text-sm text-danger">
                {errorText[id]}
              </p>
            )}
          </div>
        );
      })}

      {/* Honeypot: hidden from people and screen readers, so only bots fill it in. */}
      <div aria-hidden="true" className="absolute -start-[9999px] size-px overflow-hidden">
        <label htmlFor="contact-website">Website</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button type="submit" disabled={status === "sending"} className="btn btn-primary disabled:opacity-70">
        {status === "sending" ? labels.sending : labels.send}
      </button>

      <div aria-live="polite" className="min-h-6 text-sm">
        {status === "success" && <p className="text-text-soft">{labels.success}</p>}
        {status === "rate-limited" && <p className="text-danger">{labels.errRate}</p>}
        {status === "error" && (
          <p className="flex flex-wrap items-center gap-x-2 text-danger">
            {labels.errSend} <bdi className="text-text">{email}</bdi>
            <CopyButton text={email} label={labels.copy} copiedLabel={labels.copied} className="py-2" />
          </p>
        )}
      </div>
    </form>
  );
}
