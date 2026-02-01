export class SocketClient {
    private socket: WebSocket | null = null;
    private listeners: ((event: any) => void)[] = [];

    connect() {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = 'tracker.acertaexpress.app';

        this.socket = new WebSocket(`${protocol}//${host}/api/socket`);

        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.listeners.forEach(listener => listener(data));
        };

        this.socket.onclose = () => {
            setTimeout(() => this.connect(), 5000); // Reconnect
        };
    }

    onMessage(callback: (event: any) => void) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }
}

export const socketClient = new SocketClient();
