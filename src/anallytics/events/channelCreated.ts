export const name = 'CHANNEL_CREATED' as const;

export interface Payload {
    guildId:   string;
    channelId: string;
    ownerId:   string;
}

declare global {
    interface AnalyticsEventPayloads {
        CHANNEL_CREATED: Payload;
    }
}

export default { name } as const;
