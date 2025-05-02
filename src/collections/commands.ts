import {
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    CacheType,
    VoiceChannel,
    CategoryChannel,
    ChannelType,
    PermissionFlagsBits,
    SlashCommandOptionsOnlyBuilder
} from "discord.js";
import {strings} from "../localization/strings";
import {db, guildsTable} from "../db";
import {languageManager, LanguageManager} from "../localization/languageManager";

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

            await i.reply({
                content: languageManager.get("lobbyVoiceChannelSet", {
                    channelId: ch?.id ?? "none",
                }), flags: 'Ephemeral'
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

            await i.reply({
                content: languageManager.get("tempRoomCategorySet",
                    {
                        categoryId: cat?.id ?? "none",
                    }),
                flags: 'Ephemeral'
            });
        },
    },
];
