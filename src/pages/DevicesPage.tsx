import React, { useEffect, useState, useMemo } from 'react';
import { getDevices, getPositions } from '@/features/devices/deviceService';
import type { Device, Position } from '@/types/device';
import { Search, Truck, Smartphone, Car, Bike } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

const getDeviceIcon = (category: string) => {
    switch (category) {
        case 'smartphone':
        case 'person':
            return Smartphone;
        case 'motorcycle':
            return Bike;
        case 'car':
            return Car;
        default:
            return Truck;
    }
};

export const DevicesPage: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline' | 'unknown'>('all');

    useEffect(() => {
        const fetch = async () => {
            try {
                const [d, p] = await Promise.all([getDevices(), getPositions()]);
                setDevices(d);
                setPositions(p);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
        const interval = setInterval(fetch, 10000);
        return () => clearInterval(interval);
    }, []);

    const filteredDevices = useMemo(() => {
        return devices.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                d.uniqueId.includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || d.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [devices, searchTerm, statusFilter]);

    if (loading) return <div className="p-8 text-center animate-pulse">Carregando frota...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <Truck className="text-primary" />
                        Gestão de Frota
                    </h1>
                    <p className="text-muted-foreground">Gerencie seus veículos, visualize status e detalhes técnicos.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="search"
                            placeholder="Buscar por nome ou IMEI..."
                            className="bg-background pl-10 h-10 w-full sm:w-64 rounded-md border border-input focus:outline-none focus:ring-2 focus:ring-ring"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <select
                        className="h-10 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        value={statusFilter}
                        onChange={(e: any) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">Todos os Status</option>
                        <option value="online">Online</option>
                        <option value="offline">Offline</option>
                        <option value="unknown">Desconhecido</option>
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredDevices.map(device => {
                    const position = positions.find(p => p.deviceId === device.id);
                    return (
                        <DeviceCard key={device.id} device={device} position={position} />
                    );
                })}

                {filteredDevices.length === 0 && (
                    <div className="col-span-full p-12 text-center border rounded-lg border-dashed text-muted-foreground">
                        Nenhum veículo encontrado com os filtros atuais.
                    </div>
                )}
            </div>
        </div>
    );
};

const DeviceCard = ({ device, position }: { device: Device, position?: Position }) => {
    const ignition = position?.attributes?.ignition;
    const Icon = getDeviceIcon(device.category);

    return (
        <div className="card group hover:shadow-md transition-all duration-300 hover:border-primary/50 overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-start">
                <div className="flex items-center gap-5">
                    <div className="p-2.5 bg-background rounded-full border border-border shadow-sm">
                        <Icon className="text-primary" size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-base truncate pr-2" title={device.name}>{device.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">{device.uniqueId}</p>
                    </div>
                </div>
                <StatusBadge status={device.status} />
            </div>

            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Velocidade</span>
                        <div className="font-mono font-medium text-xl leading-none">
                            {(position?.speed ? position.speed * 1.852 : 0).toFixed(0)} <span className="text-xs text-muted-foreground">km/h</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Ignição</span>
                        <div className="flex items-center gap-1.5 font-medium text-sm">
                            <div className={clsx("w-2 h-2 rounded-full", ignition ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-zinc-300 dark:bg-zinc-700")} />
                            {ignition ? 'LIGADA' : 'DESLIGADA'}
                        </div>
                    </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Última Posição</span>
                        <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                            {position?.deviceTime ? format(new Date(position.deviceTime), "HH:mm dd/MM") : '-'}
                        </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed h-9" title={position?.address}>
                        {position?.address || 'Endereço não disponível'}
                    </p>
                </div>
            </div>
        </div>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    return (
        <span className={clsx("badge", {
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20": status === 'online',
            "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20": status === 'offline',
            "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700": status === 'unknown',
        })}>
            <span className={clsx("w-1.5 h-1.5 rounded-full mr-1.5", {
                "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.4)]": status === 'online',
                "bg-rose-500": status === 'offline',
                "bg-zinc-500": status === 'unknown',
            })} />
            {status === 'unknown' ? 'OFFLINE' : status.toUpperCase()}
        </span>
    );
};
