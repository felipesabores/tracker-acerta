import api from '@/api/axios';
import type { Device, Position } from '@/types/device';

export const getDevices = async (): Promise<Device[]> => {
    const response = await api.get<Device[]>('/devices');
    return response.data;
};

export const getPositions = async (): Promise<Position[]> => {
    const response = await api.get<Position[]>('/positions');
    return response.data;
};
export const getRoute = async (deviceId: number, from: string, to: string): Promise<Position[]> => {
    const response = await api.get<Position[]>('/positions', {
        params: { deviceId, from, to }
    });
    return response.data;
};

export const sendCommand = async (deviceId: number, type: string): Promise<any> => {
    const response = await api.post('/commands/send', {
        deviceId,
        type,
        attributes: {}
    });
    return response.data;
};
