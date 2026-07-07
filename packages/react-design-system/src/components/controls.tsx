import { useState, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { color, space, ty, radius, PILL, T } from '../system';
import { Text, Icon } from './primitives';

/* ---------------- Input ---------------- */
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helper?: ReactNode;
  error?: ReactNode;
  variant?: 'outlined' | 'filled';
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}
export function Input({ label, helper, error, variant = 'outlined', leadingIcon, trailingIcon, style, disabled, ...rest }: InputProps) {
  const borderColor = error ? color('border.danger') : color('border.solid.default');
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%' }}>
      {label ? <Text variant="title.xs">{label}</Text> : null}
      <span style={{
        display: 'flex', alignItems: 'center', gap: space('sm'), height: 52, padding: `0 ${space('lg')}`,
        borderRadius: 16, boxSizing: 'border-box',
        background: variant === 'filled' ? color('surface.base.default') : color('surface.canvas.default'),
        border: variant === 'filled' ? '1px solid transparent' : `1px solid ${borderColor}`,
        opacity: disabled ? 0.5 : 1,
      }}>
        {leadingIcon ? <Icon size="sm">{leadingIcon}</Icon> : null}
        <input disabled={disabled} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', color: color('text.default.default'), ...ty('body.md'), ...style }} {...rest} />
        {trailingIcon ? <Icon size="sm">{trailingIcon}</Icon> : null}
      </span>
      {(error || helper) ? <Text variant="body.sm" color={error ? color('text.danger.default') : color('text.default.muted')}>{error ?? helper}</Text> : null}
    </label>
  );
}

/* ---------------- Chip ---------------- */
export interface ChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  selected?: boolean;
  /** Inverse surface for dark (midnight/brand) backgrounds (Figma `surface=inverse`). */
  inverse?: boolean;
  leadingIcon?: ReactNode;
  onClick?: () => void;
}
export function Chip({ selected, inverse, leadingIcon, style, children, onClick, ...rest }: ChipProps) {
  const scheme: CSSProperties = inverse
    ? {
        border: `1px solid ${color(selected ? 'chips.default.inverse.border.focus' : 'chips.default.inverse.border.default')}`,
        background: selected ? color('chips.default.inverse.surface.focus') : 'transparent',
        color: color(selected ? 'chips.default.inverse.text.focus' : 'chips.default.inverse.text.default'),
      }
    : {
        border: `1px solid ${selected ? color('border.focus') : color('border.solid.default')}`,
        background: selected ? color('surface.base.brand') : color('surface.canvas.default'),
        color: selected ? color('text.default.inverse') : color('text.default.default'),
      };
  return (
    <button onClick={onClick} aria-pressed={selected}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: space('xs'), height: 40, padding: `0 ${space('md')}`,
        borderRadius: PILL, cursor: 'pointer', whiteSpace: 'nowrap',
        ...scheme, ...ty('body.md'), ...style,
      }} {...rest}>
      {leadingIcon ? <Icon size="sm">{leadingIcon}</Icon> : null}{children}
    </button>
  );
}

/* ---------------- FilterPill ---------------- */
export interface FilterPillProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Maps to Figma `State=Focused` (V1.1 `filter-pill` set 26151:391) — the pressed/active pill state. */
  selected?: boolean;
  /** Inverse color scheme for dark (midnight/brand) surfaces (Figma `Color=Inverse`). */
  inverse?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
export function FilterPill({ selected, inverse, disabled, style, children, onClick, ...rest }: FilterPillProps) {
  const scheme = inverse ? 'inverse' : 'default';
  const state = disabled ? 'disabled' : selected ? 'focus' : 'default';
  const background = selected && !disabled
    ? color(inverse ? 'filterPill.surface.inverse.focus' : 'surface.base.default')
    : inverse ? 'transparent' : color('surface.canvas.default');
  return (
    <button onClick={onClick} aria-pressed={selected} disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: space('xs'), height: 40, padding: `0 ${space('md')}`,
        borderRadius: PILL, cursor: disabled ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
        border: `1px solid ${color(`filterPill.border.${scheme}.${state}`)}`,
        background,
        color: color(`filterPill.text.${scheme}.${state}`), ...ty('body.md'), ...style,
      }} {...rest}>
      {children}<Icon size="xs">⌄</Icon>
    </button>
  );
}

/* ---------------- Checkbox ---------------- */
export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode;
  /** Control size — `md` 20×20 (default) or `sm` 16×16 (Figma V1.1 `size` axis). */
  size?: 'sm' | 'md';
  /** Inverse color scheme for dark (midnight/brand) surfaces (Figma `color-scheme=inverse`). */
  inverse?: boolean;
}
export function Checkbox({ label, checked, defaultChecked, disabled, onChange, size = 'md', inverse, style, ...rest }: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const on = checked ?? internal;
  const dim = T.checkbox[size];
  const box: CSSProperties = on
    ? { border: '1px solid transparent', background: inverse ? color('surface.base.inverse') : color('surface.base.brand') }
    : { border: `1px solid ${color(inverse ? 'border.interactive.inverse.default' : 'border.interactive.default.default')}`, background: 'transparent' };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim, borderRadius: radius('1'), boxSizing: 'border-box', flex: 'none', ...box }}>
        <input type="checkbox" checked={checked} defaultChecked={defaultChecked} disabled={disabled}
          onChange={(e) => { setInternal(e.currentTarget.checked); onChange?.(e); }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} {...rest} />
        {on ? (
          <svg aria-hidden viewBox="0 0 12 10" style={{ width: '70%', height: '70%', display: 'block' }}>
            <polyline points="1,5 4.5,8.5 11,1.5" fill="none"
              stroke={inverse ? color('text.default.default') : color('text.default.inverse')}
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label ? <Text variant="body.md">{label}</Text> : null}
    </label>
  );
}

