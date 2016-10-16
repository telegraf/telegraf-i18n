const pluralize = require('./pluralize.js')

class I18nContext {
  constructor (locale, repository, allowMissing, defaultContext) {
    this.currentLocale = locale
    this.allowMissing = allowMissing
    this.repository = repository
    this.defaultContext = defaultContext
  }

  getResource (resourceKey) {
    return (resourceKey || '').split('.').reduce((o, x) => o && o[x], this.repository)
  }

  locale (localeCode) {
    if (!localeCode) {
      return this.currentLocale
    }
    this.currentLocale = localeCode
  }

  t (resourceKey, context) {
    let template = this.getResource(`${this.currentLocale}.${resourceKey}`)
    if (!template) {
      if (!this.allowMissing) {
        throw new Error(`Resource '${resourceKey}' not found`)
      }
      template = () => resourceKey
    }
    return template(Object.assign({
      __locale: this.currentLocale,
      pluralize: pluralize(this.currentLocale)
    }, this.defaultContext, context))
  }
}

module.exports = I18nContext
