import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import ArticleListWithFilter from '@/components/ArticleListWithFilter';

export const metadata: Metadata = {
  title: 'Guides',
  description: 'Cross-cutting guides, best practices, and operational knowledge.',
};

export default function GuidesPage() {
  const articles = getAllArticles('guides');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Guides</h1>
      <p className="text-gray-600 mb-6">
        Cross-cutting guides, best practices, and operational knowledge.
      </p>
      <ArticleListWithFilter articles={articles} />
    </div>
  );
}
