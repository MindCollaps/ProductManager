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
            hide: store.me?.loggedIn,
        },
        {
            text: 'Dashboard',
            path: '/dashboard',
            icon: 'material-symbols:dashboard',
            hide: !store.me?.loggedIn,
        },
        {
            text: 'Requests',
            path: '/request',
            icon: 'material-symbols:search',
            hide: !store.me?.loggedIn || store.me?.isAdmin || store.me?.isStaff,
        },
        {
            text: 'Staff',
            icon: 'material-symbols:person',
            hide: !store.me?.isAdmin && !store.me?.isStaff,
            children: [
                 {
            text: 'Request',
            icon: 'material-symbols:search',
            path: '/staff/request',
        },
         {
            text: 'History',
            icon: 'material-symbols:history',
            path: '/staff/history',
        },
            ]
        },
        {
            text: 'Admin',
            icon: 'material-symbols:admin-panel-settings',
            hide: !(store.me?.isAdmin),
            children: [
                {
                    text: 'Devices',
                    path: '/admin/device',
                    icon: 'material-symbols:devices-rounded',
                },
                {
                    text: 'Categories',
                    path: '/admin/category',
                    icon: 'material-symbols:category-rounded',
                },
                {
                    text: 'Brands',
                    path: '/admin/brand',
                    icon: 'material-symbols:label-rounded',
                },
                {
                    text: 'Work Item Types',
                    path: '/admin/work-item-type',
                    icon: 'material-symbols:checklist-rounded',
                },
                {
                    text: 'Parts',
                    path: '/admin/parts',
                    icon: 'material-symbols:build-circle',
                },
                {
                    text: 'Config',
                    path: '/admin/config',
                    icon: 'material-symbols:settings-rounded',
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
