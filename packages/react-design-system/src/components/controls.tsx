import { useRef, useState, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { color, space, ty, radius, scale, PILL, T } from '../system';
import { Icon } from '../icons';
import { Text, IconBox, Badge, Dismiss } from './primitives';

/* ---------------- Input ----------------
   Figma V1.1 input-field (page 22609:113539): a single filled style — 56px field,
   16px radius, 1.5px state border, floating label (16px resting → 12px floated).
   `type` maps the Figma axis: text | dropdown (trailing 16px chevron) |
   picker (leading slot + chevron) | comment (multiline). OTP is `OtpInput` below. */
export type InputType = 'text' | 'dropdown' | 'picker' | 'comment';
export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Floating label inside the field. */
  label?: ReactNode;
  helper?: ReactNode;
  /** Error hint below the field (Figma status=error); drives the error border. */
  error?: ReactNode;
  /** Success hint below the field (Figma status=Success). */
  success?: ReactNode;
  /** Figma `type` axis. dropdown/picker render read-only with a trailing chevron. */
  type?: InputType;
  /** Underlying HTML input type (password, email, …) for type="text". */
  htmlType?: InputHTMLAttributes<HTMLInputElement>['type'];
  /** Inverse scheme for dark (midnight/brand) surfaces. */
  inverse?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  /** Show the 24px erase button when the field has a value. */
  clearable?: boolean;
  onClear?: () => void;
  /** @deprecated V1.0 axis — V1.1 has a single filled style; ignored. */
  variant?: 'outlined' | 'filled';
}
export function Input({
  label, helper, error, success, type = 'text', htmlType, inverse, leadingIcon, trailingIcon,
  clearable, onClear, variant: _variant, style, disabled, value, defaultValue, onChange, onFocus, onBlur, ...rest
}: InputProps) {
  const inputRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(String(defaultValue ?? ''));
  const current = String(value ?? internal);
  const floated = !label || focused || current.length > 0;
  const scheme = inverse ? 'inverse' : 'default';
  const stateKey = disabled ? 'disabled' : 'default';
  const borderColor = disabled ? color('inputField.border.disabled')
    : error ? color('inputField.border.error')
    : focused ? color('inputField.border.focus')
    : color('inputField.border.default');
  const labelColor = color(`inputField.text.${scheme}.label.${stateKey}`);
  const valueColor = color(`inputField.text.${scheme}.value.${disabled ? 'disabled' : 'default'}`);
  const readOnly = type === 'dropdown' || type === 'picker';
  // typed loosely: 'input' and 'textarea' props diverge (rows vs type)
  const FieldTag = (type === 'comment' ? 'textarea' : 'input') as any;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', alignItems: 'center', gap: space('sm'), minHeight: T.scale?.['56'] ?? 56,
          padding: `0 ${space('md')}`, borderRadius: radius('6'), boxSizing: 'border-box',
          background: color(`inputField.surface.${scheme}.${stateKey}`),
          border: `${T.border?.md ?? '1.5px'} solid ${borderColor}`,
          cursor: disabled ? 'not-allowed' : readOnly ? 'pointer' : 'text',
        }}
      >
        {(leadingIcon ?? (type === 'picker' ? <Icon name="placeholder" size={20} /> : null)) != null
          ? <IconBox size="lg" style={{ color: valueColor }}>{leadingIcon ?? <Icon name="placeholder" size={20} />}</IconBox> : null}
        <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: space('2xs'), padding: `${space('sm')} 0` }}>
          {label ? (
            <span style={{ color: labelColor, transition: 'font-size 120ms ease, line-height 120ms ease', ...ty(floated ? 'body.sm' : 'body.lg') } as CSSProperties}>{label}</span>
          ) : null}
          <FieldTag
            ref={inputRef}
            type={type === 'comment' ? undefined : htmlType}
            readOnly={readOnly}
            disabled={disabled}
            value={value}
            defaultValue={defaultValue}
            rows={type === 'comment' ? 2 : undefined}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setInternal(e.currentTarget.value); onChange?.(e); }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => { setFocused(true); onFocus?.(e); }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => { setFocused(false); onBlur?.(e); }}
            style={{
              width: '100%', minWidth: 0, border: 0, outline: 'none', background: 'transparent', padding: 0,
              resize: 'none', color: valueColor, caretColor: color('text.brand.default'),
              height: label && !floated ? 0 : undefined, transition: 'height 120ms ease', overflow: 'hidden',
              cursor: 'inherit', ...ty('body.lg'), ...style,
            }}
            {...rest}
          />
        </span>
        {clearable && current.length > 0 && !disabled ? (
          <button
            aria-label="Clear"
            onClick={(e) => {
              e.stopPropagation(); setInternal('');
              if (value === undefined && inputRef.current) inputRef.current.value = ''; // uncontrolled: clear the DOM too
              onClear?.(); inputRef.current?.focus();
            }}
            // 24px erase button, Figma `color/dismiss/default` (#908e9a) — no dismiss token group yet
            style={{ width: 24, height: 24, flex: 'none', border: 0, borderRadius: '50%', background: '#908e9a', color: '#ffffff', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, lineHeight: 1 }}
          ><Icon name="close" size={12} /></button>
        ) : null}
        {readOnly ? <IconBox size="md" style={{ color: labelColor }}><Icon name="chevron-down-sm" size={16} /></IconBox>
          : trailingIcon ? <IconBox size="lg" style={{ color: valueColor }}>{trailingIcon}</IconBox> : null}
      </div>
      {(error || success || helper) ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs') }}>
          {error ? <IconBox size="sm" style={{ color: color('text.danger.subtle') }}><Icon name="info" size={12} /></IconBox>
            : success ? <IconBox size="sm" style={{ color: color('text.positive.subtle') }}><Icon name="check" size={12} /></IconBox> : null}
          <Text variant="body.sm" color={error ? color('text.danger.subtle') : success ? color('text.positive.subtle') : color('text.default.muted')}>
            {error ?? success ?? helper}
          </Text>
        </span>
      ) : null}
    </div>
  );
}

