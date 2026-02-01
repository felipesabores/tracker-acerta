import React, { useState } from 'react';
import { Truck, Loader2 } from 'lucide-react';
import { login } from '@/features/auth/authService';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('felipe.carvalho@acertaexpress.com.br');
    const [password, setPassword] = useState('@Dinheiro2026');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) return;

        setLoading(true);
        setError('');

        try {
            await login(email, password);
            // Brief delay for better UX or to allow cookie set? Usually not needed if await successful
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Falha no login. Verifique suas credenciais.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm rounded-lg border bg-card text-card-foreground shadow-sm p-8">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="h-12 w-12 bg-primary rounded-lg flex items-center justify-center text-primary-foreground mb-4 shadow-sm">
                        <Truck size={24} />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight">Acerta Express</h1>
                    <p className="text-sm text-muted-foreground mt-2">Fleet Tracking Dashboard</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-rose-950/20 border border-red-100 dark:border-rose-900 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="admin@acerta.com"
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn btn-primary w-full h-9 mt-4"
                    >
                        {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-muted" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">Ou usando Token</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <input
                            type="text"
                            placeholder="Cole seu Bearer Token aqui"
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            onChange={async (e) => {
                                const token = e.target.value;
                                if (token.length > 20) {
                                    setLoading(true);
                                    try {
                                        const { loginWithToken } = await import('@/features/auth/authService');
                                        await loginWithToken(token);
                                        navigate('/');
                                    } catch (err) {
                                        // console.error(err);
                                        setError('Token inválido');
                                    } finally {
                                        setLoading(false);
                                    }
                                }
                            }}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
