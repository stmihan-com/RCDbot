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
    builder: () => ModalBuilder;
    execute: (i: ModalSubmitInteraction) => Promise<void>;
}

export const renameModal: Modal = {
    customId: "rename-modal",
    builder: () => {
        const modal = new ModalBuilder()
            .setCustomId("rename-modal")
            .setTitle(languageManager.get("renameRoom"));

        const renameInput = new TextInputBuilder()
            .setCustomId("rename-input")
            .setLabel(languageManager.get("newRoomName"))
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
    builder: () => {
        const modal = new ModalBuilder()
            .setCustomId("change-owner-modal")
            .setTitle(languageManager.get("changeOwner"));

        const ownerInput = new TextInputBuilder()
            .setCustomId("owner-input")
            .setLabel(languageManager.get("newOwnerId"))
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
            await i.reply({content: languageManager.get("ownerNotFound")});
            return;
        }

        await roomManager.changeOwner(room, owner, i);
    }
}

export const allModals = [
    renameModal,
    changeOwnerModal,
];
