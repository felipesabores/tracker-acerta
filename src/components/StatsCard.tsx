import React from 'react';
import clsx from 'clsx';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    title: string;
    value: string | number;
    description?: string;
    icon: LucideIcon;
    trend?: {
        value: number;
        label?: string;
        positive?: boolean;
    };
    className?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
}) => {
    return (
        <div className={clsx(
            "rounded-xl border bg-card text-card-foreground shadow-sm p-6",
            "hover:bg-accent/5 transition-colors duration-200",
            className
        )}>
            <div className="relative z-10">
                <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <h3 className="tracking-tight text-sm font-medium text-muted-foreground">{title}</h3>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-muted-foreground mt-1">
                        {trend && (
                            <span className={clsx(trend.positive ? "text-green-500" : "text-red-500", "font-medium")}>
                                {trend.value > 0 ? '+' : ''}{trend.value}%
                            </span>
                        )}
                        {' '}
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
};
