import { defineNitroPlugin } from 'nitropack/runtime';

import { sendNotificationDigestEmails } from '~~/server/utils/backend/notificationCenter';
import { redisClient } from '~~/server/utils/backend/redis';
import { getMailConfig } from '~~/server/utils/mail';

function parseBoolean(value: string | undefined, fallback: boolean) {
    if (!value) {
        return fallback;
    }

    return value.toLowerCase() === 'true' || value === '1';
}

async function tryRunDigestCycle() {
    const config = getMailConfig();
    const lockKey = 'notification-digest-lock';
    const lockValue = `${ process.pid }-${ Date.now() }`;

    const lockAcquired = await redisClient.set(lockKey, lockValue, 'PX', config.digestLockTtlMs, 'NX');

    if (lockAcquired !== 'OK') {
        return;
    }

    try {
        const result = await sendNotificationDigestEmails();

        if (result.processedNotifications > 0) {
            console.log(`[NotificationDigest] Sent summaries to ${ result.processedUsers } users (${ result.processedNotifications } notifications).`);
        }
    }
    catch (error) {
        console.error('[NotificationDigest] Cycle failed', error);
    }
    finally {
        const currentLock = await redisClient.get(lockKey);

        if (currentLock === lockValue) {
            await redisClient.del(lockKey);
        }
    }
}

export default defineNitroPlugin(() => {
    const enabled = parseBoolean(process.env.NOTIFICATION_DIGEST_ENABLED, true);

    if (!enabled) {
        console.log('[NotificationDigest] Disabled via NOTIFICATION_DIGEST_ENABLED');
        return;
    }

    const mailConfig = getMailConfig();
    const intervalMs = mailConfig.digestIntervalMinutes * 60 * 1000;

    setInterval(() => {
        void tryRunDigestCycle();
    }, intervalMs);

    // Prime once shortly after startup to avoid waiting for the full interval.
    setTimeout(() => {
        void tryRunDigestCycle();
    }, 15_000);

    console.log(`[NotificationDigest] Scheduler started with ${ mailConfig.digestIntervalMinutes } minute interval.`);
});
