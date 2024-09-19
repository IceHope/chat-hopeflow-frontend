<template>
    <div class="agent-root">
        <ChatWindow :WebUrl="WebUrl" :InputPlaceholder="InputPlaceholder" sourceType="agent" />

        <div class="agent-setting-wrap">
            <div class="setting-header">
                <span>{{ agentTitle }}</span>
            </div>

            <span class="desc-title">工作流程</span>
            <div class="agent-desc-wrap">
                <div class="desc-text" v-html="marked(AgentDesc)" />
                <img class="flow-img" @click="showFullImage" src="@/assets/flow-six-hat.png">
            </div>
            <el-dialog v-model="showFullImageDialog" :append-to-body="true" width="60%">
                <img src="@/assets/flow-six-hat.png" alt="大图" class="large-image">
            </el-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { API_URL } from '@/constants/api_url';
import '@/style/agent-setting.css'; // 导入CSS文件
import { marked } from 'marked';
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import ChatWindow from '../ChatWindow.vue';
const route = useRoute();
const AgentDesc = route.params.flow_desc as string;
const agentTitle = route.params.title as string;


const WebUrl = API_URL.wsAgentSixHat
const InputPlaceholder = ref<string>('请输入要思考的idea,shift+回车换行,回车发送');


const showFullImageDialog = ref(false);

const showFullImage = () => {
    showFullImageDialog.value = true;
};


</script>

<style scoped>
.agent-setting-wrap {
    width: 30%;
}
</style>