/* ---------------- Radio ---------------- */
export interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  label?: ReactNode;
  /** Control size — `lg` 24×24 (default) or `sm` 20×20 (Figma V1.1 `small` axis). */
  size?: 'sm' | 'lg';
  /** Inverse color scheme for dark (midnight/brand) surfaces (Figma `color-scheme=inverse`). */
  inverse?: boolean;
}
export function Radio({ label, checked, defaultChecked, disabled, onChange, size = 'lg', inverse, style, ...rest }: RadioProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const on = checked ?? internal;
  const dim = size === 'sm' ? T.radio.sm : T.radio.md; // Figma lg 24×24 maps to token radio.md
  const ring = on
    ? color(inverse ? 'border.interactive.inverse.focus' : 'border.interactive.accent.default')
    : color(inverse ? 'border.interactive.inverse.default' : 'border.interactive.default.default');
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim, borderRadius: '50%', boxSizing: 'border-box', flex: 'none', border: `1px solid ${ring}`, background: 'transparent' }}>
        <input type="radio" checked={checked} defaultChecked={defaultChecked} disabled={disabled}
          onChange={(e) => { setInternal(e.currentTarget.checked); onChange?.(e); }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} {...rest} />
        {on ? <span style={{ width: '50%', height: '50%', borderRadius: '50%', background: inverse ? color('surface.base.inverse') : color('surface.base.brand') }} /> : null}
      </span>
      {label ? <Text variant="body.md">{label}</Text> : null}
    </label>
  );
}

/* ---------------- Switcher ---------------- */
export interface SwitcherProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'lg';
  onChange?: (checked: boolean) => void;
}
export function Switcher({ checked, defaultChecked = false, disabled, size = 'lg', onChange }: SwitcherProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;
  const w = size === 'lg' ? 56 : 48, h = size === 'lg' ? 24 : 20, knob = h - 4;
  return (
    <button role="switch" aria-checked={on} disabled={disabled}
      onClick={() => { if (disabled) return; setInternal(!on); onChange?.(!on); }}
      style={{ width: w, height: h, borderRadius: PILL, border: 0, padding: 2, cursor: disabled ? 'not-allowed' : 'pointer',
        background: on ? color('surface.base.brand') : color('surface.sunken.default'), opacity: disabled ? 0.5 : 1, position: 'relative', transition: 'background 150ms' }}>
      <span style={{ position: 'absolute', top: 2, left: on ? w - knob - 2 : 2, width: knob, height: knob, borderRadius: '50%', background: '#fff', transition: 'left 150ms' }} />
    </button>
  );
}

/* ---------------- Searchbar ---------------- */
export interface SearchbarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onMic?: () => void;
}
export function Searchbar({ placeholder = 'Search', onMic, style, ...rest }: SearchbarProps) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: space('sm'), height: 52, padding: `0 ${space('lg')}`, borderRadius: 16, background: color('surface.base.default'), width: '100%', boxSizing: 'border-box', ...style }}>
      <Icon size="sm">⌕</Icon>
      <input placeholder={placeholder} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', ...ty('body.md') }} {...rest} />
      <button onClick={onMic} aria-label="Voice search" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: color('text.default.muted') }}><Icon size="sm">🎤</Icon></button>
    </span>
  );
}

/* ---------------- AISearch ---------------- */
export function AISearch({ placeholder = 'Ask e& or search', ...rest }: SearchbarProps) {
  return <Searchbar placeholder={placeholder} {...rest} />;
}

/* ---------------- Tabs (Pill Tabs) ---------------- */
export interface TabsProps {
  tabs: string[];
  value?: number;
  defaultValue?: number;
  scope?: 'global' | 'local';
  onChange?: (index: number) => void;
}
export function Tabs({ tabs, value, defaultValue = 0, scope = 'global', onChange }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  return (
    <div role="tablist" style={{ display: 'flex', gap: space('sm'), overflowX: 'auto' }}>
      {tabs.map((t, i) => {
        const on = i === active;
        let s: CSSProperties;
        if (scope === 'global') {
          s = on
            ? { background: color('surface.canvas.brand-muted'), color: color('text.brand.default'), border: '1px solid transparent' }
            : { background: color('surface.base.default'), color: color('text.default.muted'), border: '1px solid transparent' };
        } else {
          s = on
            ? { background: color('surface.base.midnight'), color: '#fff', border: '1px solid transparent' }
            : { background: color('surface.canvas.default'), color: color('text.default.default'), border: `1px solid ${color('border.solid.default')}` };
        }
        return (
          <button key={i} role="tab" aria-selected={on}
            onClick={() => { setInternal(i); onChange?.(i); }}
            style={{ height: 40, padding: `0 ${space('md')}`, borderRadius: PILL, cursor: 'pointer', whiteSpace: 'nowrap', ...ty('button.sm'), ...s }}>
            {t}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Selectors (segmented) ---------------- */
export interface SelectorsProps {
  options: string[];
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
}
export function Selectors({ options, value, defaultValue = 0, onChange }: SelectorsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  return (
    <div style={{ display: 'inline-flex', padding: 2, borderRadius: PILL, background: color('surface.base.default') }}>
      {options.map((o, i) => {
        const on = i === active;
        return (
          <button key={i} onClick={() => { setInternal(i); onChange?.(i); }}
            style={{ height: 36, padding: `0 ${space('md')}`, borderRadius: PILL, border: 0, cursor: 'pointer',
              background: on ? color('surface.canvas.default') : 'transparent', color: color('text.default.default'), ...ty('button.sm') }}>
            {o}
          </button>
        );
      })}
    </div>
  );
}
