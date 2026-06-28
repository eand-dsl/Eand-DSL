import { useState } from 'react';

export interface Snippet { swift: string; kotlin: string; react: string; }
type Lang = keyof Snippet;
const TABS: { id: Lang; label: string; badge: string }[] = [
  { id: 'swift', label: 'SwiftUI', badge: 'iOS' },
  { id: 'kotlin', label: 'Compose', badge: 'Android' },
  { id: 'react', label: 'React', badge: 'Figma Make' },
];

// single-pass tokenizer: comment | string | keyword | type (priority by alternation order)
const RE = new RegExp([
  /(\/\/[^\n]*)/.source,
  /("[^"]*"|'[^']*')/.source,
  /\b(import|struct|class|object|fun|func|val|var|let|public|private|static|return|some|export|function|const|from|enum|in)\b/.source,
  /\b(Eand[A-Za-z]+|Color|Text|Button|VStack|HStack|Capsule|Modifier|TextStyle|FontWeight|Composable|CGFloat|View|Badge|Section|NavBar|TopBar|Chip|Tabs|ListRow|QuickAction|PlanCard|Icon)\b/.source,
].join('|'), 'g');

function highlight(code: string): string {
  const esc = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return esc.replace(RE, (m, com, str, kw, ty) => {
    if (com) return `<span class="tok-com">${com}</span>`;
    if (str) return `<span class="tok-str">${str}</span>`;
    if (kw) return `<span class="tok-key">${kw}</span>`;
    if (ty) return `<span class="tok-typ">${ty}</span>`;
    return m;
  });
}

export function CodeTabs({ code }: { code: Snippet }) {
  const [lang, setLang] = useState<Lang>('swift');
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard?.writeText(code[lang]);
    setCopied(true); setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="code">
      <div className="code-tabs">
        {TABS.map((t) => (
          <button key={t.id} className={`code-tab ${lang === t.id ? 'on' : ''}`} onClick={() => setLang(t.id)}>
            {t.label} <span className="badge">{t.badge}</span>
          </button>
        ))}
        <button className="code-copy" onClick={copy}>{copied ? 'Copied' : 'Copy'}</button>
      </div>
      <pre className="code-body" dangerouslySetInnerHTML={{ __html: highlight(code[lang].trim()) }} />
    </div>
  );
}
