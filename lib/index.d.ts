declare module 'telegraf-i18n' {
    interface Config {
        directory: string;
        useSession: boolean;
        sessionName: string;
        allowMissing: boolean;
        defaultLanguage: string;
    }

    type ContextUpdate = (ctx: any, next?: (() => any) | undefined) => any;

    export class I18n {
        constructor (input: Config);
        loadLocales (directory: string): void;
        loadLocale (languageCode: string, i18Data: object): void;
        resetLocale (languageCode: string): void;
        middleware(): ContextUpdate;
        createContext (languageCode: string, templateData: object): void;
        t (languageCode?: string, resourceKey?: string, templateData?: object): string;
        t (resourceKey?: string, templateData?: object): string;
        locale (): string;
        locale (languageCode?: string): void;
    }

    export default I18n;
}
