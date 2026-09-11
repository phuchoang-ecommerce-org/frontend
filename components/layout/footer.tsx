import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-6 text-sm text-neutral-700">
        <nav aria-label="Footer" className="flex gap-4">
          <Link href="/categories">Categories</Link>
          <Link href="/account">Account</Link>
        </nav>
        <p>&copy; {new Date().getFullYear()} Enterprise Commerce Platform.</p>
      </div>
    </footer>
  );
}
