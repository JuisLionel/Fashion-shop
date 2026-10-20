export function pulseIcon(target: HTMLElement) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const icon = target.querySelector('svg')
  icon?.animate(
    [
      { transform: 'scale(1)' },
      { transform: 'scale(1.35)' },
      { transform: 'scale(0.92)' },
      { transform: 'scale(1)' },
    ],
    { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
  )
}
