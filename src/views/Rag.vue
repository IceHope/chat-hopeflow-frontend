<template>
    <div class="translate-agent">
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder"
            :showHeader="showHeader" :sourceType="sourceType" />
    </div>
</template>

<script setup lang="ts">
import ChatWindow from '@/components/ChatWindow.vue';
import { API_CONFIG } from '@/store/config';
import { ref } from 'vue';

interface AdditionalParams {
    human_flag: boolean;
}

const WebUrl = ref<string>(`${API_CONFIG.wsUrl}/rag/chat_query`);
const additionalParams = ref<AdditionalParams>({
    human_flag: true,
});
const InputPlaceholder = ref<string>('请输入问题shift+回车换行,回车发送');
const showHeader = ref<boolean>(false);
const sourceType = ref<string>("rag")

</script>

<style scoped>
/* ... (styles remain the same) ... */
</style>
