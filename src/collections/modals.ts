import {
    ActionRowBuilder,
    ModalActionRowComponentBuilder,
    ModalBuilder, ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
    VoiceChannel
} from "discord.js";
import {roomManager} from "../managers/roomManager";
import {languageManager} from "../localization/languageManager";

export interface Modal {
    customId: string;
    builder: (guildId: string | null) => Promise<ModalBuilder>;
    execute: (i: ModalSubmitInteraction) => Promise<void>;
}

export const renameModal: Modal = {
    customId: "rename-modal",
    builder: async (guildId) => {
        const modal = new ModalBuilder()
            .setCustomId("rename-modal")
            .setTitle(await languageManager.getGuild("renameRoom", guildId));

        const renameInput = new TextInputBuilder()
            .setCustomId("rename-input")
            .setLabel(await languageManager.getGuild("newRoomName", guildId))
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(renameInput);
        modal.addComponents(row);

        return modal;
    },
    execute: async (i) => {
        const rename = i.fields.getTextInputValue("rename-input");
        const room = i.channel as VoiceChannel;
        if (!room) return;

        await room.setName(rename);
        await i.reply({
            content: languageManager.get("roomRenamed", {
                rename: rename,
            })
        });
    }
}

export const changeOwnerModal: Modal = {
    customId: "change-owner-modal",
    builder: async (guildId) => {
        const modal = new ModalBuilder()
            .setCustomId("change-owner-modal")
            .setTitle(await languageManager.getGuild("changeOwner", guildId));

        const ownerInput = new TextInputBuilder()
            .setCustomId("owner-input")
            .setLabel(await languageManager.getGuild("newOwnerId", guildId))
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const row = new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(ownerInput);
        modal.addComponents(row);

        return modal;
    },
    execute: async (i) => {
        const ownerId = i.fields.getTextInputValue("owner-input");
        const room = i.channel as VoiceChannel;
        if (!room) return;

        const owner = room.members.get(ownerId);
        if (!owner) {
            await i.reply({content: await languageManager.getGuild("ownerNotFound", i.guildId ?? "")});
            return;
        }

        await roomManager.changeOwner(room, owner, i);
    }
}

export const allModals = [
    renameModal,
    changeOwnerModal,
];
