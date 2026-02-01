export interface Device {
    id: number;
    name: string;
    uniqueId: string;
    status: 'online' | 'offline' | 'unknown';
    disabled: boolean;
    lastUpdate: string;
    positionId: number;
    groupId: number;
    phone: string;
    model: string;
    contact: string;
    category: string;
    attributes: {
        totalDistance?: number;
        hours?: number;
        [key: string]: any;
    };
}

export interface Position {
    id: number;
    deviceId: number;
    protocol: string;
    serverTime: string;
    deviceTime: string;
    fixTime: string;
    valid: boolean;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number; // knots
    course: number;
    address: string;
    attributes: {
        ignition?: boolean;
        battery?: number;
        distance?: number;
        totalDistance?: number;
        motion?: boolean;
        [key: string]: any;
    };
}
export interface Command {
    id: number;
    deviceId: number;
    type: string;
    attributes: Record<string, any>;
    description: string;
}