/* ---------------- OtpInput ----------------
   Figma input-field type=otp: a row of 48×56 one-character cells sharing the
   input-field surface/border tokens; the active cell shows the active border. */
export interface OtpInputProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Render entered characters as dots. */
  masked?: boolean;
  inverse?: boolean;
  disabled?: boolean;
  error?: ReactNode;
}
export function OtpInput({ length = 4, value, defaultValue = '', onValueChange, masked, inverse, disabled, error, style, ...rest }: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [focused, setFocused] = useState(false);
  const [internal, setInternal] = useState(defaultValue.slice(0, length));
  const current = (value ?? internal).slice(0, length);
  const scheme = inverse ? 'inverse' : 'default';
  const stateKey = disabled ? 'disabled' : 'default';
  const activeIndex = Math.min(current.length, length - 1);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), ...style }} {...rest}>
      <div onClick={() => inputRef.current?.focus()} style={{ position: 'relative', display: 'flex', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'text' }}>
        <input
          ref={inputRef}
          aria-label="One-time code"
          inputMode="numeric"
          autoComplete="one-time-code"
          disabled={disabled}
          value={current}
          onChange={(e) => { const v = e.currentTarget.value.slice(0, length); setInternal(v); onValueChange?.(v); }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{ position: 'absolute', inset: 0, opacity: 0, border: 0, padding: 0, cursor: 'inherit' }}
        />
        {Array.from({ length }).map((_, i) => {
          const ch = current[i];
          const active = focused && !disabled && i === activeIndex;
          const borderColor = disabled ? color('inputField.border.disabled')
            : error ? color('inputField.border.error')
            : active ? color('inputField.border.focus')
            : color('inputField.border.default');
          return (
            <span key={i} aria-hidden style={{
              width: T.scale?.['48'] ?? 48, height: T.scale?.['56'] ?? 56, boxSizing: 'border-box',
              borderRadius: radius('6'), background: color(`inputField.surface.${scheme}.${stateKey}`),
              border: `${T.border?.md ?? '1.5px'} solid ${borderColor}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: color(`inputField.text.${scheme}.value.${disabled ? 'disabled' : 'default'}`), ...ty('body.lg'),
            }}>{ch ? (masked ? '•' : ch) : ''}</span>
          );
        })}
      </div>
      {error ? (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: space('xs') }}>
          <IconBox size="sm" style={{ color: color('text.danger.subtle') }}><Icon name="info" size={12} /></IconBox>
          <Text variant="body.sm" color={color('text.danger.subtle')}>{error}</Text>
        </span>
      ) : null}
    </div>
  );
}

/* ---------------- Chip ----------------
   Figma V1.1 chips (page 28171:29640, set 31539:8725): type = outline | filled |
   glass | inverse × state default/focus/disabled. 40px pill, 1px border (outline
   & inverse), 16px leading icon; content `type=check` swaps in a check mark when
   selected; `Loader <-> IconBox=on` swaps it for a spinner. */
export type ChipType = 'outline' | 'filled' | 'glass' | 'inverse';
// V1.2 renamed the chip state `focus` -> `selected` (color/chips/default/*/selected).
type ChipState = 'default' | 'selected' | 'disabled';
// All four types read from `color/chips/default/*`. The filled and glass values used to be
// hardcoded hex "from live Figma, absent from the generated tokens.ts" — they were absent
// because the token export was six weeks stale, not because Figma lacked them. Figma also
// renamed the `default` type to `outline`, which is why the old `chips.default.default.*`
// paths stopped resolving once the export was refreshed.
const GLASS_BLUR = { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } as const;
const CHIP_STYLE: Record<ChipType, Record<ChipState, CSSProperties>> = {
  outline: {
    default:  { background: 'transparent', color: color('chips.default.outline.text.default'), border: `1px solid ${color('chips.default.outline.border.default')}` },
    selected: { background: color('chips.default.outline.surface.selected'), color: color('chips.default.outline.text.selected'), border: `1px solid ${color('chips.default.outline.border.selected')}` },
    disabled: { background: 'transparent', color: color('chips.default.outline.text.disabled'), border: `1px solid ${color('chips.default.outline.border.disabled')}` },
  },
  filled: {
    default:  { background: color('chips.default.filled.surface.default'), color: color('chips.default.filled.text.default'), border: '1px solid transparent' },
    selected: { background: color('chips.default.filled.surface.selected'), color: color('chips.default.filled.text.selected'), border: '1px solid transparent' },
    // V1.2 fixed the old `sisabled` typo in the Figma variable name.
    disabled: { background: color('chips.default.filled.surface.disabled'), color: color('chips.default.filled.text.disabled'), border: '1px solid transparent' },
  },
  glass: {
    default:  { background: color('chips.default.glass.surface.default'), color: color('chips.default.glass.text.default'), border: '1px solid transparent', ...GLASS_BLUR },
    selected: { background: color('chips.default.glass.surface.selected'), color: color('chips.default.glass.text.selected'), border: '1px solid transparent', ...GLASS_BLUR },
    disabled: { background: color('chips.default.glass.surface.disabled'), color: color('chips.default.glass.text.disabled'), border: '1px solid transparent', ...GLASS_BLUR },
  },
  inverse: {
    default:  { background: 'transparent', color: color('chips.default.inverse.text.default'), border: `1px solid ${color('chips.default.inverse.border.default')}` },
    selected: { background: color('chips.default.inverse.surface.selected'), color: color('chips.default.inverse.text.selected'), border: `1px solid ${color('chips.default.inverse.border.selected')}` },
    disabled: { background: 'transparent', color: color('chips.default.inverse.text.disabled'), border: `1px solid ${color('chips.default.inverse.border.disabled')}` },
  },
};
/** 16px self-contained spinner for the chip loading state. */
function ChipSpinner() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ display: 'block' }} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite" />
      </path>
    </svg>
  );
}
export interface ChipProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick'> {
  /** Figma `type` axis. */
  type?: ChipType;
  /** Figma state=focus (the pressed/active chip). */
  selected?: boolean;
  disabled?: boolean;
  /** @deprecated Alias for `type="inverse"`. */
  inverse?: boolean;
  leadingIcon?: ReactNode;
  /** Show a check mark as the leading icon while selected (Figma content `type=check`). */
  check?: boolean;
  /** Spinner replaces the leading icon (Figma `Loader <-> IconBox=on`); clicks suppressed. */
  loading?: boolean;
  onClick?: () => void;
}
export function Chip({ type, selected, disabled, inverse, leadingIcon, check, loading, style, children, onClick, ...rest }: ChipProps) {
  const t: ChipType = type ?? (inverse ? 'inverse' : 'outline');
  const state: ChipState = disabled ? 'disabled' : selected ? 'selected' : 'default';
  const lead = loading ? <ChipSpinner />
    : check && selected ? <Icon name="check" size={16} />
    : leadingIcon;
  return (
    <button onClick={loading ? undefined : onClick} aria-pressed={selected} disabled={disabled} aria-busy={loading || undefined}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: space('xs'), height: 40, padding: `0 ${space('md')}`,
        borderRadius: PILL, cursor: disabled ? 'not-allowed' : loading ? 'progress' : 'pointer', whiteSpace: 'nowrap',
        ...CHIP_STYLE[t][state], ...ty('body.md'), ...style,
      }} {...rest}>
      {lead != null ? <IconBox size="md">{lead}</IconBox> : null}{children}
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
  const state = disabled ? 'disabled' : selected ? 'selected' : 'default';
  const background = selected && !disabled
    ? color(inverse ? 'filterPill.surface.inverse.selected' : 'surface.base.default')
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
      {children}<IconBox size="md"><Icon name="chevron-down-sm" size={16} /></IconBox>
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
  /** Render as a radio (single-selection) — a circle instead of a square. Same mark,
   *  colors and states (Figma `radio (single selection)=yes`, node 27685:5017). */
  radio?: boolean;
}
/* Per-state colours from Figma V1.2 `checkbox` 27685:5017 — the 07.07.2026 revamp binds
   every state to `color/mark/{default,inverse}/*`. Disabled is a colour, not opacity.
   Label colours come from the consent row `checkbox-variants` 33489:12153 (the atom has no
   label): body/md in text/default/{default,disabled} or, inverse, text/default/inverse-subtle
   and inverse-disabled. */
