class I18nContext {
  constructor (locale, repository, allowMissing, templateData) {
    this.currentLocale = locale
    this.allowMissing = allowMissing
    this.repository = repository
    this.templateData = templateData
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

  t (resourceKey, templateData) {
    let template = this.getResource(`${this.currentLocale}.${resourceKey}`)
    if (!template) {
      if (!this.allowMissing) {
        throw new Error(`Resource '${resourceKey}' not found`)
      }
      template = () => resourceKey
    }
    if (Array.isArray(template)) {
      template = template[Math.floor(Math.random() * template.length)]
    }
    return template(Object.assign({__locale: this.currentLocale}, this.templateData, templateData))
  }
}

module.exports = I18nContext
