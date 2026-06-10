import { useStore } from '~/store';

export interface HeaderItem {
    text: string;
    active?: boolean;
    action?: () => void;
    path?: string;
    disabled?: boolean;
    hide?: boolean;
    width?: string;
    icon?: string;
    children?: Omit<HeaderItem, 'children' | 'minWidth'>[];
}

export const useHeaderMenu = () => computed<HeaderItem[]>(() => {
    const route = useRoute();
    const store = useStore();

    const menu: HeaderItem[] = [
        {
            text: 'Home',
            path: '/',
            icon: 'material-symbols:other-houses',
        },
        {
            text: 'Admin',
            icon: 'material-symbols:computer',
            hide: !(store.me?.isAdmin),
            children: [
                {
                    text: 'Devices',
                    path: '/admin/device',
                    icon: 'material-symbols:computer',
                },
                {
                    text: 'Categories',
                    path: '/admin/category',
                    icon: 'material-symbols:select',
                },
            ],
        },

    ];

    return menu.filter(x => !x.hide).map(x => {
        return {
            ...x,
            active: x.active ?? (x.path === route.path || !!x.children?.some(x => x.path === route.path)),
            children: x.children && x.children.map(x => ({
                ...x,
                active: x.active ?? x.path === route.path,
            })),
        } satisfies HeaderItem as HeaderItem;
    });
});
