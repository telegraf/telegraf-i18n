const fs = require('fs')
const compile = require('compile-template')
const yaml = require('js-yaml')
const path = require('path')
const I18nContext = require('./context.js')

class I18n {
  constructor (config) {
    this.config = Object.assign({
      defaultLanguage: 'en',
      sessionName: 'session',
      allowMissing: true
    }, config)
    this.repository = {}
    if (this.config.directory) {
      this.loadLocales(this.config.directory)
    }
  }

  loadLocales (directory) {
    if (!fs.existsSync(directory)) {
      throw new Error(`Locales directory '${directory}' not found`)
    }
    const files = fs.readdirSync(directory)
    files.forEach((fileName) => {
      const extension = path.extname(fileName)
      const languageCode = path.basename(fileName, extension).toLowerCase()
      if (extension === '.yaml' || extension === '.yml') {
        const data = fs.readFileSync(path.resolve(directory, fileName), 'utf8')
        this.loadLocale(languageCode, yaml.safeLoad(data))
      } else if (extension === '.json') {
        this.loadLocale(languageCode, require(path.resolve(directory, fileName)))
      }
    })
  }

  loadLocale (languageCode, i18Data) {
    const language = languageCode.toLowerCase()
    this.repository[language] = Object.assign(
      {},
      this.repository[language],
      compileTemplates(i18Data)
    )
  }

  resetLocale (languageCode) {
    if (languageCode) {
      delete this.repository[languageCode.toLowerCase()]
    } else {
      this.repository = {}
    }
  }

  availableLocales () {
    return Object.keys(this.repository)
  }

  resourceKeys (languageCode) {
    const language = languageCode.toLowerCase()
    return getTemplateKeysRecursive(this.repository[language])
  }

  missingKeys (languageOfInterest, referenceLanguage = this.config.defaultLanguage) {
    const interest = this.resourceKeys(languageOfInterest)
    const reference = this.resourceKeys(referenceLanguage)

    return reference
      .filter(o => !interest.includes(o))
  }

  overspecifiedKeys (languageOfInterest, referenceLanguage = this.config.defaultLanguage) {
    return this.missingKeys(referenceLanguage, languageOfInterest)
  }

  translationProgress (languageOfInterest, referenceLanguage = this.config.defaultLanguage) {
    const reference = this.resourceKeys(referenceLanguage).length
    const missing = this.missingKeys(languageOfInterest, referenceLanguage).length

    return (reference - missing) / reference
  }

  middleware () {
    return (ctx, next) => {
      const session = this.config.useSession && ctx[this.config.sessionName]
      const languageCode = (session && session.__language_code) || (ctx.from && ctx.from.language_code)
      ctx.i18n = this.createContext(languageCode, {
        from: ctx.from,
        chat: ctx.chat
      })
      return next().then(() => {
        if (session) {
          session.__language_code = ctx.i18n.locale()
        }
      })
    }
  }

  createContext (languageCode, templateData) {
    return new I18nContext(this.repository, languageCode, templateData, this.config)
  }

  t (languageCode, resourceKey, templateData) {
    return this.createContext(languageCode, templateData).t(resourceKey)
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

function getTemplateKeysRecursive (root, prefix = '') {
  let keys = []
  for (const key of Object.keys(root)) {
    const subKey = prefix ? prefix + '.' + key : key
    if (typeof root[key] === 'object') {
      keys = keys.concat(getTemplateKeysRecursive(root[key], subKey))
    } else {
      keys.push(subKey)
    }
  }

  return keys
}

I18n.match = function (resourceKey, templateData) {
  return (text, ctx) => (text && ctx && ctx.i18n && text === ctx.i18n.t(resourceKey, templateData)) ? [text] : null
}

I18n.reply = function (resourceKey, extra) {
  return ({ reply, i18n }) => reply(i18n.t(resourceKey), extra)
}

module.exports = I18n
