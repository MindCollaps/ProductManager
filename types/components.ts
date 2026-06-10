import type { DeviceCategory } from '@prisma/client';

export interface EditPage {
    title: string;
    fields: EditPageField[];
    isNew: boolean;
}

export interface EditPageField {
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'category' | 'label' | 'color';
    value?: string | DeviceCategory[] | number | boolean | null | undefined;
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
    type: 'text' | 'color' | 'category';
    value: string | DeviceCategory[];
}
