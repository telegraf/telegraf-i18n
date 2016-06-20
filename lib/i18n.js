const fs = require('fs')
const Handlebars = require('handlebars')
const YAML = require('yamljs')
const path = require('path')
const HandlebarsPlural = require('./handlebars-plural.js')
const I18nContext = require('./context.js')

Handlebars.registerHelper('pluralize', HandlebarsPlural)

class I18n {
  constructor (config) {
    this.config = Object.assign({
      defaultLocale: 'en',
      allowMissing: true
    }, config)

    if (!this.config.directory || !fs.existsSync(this.config.directory)) {
      throw new Error(`Locales directory '${this.config.directory}' not found`)
    }

    const i18Data = { }
    const files = fs.readdirSync(this.config.directory)
    files.forEach((fileName) => {
      if (path.extname(fileName) === '.yaml') {
        i18Data[path.basename(fileName, '.yaml')] = YAML.load(path.resolve(this.config.directory, fileName))
      } else if (path.extname(fileName) === '.json') {
        i18Data[path.basename(fileName, '.json')] = require(path.resolve(this.config.directory, fileName))
      }
    })
    this.repository = compileTemplates(i18Data)
  }

  middleware () {
    return (ctx, next) => {
      var locale = this.config.defaultLocale
      if (ctx.session && ctx.session.__i18n && ctx.session.__i18n.locale) {
        locale = ctx.session.__i18n.locale
      }
      ctx.i18n = this.createContext(locale, {
        from: ctx.from,
        chat: ctx.chat
      })
      return next().then(() => {
        if (ctx.session) {
          ctx.session.__i18n = {
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
      root[key] = Handlebars.compile(root[key])
    }
  })
  return root
}

module.exports = I18n
