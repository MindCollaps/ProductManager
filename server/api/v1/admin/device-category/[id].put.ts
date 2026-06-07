export default defineEventHandler(async event => {
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Category ID is required', 400);
    }
    
    const category = await prisma.deviceCategory.findUnique({
        where: { id: id },
    });

    if (!category) {
        throw createApiError('Device category not found', 404);
    }
    
    const body = await readBody(event);
        
    const validationResult = deviceCategoryCreateSchema.partial().safeParse(body);    
    if (!validationResult.success) {
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }
    
    const updatedData: any = {};
    
    if (validationResult.data.name) {
        updatedData.name = validationResult.data.name;
    }
    if (validationResult.data.slug) {
        updatedData.slug = validationResult.data.slug;
    }
    if (validationResult.data.description) {
        updatedData.description = validationResult.data.description;
    }
    if (validationResult.data.color) {
        updatedData.color = validationResult.data.color;
    }
    
    const updatedCategory = await prisma.deviceCategory.update({
        where: { id: id },
        data: updatedData,
    });

    return { message: 'Device category updated', data: updatedCategory };
});