import type { Metadata } from 'next';
import './global.css';
import '@eand/react-design-system/styles.css';
import { appName, siteUrl } from '@/lib/shared';
import { LanguageProvider, noFlashScript } from '@/lib/i18n/provider';

// Without metadataBase, the OG/Twitter image paths from app/og/ resolve against
// localhost in every build. Vercel exposes the deployment host as VERCEL_URL.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s — ${appName}` },
  description:
    'React component library for the e& Consumer App, built to the Figma e& Consumer App DSL V1.2.',
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashScript }} />
      </head>
      <body className="flex flex-col min-h-screen">
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
