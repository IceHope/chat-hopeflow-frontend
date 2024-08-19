<template>
    <div class="translate-agent">
        <div class="translate-header-setting">
            <div class="translate-header-desc" v-html="AgentDesc"></div>
            <div class="review-input">
                <label for="review-flag">是否增加人工审查意见</label>
                <input id="review-flag" type="checkbox" v-model="additionalParams.human_flag" />
            </div>
        </div>
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import ChatWindow from '../ChatWindow.vue';

import { API_CONFIG } from '@/store/config';

const WebUrl = ref(`${API_CONFIG.wsUrl}/agent/storyline`);
const additionalParams = ref({
    human_flag: true // 默认是true
});
const InputPlaceholder = ref('请输入故事灵感,shift+回车换行,回车发送');
const AgentDesc = ref(
    '1.&nbsp世界观和背景故事<br/>2.&nbsp故事情节线大纲<br/>3.&nbsp一步一步生成具体情节');
</script>

<style scoped>
.translate-agent {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100%;
    box-sizing: border-box;
    overflow: hidden;
    padding: 20px;
    padding-left: 20px;
}

.translate-header-setting {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
}

.translate-header-desc {
    margin-bottom: 20px;
    padding: 10px;
    max-width: 600px;
    text-align: left;
    font-size: 16px;
    line-height: 1.5;
    color: #333;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    box-sizing: border-box;
}

.review-input {
    display: flex;
    align-items: center;
    margin-left: 20px;
}

.review-input label {
    margin-right: 10px;
    margin-bottom: 5px;
    font-size: 15px;
    color: #333;
}

.review-input input[type="checkbox"] {
    width: auto;
    transform: scale(1.5);
    /* 提高UI风格，放大复选框 */
}
</style>
