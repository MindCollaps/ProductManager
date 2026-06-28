import type { EditPage, EditPageField } from '~~/types/components';

export function useAdminEdit(apiBase: string, listPath: string) {
    const router = useRouter();
    const route = useRoute();
    const { showToast } = useToastManager();
    const apiFetch = useAuthFetch();

    const id = computed(() => route.params.id as string);

    const page = ref<EditPage>({
        title: '',
        fields: [],
        isNew: true,
    });

    function syncPage(createTitle: string, editTitle: string, fields: EditPageField[]) {
        page.value.title = id.value === 'new' ? createTitle : editTitle;
        page.value.fields = fields;
        page.value.isNew = id.value === 'new';
    }

    async function save(body: Record<string, unknown>) {
        try {
            await apiFetch(id.value === 'new' ? apiBase : `${ apiBase }/${ id.value }`, {
                method: id.value === 'new' ? 'POST' : 'PUT',
                body,
            });
            showToast({ message: 'Gespeichert' });
            router.push(listPath);
        }
        catch {
            showToast({ message: 'Fehler beim Speichern' });
        }
    }

    function cancel() {
        router.push(listPath);
    }

    return { id, page, syncPage, save, cancel };
}
