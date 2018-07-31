// https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_and_Plurals

const pluralRules = {
  english: (n) => n !== 1 ? 1 : 0,
  french: (n) => n > 1 ? 1 : 0,
  russian: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) {
      return 0
    }
    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
  },
  czech: (n) => {
    if (n === 1) {
      return 0
    }
    return (n >= 2 && n <= 4) ? 1 : 2
  },
  polish: (n) => {
    if (n === 1) {
      return 0
    }
    return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2
  },
  icelandic: (n) => (n % 10 !== 1 || n % 100 === 11) ? 1 : 0,
  chinese: (n) => 0,
  semitic: (n) => {
    if (n === 0) {
      return 0
    } else if (n === 1) {
      return 1
    } else if (n === 2) {
      return 2
    } else if (n >= 3 && n % 100 <= 10) {
      return 3
    } else if (n >= 11 && n % 100 <= 99) {
      return 5
    } else {
      return 6
    }
  }
}

const mapping = {
  english: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv', 'br'],
  chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh', 'jp'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['hr', 'ru', 'uk', 'uz'],
  czech: ['cs', 'sk'],
  icelandic: ['is'],
  polish: ['pl'],
  semitic: ['ar']
}

module.exports = function pluralize (languageCode) {
  const language = languageCode.split('-')[0].toLowerCase()
  let key = Object.keys(mapping).find((key) => mapping[key].includes(language))
  if (!key) {
    console.warn(`i18n::Pluralize: Unsupported language ${languageCode}`)
    key = 'english'
  }
  return (number, ...forms) => `${number} ${forms[pluralRules[key](number)]}`
}
