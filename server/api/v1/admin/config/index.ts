import { appConfigUpdateSchema } from '~~/server/utils/backend/validation';
import { getOrCreateAppConfig } from '~~/server/utils/backend/config';
import { applyDemoSeed, clearDemoSeed } from '~~/server/utils/backend/demoSeed';
import { createApiError } from '~~/server/utils/apiResponses';

export default defineEventHandler(async event => {
    if (event.method === 'GET') {
        return getOrCreateAppConfig();
    }

    if (event.method === 'PUT') {
        const body = appConfigUpdateSchema.parse(await readBody(event));

        const existing = await getOrCreateAppConfig();

        const data: Parameters<typeof prisma.appConfig.update>[0]['data'] = {
            hourlyRate: body.hourlyRate,
        };

        if (body.showTimelineToCustomer !== undefined) {
            data.showTimelineToCustomer = body.showTimelineToCustomer;
        }

        if (body.demoMode !== undefined) {
            data.demoMode = body.demoMode;
        }

        const updated = await prisma.appConfig.update({
            where: { id: existing.id },
            data,
        });

        if (body.demoMode === true && !existing.demoMode) {
            await applyDemoSeed();
        }
        else if (body.demoMode === false && existing.demoMode) {
            await clearDemoSeed();
        }

        return updated;
    }

    throw createApiError('Method not allowed', 405);
});
