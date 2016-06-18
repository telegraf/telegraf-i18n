const fs = require('fs')
const Handlebars = require('handlebars')
const YAML = require('yamljs')
const path = require('path')
const HandlebarsPlural = require('./handlebars-plural.js')
const I18nContext = require('./context.js')

Handlebars.registerHelper('pluralize', HandlebarsPlural)

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

  const i18Data = { }
  const files = fs.readdirSync(config.directory)
  files.forEach((fileName) => {
    if (path.extname(fileName) === '.yaml') {
      i18Data[path.basename(fileName, '.yaml')] = YAML.load(path.resolve(config.directory, fileName))
    } else if (path.extname(fileName) === '.json') {
      i18Data[path.basename(fileName, '.json')] = require(path.resolve(config.directory, fileName))
    }
  })

  const repository = compileTemplates(i18Data)

  return (ctx, next) => {
    ctx.i18n = new I18nContext(ctx, config, repository)
    return next()
  }
}

module.exports = factory
