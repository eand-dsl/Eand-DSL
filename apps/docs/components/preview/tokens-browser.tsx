'use client';

import { ColorsView, TypographyView, SpacingView } from './tokens-view';
import './preview.css';

/** Token browser sections for the Foundations MDX pages. */
export function TokenColors() {
  return <div className="eapg foundations"><ColorsView /></div>;
}
export function TokenTypography() {
  return <div className="eapg foundations"><TypographyView /></div>;
}
export function TokenSpacing() {
  return <div className="eapg foundations"><SpacingView /></div>;
}
