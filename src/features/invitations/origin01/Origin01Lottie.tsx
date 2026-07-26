import { useEffect, useMemo, useRef, useState } from 'react'

type LottieData = { w: number; h: number; fr: number; ip: number; op: number; layers?: unknown[]; assets?: unknown[] }

type LocalLottieProps = {
  animationData: LottieData
  kind: 'question' | 'confetti'
  className: string
  playKey?: number
}

const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => setReduced(query.matches)
    update()
    query.addEventListener('change', update)
    return () => query.removeEventListener('change', update)
  }, [])

  return reduced
}

const palette = ['#3b1d2d', '#5b3045', '#b77f8e', '#d8b8bc', '#c49b62', '#f5efe7']

/** A deliberately small local renderer for the two simple, bundled Origin 01 scenes. */
export function Origin01Lottie({ animationData, kind, className, playKey = 0 }: LocalLottieProps) {
  const reducedMotion = useReducedMotion()
  const animationRef = useRef<SVGSVGElement>(null)
  const duration = (animationData.op - animationData.ip) / animationData.fr
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, index) => ({
    x: 20 + ((index * 47) % Math.max(1, animationData.w - 40)),
    delay: ((index * 13) % 40) / 20,
    duration: duration * (.62 + (index % 5) * .075),
    color: palette[index % palette.length],
    rotation: index % 2 ? 540 : -480,
    width: index % 3 === 0 ? 9 : 6,
  })), [animationData.w, duration])

  if (kind === 'confetti' && reducedMotion) return null

  return (
    <svg
      key={playKey}
      ref={animationRef}
      className={className}
      viewBox={`0 0 ${animationData.w} ${animationData.h}`}
      role="presentation"
      aria-hidden="true"
      focusable="false"
    >
      {kind === 'question' ? (
        <g fill="none" stroke="#3b1d2d" strokeLinecap="round" strokeLinejoin="round" strokeWidth="8">
          <path d="M92 112c0-36 25-62 60-62 36 0 59 22 59 55 0 29-18 42-36 54-14 10-22 20-22 39" pathLength="1" className={reducedMotion ? '' : 'origin01-lottie-question__stroke'} />
          <circle cx="153" cy="238" r="6" fill="#3b1d2d" stroke="none" className={reducedMotion ? '' : 'origin01-lottie-question__dot'} />
        </g>
      ) : pieces.map((piece, index) => (
        <rect key={index} x={piece.x} y="-18" width={piece.width} height={piece.width * 1.8} rx="2" fill={piece.color}>
          <animate attributeName="y" from="-18" to={animationData.h + 24} dur={`${piece.duration}s`} begin={`${piece.delay}s`} fill="freeze" />
          <animate attributeName="x" values={`${piece.x};${piece.x + (index % 2 ? 34 : -34)};${piece.x}`} dur={`${piece.duration}s`} begin={`${piece.delay}s`} fill="freeze" />
          <animateTransform attributeName="transform" type="rotate" from={`0 ${piece.x} 0`} to={`${piece.rotation} ${piece.x} ${animationData.h}`} dur={`${piece.duration}s`} begin={`${piece.delay}s`} fill="freeze" />
        </rect>
      ))}
    </svg>
  )
}
