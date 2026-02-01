export interface Maintenance {
    id: number;
    name: string;
    type: string;
    start: number;
    period: number;
    attributes: Record<string, any>;
}

export interface MaintenanceStatus {
    maintenanceId: number;
    deviceId: number;
    name: string;
    type: string;
    status: 'good' | 'warning' | 'critical';
    lastService: number; // Odometer or Hours
    nextService: number;
    remaining: number;
}
