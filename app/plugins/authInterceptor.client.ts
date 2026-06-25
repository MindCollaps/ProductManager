import { useStore } from '~/store';

export default defineNuxtPlugin(nuxtApp => {
    const store = useStore();

    nuxtApp.hook('app:error', (error: any) => {
        if (error?.statusCode === 401 || error?.response?.status === 401) {
            store.logout();
        }
    });
});
