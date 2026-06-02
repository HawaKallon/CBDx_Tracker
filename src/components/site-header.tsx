import Link from 'next/link';

type Props = {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
};

export function SiteHeader({
  title = 'UNICEF Sierra Leone',
  subtitle = 'Digital Learning Hubs — Program Hub',
  showBack = false,
}: Props) {
  return (
    <header className="border-b border-sky-800 bg-gradient-to-r from-sky-700 to-sky-900 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 sm:px-6">
        {showBack ? (
          <Link href="/" className="text-xs font-semibold uppercase tracking-widest text-sky-200 hover:text-white">
            ← All programs
          </Link>
        ) : null}
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-sky-100">{subtitle}</p> : null}
      </div>
    </header>
  );
}
