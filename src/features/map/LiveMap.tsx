import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from 'react';
import type { Device, Position } from '@/types/device';
import { getDevices, getPositions } from '@/features/devices/deviceService';
import { socketClient } from '@/api/socket';
import { DeviceDetails } from '@/features/devices/DeviceDetails';
import { Polyline } from 'react-leaflet';
import L from 'leaflet';

// Fix default icon issue with webpack/vite
import iconMarker from 'leaflet/dist/images/marker-icon.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: iconMarker,
    iconRetinaUrl: iconRetina,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({ positions }: { positions: Position[] }) => {
    const map = useMap();
    useEffect(() => {
        if (positions.length > 0) {
            const bounds = L.latLngBounds(positions.map(p => [p.latitude, p.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        }
    }, [positions, map]);
    return null;
};

export const LiveMap = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
    const [historyRoute, setHistoryRoute] = useState<Position[]>([]);

    useEffect(() => {
        const fetch = async () => {
            try {
                const [d, p] = await Promise.all([getDevices(), getPositions()]);
                setDevices(d);
                setPositions(p);
            } catch (e) {
                console.error(e);
            }
        };
        fetch();

        socketClient.connect();
        const unsubscribe = socketClient.onMessage((data) => {
            if (data.positions) {
                setPositions(prev => {
                    const next = [...prev];
                    data.positions.forEach((newPos: Position) => {
                        const index = next.findIndex(p => p.deviceId === newPos.deviceId);
                        if (index !== -1) next[index] = newPos;
                        else next.push(newPos);
                    });
                    return next;
                });
            }
            if (data.devices) {
                setDevices(prev => {
                    const next = [...prev];
                    data.devices.forEach((newDev: Device) => {
                        const index = next.findIndex(d => d.id === newDev.id);
                        if (index !== -1) next[index] = newDev;
                        else next.push(newDev);
                    });
                    return next;
                });
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div style={{ height: 'calc(100vh - 64px)', width: '100%', borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid hsl(var(--border))' }}>
            <MapContainer center={[0, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapEvents positions={positions} />

                {historyRoute.length > 0 && (
                    <Polyline
                        positions={historyRoute.map(p => [p.latitude, p.longitude])}
                        color="blue"
                    />
                )}

                {positions.map(pos => {
                    const dev = devices.find(d => d.id === pos.deviceId);
                    return (
                        <Marker
                            key={pos.id}
                            position={[pos.latitude, pos.longitude]}
                            eventHandlers={{
                                click: () => {
                                    if (dev) {
                                        setSelectedDevice(dev);
                                        setHistoryRoute([]); // Reset history when picking new device
                                    }
                                }
                            }}
                        >
                            <Popup>
                                <div className="p-2">
                                    <h3 className="font-bold">{dev?.name || 'Unknown Device'}</h3>
                                    <p className="text-sm">Speed: {(pos.speed * 1.852).toFixed(1)} km/h</p>
                                    <p className="text-xs text-muted-foreground">{new Date(pos.deviceTime).toLocaleString()}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {selectedDevice && (
                <DeviceDetails
                    device={selectedDevice}
                    position={positions.find(p => p.deviceId === selectedDevice.id)}
                    onClose={() => {
                        setSelectedDevice(null);
                        setHistoryRoute([]);
                    }}
                    onShowHistory={setHistoryRoute}
                />
            )}
        </div>
    );
};
