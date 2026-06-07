export default defineEventHandler(async event => {
    if (event.req.url?.startsWith('/api/v1/admin')) {
         await requireAdminAuth(event);
    }
});