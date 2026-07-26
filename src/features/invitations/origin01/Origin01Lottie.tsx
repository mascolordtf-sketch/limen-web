import { useEffect, useRef, useState } from 'react'
import lottie, { type AnimationConfigWithData } from 'lottie-web'

type Origin01LottieProps = {
  animationData: AnimationConfigWithData['animationData']
  className: string
  playKey?: number
  hideForReducedMotion?: boolean
}

const useReducedMotion = () => {
  const [reducedMotion, setReducedMotion] = useState(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setReducedMotion(query.matches)

    updatePreference()
    query.addEventListener('change', updatePreference)
    return () => query.removeEventListener('change', updatePreference)
  }, [])

  return reducedMotion
}

export function Origin01Lottie({
  animationData,
  className,
  playKey = 0,
  hideForReducedMotion = false,
}: Origin01LottieProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (!containerRef.current || (reducedMotion && hideForReducedMotion)) return

    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: {
        preserveAspectRatio: 'xMidYMid meet',
      },
    })

    if (reducedMotion) {
      animation.goToAndStop(Math.max(animation.totalFrames - 1, 0), true)
    } else {
      animation.play()
    }

    return () => animation.destroy()
  }, [animationData, hideForReducedMotion, playKey, reducedMotion])

  if (reducedMotion && hideForReducedMotion) return null

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
