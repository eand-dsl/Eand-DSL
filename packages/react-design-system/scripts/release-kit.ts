/**
 * Publishes the Figma Make kit to its own GitHub repository.
 *
 * The kit repo is a *build artifact*, never hand-edited. It is the versioned, reviewable
 * snapshot you publish to npm from — Figma Make itself only accepts npm packages, not
 * GitHub repos or CDN URLs, so this repo feeds `npm publish` rather than Make directly.
 * A hand-copied kit is what drifted last time (it went on referencing demo/home-screen.png
 * for weeks after that file was renamed), so nothing here is copied by hand.
 *
 * Usage:
 *   npm run kit:release                 # gate, stage, push, tag
 *   npm run kit:release -- --dry-run    # gate and stage, print the tree, push nothing
 *
 * The gate is the same one .github/workflows/design-system.yml runs. It is repeated here
 * rather than assumed: a release cut from a laptop must not be able to skip it.
 */
import { execFileSync, execSync } from 'node:child_process';
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const PKG_DIR = resolve(import.meta.dirname, '..');
const KIT_REPO = process.env.KIT_REPO ?? 'eand-dsl/eand-make-kit';
const SOURCE_REPO = 'eand-dsl/Eand-DSL';
const DRY_RUN = process.argv.includes('--dry-run');

const run = (cmd: string, cwd = PKG_DIR) =>
  execSync(cmd, { cwd, stdio: 'inherit', env: process.env });

const capture = (file: string, args: string[], cwd = PKG_DIR) =>
  execFileSync(file, args, { cwd, encoding: 'utf8' }).trim();

// ---------------------------------------------------------------- 1. the gate

const GATE = [
  'npm run build',
  'npm test',
  'npm run typecheck',
  'npm run guidelines:check',
  'npm run guidelines:example',
  'npm run smoke',
];

console.log('→ running the pre-publish gate');
for (const cmd of GATE) {
  console.log(`\n  $ ${cmd}`);
  run(cmd);
}

// `npm pack` is the authority on what actually ships — the `files` array has regressed
// before. Pack into a temp dir so a stray .tgz never lands in the working tree.
const packDir = mkdtempSync(join(tmpdir(), 'eand-kit-pack-'));
const packed: { files: { path: string }[] }[] = JSON.parse(
  capture('npm', ['pack', '--json', '--pack-destination', packDir]),
);
rmSync(packDir, { recursive: true, force: true });

const shipped = packed[0].files.map((f) => f.path).sort();
const unexpected = shipped.filter(
  (p) => !p.startsWith('dist/') && !['package.json', 'MAKE_KIT_GUIDELINES.md', 'MAKE_KIT_README.md'].includes(p),
);
if (unexpected.length) {
  console.error(`\n✗ npm pack ships files outside dist/ and the two MD files:\n  ${unexpected.join('\n  ')}`);
  console.error('  Fix the "files" array in package.json before releasing.');
  process.exit(1);
}
console.log(`\n✓ gate green — npm pack ships ${shipped.length} files`);

// ------------------------------------------------------------- 2. stage the kit

const pkg = JSON.parse(readFileSync(join(PKG_DIR, 'package.json'), 'utf8'));
const version: string = pkg.version;
const tag = `v${version}`;
const sourceSha = capture('git', ['rev-parse', '--short', 'HEAD']);

const stage = mkdtempSync(join(tmpdir(), 'eand-kit-'));
console.log(`→ staging ${KIT_REPO} ${tag} in ${stage}`);

cpSync(join(PKG_DIR, 'dist'), join(stage, 'dist'), { recursive: true });
for (const f of ['package.json', 'MAKE_KIT_GUIDELINES.md', 'MAKE_KIT_README.md']) {
  cpSync(join(PKG_DIR, f), join(stage, f));
}

// The monorepo's root .gitignore ignores dist/. The kit repo must NOT: the whole point of
// that repo is to be an inspectable snapshot of exactly what `npm publish` uploads, and a
// tag with no dist/ shows nothing. `npm publish` is run from a checkout of it.
writeFileSync(
  join(stage, '.gitignore'),
  [
    '# dist/ is deliberately committed — this repo is a snapshot of exactly what',
    '# `npm publish` uploads, so the built output has to be in the tagged tree.',
    'node_modules/',
    '.DS_Store',
    '*.log',
    '',
  ].join('\n'),
);

writeFileSync(join(stage, 'README.md'), kitReadme({ version, tag, sourceSha }));

if (DRY_RUN) {
  console.log('\n--dry-run: staged tree\n');
  run(`find . -type f -not -path './.git/*' | sort`, stage);
  console.log(`\nStaged at ${stage} — nothing pushed.`);
  process.exit(0);
}

// -------------------------------------------------------- 3. commit, push, tag

console.log(`→ publishing to ${KIT_REPO}`);
run('git init -q -b main', stage);
run(`git remote add origin https://github.com/${KIT_REPO}.git`, stage);

// The staging repo is brand new, so it inherits only global git config — and this
// monorepo's identity is set locally, not globally. Carry it across explicitly rather
// than letting the commit fail on "Author identity unknown" in an otherwise green run.
const identity = (key: string, fallback: string) => {
  try {
    return capture('git', ['config', '--get', key]) || fallback;
  } catch {
    return fallback;
  }
};
run(`git config user.name "${identity('user.name', 'eand-dsl-bot')}"`, stage);
run(
  `git config user.email "${identity('user.email', 'eand-dsl-bot@users.noreply.github.com')}"`,
  stage,
);

