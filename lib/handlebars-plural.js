// https://developer.mozilla.org/en-US/docs/Mozilla/Localization/Localization_and_Plurals

module.exports = function () {
  const forms = [].slice.call(arguments)
  const number = forms.shift()
  const context = forms.pop().data.root
  var wordIndex = 0

  Object.keys(languageMapping).forEach((ruleKey) => {
    if (languageMapping[ruleKey].indexOf(context.__locale) !== -1) {
      wordIndex = pluralRules[ruleKey](number)
    }
  })

  return `${number} ${forms[wordIndex]}`
}

var pluralRules = {
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
  icelandic: (n) => (n % 10 !== 1 || n % 100 === 11) ? 1 : 0
}

var languageMapping = {
  english: ['da', 'de', 'en', 'es', 'fi', 'el', 'he', 'hu', 'it', 'nl', 'no', 'pt', 'sv'],
  chinese: ['fa', 'id', 'ja', 'ko', 'lo', 'ms', 'th', 'tr', 'zh'],
  french: ['fr', 'tl', 'pt-br'],
  russian: ['hr', 'ru'],
  czech: ['cs', 'sk'],
  icelandic: ['is'],
  polish: ['pl']
}
