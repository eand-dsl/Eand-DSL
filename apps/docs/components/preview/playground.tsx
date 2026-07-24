'use client';

import { LiveProvider, LiveEditor, LivePreview, LiveError } from 'react-live';
import * as DS from '@eand/react-design-system';
import { Icon } from '@eand/react-design-system';
import './preview.css';

const scope = { ...DS, Icon };

/** Editable react-live sandbox with every design-system export in scope. */
export function Playground({ code }: { code: string }) {
  return (
    <div className="eapg">
      <LiveProvider code={code.trim()} scope={scope}>
        <div className="live-preview"><LivePreview /></div>
        <div className="live-editor"><LiveEditor /></div>
        <LiveError className="live-error" />
      </LiveProvider>
    </div>
  );
}
