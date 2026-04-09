/**
 * Target output languages shown in the UI. Must match `OutputLanguage` in
 * `translate_chat/output_languages.py` (same `cliCode` as enum values; POST omits
 * `language` when default English).
 *
 * Catalan, Galician, and Frisian are not offered separately (Spanish / Dutch cover
 * those regions); API may still accept legacy codes `ca`, `gl`, `fy` via aliases.
 */
export type SupportedTargetLanguage = {
  cliCode: string
  /** Language name (search + context) */
  label: string
  /** Primary country / region associated with the flag (shown in the picker list) */
  countryName: string
  /**
   * ISO 3166-1 alpha-2 (lowercase) for flag images via flagcdn.com.
   * Used instead of emoji so Windows shows real flags (emoji often degrade to "GB", etc.).
   */
  flagCountryCode: string
}

/** English default — `cliCode` must stay empty so the API receives no `language` field */
export const DEFAULT_TARGET_LANGUAGE_CODE = ''

/** Short code shown in the list UI; POST still omits `language` when `cliCode` is empty */
export function shortCodeForLanguage(l: SupportedTargetLanguage): string {
  return l.cliCode || 'en'
}

export function targetLanguageByCliCode(code: string): SupportedTargetLanguage | undefined {
  return SUPPORTED_TARGET_LANGUAGES.find((l) => l.cliCode === code)
}

export function targetLanguageFlagImgProps(flagCountryCode: string, height: 20 | 24): {
  src: string
  srcSet: string
} {
  const h2 = height * 2
  const c = flagCountryCode.toLowerCase()
  return {
    src: `https://flagcdn.com/h${height}/${c}.png`,
    srcSet: `https://flagcdn.com/h${h2}/${c}.png 2x`,
  }
}

/** One row per `OutputLanguage` in `output_languages.py` (excluding removed regional variants). */
export const SUPPORTED_TARGET_LANGUAGES: readonly SupportedTargetLanguage[] = [
  { cliCode: DEFAULT_TARGET_LANGUAGE_CODE, label: 'English', countryName: 'United Kingdom', flagCountryCode: 'gb' },
  { cliCode: 'af', label: 'Afrikaans', countryName: 'South Africa', flagCountryCode: 'za' },
  { cliCode: 'da', label: 'Danish', countryName: 'Denmark', flagCountryCode: 'dk' },
  { cliCode: 'nl', label: 'Dutch', countryName: 'Netherlands', flagCountryCode: 'nl' },
  { cliCode: 'fr', label: 'French', countryName: 'France', flagCountryCode: 'fr' },
  { cliCode: 'de', label: 'German', countryName: 'Germany', flagCountryCode: 'de' },
  { cliCode: 'is', label: 'Icelandic', countryName: 'Iceland', flagCountryCode: 'is' },
  { cliCode: 'it', label: 'Italian', countryName: 'Italy', flagCountryCode: 'it' },
  { cliCode: 'lb', label: 'Luxembourgish', countryName: 'Luxembourg', flagCountryCode: 'lu' },
  { cliCode: 'no', label: 'Norwegian', countryName: 'Norway', flagCountryCode: 'no' },
  { cliCode: 'pt', label: 'Portuguese', countryName: 'Portugal', flagCountryCode: 'pt' },
  { cliCode: 'ro', label: 'Romanian', countryName: 'Romania', flagCountryCode: 'ro' },
  { cliCode: 'es', label: 'Spanish', countryName: 'Spain', flagCountryCode: 'es' },
  { cliCode: 'sv', label: 'Swedish', countryName: 'Sweden', flagCountryCode: 'se' },
] as const
