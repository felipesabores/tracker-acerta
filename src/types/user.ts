export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    readonly: boolean;
    administrator: boolean;
    map?: string;
    latitude?: number;
    longitude?: number;
    zoom?: number;
    attributes: Record<string, any>;
}
