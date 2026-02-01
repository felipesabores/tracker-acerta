import api from '@/api/axios';
import type { TraccarEvent, DriverScore } from '@/types/event';
import type { Device } from '@/types/device';

export const getEvents = async (deviceId: number, from: string, to: string): Promise<TraccarEvent[]> => {
    const response = await api.get<TraccarEvent[]>('/events', {
        params: { deviceId, from, to }
    });
    return response.data;
};

export const calculateDriverScores = (devices: Device[], events: TraccarEvent[]): DriverScore[] => {
    const scores: DriverScore[] = devices.map(device => {
        const deviceEvents = events.filter(e => e.deviceId === device.id);

        let score = 100;
        const breakdown = {
            overspeed: 0,
            hardBraking: 0,
            hardAcceleration: 0,
            hardCornering: 0
        };

        deviceEvents.forEach(e => {
            switch (e.type) {
                case 'deviceOverspeed':
                    score -= 10;
                    breakdown.overspeed++;
                    break;
                case 'hardBraking':
                    score -= 5;
                    breakdown.hardBraking++;
                    break;
                case 'hardAcceleration':
                    score -= 5;
                    breakdown.hardAcceleration++;
                    break;
                case 'hardCornering':
                    score -= 5;
                    breakdown.hardCornering++;
                    break;
            }
        });

        return {
            deviceId: device.id,
            deviceName: device.name,
            score: Math.max(0, score), // Minimum score 0
            totalEvents: deviceEvents.length,
            breakdown
        };
    });

    return scores.sort((a, b) => b.score - a.score); // Sort by highest score
};
