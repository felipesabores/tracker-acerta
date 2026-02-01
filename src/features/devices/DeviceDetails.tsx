import React, { useState } from 'react';
import type { Device, Position } from '@/types/device';
import { getRoute, sendCommand } from '@/features/devices/deviceService';
import { X, Lock, Unlock, History, Zap, Smartphone, Truck, Car, Bike } from 'lucide-react';
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

interface DeviceDetailsProps {
    device: Device;
    position: Position | undefined;
    onClose: () => void;
    onShowHistory: (positions: Position[]) => void;
}

export const DeviceDetails: React.FC<DeviceDetailsProps> = ({ device, position, onClose, onShowHistory }) => {
    const [loadingHistory, setLoadingHistory] = useState(false);
    const [sendingCommand, setSendingCommand] = useState(false);

    const handleHistory = async () => {
        setLoadingHistory(true);
        try {
            const now = new Date();
            const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(now.setHours(23, 59, 59, 999)).toISOString();

            const positions = await getRoute(device.id, startOfDay, endOfDay);
            onShowHistory(positions);
        } catch (e) {
            console.error(e);
            alert('Erro ao buscar histórico');
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleCommand = async (type: 'engineStop' | 'engineResume') => {
        if (!confirm(`Tem certeza que deseja ${type === 'engineStop' ? 'BLOQUEAR' : 'DESBLOQUEAR'} este veículo?`)) return;

        setSendingCommand(true);
        try {
            await sendCommand(device.id, type);
            alert('Comando enviado com sucesso!');
        } catch (e) {
            console.error(e);
            alert('Erro ao enviar comando');
        } finally {
            setSendingCommand(false);
        }
    };

    return (
        <div className="absolute right-4 top-4 w-80 bg-card rounded-lg shadow-lg border border-border flex flex-col z-[1000] overflow-hidden animate-in slide-in-from-right-10 fade-in duration-200">
            {/* Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/50">
                <div className="flex items-center gap-2">
                    {React.createElement(getDeviceIcon(device.category), { size: 20, className: "text-primary" })}
                    <h2 className="font-semibold text-lg">{device.name}</h2>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-background rounded-full transition-colors">
                    <X size={20} className="text-muted-foreground" />
                </button>
            </div>

            {/* Status Section */}
            <div className="p-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">STATUS</span>
                        <div className={clsx("flex items-center gap-2 font-medium", {
                            "text-green-600 dark:text-green-400": device.status === 'online',
                            "text-red-600 dark:text-red-400": device.status === 'offline',
                            "text-yellow-600 dark:text-yellow-400": device.status === 'unknown'
                        })}>
                            <span className={clsx("w-2 h-2 rounded-full", {
                                "bg-green-500": device.status === 'online',
                                "bg-red-500": device.status === 'offline',
                                "bg-yellow-500": device.status === 'unknown'
                            })} />
                            {device.status === 'unknown' ? 'DESCONHECIDO' : device.status.toUpperCase()}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-xs text-muted-foreground font-medium">IGNIÇÃO</span>
                        <div className="flex items-center gap-2 font-medium">
                            <Zap size={16} className={position?.attributes?.ignition ? "text-yellow-500 fill-yellow-500" : "text-gray-400"} />
                            {position?.attributes?.ignition ? 'ON' : 'OFF'}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">VELOCIDADE</span>
                    <div className="text-2xl font-bold font-mono">
                        {(position?.speed ? position.speed * 1.852 : 0).toFixed(0)} <span className="text-sm font-normal text-muted-foreground">km/h</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">ENDEREÇO</span>
                    <p className="text-sm text-foreground line-clamp-2" title={position?.address}>
                        {position?.address || 'Buscando endereço...'}
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground font-medium">ÚLTIMA ATUALIZAÇÃO</span>
                    <p className="text-sm">
                        {position?.deviceTime ? format(new Date(position.deviceTime), 'dd/MM/yyyy HH:mm:ss') : '-'}
                    </p>
                </div>
            </div>

            {/* Actions Footer */}
            <div className="p-4 bg-muted/20 border-t border-border flex flex-col gap-2">
                <button
                    onClick={handleHistory}
                    disabled={loadingHistory}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md font-medium transition-colors disabled:opacity-50"
                >
                    {loadingHistory ? <span className="animate-spin">⌛</span> : <History size={18} />}
                    Rota de Hoje
                </button>

                <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                        onClick={() => handleCommand('engineStop')}
                        disabled={sendingCommand}
                        className="flex items-center justify-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-200 dark:hover:bg-red-900/50 p-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Lock size={16} />
                        Bloquear
                    </button>
                    <button
                        onClick={() => handleCommand('engineResume')}
                        disabled={sendingCommand}
                        className="flex items-center justify-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 hover:bg-green-200 dark:hover:bg-green-900/50 p-2 rounded-md font-medium transition-colors disabled:opacity-50"
                    >
                        <Unlock size={16} />
                        Desbloquear
                    </button>
                </div>
            </div>
        </div>
    );
};
