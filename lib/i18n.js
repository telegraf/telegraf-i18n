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

    const i18Data = { }
    const files = fs.readdirSync(this.config.directory)
    files.forEach((fileName) => {
      if (path.extname(fileName) === '.yaml') {
        const data = fs.readFileSync(path.resolve(this.config.directory, fileName), 'utf8')
        i18Data[path.basename(fileName, '.yaml')] = yaml.safeLoad(data)
      } else if (path.extname(fileName) === '.json') {
        i18Data[path.basename(fileName, '.json')] = require(path.resolve(this.config.directory, fileName))
      }
    })
    this.repository = compileTemplates(i18Data)
  }

  middleware () {
    return (ctx, next) => {
      let locale = this.config.defaultLocale
      if (ctx[this.config.sessionName] && ctx[this.config.sessionName].__i18n && ctx[this.config.sessionName].__i18n.locale) {
        locale = ctx[this.config.sessionName].__i18n.locale
      }
      ctx.i18n = this.createContext(locale, {
        from: ctx.from,
        chat: ctx.chat
      })
      return next().then(() => {
        if (ctx[this.config.sessionName]) {
          ctx[this.config.sessionName].__i18n = {
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
