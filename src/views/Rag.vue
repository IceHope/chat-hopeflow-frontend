<template>
    <div class="rag-chat-container">
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder"
            :showHeader="showHeader" :sourceType="sourceType" />
        <RagConfig></RagConfig>
    </div>
</template>

<script setup lang="ts">
import ChatWindow from '@/components/ChatWindow.vue';
import RagConfig from '@/components/RagConfig.vue';
import { API_CONFIG } from '@/store/config';
import { ref } from 'vue';

const WebUrl = ref<string>(`${API_CONFIG.wsUrl}/rag/chat_query`);
const additionalParams = ref({
    detail_flag: true,
});
const InputPlaceholder = ref<string>('请输入问题,shift+回车换行,回车发送');
const showHeader = ref<boolean>(false);
const sourceType = ref<string>("rag");

</script>

<style scoped>
.rag-chat-container {
    display: flex;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
}
</style>
