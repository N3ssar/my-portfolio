import type { ReactNode } from "react";

// A section heading whose text slides up from behind a clip when its section is revealed.
export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2>
      <span className="mask-line">
        <span>{children}</span>
      </span>
    </h2>
  );
}
