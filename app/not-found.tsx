import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col items-start justify-center gap-3 px-5">
      <p className="font-mono text-xs uppercase tracking-widest text-ink-subtle">404</p>
      <h1 className="text-2xl font-medium tracking-tight">Page not found</h1>
      <p className="text-ink-muted">
        That page doesn&apos;t exist (yet).
      </p>
      <Link href="/" className="mt-4 text-accent underline">
        Back to home
      </Link>
    </main>
  );
}
