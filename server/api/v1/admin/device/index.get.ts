export default defineEventHandler(async event => {
    const devices = await prisma.device.findMany({
        orderBy: {name : 'asc' },
    });
    
    return devices;
});