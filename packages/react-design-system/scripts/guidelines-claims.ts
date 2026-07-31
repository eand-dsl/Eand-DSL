// Parses MAKE_KIT_GUIDELINES.md into the set of checkable claims it makes.
// Pure text in, structured claims out — no filesystem, no library import.

export interface Claims {
  imports: string[];
  components: Record<string, Record<string, string[]>>;
  iconNames: string[];
}

/** TypeScript primitive/builtin type names. A union of only these is a type annotation
 *  (e.g. `value: string|number`), not a literal-value claim. */
const PRIMITIVE_TYPES = new Set([
  'string', 'number', 'boolean', 'bigint', 'symbol',
  'object', 'null', 'undefined', 'any', 'unknown', 'never', 'void',
]);

/** A single union member: a double- or single-quoted string literal, or a bare lowercase identifier. */
const UNION_MEMBER = String.raw`(?:"[^"]*"|'[^']*'|[a-z][a-z0-9-]*)`;
const UNION_MEMBER_RE = new RegExp(UNION_MEMBER, 'g');
/** Two or more union members (quoted string literals and/or lowercase identifiers) joined by `|`. */
const LITERAL_UNION = new RegExp(`^${UNION_MEMBER}(?:\\s*\\|\\s*${UNION_MEMBER})+$`);
const PARAM = /^([a-zA-Z][a-zA-Z0-9]*)\??\s*(?::\s*([\s\S]+))?$/;

const OPEN = new Set(['{', '[', '(']);
const CLOSE = new Set(['}', ']', ')']);

function stripQuotes(value: string): string {
  const quote = value[0];
  return (quote === '"' || quote === "'") && value[value.length - 1] === quote
    ? value.slice(1, -1)
    : value;
}

/** Parses a validated literal-union annotation into its member values (quotes stripped), or
 *  null if every member is a bare primitive-type name — i.e. it's a type annotation, not a
 *  value claim. */
function unionValues(trimmed: string): string[] | null {
  if (!LITERAL_UNION.test(trimmed)) return null;
  const members = trimmed.match(UNION_MEMBER_RE) ?? [];
  const isPrimitiveTypeUnion = members.every(
    (m) => !(m.startsWith('"') || m.startsWith("'")) && PRIMITIVE_TYPES.has(m),
  );
  return isPrimitiveTypeUnion ? null : members.map(stripQuotes);
}

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
    props[name] = (trimmed && unionValues(trimmed)) || [];
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

/** Real icon names are kebab-case. This also rejects prose placeholders like
 *  `<Icon name="..." />` or `<Icon name="…" />` used to mean "an icon goes here". */
const KEBAB_CASE_ICON_NAME = /^[a-z][a-z0-9-]*$/;

function parseIconNames(md: string): string[] {
  const names = new Set<string>();
  for (const m of md.matchAll(/<Icon\s+name="([^"]+)"/g)) {
    if (KEBAB_CASE_ICON_NAME.test(m[1])) names.add(m[1]);
  }
  const block = /<!-- icons:begin -->([\s\S]*?)<!-- icons:end -->/.exec(md);
  if (block) {
    for (const m of block[1].matchAll(/`([^`]+)`/g)) {
      if (KEBAB_CASE_ICON_NAME.test(m[1])) names.add(m[1]);
    }
  }
  return [...names].sort();
}

export function parseClaims(md: string): Claims {
  return {
    imports: [...new Set([...md.matchAll(/from\s+'([^']+)'/g)].map((m) => m[1]))],
    components: parseComponents(md),
    iconNames: parseIconNames(md),
  };
}
