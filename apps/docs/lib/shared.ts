export const appName = 'e& Design System';

// Absolute origin for metadataBase / OG images. Vercel sets VERCEL_PROJECT_PRODUCTION_URL
// on every deployment of a production-linked project and VERCEL_URL per deployment;
// neither carries a scheme. Falls back to localhost for `next dev` and local builds.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';

export const docsRoute = '/docs';
export const docsImageRoute = '/og/docs';
export const docsContentRoute = '/llms.mdx/docs';

// Used by the OG-image and llms.txt routes to build source links.
export const gitConfig = {
  user: 'eand-dsl',
  repo: 'Eand-DSL',
  branch: 'main',
};
