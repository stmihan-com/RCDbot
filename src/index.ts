import "dotenv/config";
import {
    ActionRowBuilder,
    Client,
    GatewayIntentBits,
    MessageCreateOptions,
    Partials,
    Routes,
    VoiceChannel,
} from "discord.js";
import {REST} from "@discordjs/rest";
import {commands} from "./collections/commands";
import {EventType, roomManager} from "./managers/roomManager";
import {allButtons, roomButtons} from "./collections/buttons";
import {allModals} from "./collections/modals";
import {languageManager} from "./localization/languageManager";
import {analyticsT} from "./anallytics/analytics";
import {usersManager} from "./managers/usersManager";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

client.once("ready", async () => {
    await usersManager.ensureAllUsersFetched(client);
    console.log(`Logged in as ${client.user?.tag}`);
    const rest = new REST({version: "10"}).setToken(process.env.DISCORD_TOKEN!);
    await rest.put(
        Routes.applicationCommands(client.application!.id),
        {body: commands.map(c => c.builder.toJSON())}
    );
    console.log("Slash commands registered");
    console.log("Bot is ready");
});

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        commands.forEach(command => {
            if (interaction.commandName === command.builder.name) {
                command.execute(interaction);
            }
        })
    }
    if (interaction.isButton()) {
        allButtons.forEach(button => {
            if (interaction.customId === button.customId) {
                button.execute(interaction);
            }
        })
    }
    if (interaction.isModalSubmit()) {
        allModals.forEach(modal => {
            if (interaction.customId === modal.customId) {
                modal.execute(interaction);
            }
        })
    }
})

client.on("voiceStateUpdate", async (oldState, newState) => {
    if (newState.channel) {
        if (oldState && oldState.channel) {
            if (oldState.channel.id === newState.channel.id) return;
            await roomManager.onRoomLeave(oldState);
        }
        await roomManager.onRoomJoin(newState);
    } else {
        await roomManager.onRoomLeave(oldState);
    }
})

roomManager.on(EventType.RoomCreated, async room => {
    const vc = (await room.fetch()) as VoiceChannel
    if (!vc) return;
    const owner = room.members.first();
    if (!owner) return;
    const message = languageManager.get("roomCreated", {
        ownerId: owner.id,
    })
    const row = new ActionRowBuilder();
    row.addComponents(await Promise.all(roomButtons.map(async button => await button.buttonBuilder(vc.guild.id))));

    const messageObj: MessageCreateOptions = {
        content: message,
        components: [row.toJSON()],
    }

    await vc.send(messageObj)
    await analyticsT('CHANNEL_CREATED', {
        guildId: room.guildId,
        channelId: room.id,
        ownerId: owner.id,
    })
    await usersManager.fetchUser(room.client, owner.id, true);
})

roomManager.on(EventType.RoomDeleted, async room => {
    await analyticsT('CHANNEL_DELETED', {
        guildId: room.guildId,
        channelId: room.id,
    })
})

client.login(process.env.DISCORD_TOKEN);
