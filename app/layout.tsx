import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MoRAG UI',
  description: 'Modular Retrieval-Augmented Generation Platform',
  keywords: ['RAG', 'AI', 'Document Processing', 'Vector Database'],
  authors: [{ name: 'MoRAG Team' }],
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-background antialiased">
          {children}
        </div>
      </body>
    </html>
  );
}
