import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 bg-background px-4 py-8">
      <h1 className="text-2xl font-semibold text-primary">
        Enterprise Commerce Platform
      </h1>
      <p className="text-neutral-700">Foundation build — Sprint 00.</p>
      <Button>Get started</Button>
    </main>
  );
}
