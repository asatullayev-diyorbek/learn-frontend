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
