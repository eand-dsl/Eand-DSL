import Link from 'next/link';

const entries = [
  {
    href: '/docs',
    title: 'Get started',
    body: 'Install the package and assemble your first e& screen.',
  },
  {
    href: '/docs/components/button',
    title: 'Components',
    body: '45 documented components with live, knob-driven demos and prop tables.',
  },
  {
    href: '/docs/foundations/colors',
    title: 'Foundations',
    body: 'Colour, typography, and spacing — resolved from the Figma variable export.',
  },
  {
    href: '/docs/foundations/icons',
    title: 'Icons',
    body: '198 icons in outline and filled forms, searchable by name, description, or alias.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-20">
      <p className="text-fd-muted-foreground text-sm font-medium tracking-wide uppercase">
        e&amp; Consumer App
      </p>
      <h1 className="mt-3 max-w-2xl text-center text-4xl font-bold tracking-tight sm:text-5xl">
        The e&amp; Design System
      </h1>
      <p className="text-fd-muted-foreground mt-5 max-w-xl text-center text-lg">
        A React component library built to the Figma{' '}
        <span className="font-medium">e&amp; Consumer App DSL V1.1</span> — every token
        resolved from the same variable export that generates the SwiftUI and Compose
        tokens, so values never drift between platforms.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/docs"
          className="bg-fd-primary text-fd-primary-foreground rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
        >
          Read the docs
        </Link>
        <Link
          href="/docs/components/button"
          className="border-fd-border hover:bg-fd-accent rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          Browse components
        </Link>
      </div>

      <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="border-fd-border bg-fd-card hover:border-fd-primary/50 rounded-xl border p-5 transition-colors"
          >
            <h2 className="font-semibold">{entry.title}</h2>
            <p className="text-fd-muted-foreground mt-1.5 text-sm">{entry.body}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
