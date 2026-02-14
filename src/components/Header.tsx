import Link from 'next/link';

const NAV_ITEMS = [
  { href: '/templates', label: 'Templates' },
  { href: '/guides', label: 'Guides' },
  { href: '/troubleshooting', label: 'Troubleshooting' },
  { href: '/changelog', label: 'Changelog' },
];

export default function Header() {
  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Docs
        </Link>
        <nav className="flex gap-6">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
