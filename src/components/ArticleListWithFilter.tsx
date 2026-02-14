'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

interface ArticleMeta {
  template_id: string;
  title?: string;
  category: string;
  difficulty: string;
  duration_bucket: string;
  tags?: string[];
  description?: string;
  slug: string;
  section: string;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800',
};

const DURATION_LABELS: Record<string, string> = {
  short: '~15 min',
  mid: '30-60 min',
  long: '60+ min',
};

interface Props {
  articles: ArticleMeta[];
}

export default function ArticleListWithFilter({ articles }: Props) {
  const [category, setCategory] = useState('');
  const [tag, setTag] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [duration, setDuration] = useState('');

  const categories = useMemo(
    () => [...new Set(articles.map((a) => a.category))].sort(),
    [articles],
  );
  const tags = useMemo(
    () => [...new Set(articles.flatMap((a) => a.tags ?? []))].sort(),
    [articles],
  );

  const filtered = useMemo(() => {
    let result = articles;
    if (category) result = result.filter((a) => a.category === category);
    if (tag) result = result.filter((a) => a.tags?.includes(tag));
    if (difficulty) result = result.filter((a) => a.difficulty === difficulty);
    if (duration) result = result.filter((a) => a.duration_bucket === duration);
    return result;
  }, [articles, category, tag, difficulty, duration]);

  const hasFilter = category || tag || difficulty || duration;
  const selectClass =
    'border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <div>
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className={selectClass} value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map((c) => (<option key={c} value={c}>{c}</option>))}
        </select>
        <select className={selectClass} value={tag} onChange={(e) => setTag(e.target.value)}>
          <option value="">All Tags</option>
          {tags.map((t) => (<option key={t} value={t}>{t}</option>))}
        </select>
        <select className={selectClass} value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="">All Difficulty</option>
          <option value="beginner">beginner</option>
          <option value="intermediate">intermediate</option>
          <option value="advanced">advanced</option>
        </select>
        <select className={selectClass} value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="">All Durations</option>
          <option value="short">short (~15 min)</option>
          <option value="mid">mid (30-60 min)</option>
          <option value="long">long (60+ min)</option>
        </select>
        {hasFilter && (
          <button
            onClick={() => { setCategory(''); setTag(''); setDifficulty(''); setDuration(''); }}
            className="text-sm text-gray-500 hover:text-red-500 underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Article List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No articles match the current filters.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((article) => (
            <Link
              key={article.slug}
              href={`/${article.section}/${article.slug}`}
              className="block border border-gray-200 rounded-lg p-5 hover:border-blue-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-gray-900 truncate">
                    {article.title ?? article.template_id}
                  </h3>
                  {article.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {article.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      {article.category}
                    </span>
                    <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${DIFFICULTY_COLORS[article.difficulty] ?? 'bg-gray-100 text-gray-800'}`}>
                      {article.difficulty}
                    </span>
                    <span className="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                      {DURATION_LABELS[article.duration_bucket] ?? article.duration_bucket}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {article.template_id}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
