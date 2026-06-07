export default defineEventHandler(async event => {
    // Get the category ID from the route parameters
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Category ID is required', 400);
    }
    
    // Check if the category exists
    const existingCategory = await prisma.deviceCategory.findUnique({
        where: { id: id },
    });
    
    if (!existingCategory) {
        throw createApiError('Device category not found', 404);
    }
    
    // Delete the category
    await prisma.deviceCategory.delete({
        where: { id: id },
    });
    
    return { message: 'Device category deleted' };
});