import api from '@/api/axios';
import type { User } from '@/types/user';

export const login = async (email: string, password: string): Promise<User> => {
    const params = new URLSearchParams();
    params.append('email', email);
    params.append('password', password);

    const response = await api.post<User>('/session', params, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
    return response.data;
};

export const logout = async (): Promise<void> => {
    try {
        await api.delete('/session');
    } catch (e) {
        console.error('Logout failed', e);
    }
};

export const getSession = async (): Promise<User> => {
    const response = await api.get<User>('/session');
    return response.data;
};

export const loginWithToken = async (token: string): Promise<User> => {
    localStorage.setItem('traccar_token', token);
    const response = await api.get<User>('/session');
    return response.data;
};
