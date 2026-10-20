import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

type PaginationProps = {
  page: number
  totalPages: number
  onChange: (page: number) => void
  ariaLabel?: string
  className?: string
}

function getPageItems(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1)

  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages].filter((page) => page >= 1 && page <= total).sort((a, b) => a - b)
  const items: (number | '…')[] = []

  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) items.push('…')
    items.push(page)
  })
  return items
}

export default function Pagination({
  page,
  totalPages,
  onChange,
  ariaLabel = 'Pagination',
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const edge =
    'font-jost text-xs uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-30 enabled:hover:text-accent'

  return (
    <nav
      aria-label={ariaLabel}
      className={`mt-16 flex items-center justify-center gap-2 border-t border-base-content/10 pt-8 sm:gap-4 ${className}`}
    >
      <button
        type="button"
        className={`${edge} px-2 py-2`}
        disabled={page === 1}
        aria-label="Previous page"
        onClick={() => onChange(page - 1)}
      >
        <FiChevronLeft className="size-5 md:hidden" aria-hidden="true" />
        <span className="hidden md:inline">← Prev</span>
      </button>

      <ul className="flex items-center gap-1">
        {getPageItems(page, totalPages).map((item, index) =>
          item === '…' ? (
            <li key={`gap-${index}`} className="px-2 font-jost text-sm text-base-content/40" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                onClick={() => onChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
                className={`size-10 border-b font-jost text-sm transition-colors ${
                  item === page
                    ? 'border-base-content text-base-content'
                    : 'border-transparent text-base-content/50 hover:text-accent'
                }`}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <button
        type="button"
        className={`${edge} px-2 py-2`}
        disabled={page === totalPages}
        aria-label="Next page"
        onClick={() => onChange(page + 1)}
      >
        <span className="hidden md:inline">Next →</span>
        <FiChevronRight className="size-5 md:hidden" aria-hidden="true" />
      </button>
    </nav>
  )
}
