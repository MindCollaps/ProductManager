export default defineEventHandler(async event => {
    // Get the device ID from the route parameters
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Device ID is required', 400);
    }
    
    const device = await prisma.device.findUnique({
        where: {
            id,
        }
    });
    
    return device;
});