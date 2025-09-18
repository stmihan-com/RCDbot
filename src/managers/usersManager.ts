import {db, usersTable} from "../db";
import {Client} from "discord.js";
import {eq} from "drizzle-orm";

export interface User {
    userId: string;
    displayName?: string;
    username: string;
}

class UsersManager {
    public async ensureAllUsersFetched(client: Client, force: boolean = false) {
        console.log("Ensuring all users are fetched...");
        const users = await db.select().from(usersTable).orderBy(usersTable.userId);
        const userIdsSet = new Set(users.map(u => u.userId));

        const usersFromAnalytics = await db.$client.execute(`
            select distinct concat(json_extract(payload, '$.memberId'), json_extract(payload, '$.ownerId')) as userId
            from analytics
            where event_type = 'CHANNEL_LEFT'
               or event_type = 'CHANNEL_JOINED'
               or event_type = 'CHANNEL_CREATED'
            order by userId;
        `);

        usersFromAnalytics.rows.forEach(row => {
            const userId = row.userId as string;
            if (userId && !userIdsSet.has(userId)) {
                userIdsSet.add(userId);
            }
        });

        for (const userId of userIdsSet) {
            console.log(`User ID fetching: ${userId}`);
            await this.fetchUser(client, userId, force);
        }
        console.log("All users are fetched.");
    }

    public async fetchUser(client: Client, userId: string, force: boolean = false): Promise<User | undefined> {
        const existingUser = await db.query.usersTable.findFirst({
            where: eq(usersTable.userId, userId)
        });

        if (existingUser && !force) return {
            userId: existingUser.userId,
            displayName: existingUser.displayName || undefined,
            username: existingUser.username,
        };

        const user = await client.users.fetch(userId);
        if (!user) return undefined;

        const userData: User = {
            userId: user.id,
            displayName: user.displayName,
            username: user.username,
        };

        await db.insert(usersTable).values(userData).onConflictDoUpdate({
            target: usersTable.userId,
            set: {
                displayName: userData.displayName,
                username: userData.username,
            }
        })

        return userData;
    }
}


export const usersManager = new UsersManager();
