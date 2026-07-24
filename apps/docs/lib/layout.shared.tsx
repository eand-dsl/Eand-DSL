import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, letterSpacing: '-1px', lineHeight: 1 }}>
            e<b style={{ color: '#e00800' }}>&amp;</b>
          </span>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Design System</span>
        </span>
      ),
    },
  };
}
