import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import ArticleListWithFilter from '@/components/ArticleListWithFilter';

export const metadata: Metadata = {
  title: 'Changelog',
  description: 'Update history, version changes, and migration notes.',
};

export default function ChangelogPage() {
  const articles = getAllArticles('changelog');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Changelog</h1>
      <p className="text-gray-600 mb-6">
        Update history, version changes, and migration notes.
      </p>
      <ArticleListWithFilter articles={articles} />
    </div>
  );
}
