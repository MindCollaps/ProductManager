export default defineEventHandler(async event => {
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Device ID is required', 400);
    }

    const devices = await prisma.device.findUnique({
        where: {
            id,
        },
        include: {
            deviceCategories: {
                include: {
                    category: true
                }
            }
        }
    });
    
    return devices?.deviceCategories.map(e => e.category);
});