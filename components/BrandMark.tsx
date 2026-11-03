const SMALL_SIZE = 24;
const SMALL_STROKE = 3;
const LARGE_STROKE = 2;

// Decorative: an N made of a left bracket, a right bracket and a diagonal between their corners.
export function BrandMark({
  size,
  className,
}: {
  size: number;
  className?: string;
}) {
  const stroke = size <= SMALL_SIZE ? SMALL_STROKE : LARGE_STROKE;
  // Stops the diagonal's square caps from poking past the brackets' outer corners.
  const inset = stroke * 0.207;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
    >
      <rect width="32" height="32" rx="7" fill="var(--surface)" />
      <path
        d={`M11 7H7V25H11M21 7H25V25H21M${7 + inset} ${7 + inset}L${25 - inset} ${25 - inset}`}
        fill="none"
        stroke="var(--accent)"
        strokeWidth={stroke}
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}
