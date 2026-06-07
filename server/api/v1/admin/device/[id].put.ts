export default defineEventHandler(async event => {
    const { id } = event.context.params || {};
    
    if (!id) {
        throw createApiError('Device ID is required', 400);
    }
    
    const device = await prisma.deviceCategory.findUnique({
        where: { id: id },
    });

    if (!device) {
        throw createApiError('Device category not found', 404);
    }
    
    const body = await readBody(event);
        
    const validationResult = deviceCreateSchema.partial().safeParse(body);    
    if (!validationResult.success) {
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }
    
    const updatedData: any = {};
    
    if (validationResult.data.name) {
        updatedData.name = validationResult.data.name;
    }
    
    if (validationResult.data.description) {
        updatedData.description = validationResult.data.description;
    }
    if (validationResult.data.categoryIds) {
        updatedData.deviceCategories = {
            set: validationResult.data.categoryIds.map((id: string) => ({ id })),
        };
    }
    
    const updatedCategory = await prisma.deviceCategory.update({
        where: { id: id },
        data: updatedData,
    });

    return { message: 'Device category updated', data: updatedCategory };
});