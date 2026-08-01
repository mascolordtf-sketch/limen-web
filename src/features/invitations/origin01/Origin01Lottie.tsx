import { useEffect, useRef, useState } from 'react'
import lottie, { type AnimationConfigWithData } from 'lottie-web'

type Origin01LottieProps = {
  animationData: AnimationConfigWithData['animationData']
  className: string
  playKey?: number
  hideForReducedMotion?: boolean
  playWhenVisible?: boolean
  preserveAspectRatio?: string
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
  playWhenVisible = false,
  preserveAspectRatio = 'xMidYMid meet',
}: Origin01LottieProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const container = containerRef.current
    if (!container || (reducedMotion && hideForReducedMotion)) return

    const animation = lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData,
      rendererSettings: {
        preserveAspectRatio,
      },
    })

    if (reducedMotion) {
      animation.goToAndStop(Math.max(animation.totalFrames - 1, 0), true)
      return () => animation.destroy()
    }

    if (!playWhenVisible || !('IntersectionObserver' in window)) {
      animation.play()
      return () => animation.destroy()
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      animation.play()
      observer.disconnect()
    }, { threshold: .4 })

    observer.observe(container)

    return () => {
      observer.disconnect()
      animation.destroy()
    }
  }, [animationData, hideForReducedMotion, playKey, playWhenVisible, preserveAspectRatio, reducedMotion])

  if (reducedMotion && hideForReducedMotion) return null

  return <div ref={containerRef} className={className} aria-hidden="true" />
}
