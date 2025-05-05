export const name = 'CHANNEL_JOINED' as const;

export interface Payload {
    guildId:   string;
    channelId: string;
    memberId:   string;
}

declare global {
    interface AnalyticsEventPayloads {
        CHANNEL_JOINED: Payload;
    }
}

export default { name } as const;
