import React from 'react';
import { User, Bell, Palette, Moon, LogOut, Shield } from 'lucide-react';
import clsx from 'clsx';

export const SettingsPage: React.FC = () => {
    const [theme, setTheme] = React.useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('theme') === 'dark' ||
                (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
                ? 'dark'
                : 'light';
        }
        return 'light';
    });

    const [soundEnabled, setSoundEnabled] = React.useState(() => {
        return localStorage.getItem('soundEnabled') !== 'false';
    });

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const toggleSound = () => {
        const newState = !soundEnabled;
        setSoundEnabled(newState);
        localStorage.setItem('soundEnabled', String(newState));
    };

    const handleLogout = () => {
        if (confirm('Tem certeza que deseja sair?')) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
    };

    // Apply theme on mount
    React.useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header>
                <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
                    <User className="text-primary" />
                    Configurações
                </h1>
                <p className="text-muted-foreground">Gerencie suas preferências de conta e sistema.</p>
            </header>

            <div className="grid gap-6">
                {/* Profile Section */}
                <div className="card overflow-hidden">
                    <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-6">
                        <div className="relative">
                            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-3xl font-bold text-primary-foreground shadow-lg">
                                AD
                            </div>
                            <div className="absolute bottom-0 right-0 h-5 w-5 bg-emerald-500 border-4 border-card rounded-full" title="Online" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold tracking-tight">Admin User</h2>
                            <p className="text-muted-foreground flex items-center gap-2">
                                admin@acerta.com
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                    Administrador
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-1 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nome de Usuário</span>
                                <p className="font-medium text-lg">admin</p>
                            </div>
                            <div className="space-y-1 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Telefone</span>
                                <p className="font-medium text-lg">+55 (11) 99999-9999</p>
                            </div>
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button className="btn btn-primary bg-primary text-primary-foreground hover:bg-primary/90">
                                Editar Perfil
                            </button>
                            <button
                                onClick={handleLogout}
                                className="btn border border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-900/30 dark:hover:bg-rose-950/30 dark:text-rose-400 flex items-center gap-2"
                            >
                                <LogOut size={16} />
                                Sair da Conta
                            </button>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="card">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Palette size={20} className="text-primary" />
                            Preferências do Sistema
                        </h3>
                    </div>
                    <div className="p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 font-medium text-base">
                                    <Moon size={18} className="text-muted-foreground" />
                                    Modo Escuro
                                </div>
                                <p className="text-sm text-muted-foreground">Ajustar a aparência do sistema para ambientes com pouca luz.</p>
                            </div>
                            <button
                                role="switch"
                                aria-checked={theme === 'dark'}
                                onClick={toggleTheme}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    theme === 'dark' ? "bg-primary" : "bg-input"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
                                    theme === 'dark' ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <div className="flex items-center gap-2 font-medium text-base">
                                    <Bell size={18} className="text-muted-foreground" />
                                    Notificações Sonoras
                                </div>
                                <p className="text-sm text-muted-foreground">Reproduzir som ao receber alertas críticos de frota.</p>
                            </div>
                            <button
                                role="switch"
                                aria-checked={soundEnabled}
                                onClick={toggleSound}
                                className={clsx(
                                    "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                                    soundEnabled ? "bg-primary" : "bg-input"
                                )}
                            >
                                <span className={clsx(
                                    "pointer-events-none block h-5 w-5 transform rounded-full bg-background shadow-lg ring-0 transition duration-200 ease-in-out",
                                    soundEnabled ? "translate-x-5" : "translate-x-0"
                                )} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Security Section */}
                <div className="card">
                    <div className="p-6 border-b border-border">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Shield size={20} className="text-primary" />
                            Segurança
                        </h3>
                    </div>
                    <div className="p-6 space-y-4">
                        <div className="flex justify-between items-center py-2">
                            <div className="space-y-0.5">
                                <span className="font-medium text-base">Senha</span>
                                <p className="text-sm text-muted-foreground">Última alteração há 3 meses.</p>
                            </div>
                            <button className="btn btn-outline hover:bg-muted">
                                Alterar Senha
                            </button>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-border pt-4">
                            <div className="space-y-0.5">
                                <span className="font-medium text-base">Autenticação de Dois Fatores (2FA)</span>
                                <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança à sua conta.</p>
                            </div>
                            <button className="btn bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
                                Ativar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
