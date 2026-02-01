import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, Settings, LogOut, Truck, Wrench, Shield } from 'lucide-react';
import clsx from 'clsx';
import styles from './MainLayout.module.css';

export const MainLayout: React.FC = () => {
    const location = useLocation();
    const isMap = location.pathname === '/map';

    return (
        <div className={styles.layout}>
            <aside className={styles.sidebar}>
                <div className={styles.logoContainer}>
                    <div className={styles.logo}>
                        <Truck className="h-6 w-6" />
                        <span>Acerta Express</span>
                    </div>
                </div>

                <nav className={styles.nav}>
                    <NavLink
                        to="/"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <LayoutDashboard size={20} />
                        <span>Visão Geral</span>
                    </NavLink>

                    <NavLink
                        to="/map"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <Map size={20} />
                        <span>Mapa em Tempo Real</span>
                    </NavLink>

                    <NavLink
                        to="/devices"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <Truck size={20} />
                        <span>Veículos</span>
                    </NavLink>

                    <NavLink
                        to="/maintenance"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <Wrench size={20} />
                        <span>Manutenção</span>
                    </NavLink>

                    <NavLink
                        to="/safety"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <Shield size={20} />
                        <span>Ranking de Motoristas</span>
                    </NavLink>

                    <NavLink
                        to="/settings"
                        className={({ isActive }) => clsx(styles.navItem, isActive && styles.navItemActive)}
                    >
                        <Settings size={20} />
                        <span>Configurações</span>
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-[hsl(var(--border))]">
                    <button
                        onClick={() => {
                            if (confirm('Tem certeza que deseja sair?')) {
                                localStorage.removeItem('token');
                                window.location.href = '/login';
                            }
                        }}
                        className={clsx(styles.navItem, "w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors")}
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>

            <main className={styles.main}>
                <header className={styles.header}>
                    <h2 className="text-lg font-semibold">Painel de Controle</h2>

                    <div className="flex items-center gap-4">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground border border-border">
                            AD
                        </div>
                    </div>
                </header>

                <div className={styles.content} style={{ padding: isMap ? 0 : undefined }}>
                    <Outlet />
                </div>
            </main>
        </div >
    );
};
