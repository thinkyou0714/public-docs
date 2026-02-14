import type { Metadata } from 'next';
import { getAllArticles } from '@/lib/content';
import ArticleListWithFilter from '@/components/ArticleListWithFilter';

export const metadata: Metadata = {
  title: 'Troubleshooting',
  description: 'Symptom-based troubleshooting articles for common automation issues.',
};

export default function TroubleshootingPage() {
  const articles = getAllArticles('troubleshooting');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Troubleshooting</h1>
      <p className="text-gray-600 mb-6">
        Symptom-based articles: find by what went wrong.
      </p>
      <ArticleListWithFilter articles={articles} />
    </div>
  );
}
