import {Config, Repository, TemplateData, Template} from './types'

export class I18nContext {
  readonly config: Config
  readonly repository: Repository
  readonly templateData: Readonly<TemplateData>
  languageCode: string
  shortLanguageCode: string

  constructor(repository: Readonly<Repository>, config: Config, languageCode: string, templateData: Readonly<TemplateData>) {
    this.repository = repository
    this.config = config
    this.templateData = {
      ...config.templateData,
      ...templateData,
    }

    const result = parseLanguageCode(this.repository, this.config.defaultLanguage, languageCode)
    this.languageCode = result.languageCode
    this.shortLanguageCode = result.shortLanguageCode
  }

  locale(): string;
  locale(languageCode: string): void;
  locale(languageCode?: string): void | string {
    if (!languageCode) {
      return this.languageCode
    }

    const result = parseLanguageCode(this.repository, this.config.defaultLanguage, languageCode)
    this.languageCode = result.languageCode
    this.shortLanguageCode = result.shortLanguageCode
  }

  getTemplate(languageCode: string, resourceKey: string): Template | undefined {
    const repositoryEntry = this.repository[languageCode]
    return repositoryEntry?.[resourceKey]
  }

  t(resourceKey: string, templateData: Readonly<TemplateData> = {}) {
    let template = this.getTemplate(this.languageCode, resourceKey) ?? this.getTemplate(this.shortLanguageCode, resourceKey)

    if (!template && this.config.defaultLanguageOnMissing) {
      template = this.getTemplate(this.config.defaultLanguage, resourceKey)
    }

    if (!template && this.config.allowMissing) {
      template = () => resourceKey
    }

    if (!template) {
      throw new Error(`telegraf-i18n: '${this.languageCode}.${resourceKey}' not found`)
    }

    const data: TemplateData = {
      ...this.templateData,
      ...templateData,
    }

    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function') {
        data[key] = value.bind(this)
      }
    }

    return template(data)
  }
}

function parseLanguageCode(repository: Readonly<Repository>, defaultLanguage: string, languageCode: string): {languageCode: string; shortLanguageCode: string} {
  let code = languageCode.toLowerCase()
  const shortCode = shortLanguageCodeFromLong(code)

  if (!repository[code] && !repository[shortCode]) {
    code = defaultLanguage
  }

  return {
    languageCode: code,
    shortLanguageCode: shortLanguageCodeFromLong(code),
  }
}

function shortLanguageCodeFromLong(languageCode: string): string {
  return languageCode.split('-')[0]!
}
