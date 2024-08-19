<template>
    <div class="chat-history">
        <div class="button-container">
            <button @click="newChatClick">新建对话</button>
        </div>
        <div class="session-wraper">
            <div v-for="(message, index) in messages" :key="index" class="history-message"
                :class="{ active: activeMessageIndex === index }" @click="handleClick(message, index)">
                <div class="session-title">
                    <span>{{ message.last_msg.slice(0, 8) }}...</span>
                </div>
                <div class="session-time">
                    <span>{{ formatTimestamp(message.session_id) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { API_CONFIG } from '@/store/config';
import { eventBus } from '@/utils/eventBus';
import { ElMessage } from 'element-plus';
import { onMounted, onUnmounted, ref } from 'vue';

interface Message {
    user_name: string;
    session_id: string;
    last_msg: string;
}

const chatHistoryUrl: string = `${API_CONFIG.rootUrl}/chat/history/snapshots`;

const messages = ref<Message[]>([]);
const activeMessageIndex = ref<number | null>(null);

async function fetchChatHistory(isFromOnMounted: boolean): Promise<void> {
    try {
        console.log('Fetching chat history...');
        const response = await fetch(chatHistoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_name: localStorage.getItem("username") }),
        });

        if (!response.ok) {
            ElMessage.error('Error fetching chat history');
            return;
        }

        const data: Message[] = await response.json();
        messages.value = data;

        if (messages.value.length > 0 && !isFromOnMounted) {
            activeMessageIndex.value = 0;
        }

    } catch (error) {
        console.error('Error fetching chat history:', error);
    }
}

const performSendNewSession = (): void => {
    fetchChatHistory(false);
};

onMounted(() => {
    fetchChatHistory(true);
    eventBus.$on('performSendNewSession', performSendNewSession);
});

onUnmounted(() => {
    eventBus.$off('performSendNewSession', performSendNewSession);
});

function formatTimestamp(session_id: string): string {
    const date = new Date(Number(session_id));
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function handleClick(message: Message, index: number): void {
    console.log('Clicked message:', message);
    activeMessageIndex.value = index;
    eventBus.$emit('chatSelected', { user_name: message.user_name, session_id: message.session_id });
}

function newChatClick(): void {
    console.log('newChatClick');
    activeMessageIndex.value = null;
    eventBus.$emit('newChatClick', undefined);
}

</script>


<style scoped>
.button-container {
    display: flex;
    justify-content: center;
    padding: 20px 0px;
}

.button-container button {
    width: 90%;
}

.chat-history {
    background-color: white;
}

.session-wraper {
    display: flex;
    flex-direction: column;
}

.history-message {
    padding: 5px 10px;
    display: flex;
    flex-direction: column;
    /* 设置为上下布局 */
    margin-bottom: 10px;
    cursor: pointer;
}

.history-message:hover,
.history-message.active {
    background-color: var(--chat-user-backgroud-color);
    /* 鼠标悬浮或点击后的背景颜色 */
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.session-title span {
    font-size: 16px;
    color: #000;
    /* 默认字体颜色 */
}

.session-time span {
    font-size: 14px;
}

.history-message:hover .session-title span,
.history-message.active .session-title span {
    color: #615CED;
    /* 鼠标悬浮或点击后的字体颜色 */
}
</style>
