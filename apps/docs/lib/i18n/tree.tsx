import type * as PageTree from 'fumadocs-core/page-tree';
import { I18nLabel } from '@/components/i18n-text';

/** Page-tree names are ReactNode, so sidebar labels can be swapped for a client
 *  component that resolves the active language at render time. The tree itself
 *  stays server-built and single-locale. */
/** Separators and folders render as `[node.icon, node.name]`, so an element name
 *  sits in an array and needs its own key — a bare string did not. */
function label(name: PageTree.Root['name']) {
  return typeof name === 'string' ? <I18nLabel key="label" en={name} /> : name;
}

function localizeNode(node: PageTree.Node): PageTree.Node {
  if (node.type === 'folder') {
    return {
      ...node,
      name: label(node.name),
      index: node.index ? { ...node.index, name: label(node.index.name) } : undefined,
      children: node.children.map(localizeNode),
    };
  }
  if (node.type === 'separator') {
    return { ...node, name: node.name ? label(node.name) : undefined };
  }
  return { ...node, name: label(node.name) };
}

export function localizeTree(tree: PageTree.Root): PageTree.Root {
  return { ...tree, name: label(tree.name), children: tree.children.map(localizeNode) };
}
