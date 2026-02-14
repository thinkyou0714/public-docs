import { getAllArticles } from '@/lib/content';
import ArticleListWithFilter from '@/components/ArticleListWithFilter';

export default function TemplatesPage() {
  const articles = getAllArticles('templates');

  return (
    <div>
      <h1 className="text-3xl font-bold mb-2">Templates</h1>
      <p className="text-gray-600 mb-6">
        Implementation guides for automation templates.
      </p>
      <ArticleListWithFilter articles={articles} />
    </div>
  );
}
