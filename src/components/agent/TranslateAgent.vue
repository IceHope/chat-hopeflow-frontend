<template>
    <div class="translate-agent">
        <div class="translate-header-setting">
            <div class="translate-header-desc" v-html="AgentDesc" />
            <div class="review-input">
                <label for="review-flag">是否增加人工审查意见</label>
                <input id="review-flag" type="checkbox" v-model="additionalParams.human_flag" />
            </div>
            <div class="header-right">
                <div class="language-inputs">
                    <div class="language-input">
                        <label for="source-lang">源语言</label>
                        <input id="source-lang" v-model="additionalParams.source_lang" />
                    </div>
                    <div class="language-input">
                        <label for="target-lang">目标语言</label>
                        <input id="target-lang" v-model="additionalParams.target_lang" />
                    </div>
                </div>
            </div>
        </div>
        <ChatWindow :WebUrl="WebUrl" :additionalParams="additionalParams" :InputPlaceholder="InputPlaceholder" />
    </div>
</template>

<script setup lang="ts">
import { API_CONFIG } from '@/store/config';
import { ref } from 'vue';
import ChatWindow from '../ChatWindow.vue';

interface AdditionalParams {
    source_lang: string;
    target_lang: string;
    human_flag: boolean;
}

const WebUrl = ref<string>(`${API_CONFIG.wsUrl}/agent/translate_human`);
const additionalParams = ref<AdditionalParams>({
    source_lang: '英文',
    target_lang: '中文',
    human_flag: true,
});
const InputPlaceholder = ref<string>('请输入要翻译的文本,shift+回车换行,回车发送');
const AgentDesc = ref<string>(
    '1. 大模型直接翻译<br/>2. 大模型审查翻译结果,给出修改意见, 可以人工给出参考意见<br/>3. 大模型根据修改意见,最后翻译结果'
);
</script>

<style scoped>
/* ... (styles remain the same) ... */
</style>

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

.header-right {
    display: flex;
    align-items: center;
}

.language-inputs {
    display: flex;
    justify-content: flex-end;
    margin-right: 20px;
}

.language-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 10px;
}

.language-input label {
    margin-bottom: 5px;
    font-size: 14px;
    color: #333;
}

.language-input input {
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 5px;
    font-size: 14px;
    color: #333;
    transition: border-color 0.3s, box-shadow 0.3s;
    width: 200px;
    box-sizing: border-box;
}

.language-input input:focus {
    outline: none;
    border-color: #66afe9;
    box-shadow: 0 0 5px rgba(102, 175, 233, 0.5);
}

.language-input input:hover {
    border-color: #aaa;
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
