import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto max-w-content px-4 py-12">
      <h1 className="text-3xl font-semibold">Hello, World</h1>
      <Link href="/login" className="mt-6 inline-block underline underline-offset-4">Sign in</Link>
    </main>
  );
}
