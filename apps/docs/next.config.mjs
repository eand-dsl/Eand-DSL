import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // file:../../packages/* deps are symlinks that resolve outside apps/docs;
  // Turbopack only sees files under its root, so lift it to the repo root.
  turbopack: {
    root: '../..',
  },
  outputFileTracingRoot: '../..',
};

export default withMDX(config);
