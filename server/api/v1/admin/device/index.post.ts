import { deviceCreateSchema } from '~~/server/utils/backend/validation';

export default defineEventHandler(async event => {    
    const body = await readBody(event);
    
    const validationResult = deviceCreateSchema.safeParse(body);    
    if (!validationResult.success) {
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }
    
    const newCategory = await prisma.device.create({
        data: { 
            name: validationResult.data.name,
            description: validationResult.data.description,
            deviceCategories: {
                connect: validationResult.data.categoryIds.map((id: string) => ({ id })),
            },
         },
    });
    
    return { message: 'Device category created', data: newCategory };
});