const MARK = {
  default: {
    boxOn: color('mark.default.surface.selected'), boxOnDisabled: color('mark.default.surface.selected-disabled'),
    tickOn: color('mark.default.icon.selected'), tickOnDisabled: color('mark.default.icon.selected-disabled'),
    borderOff: color('mark.default.border.default'), borderOffDisabled: color('mark.default.border.disabled'),
    label: color('text.default.default'), labelDisabled: color('text.default.disabled'),
  },
  inverse: {
    boxOn: color('mark.inverse.surface.selected'), boxOnDisabled: color('mark.inverse.surface.selected-disabled'),
    tickOn: color('mark.inverse.icon.selected'), tickOnDisabled: color('mark.inverse.icon.selected-disabled'),
    borderOff: color('mark.inverse.border.default'), borderOffDisabled: color('mark.inverse.border.disabled'),
    label: color('text.default.inverse-subtle'), labelDisabled: color('text.default.inverse-disabled'),
  },
} as const;
export function Checkbox({ label, checked, defaultChecked, disabled, onChange, size = 'md', inverse, radio, style, ...rest }: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const on = checked ?? internal;
  const dim = T.checkbox[size];
  const m = MARK[inverse ? 'inverse' : 'default'];
  const box: CSSProperties = on
    ? { border: `${T.border.md} solid transparent`, background: disabled ? m.boxOnDisabled : m.boxOn }
    : { border: `${T.border.md} solid ${disabled ? m.borderOffDisabled : m.borderOff}`, background: 'transparent' };
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim, borderRadius: radio ? '50%' : radius('1'), boxSizing: 'border-box', flex: 'none', ...box }}>
        <input type={radio ? 'radio' : 'checkbox'} checked={checked} defaultChecked={defaultChecked} disabled={disabled}
          onChange={(e) => { setInternal(e.currentTarget.checked); onChange?.(e); }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} {...rest} />
        {/* Figma instances `check` filled=true: 12px in a 16px icon-size (md), 8px in 12px (sm). */}
        {on ? (
          <IconBox size={size === 'sm' ? 'sm' : 'md'} aria-hidden style={{ pointerEvents: 'none' }}>
            <Icon name="check-filled" size={size === 'sm' ? 8 : 12} color={disabled ? m.tickOnDisabled : m.tickOn} />
          </IconBox>
        ) : null}
      </span>
      {label ? <Text variant="body.md" color={disabled ? m.labelDisabled : m.label}>{label}</Text> : null}
    </label>
  );
}

