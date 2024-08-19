// config.ts
export const API_CONFIG: API_CONFIG = {
    wsUrl: 'ws://localhost:8001/ws',
    rootUrl: 'http://localhost:8585'
};

export const LOCAL_STORE_ITEM: LOCAL_STORE_ITEM = {
    userName: "username",
    authToken: "authToken",
}

interface API_CONFIG {
    wsUrl: string;
    rootUrl: string;
}

interface LOCAL_STORE_ITEM {
    userName: string;
    authToken: string;
}

