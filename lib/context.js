const pluralize = require('./pluralize.js')

class I18nContext {
  constructor (repository, languageCode, templateData, config) {
    this.repository = repository
    this.defaultContext = templateData
    this.config = config
    this.locale(languageCode || this.config.defaultLanguage)
  }

  locale (languageCode) {
    if (!languageCode) {
      return this.languageCode
    }

    const code = languageCode.toLowerCase()
    const shortCode = code.split('-')[0]

    if (!this.repository[code] && !this.repository[shortCode]) {
      this.languageCode = this.config.defaultLanguage
      this.shortLanguageCode = this.languageCode.split('-')[0]
      return
    }

    this.languageCode = code
    this.shortLanguageCode = shortCode
  }

  getTemplate (languageCode, resourceKey = '') {
    return resourceKey
      .split('.')
      .reduce((acc, key) => acc && acc[key], this.repository[languageCode])
  }

  t (resourceKey, context) {
    let template = this.getTemplate(this.languageCode, resourceKey) || this.getTemplate(this.shortLanguageCode, resourceKey)
    if (!template) {
      if (!this.config.allowMissing) {
        throw new Error(`telegraf-i18n: '${this.languageCode}.${resourceKey}' not found`)
      }
      if (this.config.fallbackToDefaultLanguage) {
        template = this.getTemplate(this.config.defaultLanguage, resourceKey)
      } else {
        template = () => resourceKey
      }
    }
    if (this.config.skipPluralize) {
      return template(Object.assign(this.defaultContext, context))
    } else {
      return template(Object.assign({
        pluralize: pluralize(this.shortLanguageCode)
      }, this.defaultContext, context))
    }
  }
}

module.exports = I18nContext
