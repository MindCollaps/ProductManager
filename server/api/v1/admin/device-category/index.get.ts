export default defineEventHandler(async event => {
    const categories = await prisma.deviceCategory.findMany({
        orderBy: { name: 'asc' },
    });
    
    return categories;
});