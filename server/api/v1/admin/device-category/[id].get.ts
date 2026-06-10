export default defineEventHandler(async event => {
    // Get the device ID from the route parameters
    const { id } = event.context.params || {};

    if (!id) {
        throw createApiError('Category ID is required', 400);
    }

    const device = await prisma.deviceCategory.findUnique({
        where: {
            id,
        },
    });

    return device;
});
