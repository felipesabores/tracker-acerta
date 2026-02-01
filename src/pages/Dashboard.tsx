import React, { useEffect, useState } from 'react';
import { Truck, Wifi, AlertTriangle, Activity, Loader2, Fuel, MapPin, Search } from 'lucide-react';
import clsx from 'clsx';
import { StatsCard } from '@/components/StatsCard';
import { getDevices, getPositions } from '@/features/devices/deviceService';
import type { Device, Position } from '@/types/device';

const Dashboard: React.FC = () => {
    const [devices, setDevices] = useState<Device[]>([]);
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [devs, pos] = await Promise.all([getDevices(), getPositions()]);
            setDevices(devs);
            setPositions(pos);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 10000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="flex justify-center p-6"><Loader2 className="animate-spin text-primary" /></div>;

    const totalDevices = devices.length;
    // Fix: Case-insensitive check for online status
    const onlineDevices = devices.filter(d => d.status?.toLowerCase() === 'online').length;
    // Fix: Ensure speed exists strictly greater than 0 (handling potential nulls)
    const movingDevices = positions.filter(p => (p.speed || 0) > 0).length;
    // Fix: "Stopped" logic - speed 0 or undefined
    const stoppedDevices = positions.filter(p => !p.speed || p.speed === 0).length;
    const alerts = positions.filter(p => p.attributes?.alarm).length;

    // Improved Fuel Logic: Handle varied attribute names if needed, default to safe value
    const lowFuel = devices.filter(d => {
        const level = d.attributes?.fuelLevel ?? d.attributes?.fuel ?? 100;
        return level < 20;
    }).length;

    return (
        <div className="flex flex-col gap-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight mb-2">Visão Geral</h1>
                <p className="text-muted-foreground">Métricas em tempo real e status operacional da frota.</p>
            </header>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="Total de Veículos"
                    value={totalDevices}
                    icon={Truck}
                    description="Frota registrada"
                    className="border-l-4 border-l-zinc-500 bg-gradient-to-br from-card to-zinc-50/50 dark:to-zinc-900/50"
                />
                <StatsCard
                    title="Em Operação"
                    value={onlineDevices}
                    icon={Wifi}
                    description={`${totalDevices > 0 ? ((onlineDevices / totalDevices) * 100).toFixed(0) : 0}% da frota conectada`}
                    className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-card to-emerald-50/50 dark:to-emerald-900/20"
                />
                <StatsCard
                    title="Em Movimento"
                    value={movingDevices}
                    icon={Activity}
                    description="Veículos deslocando"
                    className="border-l-4 border-l-blue-500 bg-gradient-to-br from-card to-blue-50/50 dark:to-blue-900/20"
                />
                <StatsCard
                    title="Alertas Críticos"
                    value={alerts}
                    icon={AlertTriangle}
                    description="Necessitam atenção imediata"
                    className="border-l-4 border-l-rose-500 bg-rose-50 dark:bg-rose-950/30"
                />
            </div>

            {/* Secondary Metrics & Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="card p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 bg-amber-50/50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400">Combustível</p>
                            <h4 className="text-2xl font-bold mt-1 text-amber-700 dark:text-amber-500">{lowFuel}</h4>
                            <p className="text-xs text-muted-foreground">Alertas de nível baixo</p>
                        </div>
                        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/40">
                            <Fuel size={18} />
                        </div>
                    </div>
                    <div className="w-full bg-amber-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-amber-500 w-[15%]" />
                    </div>
                </div>

                <div className="card p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600/80 dark:text-indigo-400">Cobertura</p>
                            <h4 className="text-2xl font-bold mt-1 text-indigo-700 dark:text-indigo-500">SP / RJ</h4>
                            <p className="text-xs text-muted-foreground">Área de atuação</p>
                        </div>
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg dark:bg-indigo-900/40">
                            <MapPin size={18} />
                        </div>
                    </div>
                </div>

                <div className="card p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 bg-zinc-50/50 dark:bg-zinc-900/10 border-zinc-100 dark:border-zinc-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Parados</p>
                            <h4 className="text-2xl font-bold mt-1 text-zinc-700 dark:text-zinc-300">{stoppedDevices}</h4>
                            <p className="text-xs text-muted-foreground">Sem ignição &gt; 10min</p>
                        </div>
                        <div className="p-2 bg-zinc-100 text-zinc-600 rounded-lg dark:bg-zinc-800">
                            <Truck size={18} />
                        </div>
                    </div>
                </div>

                {/* New 'System Status' Card to fill the 4th column */}
                <div className="card p-4 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-200 bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400">Conexão</p>
                            <h4 className="text-2xl font-bold mt-1 text-emerald-700 dark:text-emerald-500">Estável</h4>
                            <p className="text-xs text-muted-foreground">API v2.4 conectada</p>
                        </div>
                        <div className="relative p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/40">
                            <Wifi size={18} />
                            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                            </span>
                        </div>
                    </div>
                    <div className="w-full bg-emerald-200/50 h-1.5 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 w-[98%]" />
                    </div>
                </div>
            </div>

            {/* Recent Activity Table - Added mt-10 for clear separation */}
            <div className="card overflow-hidden mt-10">
                <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
                    <div>
                        <h3 className="text-lg font-semibold">Status Recente da Frota</h3>
                        <p className="text-sm text-muted-foreground">Últimas atualizações recebidas</p>
                    </div>
                    <button className="btn btn-outline gap-2 text-xs">
                        <Search size={14} />
                        Ver Mapa Completo
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 font-medium text-muted-foreground border-b border-border">
                            <tr>
                                <th className="px-6 py-3 w-[30%]">Veículo</th>
                                <th className="px-6 py-3 w-[20%]">Status</th>
                                <th className="px-6 py-3 w-[25%]">Última Posição</th>
                                <th className="px-6 py-3 w-[15%]">Velocidade</th>
                                <th className="px-6 py-3 w-[10%] text-right">Sinal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {devices.map(device => {
                                const position = positions.find(p => p.deviceId === device.id);
                                return (
                                    <tr key={device.id} className="hover:bg-muted/40 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className={clsx("w-2 h-2 rounded-full", {
                                                    "bg-emerald-500": device.status === 'online',
                                                    "bg-rose-500": device.status === 'offline',
                                                    "bg-amber-500": device.status === 'unknown'
                                                })} />
                                                {device.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={clsx("px-2.5 py-0.5 rounded-full text-xs font-medium border", {
                                                "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-800": device.status?.toLowerCase() === 'online',
                                                "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-800": device.status?.toLowerCase() === 'offline',
                                                "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-800": !['online', 'offline'].includes(device.status?.toLowerCase() || '')
                                            })}>
                                                {device.status?.toLowerCase() === 'online' ? 'Online' :
                                                    device.status?.toLowerCase() === 'offline' ? 'Offline' :
                                                        'Sem Sinal'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">
                                            {device.lastUpdate ? new Date(device.lastUpdate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-mono">
                                            {position ? `${(position.speed * 1.852).toFixed(0)} km/h` : '0 km/h'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Wifi size={16} className={clsx({
                                                "text-emerald-500": device.status === 'online',
                                                "text-muted-foreground": device.status !== 'online'
                                            })} />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
