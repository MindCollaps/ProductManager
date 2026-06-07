export default defineEventHandler(async event => {
    // Get the device ID from the route parameters
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Device ID is required', 400);
    }
    
    // Check if the device exists
    const existingDevice = await prisma.device.findUnique({
        where: { id: id },
    });
    
    if (!existingDevice) {
        throw createApiError('Device not found', 404);
    }
    
    // Delete the device
    await prisma.device.delete({
        where: { id: id },
    });
    
    return { message: 'Device deleted' };
});