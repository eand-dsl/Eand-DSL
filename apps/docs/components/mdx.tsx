import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { ComponentDemo } from './preview/demo';
import { Playground } from './preview/playground';
import { PropsTable } from './preview/props-table';
import { TokenColors, TokenTypography, TokenSpacing } from './preview/tokens-browser';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ComponentDemo,
    Playground,
    PropsTable,
    TokenColors,
    TokenTypography,
    TokenSpacing,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
