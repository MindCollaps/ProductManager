import type { DeviceCategory } from "@prisma/client";

export interface EditPage {
    title: string;
    fields: EditPageField[];
    isNew: boolean;
}

export interface EditPageField {
    label: string;
    type: 'text' | 'number' | 'checkbox' | 'category';
    value?: string | DeviceCategory[] | number | boolean | null | undefined;
    options?: string[]; // For select type
}