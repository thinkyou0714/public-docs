import Link from 'next/link';
import { getAllArticles } from '@/lib/content';

const SECTIONS = [
  {
    href: '/templates',
    title: 'Templates',
    description: 'Template implementation guides with step-by-step setup instructions.',
  },
  {
    href: '/guides',
    title: 'Guides',
    description: 'Cross-cutting guides and best practices.',
  },
  {
    href: '/troubleshooting',
    title: 'Troubleshooting',
    description: 'Symptom-based articles for common issues.',
  },
  {
    href: '/changelog',
    title: 'Changelog',
    description: 'Update history and version notes.',
  },
];

export default function HomePage() {
  const articles = getAllArticles();
  const totalCount = articles.length;

  return (
    <div>
      <section className="py-12 text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Template Implementation Guides
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Step-by-step guides for automation templates.
          Reproducible setup, common pitfalls, and troubleshooting.
        </p>
        <p className="mt-2 text-sm text-gray-400">
          {totalCount} article{totalCount !== 1 ? 's' : ''} published
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-6 mt-8">
        {SECTIONS.map((sec) => (
          <Link
            key={sec.href}
            href={sec.href}
            className="block border border-gray-200 rounded-lg p-6 hover:border-primary hover:shadow-md transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900">{sec.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{sec.description}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
