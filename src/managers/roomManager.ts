import {db, guildsTable, roomsTable} from "../db";
import {eq} from "drizzle-orm";
import {ChannelType, Guild, GuildChannel, GuildMember, Interaction, VoiceChannel, VoiceState} from "discord.js";
import {languageManager} from "../localization/languageManager";
import {analyticsT} from "../anallytics/analytics";

export enum EventType {
    RoomCreated = "roomCreated",
    RoomDeleted = "roomDeleted",
}

class RoomManager {
    private eventCallbacks: {
        [key in EventType]?: ((room: GuildChannel) => void)[]
    } = {};

    public on(event: EventType, callback: (room: GuildChannel) => void) {
        this.eventCallbacks[event] = [...(this.eventCallbacks[event] || []), callback];
    }

    public async onRoomJoin(state: VoiceState) {
        const guildDb = await db.query.guildsTable.findFirst({
            where: eq(guildsTable.guildId, state.guild.id),
        });
        if (!guildDb || !guildDb.lobbyVoiceId) return;

        if (state.channelId === guildDb.lobbyVoiceId) {
            await roomManager.createNewRoom(state.guild, state.member as GuildMember, guildDb.roomCategoryId)
        } else {
            await analyticsT("CHANNEL_JOINED", {
                guildId: state.guild.id,
                channelId: state.channelId ?? "none",
                memberId: state.member?.id ?? "none",
            })
            await roomManager.cleanUpRooms(state.guild);
        }
    }

    public async onRoomLeave(state: VoiceState) {
        const guildDb = await db.query.guildsTable.findFirst({
            where: eq(guildsTable.guildId, state.guild.id),
        });
        if (!guildDb) return;

        if (state.channelId !== guildDb.lobbyVoiceId) {
            await roomManager.cleanUpRooms(state.guild);
            await analyticsT("CHANNEL_LEFT", {
                guildId: state.guild.id,
                channelId: state.channelId ?? "none",
                memberId: state.member?.id ?? "none",
            })
        }
    }

    public async changeOwner(room: VoiceChannel, newOwner: GuildMember, i: Interaction | null = null) {
        await db.update(roomsTable).set({
            ownerId: newOwner.id,
        }).where(eq(roomsTable.roomId, room.id));
        const message = {
            content: await languageManager.getGuild("roomOwnerChanged", room.guild.id, {
                newOwnerId: newOwner.id,
            }),
        };
        if (i && i.isRepliable()) {
            i.reply(message);
        } else {
            await room.send(message);
        }
    }

    public async isOwner(roomId: string, memberId: string) {
        const roomDb = await db.query.roomsTable.findFirst({
            where: eq(roomsTable.roomId, roomId),
        });
        if (!roomDb) return false;
        return roomDb.ownerId === memberId;
    }

    private async createNewRoom(guild: Guild, owner: GuildMember, categoryId: string | null) {
        const room = await guild.channels.create({
            name: await languageManager.getGuild("defaultRoomName", guild.id, {
                username: owner.user.username,
            }),
            type: ChannelType.GuildVoice,
            parent: categoryId,
        });
        await db.insert(roomsTable).values({
            id: room.id,
            guildId: guild.id,
            roomId: room.id,
            ownerId: owner.id,
        });

        await owner.voice.setChannel(room);
        this.trigger(EventType.RoomCreated, room);
    }

    private async cleanUpRooms(guild: Guild) {
        const rooms = await db
            .select()
            .from(roomsTable)
            .where(eq(roomsTable.guildId, guild.id))

        for (const roomDb of rooms) {
            try {
                const room = await guild.channels.fetch(roomDb.roomId!) as VoiceChannel | null;
                if (!room) {
                    await db.delete(roomsTable).where(eq(roomsTable.roomId, roomDb.roomId!));
                    continue;
                }
                if (room.members.size === 0) {
                    await room.delete();
                    await db.delete(roomsTable).where(eq(roomsTable.roomId, roomDb.roomId!));
                    this.trigger(EventType.RoomDeleted, room);
                } else {
                    await this.migrateAdmins(room)
                }
            } catch (e) {
                await db.delete(roomsTable).where(eq(roomsTable.id, roomDb.id));
            }
        }
    }

    private trigger(event: EventType, room: GuildChannel) {
        const callbacks = this.eventCallbacks[event];
        if (callbacks) {
            for (const callback of callbacks) {
                callback(room);
            }
        }
    }

    private async migrateAdmins(room: VoiceChannel) {
        const roomDb = await db.query.roomsTable.findFirst({
            where: eq(roomsTable.roomId, room.id),
        })
        if (!roomDb) return;
        const foundAdmin = room.members.find(m => m.id === roomDb.ownerId);
        if (!foundAdmin) {
            const newAdmin = room.members.first();
            if (newAdmin) {
                await this.changeOwner(room, newAdmin);
            } else {
                await room.delete();
                await db.delete(roomsTable).where(eq(roomsTable.roomId, room.id));
            }
        }
    }
}

export const roomManager = new RoomManager();