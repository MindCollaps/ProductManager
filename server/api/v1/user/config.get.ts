import { getOrCreateAppConfig } from '~~/server/utils/backend/config';

export default defineEventHandler(async () => {
    const config = await getOrCreateAppConfig();

    return {
        hourlyRate: config.hourlyRate,
        showTimelineToCustomer: config.showTimelineToCustomer,
        demoMode: config.demoMode,
    };
});