run('git add -A', stage);
execFileSync(
  'git',
  ['commit', '-q', '-m', `release: @eand/react-design-system ${version}\n\nGenerated by scripts/release-kit.ts from ${SOURCE_REPO}@${sourceSha}.\nDo not edit this repository by hand — changes are overwritten on the next release.`],
  { cwd: stage, stdio: 'inherit' },
);

// Force-push: the kit repo has no history worth preserving — every release is a full
// snapshot of the built package, and the tags are the durable references.
run('git push -q --force origin main', stage);
execFileSync('git', ['tag', '-f', tag], { cwd: stage, stdio: 'inherit' });
run(`git push -q --force origin ${tag}`, stage);

rmSync(stage, { recursive: true, force: true });

console.log(`
✓ published ${KIT_REPO} ${tag}

  https://github.com/${KIT_REPO}/releases/tag/${tag}

This is the artifact, not yet a usable Make kit — Figma Make installs from an npm
registry, not from GitHub. To finish:

  1. npm publish   (Figma private registry or public npm — see MAKE_KIT_README.md)
  2. Figma Make -> Make kits -> add ${pkg.name}
  3. paste MAKE_KIT_GUIDELINES.md into the kit's guidelines/guidelines.md

Step 3 is not optional: the package alone does not teach Make how to assemble a screen.
`);

// ---------------------------------------------------------------- kit README

function kitReadme({ version, tag, sourceSha }: { version: string; tag: string; sourceSha: string }) {
  return `# e& Design System — Figma Make kit

The **e& Consumer App** design system, packaged for [Figma Make](https://figma.com/make):
54 React components and 396 icons, built to the Figma \`e& Consumer App DSL V1.1\`
library and styled entirely from its exported design tokens.

> **Generated repository — do not edit by hand.**
> Every file here is produced by \`scripts/release-kit.ts\` in
> [${SOURCE_REPO}](https://github.com/${SOURCE_REPO}) and overwritten on the next release.
> Open issues and pull requests against that repository instead.
>
> This release: \`${version}\`, cut from \`${SOURCE_REPO}@${sourceSha}\`.

## What's in here

| Path | What it is |
| --- | --- |
| \`dist/\` | The built library — ESM, CJS, TypeScript declarations, and \`styles.css\` |
| \`package.json\` | \`@eand/react-design-system\`, self-contained: no dependencies, React 18/19 as peers |
| \`MAKE_KIT_GUIDELINES.md\` | **The artifact that teaches Make how to build e& screens.** Paste this into your kit |
| \`MAKE_KIT_README.md\` | Build and npm-publish runbook for maintainers |

## Set up the kit in Figma Make

> **This repository is not itself a Make kit source.** Figma Make kits accept **npm
> packages only** — the public registry, or a Figma-hosted private registry scoped to your
> org. GitHub repositories and CDN URLs such as esm.sh are not accepted
> ([Figma docs](https://developers.figma.com/docs/code/bring-your-design-system-package/)).
> This repo is the versioned artifact you publish *from*.

### 1. Publish the package

Publish \`@eand/react-design-system\` to Figma's private npm registry (the intended route —
it keeps the library inside the e& org, and needs a Figma org admin to claim the \`@eand\`
scope) or to public npm. The full runbook — registry setup, auth, versioning, verification,
and the exact request to send an org admin — is in
[\`MAKE_KIT_README.md\`](./MAKE_KIT_README.md). It needs e& org credentials, so it is
deliberately a manual, owner-operated step.

The package already satisfies Figma's requirements: React 18 as a peer dependency,
Vite-built, and no \`workspace:*\` dependencies (in fact no dependencies at all).

### 2. Add it to a kit and paste the guidelines

Figma Make → **Make kits** → create a kit → add \`@eand/react-design-system\` by name. The
kit gets a \`guidelines/\` folder; copy all of
[\`MAKE_KIT_GUIDELINES.md\`](./MAKE_KIT_GUIDELINES.md) into \`guidelines/guidelines.md\`,
which Make reads first.

**This step is not optional.** The package gives Make the components; the guidelines give
it the golden rules, the prop reference, the UX→UI assembly table, and a worked screen.
Without them Make produces code that imports the right library and still assembles the
wrong screen. Figma can auto-generate guidelines — don't; these are hand-written and
fact-checked against the library on every push.

### 3. Prompt with a wireframe

In a Make file, describe or paste a UX wireframe. Make installs the package and assembles
the screen from real e& components, using design tokens rather than hardcoded values.

## Using it as a plain library

\`\`\`bash
npm install @eand/react-design-system   # once published to a registry
\`\`\`

\`\`\`tsx
import { TopBar, Section, ListRow, Button, Icon } from '@eand/react-design-system';
\`\`\`

Components are inline-token-styled, so they render correctly with no CSS import and no
build-step configuration — which is what keeps them reliable inside Make's Vite sandbox.
\`dist/styles.css\` ships the raw \`--eand-*\` custom properties if you want them for your
own styles.

Icons are part of this package; there is no separate icons package. Every icon has an
outline form and a \`-filled\` form: 198 base names, 396 total.

## Documentation

Full component documentation, live demos, prop tables, and a searchable icon gallery live
in the design system's documentation site. The source of truth for component behaviour is
\`design.md\` in [${SOURCE_REPO}](https://github.com/${SOURCE_REPO});
\`MAKE_KIT_GUIDELINES.md\` here is the Make-facing distillation of it, and a CI check keeps
the two from drifting apart.
`;
}
