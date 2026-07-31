// Parses MAKE_KIT_GUIDELINES.md into the set of checkable claims it makes.
// Pure text in, structured claims out — no filesystem, no library import.

export interface Claims {
  imports: string[];
  components: Record<string, Record<string, string[]>>;
  iconNames: string[];
}

/** Two or more lowercase identifiers joined by `|`. */
const LITERAL_UNION = /^[a-z][a-z0-9-]*(\s*\|\s*[a-z][a-z0-9-]*)+$/;
const PARAM = /^([a-zA-Z][a-zA-Z0-9]*)\??\s*(?::\s*([\s\S]+))?$/;

const OPEN = new Set(['{', '[', '(']);
const CLOSE = new Set(['}', ']', ')']);

/** Split a parameter list on top-level commas, so nested `{…}` and `[…]` survive. */
function splitParams(body: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of body) {
    if (OPEN.has(ch)) depth++;
    else if (CLOSE.has(ch)) depth--;
    if (ch === ',' && depth === 0) {
      parts.push(cur);
      cur = '';
      continue;
    }
    cur += ch;
  }
  parts.push(cur);
  return parts.map((p) => p.trim()).filter(Boolean);
}

function parseParams(body: string): Record<string, string[]> {
  const props: Record<string, string[]> = {};
  for (const token of splitParams(body)) {
    const m = PARAM.exec(token);
    if (!m) continue;
    const [, name, annotation] = m;
    const trimmed = annotation?.trim();
    props[name] = trimmed && LITERAL_UNION.test(trimmed)
      ? trimmed.split('|').map((v) => v.trim())
      : [];
  }
  return props;
}

function parseComponents(md: string): Claims['components'] {
  const out: Claims['components'] = {};
  const head = /`([A-Z][A-Za-z0-9]*)\(\{/g;
  let m: RegExpExecArray | null;
  while ((m = head.exec(md))) {
    let depth = 1;
    let i = head.lastIndex;
    while (i < md.length && depth > 0) {
      if (md[i] === '{') depth++;
      else if (md[i] === '}') depth--;
      i++;
    }
    if (depth !== 0) continue;
    out[m[1]] = { ...(out[m[1]] ?? {}), ...parseParams(md.slice(head.lastIndex, i - 1)) };
  }
  return out;
}

function parseIconNames(md: string): string[] {
  const names = new Set<string>();
  for (const m of md.matchAll(/<Icon\s+name="([^"]+)"/g)) names.add(m[1]);
  const block = /<!-- icons:begin -->([\s\S]*?)<!-- icons:end -->/.exec(md);
  if (block) for (const m of block[1].matchAll(/`([a-z0-9-]+)`/g)) names.add(m[1]);
  return [...names].sort();
}

export function parseClaims(md: string): Claims {
  return {
    imports: [...new Set([...md.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]))],
    components: parseComponents(md),
    iconNames: parseIconNames(md),
  };
}
