import 'dotenv/config';
import {drizzle} from 'drizzle-orm/libsql';
import {createClient} from '@libsql/client';
import {sqliteTable, text} from "drizzle-orm/sqlite-core";

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

const client = createClient({url: process.env.DB_FILE_NAME!});
export const db = drizzle({
    client,
    schema: {
        roomsTable,
        guildsTable,
    }
});
