// eventBus.ts

type EventCallback<T = any> = (data: T) => void;

class EventBus {
    private events: Record<string, EventCallback[]> = {};

    // 注册事件监听器
    public $on<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    // 触发事件并传递数据
    public $emit<T = any>(event: string, data: T): void {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    // 取消注册事件监听器
    public $off<T = any>(event: string, callback: EventCallback<T>): void {
        if (!this.events[event]) return;

        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
}

// 导出 EventBus 实例
export const eventBus = new EventBus();
