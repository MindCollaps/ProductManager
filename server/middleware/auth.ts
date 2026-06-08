export default defineEventHandler(async event => {
    if (event.node.req.url?.startsWith('/api/v1/admin')) {
         //await requireAdminAuth(event);
    }
});