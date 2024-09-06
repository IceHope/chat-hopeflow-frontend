<template>
    <div class="rag-root">
        <ChatHistory class="chat-history" />
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder"
            :showHeader="showHeader" :sourceType="sourceType" />
        <RagConfig></RagConfig>
    </div>
</template>

<script setup lang="ts">
import ChatWindow from '@/components/ChatWindow.vue';
import RagConfig from '@/components/RagConfig.vue';
import { API_URL } from '@/constants/api_url';
import { ref } from 'vue';
import ChatHistory from '../components/ChatHistory.vue';

const WebUrl = API_URL.wsRagChatUrl;
const additionalParams = ref({
    detail_flag: true,
});
const InputPlaceholder = ref<string>('请输入问题,shift+回车换行,回车发送');
const showHeader = ref<boolean>(false);
const sourceType = ref<string>("rag");

</script>

<style scoped>
.rag-root {
    display: flex;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
}
</style>
