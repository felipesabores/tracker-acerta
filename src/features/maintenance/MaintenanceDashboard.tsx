import React, { useEffect, useState } from 'react';
import { getDevices } from '@/features/devices/deviceService';
import { getMaintenanceList } from '@/features/maintenance/maintenanceService';
import type { Device } from '@/types/device';
import type { Maintenance, MaintenanceStatus } from '@/types/maintenance';
import { Wrench, AlertTriangle, CheckCircle, Activity, Gauge } from 'lucide-react';
import clsx from 'clsx';

export const MaintenanceDashboard: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [maintenanceList, setMaintenanceList] = useState<Maintenance[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [d, m] = await Promise.all([getDevices(), getMaintenanceList()]);
                setDevices(d);
                setMaintenanceList(m);
            } catch (e) {
                console.error("Failed to fetch maintenance data", e);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    console.log('Maintenance Definitions:', maintenanceList); // Keep for debugging/future use

    // Mock calculation for MVP since we lack "Last Service" history in this context
    // In a real app, we'd fetch the last event or attribute.
    // Here we simulate a standard "Oil Change" if no maintenance is returned, or use the API data.
    const getStatus = (device: Device): MaintenanceStatus[] => {
        const statuses: MaintenanceStatus[] = [];

        // Default Mock Rule if API returns nothing (for demonstration)
        const mockOilChangeInterval = 10000;
        const totalDistanceKm = (device.attributes.totalDistance || 0) / 1000;

        // Calculate remaining based on simple modulus/mock start
        // Warning: This is a simplification. Real logic needs 'Last Service Odometer'.
        // We will assume Last Service was at 0 for MVP visualization unless attribute exists.
        const lastService = device.attributes.lastServiceOil || 0;
        const nextService = lastService + mockOilChangeInterval;
        const remaining = nextService - totalDistanceKm;

        let status: 'good' | 'warning' | 'critical' = 'good';
        if (remaining < 500) status = 'critical';
        else if (remaining < 1000) status = 'warning';

        statuses.push({
            maintenanceId: 0,
            deviceId: device.id,
            name: 'Troca de Óleo (Mock)',
            type: 'oil',
            status,
            lastService,
            nextService,
            remaining
        });

        return statuses;
    };

    if (loading) return <div className="p-8 text-center">Carregando dados da frota...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                        <Wrench className="text-primary" />
                        Saúde da Frota
                    </h1>
                    <p className="text-muted-foreground">Monitoramento preventivo e status de manutenção.</p>
                </div>
            </header>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card title="Frota Saudável" value={devices.length} icon={<CheckCircle className="text-emerald-700" />} />
                <Card title="Atenção Necessária" value="0" icon={<AlertTriangle className="text-amber-700" />} />
                <Card title="Críticos" value="0" icon={<Activity className="text-rose-700" />} />
                <Card title="Custo Médio/km" value="R$ 1.12" icon={<Gauge className="text-primary" />} />
            </div>

            <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/40">
                    <h3 className="font-semibold flex items-center gap-2">
                        <Wrench size={16} />
                        Próximas Manutenções
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-muted/50 text-muted-foreground font-medium border-b border-border">
                            <tr>
                                <th className="px-4 py-3 font-medium w-[25%]">Veículo</th>
                                <th className="px-4 py-3 font-medium w-[15%]">Odômetro</th>
                                <th className="px-4 py-3 font-medium w-[25%]">Serviço</th>
                                <th className="px-4 py-3 font-medium w-[15%]">Próxima Rev.</th>
                                <th className="px-4 py-3 font-medium w-[10%]">Restante</th>
                                <th className="px-4 py-3 font-medium w-[10%] text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {devices.map(device => {
                                const statuses = getStatus(device);
                                return statuses.map((stat, idx) => (
                                    <tr key={`${device.id}-${idx}`} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-4 py-3 font-medium text-foreground">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1 h-8 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                                {device.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{((device.attributes.totalDistance || 0) / 1000).toFixed(0)} km</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2 text-foreground">
                                                <span className="p-1 min-w-[24px] rounded bg-muted flex items-center justify-center">
                                                    <Wrench size={12} className="text-muted-foreground" />
                                                </span>
                                                {stat.name}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{stat.nextService.toLocaleString()} km</td>
                                        <td className="px-4 py-3 font-mono text-foreground">{stat.remaining.toFixed(0)} km</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end">
                                                <StatusBadge status={stat.status} />
                                            </div>
                                        </td>
                                    </tr>
                                ));
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Card = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-card p-6 rounded-lg border border-border shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-muted/50 rounded-full">{icon}</div>
    </div>
);

const StatusBadge = ({ status }: { status: 'good' | 'warning' | 'critical' }) => {
    return (
        <span className={clsx("px-3 py-1 rounded-full text-xs font-medium border", {
            "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800": status === 'good',
            "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800": status === 'warning',
            "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800": status === 'critical',
        })}>
            {status === 'good' ? 'OK' : status === 'warning' ? 'ATENÇÃO' : 'CRÍTICO'}
        </span>
    );
};
