import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getSlugsForSection } from '@/lib/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getSlugsForSection('guides').map((slug) => ({ slug }));
}

export default async function GuidePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug('guides', slug);
  if (!article) notFound();

  return (
    <article className="max-w-4xl">
      <header className="mb-8">
        <p className="text-sm text-gray-500 mb-1">{article.template_id}</p>
        <h1 className="text-3xl font-bold">{article.title}</h1>
        <div className="flex flex-wrap gap-2 mt-3 text-sm">
          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
            {article.category}
          </span>
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
            {article.difficulty}
          </span>
        </div>
      </header>
      <div className="prose">
        <MDXRemote
          source={article.content}
          options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
        />
      </div>
    </article>
  );
}
