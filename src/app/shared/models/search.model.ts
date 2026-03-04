export type SearchFieldType = 'text' | 'date' | 'select';

export interface SearchField {
    name: string,
    label?: string,
    type?: SearchFieldType,
    placeholder?: string,
    options?: { value: string, label: string }[],
    icon?: string;
}

export interface SearchParams {
    [key: string]: string;
}
