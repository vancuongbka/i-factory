import { SVGProps } from 'react';

export function IFactoryLogo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-label="iFactory logo"
      {...props}
    >
      {/* Factory building */}
      <rect x="6" y="32" width="52" height="26" rx="2" fill="currentColor" opacity="0.15" />
      <rect x="6" y="32" width="52" height="26" rx="2" stroke="currentColor" strokeWidth="2.5" />

      {/* Roof / gable */}
      <path d="M4 33 L32 14 L60 33" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />

      {/* Chimney */}
      <rect x="42" y="18" width="7" height="14" rx="1" fill="currentColor" opacity="0.15" />
      <rect x="42" y="18" width="7" height="14" rx="1" stroke="currentColor" strokeWidth="2.5" />

      {/* Smoke dots */}
      <circle cx="45.5" cy="13" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="47.5" cy="9" r="1.2" fill="currentColor" opacity="0.35" />
      <circle cx="44.5" cy="6" r="1" fill="currentColor" opacity="0.2" />

      {/* Door */}
      <rect x="26" y="44" width="12" height="14" rx="1.5" fill="currentColor" opacity="0.2" />
      <rect x="26" y="44" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="2" />

      {/* Windows */}
      <rect x="10" y="38" width="9" height="8" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="10" y="38" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" />
      <rect x="45" y="38" width="9" height="8" rx="1" fill="currentColor" opacity="0.2" />
      <rect x="45" y="38" width="9" height="8" rx="1" stroke="currentColor" strokeWidth="1.8" />

      {/* Gear overlay — "i" in factory */}
      <circle cx="32" cy="34" r="5.5" fill="currentColor" opacity="0.1" />
      <circle cx="32" cy="34" r="5.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="32" cy="34" r="2" fill="currentColor" />
    </svg>
  );
}
