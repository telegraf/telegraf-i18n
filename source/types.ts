export type LanguageCode = string

export type TemplateData = Record<string, unknown>
export type Template = (data: Readonly<TemplateData>) => string

export type RepositoryEntry = Record<string, Template>
export type Repository = Record<LanguageCode, Readonly<RepositoryEntry>>

export interface Config {
  readonly allowMissing?: boolean;
  readonly defaultLanguage: LanguageCode;
  readonly defaultLanguageOnMissing?: boolean;
  readonly directory?: string;
  readonly sessionName: string;
  readonly templateData: Readonly<TemplateData>;
  readonly useSession?: boolean;
}
