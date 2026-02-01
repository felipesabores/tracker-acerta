export interface TraccarEvent {
    id: number;
    type: string;
    serverTime: string;
    deviceId: number;
    positionId: number;
    geofenceId: number;
    maintenanceId: number;
    attributes: Record<string, any>;
}

export interface DriverScore {
    deviceId: number;
    deviceName: string;
    score: number;
    totalEvents: number;
    breakdown: {
        overspeed: number;
        hardBraking: number;
        hardAcceleration: number;
        hardCornering: number;
    };
}
