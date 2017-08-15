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
    this.languageCode = languageCode.toLowerCase()
    this.shortLanguageCode = this.languageCode.split('-')[0]
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
      template = () => resourceKey
    }
    return template(Object.assign({
      pluralize: pluralize(this.shortLanguageCode)
    }, this.defaultContext, context))
  }
}

module.exports = I18nContext
