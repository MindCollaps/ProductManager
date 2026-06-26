import { defineNitroPlugin } from 'nitropack/runtime';
import { createUser } from '../../server/utils/backend/user';
import { initJWTSecret } from '../../server/utils/crypto/jwt';
import { prisma } from '../../server/utils/prisma';
import { applyDemoSeed, clearDemoSeed } from '../../server/utils/backend/demoSeed';
import { getOrCreateAppConfig } from '../../server/utils/backend/config';


export default defineNitroPlugin(async () => {
    if (import.meta.dev) {
        console.warn('##############################################');
        console.warn(' THIS SERVER IS RUNNING IN DEVELOPMENT MODE');
        console.warn(' ==> MANY SECURITY FEATURES ARE DISABLED');
        console.warn(' !! NEVER USE THIS MODE IN PRODUCTION !!');
        console.warn('##############################################');
    }

    await initializeAdminUser();
    await initializeDemoMode();

    const jwtInitialized = initJWTSecret();
    if (jwtInitialized) {
        console.log('JWT keys initialized successfully');
    }
    else {
        throw new Error('Failed to initialize JWT keys');
    }
});

async function initializeDemoMode() {
    const envValue = process.env.DEMO_MODE;

    if (envValue === undefined) {
        return;
    }

    const envDemo = envValue === 'true';
    const config = await getOrCreateAppConfig();

    if (envDemo === config.demoMode) {
        return;
    }

    if (envDemo) {
        console.log('[Demo] DEMO_MODE=true — applying demo seed...');
        await applyDemoSeed();
        await prisma.appConfig.update({ where: { id: 'default' }, data: { demoMode: true } });
        console.log('[Demo] Demo seed applied.');
    }
    else {
        console.log('[Demo] DEMO_MODE=false — clearing demo seed...');
        await clearDemoSeed();
        await prisma.appConfig.update({ where: { id: 'default' }, data: { demoMode: false } });
        console.log('[Demo] Demo seed cleared.');
    }
}

async function initializeAdminUser() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    const email = process.env.ADMIN_EMAIL;

    if (username && password && email) {
        try {
            // disable the login for the admin user in prod
            // but allow it in development mode
            let isActive = false;
            if (import.meta.dev) {
                isActive = true;
            }

            const result = await createUser(username, email, password, true, false, isActive);
            if (!result) {
                throw new Error('Failed to create the initial admin user');
            }

            if (result.success) {
                console.log(`Admin user '${ username }' created successfully.`);
            }
            else if (result.error === 'ALREADY_EXISTS') {
                console.log(`Admin user '${ username }' already exists.`);

                // make sure the admin user can login in development mode
                if (import.meta.dev) {
                    if (!result.user) {
                        throw new Error('Missing user data');
                    }

                    const success = await prisma.user.update({
                        where: { id: result.user.id },
                        data: { isActive: true },
                    });

                    if (success) {
                        console.log(`Admin user '${ username }' enabled for login in development mode.`);
                    }
                }
                else {
                    if (!result.user) {
                        throw new Error('Missing user data');
                    }

                    await prisma.user.update({
                        where: { id: result.user.id },
                        data: { isActive: false },
                    });
                }
            }
            else {
                console.error(`Failed to create admin user: ${ result.error }`);
            }
        }
        catch (error: any) {
            console.error(`Error creating admin user: ${ error.message }`);
        }
    }
    else {
        console.log('Admin user creation skipped. Missing ADMIN_USERNAME, ADMIN_PASSWORD, or ADMIN_EMAIL environment variables.');
    }
}
