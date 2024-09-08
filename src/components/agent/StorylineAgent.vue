<template>
    <div class="agent-root">

        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" sourceType="agent"
            :InputPlaceholder="InputPlaceholder" />

        <div class="agent-setting-wrap">
            <div class="setting-header">
                <span>{{ agentTitle }}</span>
            </div>
            <div class="review-input-wrap">
                <div class="review-input" style="margin-bottom: 10px;">
                    <el-switch v-model="isAllAuto" />
                    <span class="switch-hint">无需人类,全自动生成</span>
                </div>
                <div class="review-input">
                    <el-switch v-model="additionalParams.background_human_flag" size="small" :disabled="isAllAuto" />
                    <span class="switch-hint">人类协作,故事背景</span>
                </div>

                <div class="review-input">
                    <el-switch v-model="additionalParams.storyline_human_flag" size="small" :disabled="isAllAuto" />
                    <span class="switch-hint">人工协作,故事情节线大纲</span>
                </div>

                <div class="review-input">
                    <el-switch v-model="additionalParams.detail_human_flag" size="small" :disabled="isAllAuto" />
                    <span class="switch-hint">人工协作,每段的具体情节</span>
                </div>
            </div>
            <span class="desc-title">工作流程</span>
            <div class="agent-desc-wrap">
                <div class="desc-text" v-html="marked(AgentDesc)" />
                <img class="flow-img" @click="showFullImage" src="@/assets/flow-storyline-detail.png">
            </div>

            <el-dialog v-model="showFullImageDialog" :append-to-body="true" width="60%">
                <img src="@/assets/flow-storyline-detail.png" alt="大图" class="large-image">
            </el-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import { API_URL } from '@/constants/api_url';
import '@/style/agent-setting.css'; // 导入CSS文件
import { marked } from 'marked';
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import ChatWindow from '../ChatWindow.vue';

interface AdditionalParams {
    background_human_flag: boolean;
    storyline_human_flag: boolean;
    detail_human_flag: boolean;
}
const isAllAuto = ref(true)
const route = useRoute();
const AgentDesc = route.params.flow_desc as string;
const agentTitle = route.params.title as string;

const WebUrl = API_URL.wsAgentStoryLineUrl
const additionalParams = ref<AdditionalParams>({
    background_human_flag: false,
    storyline_human_flag: false,
    detail_human_flag: false,
});
const InputPlaceholder = ref<string>('请输入故事灵感,shift+回车换行,回车发送');
const showFullImageDialog = ref(false);

const showFullImage = () => {
    showFullImageDialog.value = true;
};

// 监视isAllAuto的变化
watch(isAllAuto, (newValue) => {
    if (newValue) {
        additionalParams.value.background_human_flag = false;
        additionalParams.value.storyline_human_flag = false;
        additionalParams.value.detail_human_flag = false;
    }
});

</script>

<style scoped>
/* ... (styles remain the same) ... */
</style>
