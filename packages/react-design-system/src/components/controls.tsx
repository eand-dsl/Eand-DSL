import { useRef, useState, type CSSProperties, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react';
import { color, space, ty, radius, PILL, T } from '../system';
import { Icon } from '../icons';
import { Text, IconBox } from './primitives';

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
    : focused ? color('inputField.border.active')
    : color('inputField.border.default');
  const labelColor = color(`inputField.text.${scheme}.label.${stateKey}`);
  const valueColor = color(`inputField.text.${scheme}.value.${disabled ? 'disabled' : 'active'}`);
  const readOnly = type === 'dropdown' || type === 'picker';
  // typed loosely: 'input' and 'textarea' props diverge (rows vs type)
  const FieldTag = (type === 'comment' ? 'textarea' : 'input') as any;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: space('xs'), width: '100%' }}>
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          display: 'flex', alignItems: 'center', gap: space('sm'), minHeight: T.scale?.['56'] ?? 56,
          padding: `0 ${space('md')}`, borderRadius: radius('5'), boxSizing: 'border-box',
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
            : active ? color('inputField.border.active')
            : color('inputField.border.default');
          return (
            <span key={i} aria-hidden style={{
              width: T.scale?.['48'] ?? 48, height: T.scale?.['56'] ?? 56, boxSizing: 'border-box',
              borderRadius: radius('5'), background: color(`inputField.surface.${scheme}.${stateKey}`),
              border: `${T.border?.md ?? '1.5px'} solid ${borderColor}`,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              color: color(`inputField.text.${scheme}.value.${disabled ? 'disabled' : 'active'}`), ...ty('body.lg'),
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
type ChipState = 'default' | 'focus' | 'disabled';
// filled & glass values from live Figma `color/chips/default/{filled,glass}/*` — absent
// from the generated tokens.ts; inverse focus text is #575362 live (tokens.ts is stale there).
const CHIP_STYLE: Record<ChipType, Record<ChipState, CSSProperties>> = {
  outline: {
    default:  { background: 'transparent', color: color('chips.default.default.text.default'), border: `1px solid ${color('chips.default.default.border.default')}` },
    focus:    { background: color('chips.default.default.surface.focus'), color: color('chips.default.default.text.focus'), border: `1px solid ${color('chips.default.default.border.focus')}` },
    disabled: { background: 'transparent', color: color('chips.default.default.text.disabled'), border: `1px solid ${color('chips.default.default.border.disabled')}` },
  },
  filled: {
    default:  { background: '#ffffff', color: '#575362', border: '1px solid transparent' },
    focus:    { background: '#140f21', color: '#ffffff', border: '1px solid transparent' },
    disabled: { background: '#19132912', color: '#908e9a', border: '1px solid transparent' },
  },
  glass: {
    default:  { background: '#ffffff26', color: '#ffffff', border: '1px solid transparent', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    focus:    { background: '#ffffff', color: '#191329', border: '1px solid transparent', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
    disabled: { background: '#ffffff1a', color: '#ffffff4d', border: '1px solid transparent', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' },
  },
  inverse: {
    default:  { background: 'transparent', color: '#ffffffbf', border: `1px solid ${color('chips.default.inverse.border.default')}` }, // live Figma #ffffffbf; tokens.ts stale (0.70)
    focus:    { background: color('chips.default.inverse.surface.focus'), color: '#575362', border: `1px solid ${color('chips.default.inverse.border.focus')}` },
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
  const state: ChipState = disabled ? 'disabled' : selected ? 'focus' : 'default';
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
export function Checkbox({ label, checked, defaultChecked, disabled, onChange, size = 'md', inverse, radio, style, ...rest }: CheckboxProps) {
  const [internal, setInternal] = useState(defaultChecked ?? false);
  const on = checked ?? internal;
  const dim = T.checkbox[size];
  // Per-state colors from Figma `color/mark` tokens (V1.1 checkbox, node 27685:5017).
  // Two schemes — `default` (light surfaces) and `inverse` (brand/midnight surfaces) —
  // each across on/off × enabled/disabled. Disabled is a distinct muted fill, not opacity.
  const scheme = inverse
    ? { boxOn: 'surface.base.inverse', boxOnDisabled: 'border.interactive.inverse.disabled', tickOn: 'text.brand.default', tickOnDisabled: 'text.default.inverseMuted', borderOff: 'border.interactive.inverse.focus', borderOffDisabled: 'border.interactive.inverse.disabled' }
    : { boxOn: 'surface.base.brand', boxOnDisabled: 'border.surfaceBased.base.default', tickOn: 'text.default.inverse', tickOnDisabled: 'text.default.muted', borderOff: 'text.default.muted', borderOffDisabled: 'border.surfaceBased.base.default' };
  const box: CSSProperties = on
    ? { border: `${T.border.md} solid transparent`, background: color(disabled ? scheme.boxOnDisabled : scheme.boxOn) }
    : { border: `${T.border.md} solid ${color(disabled ? scheme.borderOffDisabled : scheme.borderOff)}`, background: 'transparent' };
  const tick = color(disabled ? scheme.tickOnDisabled : scheme.tickOn);
  const labelColor = inverse
    ? color(disabled ? 'text.default.inverseMuted' : 'text.default.inverse')
    : color(disabled ? 'text.default.disabled' : 'text.default.default');
  return (
    <label style={{ display: 'inline-flex', alignItems: 'center', gap: space('sm'), cursor: disabled ? 'not-allowed' : 'pointer', ...style }}>
      <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: dim, height: dim, borderRadius: radio ? '50%' : radius('1'), boxSizing: 'border-box', flex: 'none', ...box }}>
        <input type={radio ? 'radio' : 'checkbox'} checked={checked} defaultChecked={defaultChecked} disabled={disabled}
          onChange={(e) => { setInternal(e.currentTarget.checked); onChange?.(e); }}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }} {...rest} />
        {on ? (
          <svg aria-hidden viewBox="0 0 12 10" style={{ width: '80%', height: '80%', display: 'block' }}>
            <polyline points="1,5 4.5,8.5 11,1.5" fill="none"
              stroke={tick} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        ) : null}
      </span>
      {label ? <Text variant="body.md" color={labelColor}>{label}</Text> : null}
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
    <span style={{ display: 'flex', alignItems: 'center', gap: space('sm'), height: 52, padding: `0 ${space('lg')}`, borderRadius: radius('5'), background: color('surface.base.default'), width: '100%', boxSizing: 'border-box', ...style }}>
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
            : { background: color('surface.canvas.default'), color: color('text.default.default'), border: `1px solid ${color('border.surface-based.canvas.default')}` };
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

/* ---------------- Picker ----------------
   Figma V1.1 Picker (page 28278:1530, set 31358:139406): a selectable option tile —
   value + optional caption + optional status badge, 16px radius, ~72px tall.
   Surface axis default | light | inverse | glass; selected = red accent border +
   check indicator; disabled dims the tile. `Picker` manages single selection over
   `options`; `PickerOption` is the standalone tile for custom layouts. */
export type PickerSurface = 'default' | 'light' | 'inverse' | 'glass';
// All from real tokens except the glass fill (surface.glass.white.lg = white-20%).
const PICKER_SURFACE: Record<PickerSurface, { bg: string; value: string; caption: string; blur?: boolean }> = {
  default: { bg: color('surface.sunken.default'), value: color('text.default.default'), caption: color('text.default.subtle') },
  light:   { bg: color('surface.canvas.default'), value: color('text.default.default'), caption: color('text.default.subtle') },
  inverse: { bg: color('surface.raised.midnight'), value: color('text.default.inverse'), caption: color('text.default.inverse-subtle') },
  glass:   { bg: color('surface.glass.white.lg'), value: color('text.default.inverse'), caption: color('text.default.inverse-subtle'), blur: true },
};
export interface PickerOptionProps extends Omit<HTMLAttributes<HTMLButtonElement>, 'onClick' | 'value'> {
  /** Primary text (title.sm). */
  value?: ReactNode;
  /** Secondary line under the value (body.xs, subtle) — e.g. a unit. */
  caption?: ReactNode;
  /** Status badge slot rendered at the bottom of the tile. */
  badge?: ReactNode;
  surface?: PickerSurface;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}
export function PickerOption({ value, caption, badge, surface = 'default', selected, disabled, style, children, onClick, ...rest }: PickerOptionProps) {
  const s = PICKER_SURFACE[surface];
  const accent = color('border.interactive.accent.default');
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
      style={{
        position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: space('xs'),
        minWidth: 96, minHeight: 72, boxSizing: 'border-box', textAlign: 'left', cursor: disabled ? 'not-allowed' : 'pointer',
        padding: `${space('sm')} ${space('sm')}`, borderRadius: radius('5'),
        background: s.bg, color: s.value,
        // always render a border so selecting doesn't shift layout
        border: `1.5px solid ${selected ? accent : 'transparent'}`,
        opacity: disabled ? 0.5 : 1,
        ...(s.blur ? { backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' } : {}),
        ...style,
      }}
      {...rest}
    >
      {selected ? (
        <svg aria-hidden width={16} height={16} viewBox="0 0 24 24" fill="none"
          style={{ position: 'absolute', top: space('sm'), right: space('sm'), color: s.value }}>
          <path d="M5 12.5l4.5 4.5L19 7" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      {children ?? (
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          {value != null ? <Text variant="title.sm" color={s.value} as="span">{value}</Text> : null}
          {caption != null ? <Text variant="body.xs" color={s.caption} as="span">{caption}</Text> : null}
        </span>
      )}
      {badge != null ? <span>{badge}</span> : null}
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
