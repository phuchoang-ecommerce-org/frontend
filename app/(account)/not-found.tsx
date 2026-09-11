// Deliberately unexplained (Routing.md §8) — an order that isn't yours and
// an order that doesn't exist render identically (Security.md §13, T10).
export default function AccountNotFound() {
  return (
    <div className="px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold text-primary">Not found</h1>
    </div>
  );
}
