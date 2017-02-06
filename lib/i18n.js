const fs = require('fs')
const compile = require('compile-template')
const yaml = require('js-yaml')
const path = require('path')
const I18nContext = require('./context.js')

class I18n {
  constructor (config) {
    this.config = Object.assign({
      defaultLocale: 'en',
      sessionName: 'session',
      allowMissing: true
    }, config)

    if (!this.config.directory || !fs.existsSync(this.config.directory)) {
      throw new Error(`Locales directory '${this.config.directory}' not found`)
    }
    this.repository = {}
    this.loadLocales(this.config.directory)
  }

  loadLocales (directory) {
    const files = fs.readdirSync(directory)
    files.forEach((fileName) => {
      const extension = path.extname(fileName)
      const locale = path.basename(fileName, extension)
      if (extension === '.yaml' || extension === '.yml') {
        const data = fs.readFileSync(path.resolve(directory, fileName), 'utf8')
        this.loadLocale(locale, yaml.safeLoad(data))
      } else if (extension === '.json') {
        this.loadLocale(locale, require(path.resolve(directory, fileName)))
      }
    })
  }

  loadLocale (locale, i18Data, assign) {
    if (assign) {
      Object.assign(this.repository[locale], compileTemplates(i18Data))
    } else {
      this.repository[locale] = compileTemplates(i18Data)
    }
  }

  middleware () {
    return (ctx, next) => {
      let locale = this.config.defaultLocale
      let sessionName = this.config.sessionName
      if (ctx[sessionName] && ctx[sessionName].__i18n && ctx[sessionName].__i18n.locale) {
        locale = ctx[sessionName].__i18n.locale
      }
      ctx.i18n = this.createContext(locale, {
        from: ctx.from,
        chat: ctx.chat
      })
      return next().then(() => {
        if (ctx[sessionName]) {
          ctx[sessionName].__i18n = {
            locale: ctx.i18n.locale()
          }
        }
      })
    }
  }

  createContext (locale, templateData) {
    return new I18nContext(locale, this.repository, this.config.allowMissing, templateData)
  }

  t (locale, resourceKey, templateData) {
    return this.createContext(locale, templateData).t(resourceKey)
  }
}

function compileTemplates (root) {
  Object.keys(root).forEach((key) => {
    if (!root[key]) {
      return
    }
    if (Array.isArray(root[key])) {
      root[key] = root[key].map(compileTemplates)
    }
    if (typeof root[key] === 'object') {
      root[key] = compileTemplates(root[key])
    }
    if (typeof root[key] === 'string') {
      root[key] = compile(root[key])
    }
  })
  return root
}

I18n.match = function (resourceKey, templateData) {
  return (text, ctx) => (text && ctx && ctx.i18n && text === ctx.i18n.t(resourceKey, templateData)) ? [text] : null
}

module.exports = I18n
