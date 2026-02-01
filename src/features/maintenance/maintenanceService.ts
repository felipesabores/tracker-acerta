import api from '@/api/axios';
import type { Maintenance } from '@/types/maintenance';

export const getMaintenanceList = async (): Promise<Maintenance[]> => {
    const response = await api.get<Maintenance[]>('/maintenance');
    return response.data;
};

// This endpoint is often used to link devices to maintenance schedules
// Traccar API structure for this might vary, but usually it's getting permissions
export const getDeviceMaintenance = async (_deviceId: number): Promise<number[]> => {
    // Returns list of maintenance IDs linked to the device
    // Note: Traccar uses /permissions endpoint for links, but often we just fetch all and filter client-side if needed, 
    // or use specific endpoint if available. For now, assuming we might need to fetch all permissions.
    // Simpler approach for now: Fetch all maintenance and assume global or fetch permissions if needed.
    // Let's stick to fetching the definitions first.
    return [];
};
