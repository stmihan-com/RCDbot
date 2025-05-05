export const name = 'CHANNEL_LEFT' as const;

export interface Payload {
    guildId:   string;
    channelId: string;
    memberId:   string;
}

declare global {
    interface AnalyticsEventPayloads {
        CHANNEL_LEFT: Payload;
    }
}

export default { name } as const;
