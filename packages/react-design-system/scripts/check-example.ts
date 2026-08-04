// Type-checks the guidelines' worked example against the built package types.
// Requires `npm run build` first — it resolves the import to dist/index.d.ts.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const PKG = resolve(here, '..');

export function extractExample(md: string): string | null {
  const m = /```tsx example\n([\s\S]*?)```/.exec(md);
  return m ? m[1].trimEnd() : null;
}

function run(): void {
  const md = readFileSync(resolve(PKG, 'MAKE_KIT_GUIDELINES.md'), 'utf8');
  const example = extractExample(md);
  if (!example) {
    console.error('✗ no ```tsx example fence found in MAKE_KIT_GUIDELINES.md');
    process.exit(1);
  }

  const dir = resolve(PKG, '.example-check');
  mkdirSync(dir, { recursive: true });

  // Every identifier the example uses comes from the package's public entry point,
  // so a wildcard import is enough to prove the names and prop types line up.
  writeFileSync(
    resolve(dir, 'example.tsx'),
    [
      "import * as DS from '@eand/react-design-system';",
      'const { ' +
        [...new Set([...example.matchAll(/<([A-Z][A-Za-z0-9]*)/g)].map((m) => m[1]))].join(', ') +
        ' } = DS;',
      'export default function Example() {',
      '  return (',
      example,
      '  );',
      '}',
    ].join('\n'),
  );

  writeFileSync(
    resolve(dir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          lib: ['ES2020', 'DOM'],
          jsx: 'react-jsx',
          module: 'ESNext',
          moduleResolution: 'bundler',
          strict: true,
          skipLibCheck: true,
          noEmit: true,
          types: ['react'],
          baseUrl: '.',
          paths: { '@eand/react-design-system': ['../dist/index.d.ts'] },
        },
        include: ['example.tsx'],
      },
      null,
      2,
    ),
  );

  try {
    execFileSync('npx', ['tsc', '-p', resolve(dir, 'tsconfig.json')], { cwd: PKG, stdio: 'inherit' });
    console.log('✓ worked example type-checks against dist');
    rmSync(dir, { recursive: true, force: true });
  } catch {
    console.error(`✗ worked example does not type-check — see ${dir}/example.tsx`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) run();
