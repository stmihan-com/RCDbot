import {
    CacheType,
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction, MessageCreateOptions,
    PermissionFlagsBits,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
    VoiceChannel
} from "discord.js";
import {db, guildsTable} from "../db";
import {languageManager} from "../localization/languageManager";
import {eq} from "drizzle-orm";
import {defaultLanguage, Language} from "../localization/languages";
import {usersManager} from "../managers/usersManager";

export interface Command {
    builder: SlashCommandOptionsOnlyBuilder;
    execute: (i: ChatInputCommandInteraction<CacheType>) => Promise<void>;
}

export const commands: Command[] = [
    {
        builder: new SlashCommandBuilder()
            .setName("setlobby")
            .setDescription(languageManager.get("setLobbyVoiceChannel"))
            .addChannelOption(opt =>
                opt.setName("channel")
                    .addChannelTypes(ChannelType.GuildVoice)
                    .setDescription(languageManager.get("voiceChannel"))
                    .setRequired(false)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (i) => {
            if (!i.inGuild() || !i.guild) return;

            const ch = i.options.getChannel("channel") as VoiceChannel;

            await db
                .insert(guildsTable)
                .values({
                    guildId: i.guild.id,
                    lobbyVoiceId: ch?.id ?? null,
                }).onConflictDoUpdate({
                    target: guildsTable.guildId,
                    set: {
                        lobbyVoiceId: ch?.id ?? null,
                    }
                })

            const message = await languageManager.getGuild("lobbyVoiceChannelSet", i.guildId, {
                channelId: ch?.id ?? "none",
            });
            await i.reply({
                content: message, flags: 'Ephemeral'
            });
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("setcategory")
            .setDescription(languageManager.get("setTempRoomCategory"))
            .addChannelOption(opt =>
                opt.setName("category")
                    .addChannelTypes(ChannelType.GuildCategory)
                    .setDescription(languageManager.get("category"))
                    .setRequired(false)
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (i) => {
            if (!i.inGuild() || !i.guild) return;
            const cat = i.options.getChannel("category") as CategoryChannel;

            await db
                .insert(guildsTable)
                .values({
                    guildId: i.guild.id,
                    roomCategoryId: cat?.id ?? null,
                }).onConflictDoUpdate({
                    target: guildsTable.guildId,
                    set: {
                        roomCategoryId: cat?.id ?? null,
                    }
                })

            const message = await languageManager.getGuild("tempRoomCategorySet", i.guildId, {
                categoryId: cat?.id ?? "none",
            });
            await i.reply({
                content: message,
                flags: 'Ephemeral'
            });
        },
    },
    {
        builder: new SlashCommandBuilder()
            .setName("status")
            .setDescription(languageManager.get("status"))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (i) => {
            if (!i.inGuild() || !i.guild) return;

            const guildDb = await db
                .select()
                .from(guildsTable)
                .where(eq(guildsTable.guildId, i.guild.id))
                .get();

            if (!guildDb) {
                await i.reply({
                    content: languageManager.get("noGuildSettings"),
                    flags: 'Ephemeral'
                });
                return;
            }

            const message = await languageManager.getGuild("statusMessage", i.guildId, {
                lobbyVoiceId: guildDb.lobbyVoiceId ?? "none",
                roomCategoryId: guildDb.roomCategoryId ?? "none",
                language: guildDb.language ?? defaultLanguage,
            })
            await i.reply({
                content: message,
                flags: 'Ephemeral'
            });
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("setlanguage")
            .setDescription(languageManager.get("setLanguage"))
            .addStringOption(opt =>
                opt.setName("language")
                    .setDescription(languageManager.get("language"))
                    .setRequired(true)
                    .addChoices(
                        Object.values(Language).map(lang => ({
                            name: lang,
                            value: lang,
                        }))
                    )
            )
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (i) => {
            if (!i.inGuild() || !i.guild) return;
            const lang = i.options.getString("language") ?? defaultLanguage;
            await languageManager.setLanguage(i.guildId ?? "", i.options.getString("language") as Language);

            await i.reply({
                content: await languageManager.getGuild("onLanguageChanged", i.guildId ?? "", {
                    language: lang,
                })
            })
        }
    },
    {
        builder: new SlashCommandBuilder()
            .setName("fetchusers")
            .setDescription(languageManager.get("fetchAllUsers"))
            .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
        execute: async (i) => {
            if (!i.inGuild() || !i.guild) return;
            await i.channel?.send({
                content: "Fetching all users, this may take a while...",
            });
            await i.reply({
                content: "Started fetching all users data. Check this channel for progress.",
                flags: 'Ephemeral',
            });
            await usersManager.ensureAllUsersFetched(i.client, true);
            await i.channel?.send({
                content: "All users data fetched successfully.",
            });
        },
    }
];
