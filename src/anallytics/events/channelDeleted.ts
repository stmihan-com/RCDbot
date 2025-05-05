export const name = 'CHANNEL_DELETED' as const;

export interface Payload {
    guildId:   string;
    channelId: string;
}

declare global {
    interface AnalyticsEventPayloads {
        CHANNEL_DELETED: Payload;
    }
}

export default { name } as const;
