const principles = [
  {
    title: "Every dollar in one place",
    body: "Cash moves between till, pickup bag, safe, deposit and bank, and every move is recorded.",
  },
  {
    title: "Nothing is edited or deleted",
    body: "Corrections are new records, so any till's history can be rebuilt exactly.",
  },
  {
    title: "Two people, not one",
    body: "The person who counts cash cannot be the person who verifies it.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center gap-10 px-6 py-24">
      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold tracking-tight">TillTrack</h1>
        <p className="max-w-xl text-lg leading-relaxed text-foreground/70">
          Cash reconciliation for small retailers. Track every dollar from the till to the bank, and
          flag discrepancies the moment they happen.
        </p>
      </header>

      <ul className="grid gap-4 sm:grid-cols-3">
        {principles.map((principle) => (
          <li key={principle.title} className="rounded-lg border border-foreground/10 p-4">
            <h2 className="font-medium">{principle.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">{principle.body}</p>
          </li>
        ))}
      </ul>
    </main>
  );
}