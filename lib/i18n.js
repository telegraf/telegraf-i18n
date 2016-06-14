const debug = require('debug')('telegraf:i18n')
const fs = require('fs')
const Handlebars = require('handlebars')
const YAML = require('yamljs')
const path = require('path')
const HandlebarsPlural = require('./handlebars-plural.js')

Handlebars.registerHelper('pluralize', HandlebarsPlural)

function getResource (root, resourceKey) {
  return (resourceKey || '').split('.').reduce((o, x) => o && o[x], root)
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

function factory (config) {
  config = Object.assign({
    defaultLocale: 'en',
    allowMissing: true
  }, config)

  if (!config.directory || !fs.existsSync(config.directory)) {
    throw new Error(`Locales directory '${config.directory}' not found`)
  }

  var i18Data = { }
  var files = fs.readdirSync(config.directory)
  files.forEach((fileName) => {
    if (path.extname(fileName) === '.yaml') {
      i18Data[path.basename(fileName, '.yaml')] = YAML.load(path.resolve(config.directory, fileName))
    } else if (path.extname(fileName) === '.json') {
      i18Data[path.basename(fileName, '.json')] = require(path.resolve(config.directory, fileName))
    }
  })

  var repository = compileTemplates(i18Data)

  return (ctx, next) => {
    var currentLocale = config.defaultLocale
    ctx.i18n = {
      locale: function (localeCode) {
        if (!localeCode) {
          return currentLocale
        }
        currentLocale = localeCode
        if (ctx.session) {
          ctx.session.__i18n = { code: localeCode }
          debug('Locale saved to session', currentLocale)
        }
      },
      t: function (resourceKey, payload) {
        var template = getResource(repository, `${currentLocale}.${resourceKey}`)
        if (!template) {
          if (!config.allowMissing) {
            throw new Error(`Resource '${resourceKey}' not found`)
          }
          template = () => resourceKey
        }
        if (Array.isArray(template)) {
          template = template[Math.floor(Math.random() * template.length)]
        }
        var templateContext = Object.assign({
          bot: ctx.me,
          from: ctx.from,
          chat: ctx.chat
        }, ctx.i18n.context, payload)
        debug(template)
        return template(Object.assign({__locale: currentLocale}, templateContext))
      }
    }

    ctx.i18n.context = {}

    if (ctx.session && ctx.session.__i18n) {
      var i18nSession = Object.assign({code: config.defaultLocale}, ctx.session.__i18n)
      currentLocale = i18nSession.code
      debug('Locale restored from session', currentLocale)
    }

    return next()
  }
}

module.exports = factory
