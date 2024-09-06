<template>
    <div class="chat-history" :class="{ collapsed: !showChatHistory, expanded: showChatHistory }">
        <div class="chat-history-header"
            :style="{ backgroundColor: showChatHistory ? 'white' : 'var(--chat-background-color)' }"
            style="position: sticky; top: 0; z-index: 1;">
            <el-tooltip placement="top">
                <template #content>
                    {{ showChatHistory ? '收起历史记录' : '打开历史记录' }}
                </template>
                <div class="new-chat-wrap" @click="toggleChatHistory()">
                    <div><img src="@/assets/expand-icon.svg"></div>
                </div>
            </el-tooltip>

            <span class="history-title" v-show="showChatHistory">历史记录</span>

            <el-tooltip placement="top">
                <template #content> 新聊天</template>
                <div class="new-chat-wrap" @click="newChatClick()">
                    <div><img src="@/assets/new-chat-icon.svg"></div>
                </div>
            </el-tooltip>
        </div>

        <div class="session-wraper" v-show="showChatHistory">
            <div v-for="(message, index) in messages" :key="index" class="history-message"
                :class="{ active: activeMessageIndex === index }" @click="handleClick(message, index)"
                @mouseenter="hoverMessageIndex = index" @mouseleave="hoverMessageIndex = null">
                <div class="session-title">
                    <span>{{ message.last_msg.slice(0, 10) }}...</span>
                </div>
                <div class="session-time">
                    <span>{{ formatTimestamp(message.session_id) }}</span>
                    <el-icon v-if="hoverMessageIndex === index || activeMessageIndex === index" class="icon-hover"
                        size="16px" :color="hoverDeleteIconIndex === index ? 'red' : '#B5BCC4'"
                        @mouseenter="hoverDeleteIconIndex = index" @mouseleave="hoverDeleteIconIndex = null"
                        @click.stop="deleteItem(message, index)">
                        <Delete />
                    </el-icon>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { API_URL } from '@/constants/api_url';
import { eventBus } from '@/utils/eventBus';
import { Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';


interface Message {
    user_name: string;
    session_id: string;
    last_msg: string;
}


const chatHistoryUrl: string = API_URL.chatHistorySnapshots;
const messages = ref<Message[]>([]);
const activeMessageIndex = ref<number | null>(null);
const hoverMessageIndex = ref<number | null>(null);
const hoverDeleteIconIndex = ref<number | null>(null);
const showChatHistory = ref(true);

onMounted(async () => {
    await fetchChatHistory();
});

async function fetchChatHistory(): Promise<void> {

    try {
        const response = await fetch(chatHistoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_name: localStorage.getItem('username') }),
        });

        if (!response.ok) {
            ElMessage.error('Error fetching chat history');
            return;
        }

        const data: Message[] = await response.json();
        messages.value = data;
    } catch (error) {
        console.error('Error fetching chat history:', error);
    }
}

function toggleChatHistory(): void {
    showChatHistory.value = !showChatHistory.value;
}

function handleClick(message: Message, index: number): void {
    activeMessageIndex.value = index;
    eventBus.$emit('chatSelected', { user_name: message.user_name, session_id: message.session_id });
}

function newChatClick(): void {
    activeMessageIndex.value = null;
    eventBus.$emit('newChatClick', undefined);
}

async function deleteItem(message: Message, index: number): Promise<void> {
    try {
        const response = await fetch(`${API_URL.chatHistoryDeleteUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_name: message.user_name, session_id: message.session_id }),
        });
        if (!response.ok) {
            ElMessage.error('Error deleting chat history');
            return;
        }
        messages.value.splice(index, 1);
        activeMessageIndex.value = null;
    } catch (error) {
        console.error('Error deleting chat history:', error);
        ElMessage.error("delete error");
    }
}

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
</script>

<style scoped>
.chat-history {
    flex-basis: 180px;
    transition: all 0.3s ease-in-out;
    background-color: white;
    /* 默认背景色 */
}

.chat-history.collapsed {
    flex-basis: 80px;
    /* 收起时减少宽度 */
    background-color: var(--chat-background-color)
        /* 收起时背景色 */
}

.chat-history.expanded {
    background-color: white;
    /* 展开时背景色 */
}

.chat-main-content {
    flex-grow: 1;
    padding-left: 20px;
}

.history-title {
    font-weight: bold;
    font-size: 12px;
}

.chat-history-header {
    padding: 8px 8px 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.new-chat-wrap {
    padding: 8px 8px 2px 8px;
    border-radius: 6px;
}

.new-chat-wrap:hover {
    background-color: var(--chat-background-color-hover);
}

.icon-hover {
    padding: 8px 8px 4px 8px;
    cursor: pointer;
    border-radius: 6px;
}

.icon-hover:hover {
    background-color: var(--chat-background-color-hover);
}

.session-wraper {
    display: flex;
    flex-direction: column;
}

.history-message {
    padding: 8px 8px 8px 18px;
    display: flex;
    flex-direction: column;
    cursor: pointer;
}

.history-message:hover,
.history-message.active {
    background-color: var(--chat-background-color-hover);
}

.session-title span {
    font-size: 12px;
    color: #000;
}

.session-time {
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #B5BCC4;
}

.history-message:hover .session-title span,
.history-message.active .session-title span {
    color: #615CED;
}
</style>
