import { site } from "@/content/site";
import { CopyrightYear } from "./FooterClient";

export function Footer() {
  const socials = (["github", "linkedin", "figma", "x"] as const).map((key) => ({
    key,
    href: site.links[key],
    label: site.linkLabels[key],
  }));

  return (
    // The bottom padding leaves room for the floating back-to-top button at the end of the page.
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-page flex-col gap-4 px-4 pt-8 pb-24 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-text-soft">
          <CopyrightYear name={site.name} />
        </p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          {socials.map(({ key, href, label }) => (
            <li key={key}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center text-text-soft hover:text-accent"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
