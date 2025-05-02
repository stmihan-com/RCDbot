import {strings} from "./strings";
import {defaultLanguage, Language} from "./languages";
import {db, guildsTable} from "../db";
import {eq} from "drizzle-orm";


export type StringKey = keyof typeof strings;

export class LanguageManager {
    private lang: Language = defaultLanguage;

    get<K extends StringKey>(
        key: K,
        params: Record<string, string | number> = {},
        lang: Language = this.lang,
    ): string {
        const entry = strings[key];
        const template = entry[lang];

        return template.replace(/%(\w+)%/g, (_m, p: string) =>
            p in params ? String(params[p]) : `%${p}%`,
        );
    }

    async getGuild<K extends StringKey>(
        key: K,
        guildId: string | null,
        params: Record<string, string | number> = {},
    ): Promise<string> {
        let lang: Language = defaultLanguage;

        if (guildId) {
            const guild = await db.query.guildsTable.findFirst({
                where: eq(guildsTable.guildId, guildId),
            })
            if (guild && guild.language) {
                lang = guild.language as Language;
            }
        }

        return this.get(key, params, lang);
    }

    async setLanguage(guildId: string, lang: Language) {
        await db
            .insert(guildsTable)
            .values({
                guildId: guildId,
                language: lang,
            })
            .onConflictDoUpdate({
                target: guildsTable.guildId,
                set: {
                    language: lang,
                }
            })
    }
}

export const languageManager = new LanguageManager();
