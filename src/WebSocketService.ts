// src/SocketService.ts

import WebSocket from 'ws';

const wsServer = new WebSocket('wss://your-backend-server-url');

let listeners: ((message: any) => void)[] = [];

wsServer.on('open', () => {
    console.log('WebSocket connection opened');
});

wsServer.on('message', (data) => {
    const message = JSON.parse(data);

    // Dispatch the received message to all registered listeners
    for (const listener of listeners) {
        listener(message);
    }
});

export const WebSocketService = {
    send(data: string): void {
        wsServer.send(data);
    },

    addListener(callback: (message: any) => void): void {
        listeners.push(callback);
    },

    removeListener(callback: (message: any) => void): void {
        const index = listeners.indexOf(callback);
        if (index !== -1) {
            listeners.splice(index, 1);
        }
    },
};