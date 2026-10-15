'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { RootProvider } from 'fumadocs-ui/provider/next';
import SearchDialogWithImage from '@/components/search-dialog';
import { fumadocsAr } from './fumadocs-ar';
import { ui, type Lang } from './ui';

export const STORAGE_KEY = 'eand-lang';

interface LangCtx {
  lang: Lang;
  t: (typeof ui)[Lang];
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<LangCtx | null>(null);

const LOCALES = [
  { locale: 'en', name: 'English' },
  { locale: 'ar', name: 'العربية' },
];

/** Sets `lang` before first paint so the Arabic font subset is picked up without
 *  a swap. Direction stays `ltr` in both languages — the header, sidebar and TOC
 *  keep their positions and only the copy changes.
 *  `?lang=ar` wins over the stored value so a direct link opens in Arabic. */
export const noFlashScript = `(function(){try{var q=new URLSearchParams(location.search).get('lang');var l=q||localStorage.getItem('${STORAGE_KEY}');if(l==='ar'){document.documentElement.lang='ar'}}catch(e){}})()`;

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('lang');
    if (q === 'ar' || q === 'en') {
      setLangState(q);
      localStorage.setItem(STORAGE_KEY, q);
      return;
    }
    if (localStorage.getItem(STORAGE_KEY) === 'ar') setLangState('ar');
  }, []);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.lang = next;
  }, []);

  return (
    <RootProvider
      dir="ltr"
      search={{ SearchDialog: SearchDialogWithImage }}
      i18n={{
        locale: lang,
        locales: LOCALES,
        translations: lang === 'ar' ? fumadocsAr : undefined,
        onLocaleChange: (v) => setLang(v === 'ar' ? 'ar' : 'en'),
      }}
    >
      <LangContext.Provider
        value={{
          lang,
          t: ui[lang],
          setLang,
          toggle: () => setLang(lang === 'en' ? 'ar' : 'en'),
        }}
      >
        {children}
      </LangContext.Provider>
    </RootProvider>
  );
}

export function useLang(): LangCtx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang must be used inside LanguageProvider');
  return ctx;
}
