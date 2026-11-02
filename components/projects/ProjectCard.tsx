import { useTranslations } from "next-intl";
import type { Project } from "@/content/projects";
import { isTodo, isVisibleLink } from "@/lib/status";
import { StatusPill } from "../StatusPill";
import { ScreenshotGallery } from "./ScreenshotGallery";

function externalLinkProps(href: string) {
  return { href, target: "_blank", rel: "noopener noreferrer" };
}

export function ProjectCard({ project }: { project: Project }) {
  const t = useTranslations("projects");
  const common = useTranslations("common");
  const { id, status, kind, stack, links, images } = project;
  const item = `items.${id}`;

  // Optional text: missing keys and TODO values are hidden.
  const optional = (key: string) => {
    const path = `${item}.${key}`;
    return t.has(path) && !isTodo(t(path)) ? t(path) : undefined;
  };
  const challenge = optional("challenge");
  const did = optional("did");
  const note = optional("note");

  const bulletsKey = status === "in-progress" ? "building" : "built";
  const bullets: string[] = t.has(`${item}.${bulletsKey}`)
    ? t.raw(`${item}.${bulletsKey}`)
    : [];
  const name = t(`${item}.name`);

  return (
    <article className="rounded-xl border-s-[3px] border-s-accent bg-surface p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="me-1 text-base">{name}</h3>
        <StatusPill>{t(`kinds.${kind}`)}</StatusPill>
        {status === "in-progress" && <StatusPill>{t(`status.${status}`)}</StatusPill>}
      </div>
      <p className="mt-2 text-text-soft">{t(`${item}.summary`)}</p>

      {challenge && (
        <div className="mt-3">
          <h4 className="font-medium">{t("labels.challenge")}</h4>
          <p className="mt-1 text-text-soft">{challenge}</p>
        </div>
      )}
      {did && (
        <div className="mt-3">
          <h4 className="font-medium">{t("labels.did")}</h4>
          <p className="mt-1 text-text-soft">{did}</p>
        </div>
      )}
      {note && <p className="mt-3 text-text-muted">{note}</p>}

      {images.length > 0 && (
        <ScreenshotGallery
          images={images}
          altPrefix={`${name}: ${t("labels.screenshots")}`}
          closeLabel={common("close")}
        />
      )}

      {bullets.length > 0 && (
        <div className="mt-3">
          <h4 className="font-medium">{t(`labels.${bulletsKey}`)}</h4>
          <ul className="mt-1 list-disc space-y-1 ps-5 text-text-soft">
            {bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-3 flex flex-wrap gap-2">
        {stack.map((tech) => (
          <li key={tech} className="rounded-full bg-bg px-3 py-1 text-xs text-text-soft">
            <bdi>{tech}</bdi>
          </li>
        ))}
      </ul>

      {(isVisibleLink(links.live) || isVisibleLink(links.repo)) && (
        <div className="mt-4 flex flex-wrap gap-3">
          {isVisibleLink(links.live) && (
            <a {...externalLinkProps(links.live)} className="btn btn-primary btn-sm">
              {common("live")}
            </a>
          )}
          {isVisibleLink(links.repo) && (
            <a {...externalLinkProps(links.repo)} className="btn btn-outline btn-sm">
              {status === "in-progress" ? common("follow") : common("code")}
            </a>
          )}
        </div>
      )}
    </article>
  );
}
