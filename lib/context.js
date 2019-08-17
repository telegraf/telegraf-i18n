class I18nContext {
  constructor (repository, config, languageCode, templateData) {
    this.repository = repository
    this.config = config
    this.locale(languageCode || config.defaultLanguage)
    this.templateData = {
      ...config.templateData,
      ...templateData
    }
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

  t (resourceKey, templateData) {
    let template = this.getTemplate(this.languageCode, resourceKey) || this.getTemplate(this.shortLanguageCode, resourceKey)

    if (!template && this.config.defaultLanguageOnMissing) {
      template = this.getTemplate(this.config.defaultLanguage, resourceKey)
    }

    if (!template && this.config.allowMissing) {
      template = () => resourceKey
    }

    if (!template) {
      throw new Error(`telegraf-i18n: '${this.languageCode}.${resourceKey}' not found`)
    }
    const context = {
      ...this.templateData,
      ...templateData
    }
    Object.keys(context)
      .filter((key) => typeof context[key] === 'function')
      .forEach((key) => (context[key] = context[key].bind(this)))
    return template(context)
  }
}

module.exports = I18nContext
