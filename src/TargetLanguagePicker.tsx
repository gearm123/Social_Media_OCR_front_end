import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  shortCodeForLanguage,
  SUPPORTED_TARGET_LANGUAGES,
  targetLanguageByCliCode,
  targetLanguageFlagImgProps,
} from './supportedTargetLanguages'

function LanguageFlagImage({
  flagCountryCode,
  size,
  className,
  loading = 'lazy',
}: {
  flagCountryCode: string
  size: 20 | 24
  className?: string
  loading?: 'eager' | 'lazy'
}) {
  const { src, srcSet } = targetLanguageFlagImgProps(flagCountryCode, size)
  return (
    <img
      className={className}
      src={src}
      srcSet={srcSet}
      alt=""
      width={size === 20 ? 27 : 32}
      height={size}
      loading={loading}
      decoding="async"
    />
  )
}

type TargetLanguagePickerProps = {
  id: string
  value: string
  onChange: (cliCode: string) => void
}

const PANEL_MARGIN_PX = 14
const PANEL_LIST_MIN_PX = 120

export function TargetLanguagePicker({ id, value, onChange }: TargetLanguagePickerProps) {
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [panelAbove, setPanelAbove] = useState(false)
  const [panelMaxHeightPx, setPanelMaxHeightPx] = useState<number | null>(null)

  const selected = targetLanguageByCliCode(value) ?? SUPPORTED_TARGET_LANGUAGES[0]

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [...SUPPORTED_TARGET_LANGUAGES]
    return SUPPORTED_TARGET_LANGUAGES.filter((l) => {
      const short = shortCodeForLanguage(l)
      return (
        l.countryName.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        short.toLowerCase().includes(q)
      )
    })
  }, [query])

  const close = useCallback(() => {
    setOpen(false)
    setQuery('')
  }, [])

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open, close])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, close])

  useEffect(() => {
    if (open) searchRef.current?.focus()
  }, [open])

  useLayoutEffect(() => {
    if (!open) {
      setPanelMaxHeightPx(null)
      setPanelAbove(false)
      return
    }

    const rootRem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
    const preferredMaxPx = 22 * rootRem

    const visualViewport = window.visualViewport

    const measure = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const vh = visualViewport?.height ?? window.innerHeight
      const topInset = visualViewport?.offsetTop ?? 0
      const bottomEdge = topInset + vh
      const spaceBelow = bottomEdge - rect.bottom - PANEL_MARGIN_PX
      const spaceAbove = rect.top - topInset - PANEL_MARGIN_PX
      const useAbove = spaceBelow < PANEL_LIST_MIN_PX && spaceAbove > spaceBelow
      const raw = useAbove ? spaceAbove : spaceBelow
      const capped = Math.min(preferredMaxPx, Math.max(PANEL_LIST_MIN_PX, raw))
      setPanelAbove(useAbove)
      setPanelMaxHeightPx(capped)
    }

    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, true)
    visualViewport?.addEventListener('resize', measure)
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure, true)
      visualViewport?.removeEventListener('resize', measure)
    }
  }, [open])

  return (
    <div ref={rootRef} className="target-language-picker">
      <button
        ref={triggerRef}
        type="button"
        id={id}
        className="target-language-picker__trigger"
        aria-label={`Target language, ${selected.label} (${shortCodeForLanguage(selected)})`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        title={`Target language: ${selected.label} (${shortCodeForLanguage(selected)})`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="target-language-picker__trigger-flag" aria-hidden>
          <LanguageFlagImage
            flagCountryCode={selected.flagCountryCode}
            size={20}
            loading="eager"
            className="target-language-picker__flag-img target-language-picker__flag-img--trigger"
          />
        </span>
        <span className="target-language-picker__trigger-chevron" aria-hidden />
      </button>
      {open ? (
        <div
          className={`target-language-picker__panel${panelAbove ? ' target-language-picker__panel--above' : ''}`}
          role="presentation"
          style={panelMaxHeightPx != null ? { maxHeight: panelMaxHeightPx } : undefined}
        >
          <label className="target-language-picker__search-label sr-only" htmlFor={`${id}-search`}>
            Search languages
          </label>
          <input
            ref={searchRef}
            id={`${id}-search`}
            type="search"
            className="target-language-picker__search"
            placeholder="Search country, language, or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
          <ul
            id={listId}
            className="target-language-picker__list"
            role="listbox"
            aria-label="Language choices"
          >
            {filtered.length === 0 ? (
              <li className="target-language-picker__empty" role="presentation">
                No matches
              </li>
            ) : (
              filtered.map((l) => {
                const short = shortCodeForLanguage(l)
                const isActive = l.cliCode === value
                return (
                  <li key={l.cliCode === '' ? 'default-en' : l.cliCode} role="presentation">
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      className={`target-language-picker__option${isActive ? ' target-language-picker__option--active' : ''}`}
                      onClick={() => {
                        onChange(l.cliCode)
                        close()
                      }}
                    >
                      <span className="target-language-picker__option-flag" aria-hidden>
                        <LanguageFlagImage
                          flagCountryCode={l.flagCountryCode}
                          size={24}
                          className="target-language-picker__flag-img target-language-picker__flag-img--option"
                        />
                      </span>
                      <span className="target-language-picker__option-country">{l.countryName}</span>
                      <span className="target-language-picker__option-short">{short}</span>
                    </button>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
