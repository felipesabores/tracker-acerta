import React, { useEffect, useState } from 'react';
import { getDevices } from '@/features/devices/deviceService';
import { getEvents, calculateDriverScores } from '@/features/safety/safetyService';
import type { DriverScore } from '@/types/event';
import { Shield, TrendingUp, AlertOctagon, Zap, Gauge } from 'lucide-react';
import clsx from 'clsx';

export const SafetyDashboard: React.FC = () => {
    const [scores, setScores] = useState<DriverScore[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                // Fetch last 24h events (or wider range for demo)
                const end = new Date();
                const start = new Date();
                start.setDate(start.getDate() - 7); // Last 7 days for meaningful data

                // Get all devices first to filter events
                const devices = await getDevices();

                // Fetch events for each device (or use a bulk endpoint if available, but Traccar standard is per device or global)
                // For MVP, we'll fetch global events for the user
                const events = await getEvents(0, start.toISOString(), end.toISOString()); // 0 usually implies 'all' in some Traccar contexts, or we iterate.
                // Re-verification: Standard Traccar /events endpoint with from/to gets events for user's devices.

                const calculatedScores = calculateDriverScores(devices, events);
                setScores(calculatedScores);
            } catch (e) {
                console.error("Failed to fetch safety data", e);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading) return <div className="p-8 text-center animate-pulse">Calculando pontuação dos motoristas...</div>;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                    <Shield className="text-blue-600" />
                    Scorecard do Motorista
                </h1>
                <p className="text-muted-foreground">Ranking de segurança e comportamento dos últimos 7 dias.</p>
            </header>

            {/* Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ScoreHighlight
                    title="Média da Frota"
                    value={scores.reduce((acc, s) => acc + s.score, 0) / (scores.length || 1)}
                    suffix="/ 100"
                    trend="Estável"
                    icon={<TrendingUp size={20} className="text-muted-foreground" />}
                />
                <ScoreHighlight
                    title="Motorista Mais Seguro"
                    value={scores[0]?.deviceName || '-'}
                    suffix={scores[0] ? `(${scores[0].score})` : ''}
                    color="green"
                    icon={<Shield size={20} className="text-emerald-500" />}
                />
                <ScoreHighlight
                    title="Risco Elevado"
                    value={scores[scores.length - 1]?.score < 80 ? scores[scores.length - 1].deviceName : 'Nenhum'}
                    suffix=""
                    color="red"
                    icon={<AlertOctagon size={20} className="text-rose-500" />}
                />
            </div>

            {/* Leaderboard */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp size={18} />
                        Ranking de Pilotos
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-medium">
                            <tr>
                                <th className="p-4 w-[10%]">Posição</th>
                                <th className="p-4 w-[25%]">Motorista/Veículo</th>
                                <th className="p-4 w-[10%] text-center">Score</th>
                                <th className="p-4 w-[15%] text-center">Excesso Vel.</th>
                                <th className="p-4 w-[15%] text-center">Frenagem</th>
                                <th className="p-4 w-[15%] text-center">Curva/Acel.</th>
                                <th className="p-4 w-[10%]">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {scores.map((s, idx) => (
                                <tr key={s.deviceId} className="hover:bg-muted/30 transition-colors group">
                                    <td className="p-4 font-mono text-muted-foreground">
                                        <span className={clsx("inline-flex items-center justify-center w-6 h-6 rounded-full text-xs", {
                                            "bg-amber-100 text-amber-700 font-bold": idx === 0,
                                            "bg-zinc-100": idx > 0
                                        })}>
                                            {idx + 1}
                                        </span>
                                    </td>
                                    <td className="p-4 font-medium text-foreground">{s.deviceName}</td>
                                    <td className="p-4 text-center">
                                        <ScoreBadge score={s.score} />
                                    </td>
                                    <td className="p-4 text-center text-red-500 font-medium">
                                        {s.breakdown.overspeed > 0 ? (
                                            <div className="flex items-center justify-center gap-1 bg-red-50 dark:bg-red-900/10 rounded-md py-1">
                                                <Gauge size={14} /> {s.breakdown.overspeed}
                                            </div>
                                        ) : <span className="text-muted-foreground/30">-</span>}
                                    </td>
                                    <td className="p-4 text-center text-orange-500 font-medium">
                                        {s.breakdown.hardBraking > 0 ? (
                                            <div className="flex items-center justify-center gap-1 bg-orange-50 dark:bg-orange-900/10 rounded-md py-1">
                                                <AlertOctagon size={14} /> {s.breakdown.hardBraking}
                                            </div>
                                        ) : <span className="text-muted-foreground/30">-</span>}
                                    </td>
                                    <td className="p-4 text-center text-yellow-500 font-medium">
                                        {s.breakdown.hardAcceleration + s.breakdown.hardCornering > 0 ? (
                                            <div className="flex items-center justify-center gap-1 bg-yellow-50 dark:bg-yellow-900/10 rounded-md py-1">
                                                <Zap size={14} /> {s.breakdown.hardAcceleration + s.breakdown.hardCornering}
                                            </div>
                                        ) : <span className="text-muted-foreground/30">-</span>}
                                    </td>
                                    <td className="p-4">
                                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                                            <div
                                                className={clsx("h-full transition-all duration-1000", {
                                                    "bg-emerald-500": s.score >= 90,
                                                    "bg-amber-500": s.score >= 70 && s.score < 90,
                                                    "bg-rose-500": s.score < 70
                                                })}
                                                style={{ width: `${s.score}%` }}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {scores.length === 0 && (
                        <div className="p-12 text-center flex flex-col items-center justify-center gap-4">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-2">
                                <Shield size={32} />
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-foreground">Frota 100% Segura!</h4>
                                <p className="text-muted-foreground max-w-sm mx-auto mt-1">
                                    Nenhuma infração registrada nos últimos 7 dias. Continue assim! 🌟
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ScoreHighlight = ({ title, value, suffix, trend, color, icon }: any) => (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-start justify-between">
        <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">{title}</span>
            <div className="flex items-baseline gap-1">
                <span className={clsx("text-4xl font-bold tracking-tight", {
                    "text-emerald-600 dark:text-emerald-400": color === 'green',
                    "text-rose-600 dark:text-rose-400": color === 'red',
                    "text-foreground": !color
                })}>
                    {typeof value === 'number' ? value.toFixed(0) : value}
                </span>
                <span className="text-muted-foreground text-sm font-medium">{suffix}</span>
            </div>
            {trend && <span className="text-xs text-muted-foreground bg-secondary self-start px-2 py-0.5 rounded-full">{trend}</span>}
        </div>
        {icon && <div className="p-3 bg-muted/50 rounded-full">{icon}</div>}
    </div>
);

const ScoreBadge = ({ score }: { score: number }) => {
    return (
        <div className={clsx("inline-flex items-center justify-center w-12 h-12 rounded-full border-4 font-bold text-sm", {
            "border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20": score >= 90,
            "border-yellow-500 text-yellow-700 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20": score >= 70 && score < 90,
            "border-red-500 text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20": score < 70
        })}>
            {score}
        </div>
    );
};
