/*
 * Inline SVG icon set (24px grid, 1.75 stroke, currentColor). Decorative by
 * default — pair with visible text or an aria-label on the parent control.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function TelegramIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" {...rest}>
      <path
        fill="currentColor"
        d="M21.7 4.3a1 1 0 0 0-1.04-.17L2.9 11.05a.9.9 0 0 0 .05 1.69l4.33 1.43 1.67 5.3a.9.9 0 0 0 1.5.37l2.43-2.38 4.38 3.22a1 1 0 0 0 1.57-.6l3.2-14.7a1 1 0 0 0-.33-1.08ZM9.92 14.02l-.43 3.12-1.15-3.66 9.24-5.86-7.66 6.4Z"
      />
    </svg>
  );
}

export function CopyIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="8.5" y="8.5" width="11" height="11" rx="2.25" />
      <path d="M15.5 8.5V6.25A1.75 1.75 0 0 0 13.75 4.5h-7.5A1.75 1.75 0 0 0 4.5 6.25v7.5c0 .97.78 1.75 1.75 1.75H8.5" />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.75V12l2.75 1.75" />
    </Svg>
  );
}

export function AlertCircleIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 8v4.5" />
      <path d="M12 15.75h.01" strokeWidth={2.25} />
    </Svg>
  );
}

export function WifiOffIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 3.5l17 17" />
      <path d="M8.6 8.9A10.9 10.9 0 0 0 3 11.6" />
      <path d="M21 11.6a10.9 10.9 0 0 0-7.3-3" />
      <path d="M6.5 14.9a7 7 0 0 1 4.1-2" />
      <path d="M15.6 13.3c.7.4 1.3.9 1.9 1.6" />
      <path d="M12 18.75h.01" strokeWidth={2.25} />
    </Svg>
  );
}

export function RefreshIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19.25 12a7.25 7.25 0 1 1-2.12-5.13" />
      <path d="M19.25 4.75v4.5h-4.5" />
    </Svg>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 6.5h-2.25A1.75 1.75 0 0 0 5 8.25v9c0 .97.78 1.75 1.75 1.75h9c.97 0 1.75-.78 1.75-1.75V15" />
      <path d="M13 5h6v6" />
      <path d="M19 5l-8 8" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2.25" />
      <path d="M8.25 10.5V8a3.75 3.75 0 0 1 7.5 0v2.5" />
    </Svg>
  );
}

export function BookIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4.75 5.75c0-.97.78-1.75 1.75-1.75h11.75v13H6.5c-.97 0-1.75.78-1.75 1.75" />
      <path d="M4.75 18.75V5.75" />
      <path d="M4.75 18.75c0 .97.78 1.75 1.75 1.75h11.75V17" />
      <path d="M8.75 8.25h5.5" />
    </Svg>
  );
}

export function PencilIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M14.5 5.5l4 4" />
      <path d="M16.25 3.75a2.12 2.12 0 0 1 3 3L8.5 17.5l-4 1 1-4Z" />
    </Svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="6.25" />
      <path d="m19.5 19.5-3.9-3.9" />
    </Svg>
  );
}

export function UsersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="9.5" cy="8.75" r="3.25" />
      <path d="M3.75 19c.4-3.05 2.75-5 5.75-5s5.35 1.95 5.75 5" />
      <path d="M15.25 5.6a3.25 3.25 0 0 1 0 6.3" />
      <path d="M17.5 14.35c1.55.6 2.6 2.25 2.75 4.65" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M19 12H5.5" />
      <path d="m11 6-6 6 6 6" />
    </Svg>
  );
}


export function SunIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="4.25" />
      <path d="M12 2.5v2.25M12 19.25V21.5M4.93 4.93l1.59 1.59M17.48 17.48l1.59 1.59M2.5 12h2.25M19.25 12H21.5M4.93 19.07l1.59-1.59M17.48 6.52l1.59-1.59" />
    </Svg>
  );
}

export function MoonIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20.25 14.5A8.25 8.25 0 0 1 9.5 3.75a8.25 8.25 0 1 0 10.75 10.75Z" />
    </Svg>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m9 6 6 6-6 6" />
    </Svg>
  );
}

export function SparklesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m12 3 1.9 5.6L19.5 10.5l-5.6 1.9L12 18l-1.9-5.6L4.5 10.5l5.6-1.9L12 3Z" />
      <path d="M19 18l.8 2.2L22 21l-2.2.8L19 24l-.8-2.2L16 21l2.2-.8L19 18Z" />
    </Svg>
  );
}

export function GraduationCapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </Svg>
  );
}


export function StarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon
        points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
        fill="currentColor"
        stroke="none"
      />
    </Svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function ShieldCheckIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  );
}

export function CodeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </Svg>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m6 9 6 6 6-6" />
    </Svg>
  );
}

export function AwardIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </Svg>
  );
}

export function VideoIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <polygon points="23 7 16 12 23 17 23 7" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </Svg>
  );
}

export function YouTubeIcon({ size = 20, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false" {...rest}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}
