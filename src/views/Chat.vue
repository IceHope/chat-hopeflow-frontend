<template>
    <div class="chat-container-custom">
        <ChatHistory class="chat-history" />
        <ChatWindow :WebUrl="WebUrl" :InputPlaceholder="InputPlaceholder" class="chat-window" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatHistory from '../components/ChatHistory.vue';
import ChatWindow from '../components/ChatWindow.vue';
import { API_CONFIG } from '../store/config';

const WebUrl = ref(`${API_CONFIG.wsUrl}/chat`); // WebSocket URL

const InputPlaceholder = ref('请您输入问题,shift+回车换行,回车发送');


</script>

<style scropped>
.chat-container-custom {
    display: flex;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
}

.chat-history {
    width: 180px;
    overflow-y: auto;
    /* 启用垂直滚动条以防内容过多 */
    overflow-x: hidden;
    /* 禁用水平滚动条 */
    box-sizing: border-box;
    /* 使 padding 不会影响宽度 */
    /* 隐藏滚动条 - 对于 Webkit 浏览器（Chrome, Safari 等） */
    scrollbar-width: none;
    /* 对于 Firefox */
    -ms-overflow-style: none;
    /* 对于 IE 和 Edge */
}

.chat-history::-webkit-scrollbar {
    display: none;
    /* 对于 Chrome, Safari, 和其他 Webkit 浏览器 */
}

.chat-window {
    flex: 1;
}
</style>
