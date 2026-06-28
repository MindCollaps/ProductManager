import icons from '@iconify-json/material-symbols/icons.json';

const allNames = Object.keys(icons.icons);

export default defineEventHandler(async event => {
    await requireAdminAuth(event);

    const { q } = getQuery(event);
    const query = typeof q === 'string' ? q.trim().toLowerCase() : '';

    if (!query) return [];

    const matches = allNames
        .filter(name => name.includes(query))
        .slice(0, 64)
        .map(name => `material-symbols:${ name }`);

    return matches;
});
