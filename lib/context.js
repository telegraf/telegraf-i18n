const pluralize = require('./pluralize.js')

class I18nContext {
  constructor (repository, locale, templateData, config) {
    this.repository = repository
    this.currentLocale = locale
    this.config = config
    this.defaultContext = templateData
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
      if (!this.config.allowMissing) {
        throw new Error(`Resource '${resourceKey}' not found`)
      }
      template = this.getResource(`${this.config.defaultLocale}.${resourceKey}`)
      if (!template) {
        template = () => resourceKey
      }
    }
    return template(Object.assign({
      __locale: this.currentLocale,
      pluralize: pluralize(this.currentLocale)
    }, this.defaultContext, context))
  }
}

module.exports = I18nContext
