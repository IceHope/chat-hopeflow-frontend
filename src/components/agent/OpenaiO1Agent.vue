<template>
    <div class="agent-root">
        <ChatWindow :WebUrl="WebUrl" :InputPlaceholder="InputPlaceholder" sourceType="agent" />
    </div>
</template>

<script setup lang="ts">
import { API_URL } from '@/constants/api_url';
import '@/style/agent-setting.css'; // 导入CSS文件
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ChatWindow from '../ChatWindow.vue';
const route = useRoute();



const WebUrl = API_URL.wsAgentOpenaiO1
const InputPlaceholder = ref<string>('请输入推理目标,shift+回车换行,回车发送');

</script>

<style scoped></style>
