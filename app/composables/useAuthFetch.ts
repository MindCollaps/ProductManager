import { useStore } from '~/store';

export function useAuthFetch() {
    const store = useStore();

    return $fetch.create({
        onResponseError({ response }) {
            if (response.status === 401) {
                store.logout();
            }
        },
    });
}
