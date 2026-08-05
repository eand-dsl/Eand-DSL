import { RootProvider } from 'fumadocs-ui/provider/next';
import type { Metadata } from 'next';
import './global.css';
import '@eand/react-design-system/styles.css';
import { Inter } from 'next/font/google';
import { appName, siteUrl } from '@/lib/shared';

const inter = Inter({
  subsets: ['latin'],
});

// Without metadataBase, the OG/Twitter image paths from app/og/ resolve against
// localhost in every build. Vercel exposes the deployment host as VERCEL_URL.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s — ${appName}` },
  description:
    'React component library for the e& Consumer App, built to the Figma e& Consumer App DSL V1.1.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
