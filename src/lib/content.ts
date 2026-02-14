import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// ---------- Types ----------
export interface ArticleFrontmatter {
  template_id: string;
  title: string;
  category: 'LINE' | 'Obsidian' | 'X' | 'Ops';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_bucket: 'short' | 'mid' | 'long';
  prerequisites: string[];
  integrations: string[];
  version: string;
  last_verified_yyyy_mm: string;
  visibility: 'public' | 'private';
  tags: string[];
  description?: string;
}

export interface ArticleMeta extends ArticleFrontmatter {
  slug: string;
  section: string;
}

export interface ArticleContent extends ArticleMeta {
  content: string;
}

// ---------- Constants ----------
const CONTENT_DIR = path.join(process.cwd(), 'content');
const SECTIONS = ['templates', 'guides', 'troubleshooting', 'changelog'] as const;
export type Section = (typeof SECTIONS)[number];

// ---------- Helpers ----------
function getMdxFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));
}

// ---------- Public API ----------

/**
 * Get all articles across all sections (or a specific section).
 * Returns frontmatter + slug, no body content.
 */
export function getAllArticles(section?: Section): ArticleMeta[] {
  const sections = section ? [section] : [...SECTIONS];
  const articles: ArticleMeta[] = [];

  for (const sec of sections) {
    const dir = path.join(CONTENT_DIR, sec);
    const files = getMdxFiles(dir);

    for (const file of files) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf-8');
      const { data } = matter(raw);
      const slug = file.replace(/\.mdx?$/, '');
      articles.push({
        ...(data as ArticleFrontmatter),
        slug,
        section: sec,
      });
    }
  }

  return articles;
}

/**
 * Get a single article by section + slug, including MDX body.
 */
export function getArticleBySlug(
  section: Section,
  slug: string,
): ArticleContent | null {
  const dir = path.join(CONTENT_DIR, section);
  const mdxPath = path.join(dir, `${slug}.mdx`);
  const mdPath = path.join(dir, `${slug}.md`);
  const filePath = fs.existsSync(mdxPath) ? mdxPath : fs.existsSync(mdPath) ? mdPath : null;

  if (!filePath) return null;

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    ...(data as ArticleFrontmatter),
    slug,
    section,
    content,
  };
}

/**
 * Get all slugs for a section (used for generateStaticParams).
 */
export function getSlugsForSection(section: Section): string[] {
  const dir = path.join(CONTENT_DIR, section);
  return getMdxFiles(dir).map((f) => f.replace(/\.mdx?$/, ''));
}

