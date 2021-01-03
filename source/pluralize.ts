// https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_and_Plurals

import {I18nContext} from './context'

type AvailableRuleLanguages = 'english' | 'french' | 'russian' | 'czech' | 'polish' | 'icelandic' | 'chinese' | 'arabic'
type LanguageCode = string
type Form = string | ((n: number) => string)

const pluralRules: Readonly<Record<AvailableRuleLanguages, (n: number) => number>> = {
  english: (n: number) => n === 1 ? 0 : 1,
  french: (n: number) => n > 1 ? 1 : 0,
  russian: (n: number) => {
    if (n % 10 === 1 && n % 100 !== 11) {
      return 0
    }

    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
  },
  czech: (n: number) => {
    if (n === 1) {
      return 0
    }

    return (n >= 2 && n <= 4) ? 1 : 2
  },
  polish: (n: number) => {
    if (n === 1) {
      return 0
    }

    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
  },
  icelandic: (n: number) => (n % 10 !== 1 || n % 100 === 11) ? 1 : 0,
  chinese: () => 0,
  arabic: (n: number) => {
    if (n >= 0 && n < 3) {
      return n
    }

    if (n % 100 <= 10) {
      return 3
    }

    if (n >= 11 && n % 100 <= 99) {
      return 4
    }

    return 5
  }
}

const AVAILABLE_RULE_LANGUAGES = Object.keys(pluralRules) as readonly AvailableRuleLanguages[]

const mapping: Readonly<Record<AvailableRuleLanguages, readonly LanguageCode[]>> = {
  english: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv', 'br'],
  chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh', 'jp'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['hr', 'ru', 'uk', 'uz'],
  czech: ['cs', 'sk'],
  icelandic: ['is'],
  polish: ['pl'],
  arabic: ['ar']
}

function findRuleLanguage(languageCode: string): AvailableRuleLanguages {
  const result = AVAILABLE_RULE_LANGUAGES.find(key => mapping[key].includes(languageCode))
  if (!result) {
    console.warn(`i18n::Pluralize: Unsupported language ${languageCode}`)
    return 'english'
  }

  return result
}

function pluralizeInternal(languageCode: string, number: number, ...forms: readonly Form[]): string {
  const key = findRuleLanguage(languageCode)
  const rule = pluralRules[key]
  const form = forms[rule(number)]
  return typeof form === 'function' ? form(number) : `${number} ${String(form)}`
}

// eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
export function pluralize(this: I18nContext, number: number, ...forms: readonly Form[]): string {
  const code = this.shortLanguageCode
  return pluralizeInternal(code, number, ...forms)
}
