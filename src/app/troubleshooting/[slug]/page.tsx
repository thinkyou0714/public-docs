import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import { getArticleBySlug, getSlugsForSection } from '@/lib/content';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return getSlugsForSection('troubleshooting').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug('troubleshooting', slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description ?? `${article.template_id} troubleshooting`,
  };
}

export default async function TroubleshootingArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug('troubleshooting', slug);
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
          <span className="px-2 py-0.5 bg-red-100 text-red-800 rounded">
            troubleshooting
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
