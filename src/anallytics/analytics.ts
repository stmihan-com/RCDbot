import { db, analyticsTable } from '../db';
import fs from 'fs';
import path from 'path';

export type EventName          = keyof AnalyticsEventPayloads;
export type PayloadOf<E extends EventName> = AnalyticsEventPayloads[E];

const eventsDir   = path.join(__dirname, 'events');
const runtimeMap: Record<string, { name: string }> = {};

for (const file of fs.readdirSync(eventsDir)) {
    if (!/\.(js|ts)$/.test(file)) continue;
    const modPath = path.join(eventsDir, file);
    const mod = require(modPath);
    const def = mod.default ?? mod;
    if (def && typeof def.name === 'string')
        runtimeMap[def.name] = def;
}

export async function analyticsT<E extends EventName>(
    event: E,
    payload: PayloadOf<E>
) {
    if (!runtimeMap[event])
        throw new Error(`Unknown analytics event: ${event}`);

    await db.insert(analyticsTable).values({
        eventType: event,
        payload
    });
}
