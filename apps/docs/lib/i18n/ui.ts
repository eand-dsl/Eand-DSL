export type Lang = 'en' | 'ar';

/** Site chrome. Component names (Button, TopBar…) are code identifiers and stay
 *  in English in both languages — only prose around them is translated. */
export const ui = {
  en: {
    langName: 'العربية',
    langSwitchLabel: 'Switch to Arabic',
    tagline: 'e& Consumer App',
    siteTitle: 'Design System',
    heroTitle: 'The e& Design System',
    heroBody:
      'A React component library built to the Figma e& Consumer App DSL V1.2 — every token resolved from the same variable export that generates the SwiftUI and Compose tokens, so values never drift between platforms.',
    heroBodyEmphasis: 'e& Consumer App DSL V1.2',
    ctaDocs: 'Read the docs',
    ctaComponents: 'Browse components',
    cards: {
      started: { title: 'Get started', body: 'Install the package and assemble your first e& screen.' },
      components: { title: 'Components', body: '57 documented components with live, knob-driven demos and prop tables.' },
      foundations: { title: 'Foundations', body: 'Colour, typography, and spacing — resolved from the Figma variable export.' },
      icons: { title: 'Icons', body: '198 icons in outline and filled forms, searchable by name, description, or alias.' },
    },
    finder: {
      title: 'Component Finder',
      body: 'Search every React component, icon, and Figma library component at once — or drop / paste an image to search by picture. The field is built from the design system’s own tokens and icons; the search runs entirely in your browser, with no server model.',
      placeholder: 'Search components, icons, or describe it…',
    },
    untranslated: 'This page’s reference content is not translated yet.',
  },
  ar: {
    langName: 'English',
    langSwitchLabel: 'التبديل إلى الإنجليزية',
    tagline: 'تطبيق ⁦e&⁩ للأفراد',
    siteTitle: 'نظام التصميم',
    heroTitle: 'نظام التصميم من ⁦e&⁩',
    heroBody:
      'مكتبة مكوّنات React مبنية وفق نظام التصميم في Figma الخاص بتطبيق ⁦e&⁩ للأفراد، الإصدار 1.2 — تُستمد كل الرموز التصميمية من ملف المتغيّرات نفسه الذي يولّد رموز SwiftUI وCompose، فلا تتباين القيم بين المنصّات.',
    heroBodyEmphasis: 'نظام تصميم تطبيق ⁦e&⁩ للأفراد 1.2',
    ctaDocs: 'اطّلع على التوثيق',
    ctaComponents: 'استعرض المكوّنات',
    cards: {
      started: { title: 'ابدأ الآن', body: 'ثبّت الحزمة وابنِ أول شاشة لك من ⁦e&⁩.' },
      components: { title: 'المكوّنات', body: '57 مكوّنًا موثّقًا مع عروض تفاعلية مباشرة وجداول للخصائص.' },
      foundations: { title: 'الأساسيات', body: 'الألوان والطباعة والمسافات — مستمدّة من ملف متغيّرات Figma.' },
      icons: { title: 'الأيقونات', body: '198 أيقونة بنمطي الإطار والتعبئة، قابلة للبحث بالاسم أو الوصف أو الاسم البديل.' },
    },
    finder: {
      title: 'مستكشف المكوّنات',
      body: 'ابحث في كل مكوّنات React والأيقونات ومكوّنات مكتبة Figma في وقت واحد — أو أفلِت صورة أو الصقها للبحث بالصورة. حقل البحث مبنيّ من رموز نظام التصميم وأيقوناته، والبحث يعمل بالكامل في متصفّحك دون أي معالجة على الخادم.',
      placeholder: 'ابحث عن مكوّن أو أيقونة، أو اكتب وصفًا…',
    },
    untranslated: 'لم تُترجم المادة المرجعية في هذه الصفحة بعد.',
  },
} as const;

/** Sidebar labels keyed by their English string: meta.json titles, the
 *  `---Group---` separators, and the page titles that are concepts rather than
 *  code identifiers. Component page titles are absent on purpose — `Button`
 *  and `TopBar` are API names and stay Latin in both languages. */
export const navLabels: Record<string, string> = {
  Docs: 'التوثيق',
  Components: 'المكوّنات',
  Foundations: 'الأساسيات',
  Primitives: 'العناصر الأوّلية',
  Controls: 'عناصر التحكّم',
  Layout: 'التخطيط',
  Navigation: 'التنقّل',
  'Feedback & Status': 'التنبيهات والحالة',
  Overlays: 'الطبقات المنبثقة',
  Cards: 'البطاقات',
  'Get started': 'ابدأ الآن',
  Colours: 'الألوان',
  Typography: 'الطباعة',
  'Spacing & Radius': 'المسافات واستدارة الحواف',
  Icons: 'الأيقونات',
};

export function t(lang: Lang) {
  return ui[lang];
}
