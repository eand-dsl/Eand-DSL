/**
 * Publishes the Figma Make kit to its own GitHub repository.
 *
 * The kit repo is a *build artifact*, never hand-edited. It exists because Figma Make
 * consumes the library from outside this monorepo — either through esm.sh, which resolves
 * package.json `exports` straight from a tagged GitHub tree, or from an npm registry. A
 * hand-copied kit is what drifted last time (it went on referencing demo/home-screen.png
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

// The monorepo's root .gitignore ignores dist/. The kit repo must NOT: esm.sh resolves
// package.json "exports" against the committed tree, so an uncommitted dist/ is an empty kit.
writeFileSync(
  join(stage, '.gitignore'),
  [
    '# dist/ is deliberately committed — esm.sh resolves package.json "exports" from the',
    '# tagged tree, so the built output has to be in it.',
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

  Repo    https://github.com/${KIT_REPO}
  esm.sh  https://esm.sh/gh/${KIT_REPO}@${tag}

Next: in Figma Make, create a kit from that package and paste MAKE_KIT_GUIDELINES.md as
the kit guidelines. The package alone does not teach Make how to assemble a screen.
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

### 1. Point Make at the package

**Option A — esm.sh (no credentials, works immediately)**

\`\`\`
https://esm.sh/gh/${KIT_REPO}@${tag}
\`\`\`

Pin the tag, never \`main\`. \`main\` is force-pushed on every release, so an unpinned
reference changes underneath your Make files without warning.

**Option B — npm registry**

Publish \`@eand/react-design-system\` to Figma's private npm registry (recommended if you
have the e& org) or to public npm, then add it to the kit by package name. The full
runbook — registry setup, auth, versioning, and verification — is in
[\`MAKE_KIT_README.md\`](./MAKE_KIT_README.md). Publishing needs e& org credentials, so it
is deliberately a manual, owner-operated step.

### 2. Paste the guidelines

Copy all of [\`MAKE_KIT_GUIDELINES.md\`](./MAKE_KIT_GUIDELINES.md) into the kit's
guidelines field. **This step is not optional.** The package gives Make the components;
the guidelines give it the golden rules, the prop reference, the UX→UI assembly table,
and a worked screen. Without them Make produces code that imports the right library and
still assembles the wrong screen.

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

Components are inline-token-styled, so they render correctly with no CSS import — that is
what lets them work through esm.sh with no build step. \`dist/styles.css\` ships the raw
\`--eand-*\` custom properties if you want them for your own styles.

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
