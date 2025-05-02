import {ButtonBuilder, ButtonInteraction, ButtonStyle, VoiceChannel} from "discord.js";
import {changeOwnerModal, renameModal} from "./modals";
import {roomManager} from "../managers/roomManager";
import {languageManager} from "../localization/languageManager";

export interface Button {
    customId: string;
    buttonBuilder: (guildId: string) => Promise<ButtonBuilder>;
    execute: (i: ButtonInteraction) => Promise<void>;
}

export const roomButtons: Button[] = [
    {
        customId: "rename",
        buttonBuilder: async (guildId) => new ButtonBuilder()
            .setCustomId("rename")
            .setLabel(await languageManager.getGuild("renameRoom", guildId))
            .setStyle(ButtonStyle.Primary),
        execute: async (i) => {
            const room = i.channel as VoiceChannel;
            if (!room) return;
            if (await roomManager.isOwner(room.id, i.user.id)) {
                await i.showModal(await renameModal.builder(i.guildId));
            }
        }
    },
    {
        customId: "change-owner",
        buttonBuilder: async (guildId) => new ButtonBuilder()
            .setCustomId("change-owner")
            .setLabel(await languageManager.getGuild("changeOwner", guildId))
            .setStyle(ButtonStyle.Primary),
        execute: async (i) => {
            const room = i.channel as VoiceChannel;
            if (!room) return;
            if (await roomManager.isOwner(room.id, i.user.id)) {
                await i.showModal(await changeOwnerModal.builder(i.guildId));
            }
        }
    }
]

export const allButtons = [
    ...roomButtons,
];
