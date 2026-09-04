import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import { localizeTree } from '@/lib/i18n/tree';

export default function Layout({ children }: LayoutProps<'/docs'>) {
  return (
    <DocsLayout tree={localizeTree(source.getPageTree())} {...baseOptions()}>
      {children}
    </DocsLayout>
  );
}
