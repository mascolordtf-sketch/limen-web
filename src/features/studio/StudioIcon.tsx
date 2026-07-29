import type { ReactNode, SVGProps } from 'react'

export type StudioIconName =
  | 'template'
  | 'aesthetic'
  | 'sections'
  | 'content'
  | 'review'
  | 'temporary'
  | 'exit'

const iconPaths: Record<StudioIconName, ReactNode> = {
  template: <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 3.5v17M8 9h12.5" />
  </>,
  aesthetic: <>
    <path d="M12 3.25a8.75 8.75 0 1 0 0 17.5h1.25a1.75 1.75 0 0 0 0-3.5h-.5a1.5 1.5 0 0 1 0-3h2.75a5.25 5.25 0 0 0 0-10.5H12Z" />
    <path d="M7.75 9.1h.01M10.25 6.75h.01M14 6.55h.01M17 8.4h.01" />
  </>,
  sections: <>
    <path d="m12 3.5 8.5 4.25L12 12 3.5 7.75 12 3.5Z" />
    <path d="m5.5 11.2-2 1L12 16.5l8.5-4.3-2-1M5.5 15.7l-2 1L12 21l8.5-4.3-2-1" />
  </>,
  content: <>
    <path d="M5 4.25h9.25A2.75 2.75 0 0 1 17 7v3" />
    <path d="M5 8.5h6M5 12.75h4" />
    <path d="m11.25 18.75.65-3.1 6.85-6.85a1.55 1.55 0 0 1 2.2 2.2l-6.85 6.85-3.1.65.25.25Z" />
  </>,
  review: <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="m8.25 12.1 2.45 2.45 5.2-5.2" />
  </>,
  temporary: <>
    <circle cx="12" cy="12" r="8.75" />
    <path d="M12 7.25v5.25l3.25 1.75" />
  </>,
  exit: <>
    <path d="M10 4H5.75A1.75 1.75 0 0 0 4 5.75v12.5A1.75 1.75 0 0 0 5.75 20H10" />
    <path d="m15.5 8 4 4-4 4M9.5 12h10" />
  </>,
}

export function StudioIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: StudioIconName }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65"
    strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" {...props}>
    {iconPaths[name]}
  </svg>
}
