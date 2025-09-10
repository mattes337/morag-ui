import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/theme-provider';
import { RootErrorBoundary } from '@/components/error/RootErrorBoundary';
import { GlobalErrorHandler } from '@/components/error/GlobalErrorHandler';
import { ApiProvider } from '@/contexts/api/ApiProvider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MoRAG UI',
  description: 'Modular Retrieval-Augmented Generation Platform',
  keywords: ['RAG', 'AI', 'Document Processing', 'Vector Database'],
  authors: [{ name: 'MoRAG Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'hsl(0 0% 100%)' },
    { media: '(prefers-color-scheme: dark)', color: 'hsl(229 84% 2%)' },
  ],
  colorScheme: 'light dark',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <GlobalErrorHandler 
          showNotifications={true}
          enableReporting={process.env.NODE_ENV === 'production'}
          enableConsoleLogging={process.env.NODE_ENV === 'development'}
        />
        <RootErrorBoundary>
          <ApiProvider>
            <ThemeProvider
              config={{
                defaultTheme: 'system',
                enableSystemTheme: true,
                disableTransitionOnChange: false,
                storageKey: 'morag-ui-theme',
                themes: ['light', 'dark'],
              }}
            >
              <div className="relative flex min-h-screen flex-col">
                <div className="flex-1">
                  {children}
                </div>
              </div>
            </ThemeProvider>
          </ApiProvider>
        </RootErrorBoundary>
      </body>
    </html>
  );
}
