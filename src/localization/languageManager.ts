import {strings} from "./strings";
import {defaultLanguage, Language} from "./languages";


export type StringKey = keyof typeof strings;

export class LanguageManager {
    private lang: Language = defaultLanguage;

    setLanguage(l: Language) {
        this.lang = l;
    }

    get<K extends StringKey>(
        key: K,
        params: Record<string, string | number> = {},
    ): string {
        const entry = strings[key];
        const template = entry[this.lang];

        return template.replace(/%(\w+)%/g, (_m, p: string) =>
            p in params ? String(params[p]) : `%${p}%`,
        );
    }
}

export const languageManager = new LanguageManager();
