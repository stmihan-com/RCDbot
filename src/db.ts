import 'dotenv/config';
import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';
import {integer, sqliteTable, text} from "drizzle-orm/sqlite-core";
import {sql} from "drizzle-orm";

export const roomsTable = sqliteTable("rooms", {
    id: text("id").primaryKey(),
    guildId: text("guild_id"),
    roomId: text("room_id"),
    ownerId: text("owner_id"),
});

export const guildsTable = sqliteTable("guilds", {
    guildId: text("guild_id").primaryKey(),
    lobbyVoiceId: text("lobby_voice_id"),
    roomCategoryId: text("room_category_id"),
    language: text("language"),
});

export const analyticsTable = sqliteTable("analytics", {
    id: integer("id").primaryKey({autoIncrement: true}),
    eventType: text("event_type").notNull(),
    payload: text("payload", {mode: 'json'}).notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

const client = createClient({url: process.env.DB_FILE_NAME!});
export const db = drizzle({
    client,
    schema: {
        roomsTable,
        guildsTable,
        analyticsTable,
    }
});
