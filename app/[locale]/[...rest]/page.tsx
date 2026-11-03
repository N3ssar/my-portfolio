import { notFound } from "next/navigation";

// This route only ever renders the 404, so it is left out of instant navigation validation.
export const instant = false;

// Any unknown path under a locale renders the localized 404 inside the site layout.
export default function CatchAll() {
  notFound();
}
