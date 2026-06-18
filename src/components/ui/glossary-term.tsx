import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'
import { glossaryTerms, getGlossaryKeys } from '@/lib/glossary'
import { useTranslation } from '@/hooks/useTranslation'

interface GlossaryTermProps {
  /** Term identifier e.g. 'coso', 'rcm' */
  term: string
  /** Displayed text content */
  children: React.ReactNode
  className?: string
}

const HOVER_DELAY_MS = 300
const TOOLTIP_GAP = 8
const TOOLTIP_MIN_SPACE = 220

/**
 * GlossaryTerm wraps a piece of text and shows a rich tooltip
 * with definition, context, and importance on hover.
 *
 * The tooltip is rendered into document.body via a portal with
 * `position: fixed` to avoid being clipped by parent containers
 * that have `overflow: hidden` or `overflow-x: auto` (common
 * in table wrappers and card layouts).
 */
export function GlossaryTerm({ term, children, className }: GlossaryTermProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = React.useState(false)
  const [tooltipStyle, setTooltipStyle] = React.useState<React.CSSProperties>({})
  const containerRef = React.useRef<HTMLSpanElement>(null)
  const tooltipRef = React.useRef<HTMLSpanElement>(null)
  const showTimerRef = React.useRef<number | null>(null)

  const entry = glossaryTerms[term]
  const keys = getGlossaryKeys(term)

  const clearShowTimer = React.useCallback(() => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
  }, [])

  /**
   * Compute fixed-position coordinates for the tooltip so it sits
   * right above or below the trigger element, centred horizontally.
   */
  const computePosition = React.useCallback(() => {
    if (!containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const viewportW = window.innerWidth

    // Decide above / below
    const showBelow = rect.top < TOOLTIP_MIN_SPACE

    // Horizontal centre relative to the trigger span
    let left = rect.left + rect.width / 2

    // Keep the 320px-wide tooltip inside the viewport
    const halfWidth = 160
    if (left - halfWidth < 12) {
      left = halfWidth + 12
    } else if (left + halfWidth > viewportW - 12) {
      left = viewportW - halfWidth - 12
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      zIndex: 100,
      width: 320,
      left,
      transform: 'translateX(-50%)',
    }

    if (showBelow) {
      style.top = `${rect.bottom + TOOLTIP_GAP}px`
    } else {
      // Position bottom edge just above the trigger
      style.bottom = `${window.innerHeight - rect.top + TOOLTIP_GAP}px`
    }

    setTooltipStyle(style)
  }, [])

  const handleMouseEnter = () => {
    computePosition()
    clearShowTimer()
    showTimerRef.current = window.setTimeout(() => {
      setVisible(true)
      showTimerRef.current = null
    }, HOVER_DELAY_MS)
  }

  const handleMouseLeave = () => {
    clearShowTimer()
    setVisible(false)
  }

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      clearShowTimer()
    }
  }, [clearShowTimer])

  if (!entry || !keys) {
    return <span className={className}>{children}</span>
  }

  const definition = t(keys.definition)
  const context = t(keys.context)
  const importance = t(keys.importance)

  return (
    <>
      {/* Inline trigger – no `relative` positioning needed anymore */}
      <span
        ref={containerRef}
        className={cn('inline-flex items-baseline cursor-help', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <span
          className="border-b border-dashed border-[#4A4A68]/60"
          style={{ color: '#4A4A68' }}
        >
          {children}
        </span>
      </span>

      {/* Tooltip rendered to document.body so it cannot be clipped */}
      {visible &&
        createPortal(
          <span
            ref={tooltipRef}
            className="rounded-lg bg-white shadow-L2 border border-gray-100 p-3 px-4 text-left pointer-events-none"
            style={{ ...tooltipStyle, whiteSpace: 'normal' }}
          >
            {/* Header */}
            <span className="block text-sm font-bold text-gray-900 mb-1.5">
              {entry.abbreviation}
            </span>

            {/* Separator */}
            <span className="block h-px bg-gray-200 mb-2" />

            {/* Definition */}
            <span className="block mb-2">
              <span className="block text-xs font-semibold text-gray-600 mb-0.5">
                {t('glossary.label.definition')}
              </span>
              <span className="block text-xs text-gray-700 leading-relaxed">
                {definition}
              </span>
            </span>

            {/* Context */}
            <span className="block mb-2">
              <span className="block text-xs font-semibold text-gray-600 mb-0.5">
                {t('glossary.label.context')}
              </span>
              <span className="block text-xs text-gray-700 leading-relaxed">
                {context}
              </span>
            </span>

            {/* Importance */}
            <span className="block">
              <span className="block text-xs font-semibold text-gray-600 mb-0.5">
                {t('glossary.label.importance')}
              </span>
              <span className="block text-xs text-gray-700 leading-relaxed">
                {importance}
              </span>
            </span>
          </span>,
          document.body
        )}
    </>
  )
}