/* ---------------- ConsentCheckbox ----------------
   Figma V1.2 `checkbox-variants` 33489:12153 (inverse × selected × disabled) with its core
   `.checkbox-core-variants-core` 38351:31883 (title-string, link-1, link-2, description,
   direction). A md checkbox, 8px gap, then one wrapping run of body/md text: "Agree to" ·
   link · "and" · link · "before proceeding". The links are `button type=link size=md` —
   body/md, 2px inline padding, no underline, button/link/text/{brand|inverse}/*. */
export interface ConsentLink {
  label: ReactNode;
  /** Renders an `<a>` when set, otherwise a `<button>`. */
  href?: string;
  onClick?: () => void;
}
export interface ConsentCheckboxProps extends Omit<CheckboxProps, 'label' | 'size' | 'radio'> {
  /** Text before the first link (Figma `title-string`, "Agree to"). */
  prefix?: ReactNode;
  /** Inline legal links (Figma `link-1`, `link-2`). Two are joined by `conjunction`. */
  links?: ConsentLink[];
  /** Word between the links (Figma "and"). */
  conjunction?: ReactNode;
  /** Text after the links (Figma `description-string`, "before proceeding"). */
  suffix?: ReactNode;
}
export function ConsentCheckbox({ prefix, links = [], conjunction = 'and', suffix, inverse, disabled, ...rest }: ConsentCheckboxProps) {
  const m = MARK[inverse ? 'inverse' : 'default'];
  const ink = disabled ? m.labelDisabled : m.label;
  // Figma disables the links with the row on the inverse scheme; the default-scheme disabled
  // variant leaves them at state=default (design question). Code disables them in both.
  const linkInk = color(`button.link.text.${inverse ? 'inverse' : 'brand'}.${disabled ? 'disabled' : 'default'}`);
  const seg = (c: ReactNode) => (c == null || c === '' ? null : <span style={{ color: ink }}>{c}</span>);
  const linkStyle: CSSProperties = {
    ...ty('body.md'), color: linkInk, paddingInline: space('2xs'), paddingBlock: 0, margin: 0, border: 0,
    background: 'transparent', textDecoration: 'none', cursor: disabled ? 'not-allowed' : 'pointer',
  };
  const items: ReactNode[] = [];
  links.forEach((l, i) => {
    if (i > 0) items.push(<span key={`c${i}`}>{seg(conjunction)}</span>);
    items.push(l.href && !disabled
      ? <a key={`l${i}`} href={l.href} onClick={l.onClick} style={linkStyle}>{l.label}</a>
      : l.href
        ? <a key={`l${i}`} aria-disabled="true" style={linkStyle}>{l.label}</a>
        : <button key={`l${i}`} type="button" disabled={disabled} onClick={l.onClick} style={linkStyle}>{l.label}</button>);
  });
  return (
    <Checkbox
      {...rest}
      size="md"
      inverse={inverse}
      disabled={disabled}
      label={
        <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center' }}>
          {seg(prefix)}{items}{seg(suffix)}
        </span>
      }
    />
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
/* Figma V1.2 `radio-button` 26369:775 (color-scheme × small × selected × disabled): a 2px
   inside ring (`border/lg`) and a 16px dot in the 24 control / 12px in the 20
   (`scale/16|12`). Radio missed the mark migration (last touched 05.05.2026): four states
   bind variables outside the token set, and the inverse scheme binds `mark/default/*`, which
   turns the selected radio grey on dark surfaces (design question).
   - default: on = mark/default/surface/selected; on-disabled = …/selected-disabled; off and
     off-disabled are #908e9a / #d8d7de on deleted variables, bound here to the tokens holding
     those exact values, mark/default/border/{default,disabled} (the checkbox off ring).
   - inverse: the shipped white ring + dot and 60% off ring are kept until design rules;
     disabled uses mark/inverse/{border,surface}/…disabled (white 40%) instead of opacity. */
const RADIO = {
  default: {
    on: color('mark.default.surface.selected'), onDisabled: color('mark.default.surface.selected-disabled'),
    off: color('mark.default.border.default'), offDisabled: color('mark.default.border.disabled'),
  },
  inverse: {
    on: color('mark.inverse.surface.selected'), onDisabled: color('mark.inverse.surface.selected-disabled'),
    off: color('border.interactive.inverse.default'), offDisabled: color('mark.inverse.border.disabled'),
  },
} as const;
export function Radio({ label, checked, defaultChecked, disabled, onChange, size = 'lg', inverse, style, ...rest }: RadioProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const on = checked ?? internal;
  const dim = size === 'sm' ? T.radio.sm : T.radio.md; // Figma lg 24×24 maps to token radio.md
  const dot = size === 'sm' ? scale('12') : scale('16');
  const r = RADIO[inverse ? 'inverse' : 'default'];
  const ink = on ? (disabled ? r.onDisabled : r.on) : (disabled ? r.offDisabled : r.off);
  const m = MARK[inverse ? 'inverse' : 'default'];
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim, borderRadius: '50%', boxSizing: 'border-box', flex: 'none', border: `${T.border.lg} solid ${ink}`, background: 'transparent' }}>
        <input type="radio" checked={checked} defaultChecked={defaultChecked} disabled={disabled}
          onChange={(e) => { setInternal(e.currentTarget.checked); onChange?.(e); }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} {...rest} />
        {on ? <span style={{ width: dot, height: dot, flex: 'none', borderRadius: '50%', background: ink, pointerEvents: 'none' }} /> : null}
      </span>
      {/* No label on the Figma atom; same inks as the Checkbox label so disabled reads as disabled. */}
      {label ? <Text variant="body.md" color={disabled ? m.labelDisabled : m.label}>{label}</Text> : null}
    </label>
  );
}

