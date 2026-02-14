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
  return getSlugsForSection('changelog').map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug('changelog', slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.description ?? `Changelog: ${article.template_id}`,
  };
}

export default async function ChangelogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug('changelog', slug);
  if (!article) notFound();

  return (
    <article className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">{article.title}</h1>
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
