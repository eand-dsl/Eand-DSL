import type { ReactNode } from 'react';

/** A single knob on a component page. `def` is the starting value. */
export type Control =
  | { kind: 'select'; prop: string; label: string; options: (string | number)[]; def?: string | number }
  | { kind: 'toggle'; prop: string; label: string; def?: boolean }
  | { kind: 'text'; prop: string; label: string; def?: string };

export type ControlValues = Record<string, string | number | boolean>;

/** Seed values from each control's `def` (or a sensible fallback). */
export function controlDefaults(controls: Control[] = []): ControlValues {
  const out: ControlValues = {};
  for (const c of controls) {
    if (c.kind === 'select') out[c.prop] = c.def ?? c.options[0];
    else if (c.kind === 'toggle') out[c.prop] = c.def ?? false;
    else out[c.prop] = c.def ?? '';
  }
  return out;
}

export function Controls({ controls, values, onChange }: {
  controls: Control[];
  values: ControlValues;
  onChange: (prop: string, value: string | number | boolean) => void;
}): ReactNode {
  return (
    <div className="controls">
      <div className="controls-head">Props</div>
      {controls.map((c) => (
        <label className="ctrl-row" key={c.prop}>
          <span className="ctrl-label">{c.label}</span>
          {c.kind === 'select' && (
            <span className="ctrl-seg">
              {c.options.map((o) => (
                <button key={String(o)} type="button" className={values[c.prop] === o ? 'on' : ''} onClick={() => onChange(c.prop, o)}>
                  {String(o)}
                </button>
              ))}
            </span>
          )}
          {c.kind === 'toggle' && (
            <button type="button" role="switch" aria-checked={!!values[c.prop]}
              className={`ctrl-switch ${values[c.prop] ? 'on' : ''}`} onClick={() => onChange(c.prop, !values[c.prop])}>
              <span />
            </button>
          )}
          {c.kind === 'text' && (
            <input className="ctrl-input" value={String(values[c.prop] ?? '')} onChange={(e) => onChange(c.prop, e.target.value)} />
          )}
        </label>
      ))}
    </div>
  );
}
