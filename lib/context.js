const pluralize = require('./pluralize.js')

class I18nContext {
  constructor (repository, languageCode, templateData, config) {
    this.repository = repository
    this.languageCode = languageCode
    this.config = config
    this.defaultContext = templateData
  }

  getResource (resourceKey) {
    return (resourceKey || '').split('.').reduce((o, x) => o && o[x], this.repository)
  }

  locale (localeCode) {
    if (!localeCode) {
      return this.languageCode
    }
    this.languageCode = localeCode
  }

  t (resourceKey, context) {
    let template = this.getResource(`${this.languageCode}.${resourceKey}`)
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
      __locale: this.languageCode,
      pluralize: pluralize(this.languageCode)
    }, this.defaultContext, context))
  }
}

module.exports = I18nContext
