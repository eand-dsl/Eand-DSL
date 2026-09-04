import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import NavTitle from '@/components/nav-title';

export function baseOptions(): BaseLayoutProps {
  return {
    // Renders fumadocs' own language dropdown against the locales supplied by
    // LanguageProvider. Routing stays single-locale; the provider owns the switch.
    i18n: true,
    nav: {
      title: <NavTitle />,
    },
  };
}