/* ---------------- Switcher ----------------
   Figma V1.2 `switcher` 26215:7141: inverse × small × active × disabled. Track md 40×24 /
   sm 32×20 (`switcher/track/*`), knob 20 / 16 (`switcher/thumb/*`), 2px inset
   (`spacing/2xs`), pill. Every state is a `color/mark/*` pair — disabled is a colour, not
   opacity (15.07.2026 "Updated colours based on common 'mark' variables"). */
type SwitchState = 'off' | 'on' | 'offDisabled' | 'onDisabled';
const SWITCH: Record<'default' | 'inverse', Record<SwitchState, { track: string; knob: string }>> = {
  default: {
    off:         { track: color('mark.default.surface.default'),          knob: color('mark.default.icon.default') },
    on:          { track: color('mark.default.surface.selected'),         knob: color('mark.default.icon.selected') },
    offDisabled: { track: color('mark.default.surface.disabled'),         knob: color('mark.default.icon.disabled') },
    onDisabled:  { track: color('mark.default.surface.selected-disabled'), knob: color('mark.default.icon.selected-disabled') },
  },
  inverse: {
    // The md and sm symbols disagree here: md binds a variable outside the token set
    // (`mark/default/border/default1`, white 70%) with a `surface/raised/default` knob; sm binds
    // `mark/inverse/surface/default` + `mark/inverse/icon/default`. Code follows sm, the one in
    // the mark/inverse family (design question raised).
    off:         { track: color('mark.inverse.surface.default'),          knob: color('mark.inverse.icon.default') },
    on:          { track: color('mark.inverse.surface.selected'),         knob: color('mark.inverse.icon.selected') },
    offDisabled: { track: color('mark.inverse.surface.disabled'),         knob: color('mark.inverse.icon.disabled') },
    // Both sizes bind the knob to `surface/sunken/default`, not `mark/inverse/icon/selected-disabled`.
    onDisabled:  { track: color('mark.inverse.surface.selected-disabled'), knob: color('surface.sunken.default') },
  },
};
export interface SwitcherProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  /** `md` 40×24 (Figma small=false) or `sm` 32×20 (small=true). `lg` is the deprecated
   *  pre-V1.2 name for `md`. */
  size?: 'sm' | 'md' | 'lg';
  /** Inverse scheme for brand/midnight surfaces: white track, red knob when on. */
  inverse?: boolean;
  onChange?: (checked: boolean) => void;
}
export function Switcher({ checked, defaultChecked = false, disabled, size = 'md', inverse, onChange }: SwitcherProps) {
  const [internal, setInternal] = useState(defaultChecked);
  const on = checked ?? internal;
  const k = size === 'sm' ? 'sm' : 'md';
  const w = T.switcher.track.width[k], h = T.switcher.track.height[k], knob = T.switcher.thumb.width[k];
  const inset = space('2xs');
  const c = SWITCH[inverse ? 'inverse' : 'default'][disabled ? (on ? 'onDisabled' : 'offDisabled') : on ? 'on' : 'off'];
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled}
      onClick={() => { if (disabled) return; setInternal(!on); onChange?.(!on); }}
      style={{ width: w, height: h, borderRadius: PILL, border: 0, padding: 0, flex: 'none', boxSizing: 'border-box',
        cursor: disabled ? 'not-allowed' : 'pointer', background: c.track, position: 'relative', transition: 'background 150ms' }}>
      <span style={{ position: 'absolute', top: inset, insetInlineStart: on ? `calc(${w} - ${knob} - ${inset})` : inset,
        width: knob, height: T.switcher.thumb.height[k], borderRadius: '50%', background: c.knob, transition: 'inset-inline-start 150ms' }} />
    </button>
  );
}

