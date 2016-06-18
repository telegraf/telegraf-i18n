const debug = require('debug')('telegraf:i18n')

class I18nContext {

  constructor (ctx, config, repository) {
    this.ctx = ctx
    this.currentLocale = config.defaultLocale
    this.allowMissing = config.allowMissing
    this.repository = repository
    this.templateContext = {
      from: this.ctx.from,
      chat: this.ctx.chat
    }

    if (ctx.session && ctx.session.__i18n) {
      var i18nSession = Object.assign({locale: config.defaultLocale}, ctx.session.__i18n)
      this.currentLocale = i18nSession.locale
      debug('Locale restored from session', this.currentLocale)
    }
  }

  getResource (resourceKey) {
    return (resourceKey || '').split('.').reduce((o, x) => o && o[x], this.repository)
  }

  locale (localeCode) {
    if (!localeCode) {
      return this.currentLocale
    }
    this.currentLocale = localeCode
    if (this.ctx.session) {
      this.ctx.session.__i18n = { locale: localeCode }
      debug('Locale saved to session', this.currentLocale)
    }
  }

  t (resourceKey, templateContext) {
    var template = this.getResource(`${this.currentLocale}.${resourceKey}`)
    if (!template) {
      if (!this.allowMissing) {
        throw new Error(`Resource '${resourceKey}' not found`)
      }
      template = () => resourceKey
    }
    if (Array.isArray(template)) {
      template = template[Math.floor(Math.random() * template.length)]
    }
    return template(Object.assign({__locale: this.currentLocale}, Object.assign(this.templateContext, templateContext)))
  }
}

module.exports = I18nContext
