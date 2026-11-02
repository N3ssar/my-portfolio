import { Link } from "@/i18n/navigation";

export function FastModeButton({ label }: { label: string }) {
  return (
    <Link href="/fast" className="btn btn-outline btn-sm">
      {label}
    </Link>
  );
}
