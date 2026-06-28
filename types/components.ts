import type { DeviceBrand, DeviceCategory } from '@prisma/client';

export interface EditPage {
    title: string;
    fields: EditPageField[];
    isNew: boolean;
}

export interface EditPageField {
    label: string;
    type: 'text' | 'text-area' | 'icon' | 'number' | 'checkbox' | 'category' | 'label' | 'color' | 'brand';
    value?: string | DeviceCategory[] | DeviceBrand | number | boolean | null | undefined;
    options?: string[]; // For select type
}

export interface ParametersPage {
    title: string;
    editable: boolean;
    removeable: boolean;
    entries: ParametersPageEntry[];
    onCreate: string;
}

export interface ParametersPageEntry {
    fields: ParametersPageField[];
    onDelete: () => void;
    onEdit: () => void;
}

export interface ParametersPageField {
    label: string;
    type: 'text' | 'color' | 'category' | 'icon';
    value: string | DeviceCategory[];
}
