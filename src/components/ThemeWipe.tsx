import React from 'react';
import { ThemeMode } from '../types';

interface ThemeWipeProps {
  wipeKey: number;
  targetTheme: ThemeMode;
}

export function ThemeWipe({ wipeKey, targetTheme }: ThemeWipeProps) {
  if (wipeKey === 0) return null;

  const isGoingLight = targetTheme === 'light';

  return (
    <div
      key={wipeKey}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <div
        className="sp-wipe-layer-down absolute inset-[-20%]"
        style={{
          background: isGoingLight
            ? 'linear-gradient(135deg, rgba(246,244,239,0.92), rgba(212,168,79,0.38))'
            : 'linear-gradient(135deg, rgba(11,13,19,0.94), rgba(212,168,79,0.32))',
        }}
      />
      <div
        className="sp-wipe-layer-up absolute inset-[-20%]"
        style={{
          background: isGoingLight
            ? 'linear-gradient(315deg, rgba(255,255,255,0.9), rgba(45,212,191,0.3))'
            : 'linear-gradient(315deg, rgba(19,23,34,0.94), rgba(45,212,191,0.28))',
        }}
      />
    </div>
  );
}
