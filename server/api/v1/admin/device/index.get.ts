export default defineEventHandler(async event => {
    const categories = await prisma.device.findMany({
        orderBy: {name : 'asc' },
    });
    
    return { categories };
});