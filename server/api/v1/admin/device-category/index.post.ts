import { deviceCategoryCreateSchema } from '~~/server/utils/backend/validation';

export default defineEventHandler(async event => {    
    const body = await readBody(event);
    
    const validationResult = deviceCategoryCreateSchema.safeParse(body);    
    if (!validationResult.success) {
        throw createApiError('Invalid input', 400, validationResult.error.issues);
    }
    
    const { slug } = validationResult.data;
    const existingCategory = await prisma.deviceCategory.findUnique({
        where: { slug },
    });
    
    if (existingCategory) {
        throw createApiError('Device category with this slug already exists', 400);
    }
    
    const newCategory = await prisma.deviceCategory.create({
        data: { 
            name: validationResult.data.name,
            slug: slug,
            description: validationResult.data.description,
            color: validationResult.data.color,
         },
    });
    
    return { message: 'Device category created', data: newCategory };
});