/* ---------------- Searchbar ---------------- */
export interface SearchbarProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  onMic?: () => void;
}
export function Searchbar({ placeholder = 'Search', onMic, style, ...rest }: SearchbarProps) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: space('sm'), height: 52, padding: `0 ${space('lg')}`, borderRadius: radius('6'), background: color('surface.base.default'), width: '100%', boxSizing: 'border-box', ...style }}>
      <IconBox size="lg"><Icon name="search" size={24} /></IconBox>
      <input placeholder={placeholder} style={{ flex: 1, minWidth: 0, border: 0, outline: 'none', background: 'transparent', ...ty('body.md') }} {...rest} />
      <button onClick={onMic} aria-label="Voice search" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: color('text.default.muted') }}><IconBox size="lg"><Icon name="mic" size={24} /></IconBox></button>
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
  /** Not a Figma variant axis — the published set has one look, and Global vs Local are
   *  instance-level colour overrides described in the statesheet. Kept as a prop because
   *  both appear on real screens. `global` binds `color/tab/default/*`; `local` is the
   *  midnight treatment, which has no token of its own. */
  scope?: 'global' | 'local';
  /** Optional leading glyph per tab, index-aligned with `tabs`. Figma draws it at 20px. */
  icons?: ReactNode[];
  onChange?: (index: number) => void;
}
export function Tabs({ tabs, value, defaultValue = 0, scope = 'global', icons, onChange }: TabsProps) {
  const [internal, setInternal] = useState(defaultValue);
  const active = value ?? internal;
  return (
    <div role="tablist" style={{ display: 'flex', gap: space('sm'), overflowX: 'auto' }}>
      {tabs.map((t, i) => {
        const on = i === active;
        let s: CSSProperties;
        if (scope === 'global') {
          // The audit asked for `tab/surface/global/active`; Figma has since restructured
          // these to default/inverse, and V1.2 renamed `active` to `selected` (#fce6e6).
          s = on
            ? { background: color('tab.default.surface.selected'), color: color('tab.default.text.selected'), border: '1px solid transparent' }
            : { background: color('surface.base.default'), color: color('tab.default.text.default'), border: '1px solid transparent' };
        } else {
          s = on
            ? { background: color('surface.base.midnight'), color: color('text.default.inverse'), border: '1px solid transparent' }
            : { background: color('surface.canvas.default'), color: color('text.default.default'), border: `1px solid ${color('border.surface-based.canvas.default')}` };
        }
        return (
          <button key={i} role="tab" aria-selected={on}
            onClick={() => { setInternal(i); onChange?.(i); }}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: space('xs'),
              height: T.tabs?.height?.md ?? 40, minWidth: scale('72'), padding: `0 ${space('sm')}`,
              borderRadius: PILL, cursor: 'pointer', whiteSpace: 'nowrap', boxSizing: 'border-box',
              ...ty('title.xs'), ...s }}>
            {icons?.[i] ?? null}{t}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------- Picker ----------------
   Figma V1.2 `picker` 34373:16787 (page 28278:1530): a fixed 106×72 option tile — value
   (title/sm) over a caption (body/xs), both centred, with an optional full-width neutral sm
   status badge along the bottom. State lives on the atoms `.picker-scheme-default` 34373:16315
   and `.picker-scheme-inverse` 34373:16508:
   - selected (13.07.2026, per VD feedback): the fill and ink swap — default scheme →
     surface/raised/midnight + text/default/inverse; inverse scheme → surface/raised/default +
     text/default/{default,subtle} — plus a `check-circle` (filled) 20px glyph in a 24px
     icon-size at top/end 6. No border.
   - disabled: text/default/disabled (inverse: inverse-disabled), badge hidden, no opacity.
   Surfaces: default = Figma sunken, light = Figma default (canvas), inverse = Figma midnight,
   glass = Figma glass (white 20% + glass effect). `Picker` manages single selection over
   `options`; `PickerOption` is the standalone tile for custom layouts. */
export type PickerSurface = 'default' | 'light' | 'inverse' | 'glass';
type PickerInk = { bg: string; value: string; caption: string; disabled: string; blur?: boolean };
const PICKER_DEFAULT_SCHEME = { value: color('text.default.default'), caption: color('text.default.subtle'), disabled: color('text.default.disabled') };
const PICKER_INVERSE_SCHEME = { value: color('text.default.inverse'), caption: color('text.default.inverse'), disabled: color('text.default.inverse-disabled') };
const PICKER_SURFACE: Record<PickerSurface, PickerInk> = {
  default: { bg: color('surface.sunken.default'), ...PICKER_DEFAULT_SCHEME },
  light:   { bg: color('surface.canvas.default'), ...PICKER_DEFAULT_SCHEME },
  inverse: { bg: color('surface.raised.midnight'), ...PICKER_INVERSE_SCHEME },
  glass:   { bg: color('surface.glass.white.lg'), ...PICKER_INVERSE_SCHEME, blur: true },
};
const PICKER_SELECTED = {
  // default scheme (default, light)
  default: { bg: color('surface.raised.midnight'), value: color('text.default.inverse'), caption: color('text.default.inverse'), check: color('surface.base.inverse') },
  // inverse scheme (inverse, glass)
  inverse: { bg: color('surface.raised.default'), value: color('text.default.default'), caption: color('text.default.subtle'), check: color('text.brand.default') },
};
// The check sits 6px from the top and end edges (absolute at 76,6 in the 106 tile). 6 is not a
// spacing step, so it stays literal.
const PICKER_CHECK_INSET = '6px';
// Figma: 106×72 fixed. 106 has no scale/* step.
const PICKER_WIDTH = '106px';
export interface PickerOptionProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'value'> {
  /** Primary text (title/sm, centred). */
  value?: ReactNode;
  /** Secondary line under the value (body/xs) — e.g. a unit. */
  caption?: ReactNode;
  /** Status badge along the bottom of the tile (Figma `badges`). A string or number renders the
   *  published neutral sm status badge across the tile; any other node renders as given.
   *  Hidden while disabled. */
  badge?: ReactNode;
  surface?: PickerSurface;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
export function PickerOption({ value, caption, badge, surface = 'default', selected, disabled, style, children, onClick, ...rest }: PickerOptionProps) {
  const s = PICKER_SURFACE[surface];
  const inverseScheme = surface === 'inverse' || surface === 'glass';
  const sel = selected && !disabled ? PICKER_SELECTED[inverseScheme ? 'inverse' : 'default'] : null;
  const valueInk = disabled ? s.disabled : sel ? sel.value : s.value;
  const captionInk = disabled ? s.disabled : sel ? sel.caption : s.caption;
  const showBadge = badge != null && badge !== false && !disabled;
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'stretch', flex: 'none',
        width: PICKER_WIDTH, height: scale('72'), boxSizing: 'border-box', padding: 0, border: 0,
        textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', borderRadius: radius('6'),
        background: sel ? sel.bg : s.bg, color: valueInk, overflow: 'hidden',
        ...(s.blur && !sel ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
        ...style,
      }}
      {...rest}
    >
      {sel ? (
        <IconBox size="xl" aria-hidden style={{ position: 'absolute', top: PICKER_CHECK_INSET, insetInlineEnd: PICKER_CHECK_INSET }}>
          <Icon name="check-circle-filled" size={20} color={sel.check} />
        </IconBox>
      ) : null}
      {children ?? (
        // `.picker-body` content: 20px top (spacing/xl), 8px sides (spacing/sm); label gap −2.
        <span style={{ display: 'flex', flexDirection: 'column', paddingTop: space('xl'), paddingInline: space('sm'), minWidth: 0 }}>
          {value != null ? <Text variant="title.sm" color={valueInk} as="span">{value}</Text> : null}
          {caption != null ? <Text variant="body.xs" color={captionInk} as="span" style={{ marginTop: `calc(-1 * ${space('2xs')})` }}>{caption}</Text> : null}
        </span>
      )}
      {showBadge ? (
        // `Label` strip: 0/2/2/2 (spacing/2xs) at the bottom of the tile.
        <span style={{ display: 'flex', marginTop: 'auto', padding: `0 ${space('2xs')} ${space('2xs')}` }}>
          {typeof badge === 'string' || typeof badge === 'number'
            // Figma sets the strip badge to 6/6/28/28; Figma clamps each corner to half the 16px
            // height, so it renders 6/6/8/8 (CSS would scale all four down instead).
            ? <Badge status="neutral" size="sm" style={{ width: '100%', borderRadius: `${radius('2')} ${radius('2')} ${radius('3')} ${radius('3')}` }}>{badge}</Badge>
            : badge}
        </span>
      ) : null}
    </button>
  );
}

export interface PickerOptionData {
  value?: ReactNode;
  caption?: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
}
export interface PickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: PickerOptionData[];
  surface?: PickerSurface;
  /** Selected index (controlled). */
  value?: number;
  defaultValue?: number;
  onChange?: (index: number) => void;
}
export function Picker({ options, surface = 'default', value, defaultValue, onChange, style, ...rest }: PickerProps) {
  const [internal, setInternal] = useState(defaultValue ?? -1);
  const active = value ?? internal;
  return (
    <div role="radiogroup" style={{ display: 'flex', flexWrap: 'wrap', gap: space('sm'), ...style }} {...rest}>
      {options.map((o, i) => (
        <PickerOption
          key={i}
          surface={surface}
          value={o.value}
          caption={o.caption}
          badge={o.badge}
          disabled={o.disabled}
          selected={i === active}
          onClick={() => { if (o.disabled) return; setInternal(i); onChange?.(i); }}
        />
      ))}
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
