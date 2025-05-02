import {ButtonBuilder, ButtonInteraction, ButtonStyle, VoiceChannel} from "discord.js";
import {changeOwnerModal, renameModal} from "./modals";
import {roomManager} from "../managers/roomManager";
import {languageManager} from "../localization/languageManager";

export interface Button {
    customId: string;
    buttonBuilder: ButtonBuilder;
    execute: (i: ButtonInteraction) => Promise<void>;
}

export const roomButtons: Button[] = [
    {
        customId: "rename",
        buttonBuilder: new ButtonBuilder()
            .setCustomId("rename")
            .setLabel(languageManager.get("renameRoom"))
            .setStyle(ButtonStyle.Primary),
        execute: async (i) => {
            const room = i.channel as VoiceChannel;
            if (!room) return;
            if (await roomManager.isOwner(room.id, i.user.id)) {
                await i.showModal(renameModal.builder());
            }
        }
    },
    {
        customId: "change-owner",
        buttonBuilder: new ButtonBuilder()
            .setCustomId("change-owner")
            .setLabel(languageManager.get("changeOwner"))
            .setStyle(ButtonStyle.Primary),
        execute: async (i) => {
            const room = i.channel as VoiceChannel;
            if (!room) return;
            if (await roomManager.isOwner(room.id, i.user.id)) {
                await i.showModal(changeOwnerModal.builder());
            }
        }
    }
]

export const allButtons = [
    ...roomButtons,
];
