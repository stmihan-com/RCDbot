import "dotenv/config";
import {
    ActionRowBuilder,
    Client,
    GatewayIntentBits,
    GuildMember,
    MessageCreateOptions,
    Partials,
    Routes,
    VoiceChannel,
} from "discord.js";
import {REST} from "@discordjs/rest";
import {commands} from "./collections/commands";
import {db, guildsTable} from "./db";
import {eq} from "drizzle-orm";
import {EventType, roomManager} from "./managers/roomManager";
import {allButtons, roomButtons} from "./collections/buttons";
import {allModals} from "./collections/modals";
import {languageManager} from "./localization/languageManager";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ],
    partials: [Partials.Channel]
});

client.once("ready", async () => {
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
    const guildDb = await db.query.guildsTable.findFirst({
        where: eq(guildsTable.guildId, newState.guild.id),
    });
    if (!guildDb || !guildDb.lobbyVoiceId) return;

    if (newState.channelId === guildDb.lobbyVoiceId) {
        await roomManager.createNewRoom(newState.guild, newState.member as GuildMember, guildDb.roomCategoryId)
    } else {
        await roomManager.cleanUpRooms(newState.guild);
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
    row.addComponents(roomButtons.map(b => b.buttonBuilder))

    const messageObj: MessageCreateOptions = {
        content: message,
        components: [row.toJSON()],
    }

    await vc.send(messageObj)
})

client.login(process.env.DISCORD_TOKEN);
