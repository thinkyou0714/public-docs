import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Template Implementation Guides',
    template: '%s | Template Guides',
  },
  description:
    'Step-by-step automation template guides. Reproducible setup, common pitfalls, and troubleshooting.',
  openGraph: {
    title: 'Template Implementation Guides',
    description:
      'Step-by-step automation template guides with reproducible setup instructions.',
    type: 'website',
    locale: 'ja_JP',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
