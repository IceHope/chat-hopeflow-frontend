<template>
    <div class="agent-root">
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder"
            sourceType="agent" />

        <div class="agent-setting-wrap">
            <div class="setting-header">
                <span>{{ agentTitle }}</span>
            </div>
            <div class="language-inputs">
                <div class="language-input">
                    <label for="source-lang">源语言</label>
                    <el-input class="input-value" v-model="additionalParams.source_lang" />
                </div>
                <div class="language-input">
                    <label for="target-lang">目标语言</label>
                    <el-input class="input-value" v-model="additionalParams.target_lang" />
                </div>
            </div>
            <div class="review-input">
                <el-switch v-model="additionalParams.human_flag" />
                <span class="switch-hint">是否增加人工审查意见</span>
            </div>
            <span class="desc-title">工作流程</span>
            <div class="agent-desc-wrap">
                <div class="desc-text" v-html="marked(AgentDesc)" />
                <img class="flow-img" @click="showFullImage" src="@/assets/flow-translate.png">
            </div>
            <el-dialog v-model="showFullImageDialog" :append-to-body="true" width="60%">
                <img src="@/assets/flow-translate.png" alt="大图" class="large-image">
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


interface AdditionalParams {
    source_lang: string;
    target_lang: string;
    human_flag: boolean;
}

const WebUrl = API_URL.wsAgentTranslateHuman
const additionalParams = ref<AdditionalParams>({
    source_lang: '英文',
    target_lang: '中文',
    human_flag: false,
});
const InputPlaceholder = ref<string>('请输入要翻译的文本,shift+回车换行,回车发送');


const showFullImageDialog = ref(false);

const showFullImage = () => {
    showFullImageDialog.value = true;
};



</script>

<style scoped>
.language-inputs {
    display: flex;
    align-items: flex-start;
    flex-direction: column;
}

.language-input {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-top: 10px;
}

.input-value {
    margin-top: 4px;
}

.review-input {
    margin-top: 14px;
}
</style>
