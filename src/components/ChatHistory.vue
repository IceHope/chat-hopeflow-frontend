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

<script setup>
import { API_CONFIG } from '@/store/config';
import { eventBus } from '@/utils/eventBus';
import { ElMessage } from 'element-plus';
import { onMounted, onUnmounted, ref } from 'vue';

const chatHistoryUrl = `${API_CONFIG.rootUrl}/chat/history/snapshots`;

const messages = ref([]);
const activeMessageIndex = ref(null);

async function fetchChatHistory(isFromOnMounted) {
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

        const data = await response.json();
        messages.value = data;

        if (messages.value.length > 0) {
            if (!isFromOnMounted) {
                activeMessageIndex.value = 0;
            }

        }

    } catch (error) {
        console.error('Error fetching chat history:', error);
    }
}

const performSendNewSession = () => {
    fetchChatHistory(false);
};

onMounted(() => {
    fetchChatHistory(true);
    eventBus.$on('performSendNewSession', performSendNewSession);
});

onUnmounted(() => {
    eventBus.$off('performSendNewSession', performSendNewSession);
});

// 格式化时间戳
function formatTimestamp(session_id) {
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

// 对话详情
function handleClick(message, index) {
    console.log('Clicked message:', message);
    // 标记当前点击的项为 active
    activeMessageIndex.value = index;
    // 通过 EventBus 发送选中的聊天数据
    eventBus.$emit('chatSelected', { user_name: message.user_name, session_id: message.session_id });
}

// 新建对话
function newChatClick() {
    console.log('newChatClick');
    // 清除 active 状态
    activeMessageIndex.value = null;
    eventBus.$emit('newChatClick');
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
