<template>
    <div class="rag-config-container">
        <div class="rag-config-header"><span>RAG设置</span></div>
        <div class="chat-setting-container bg-grey">
            <div class="container-header" @click="toggleChatSettingContent">
                <span>对话设置</span>
            </div>
            <div v-if="showChatSettingContent">
                <div class="expand-detail-process">
                    <el-switch v-model="isExpandDetailProcess" />
                    <span class="switch-hint">是否展开详细的检索过程</span>
                </div>
                <div class="multi-turn-chat">
                    <el-switch v-model="multiTurnChatEnabled" />
                    <span class="switch-hint">是否开启多轮对话</span>
                </div>
            </div>
        </div>
        <div class="retrive-setting-container bg-grey">
            <div class="container-header" @click="toggleRetrieveSettingContent">
                <span>召回设置</span>
            </div>
            <dev v-if="showRetrieveSettingContent">
                <div class="slider-demo-block">
                    <div class="demonstration">
                        <span class="title">similarity_top_n </span>
                        <div class="tooltip">
                            <el-tooltip placement="top">
                                <template #content> 大模型最终的参考文本数量 </template>
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-slider size="small" v-model="rerankCount" show-input :min="1" :max="10" :show-tooltip="false" />
                </div>
                <div class="slider-demo-block">
                    <div class="demonstration">
                        <span class="title">retrieve_top_k </span>
                        <div class="tooltip">
                            <el-tooltip placement="top" class="tooltip">
                                <template #content> 初次大规模检索的数量,比最终数量多 </template>
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-slider v-model="retriveCount" size="small" show-input :min="1" :max="20"
                        :show-tooltip="false" />
                </div>
                <div class="slider-demo-block">
                    <div class="demonstration">
                        <span class="title">fusion_queries</span>
                        <div class="tooltip">
                            <el-tooltip placement="top" class="tooltip">
                                <template #content> 同类语义生成的查询数量 </template>
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-slider v-model="fusionCount" size="small" show-input :max="10" :show-tooltip="false" />
                </div>
            </dev>
        </div>
        <div class="model-setting-container bg-grey">
            <div class="container-header" @click="toggleModelSettingContent">
                <span>模型设置</span>
            </div>
            <div v-if="showModelSettingContent">
                <div class="rerank-setting-wrap setting-item-wrap">
                    <div class="demonstration">
                        <span class="title">Rerank</span>
                        <div class="tooltip">
                            <el-tooltip placement="top">
                                <template #content> Rerank重排序</template>
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-select v-model="rerankValue" size="small" placeholder="Select" style="width: 90%">
                        <el-option-group v-for="group in rerankModelList" :key="group.owner_type"
                            :label="group.owner_type">
                            <el-option v-for="item in group.names" :key="item.name" :label="item.name"
                                :value="item.name" />
                        </el-option-group>
                    </el-select>
                </div>

                <div class="multi-modal-setting-wrap setting-item-wrap">
                    <div class="demonstration">
                        <span class="title">多模态大模型</span>
                        <div class="tooltip">
                            <el-tooltip placement="top">
                                <template #content> 检索到图片(PDF中的,图片知识等来源),需要多模态大模型进行图文问答</template>
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                            </el-tooltip>
                        </div>
                    </div>
                    <el-select v-model="multiModalValue" size="small" placeholder="Select" style="width: 90%">
                        <el-option-group v-for="group in multiModalList" :key="group.owner_type"
                            :label="group.owner_type">
                            <el-option v-for="item in group.names" :key="item.name" :label="item.name"
                                :value="item.name">
                                <span style="float: left">{{ item.name }}</span>
                                <span style="float: right; color: var(--primary-text-ccolor);font-size: 13px;">
                                    {{ item.input_price }}/{{ item.output_price }}
                                </span>
                            </el-option>
                        </el-option-group>
                    </el-select>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang="ts" setup>
import { QuestionFilled } from '@element-plus/icons-vue'; // 导入<QuestionFilled />
import { ref, watch } from 'vue';
import { useStore } from "vuex";

const store = useStore();

const multiTurnChatEnabled = ref(store.state.rag.multiTurnChatEnabled);
const isExpandDetailProcess = ref(store.state.rag.isExpandDetailProcess);
const rerankCount = ref<number>(store.state.rag.rerankCount);
const retriveCount = ref<number>(store.state.rag.retriveCount);
const fusionCount = ref<number>(store.state.rag.fusionCount);

const rerankValue = ref(store.state.rag.rerankModelName);
const multiModalValue = ref(store.state.rag.multiModalName);

const rerankModelList = store.state.config.models.rerank
const multiModalList = store.state.config.models.multi_modal



const showChatSettingContent = ref(true);
const showRetrieveSettingContent = ref(true);
const showModelSettingContent = ref(true);


const toggleChatSettingContent = () => {
    showChatSettingContent.value = !showChatSettingContent.value;
};

const toggleRetrieveSettingContent = () => {
    showRetrieveSettingContent.value = !showRetrieveSettingContent.value;
};
const toggleModelSettingContent = () => {
    showModelSettingContent.value = !showModelSettingContent.value;
};


watch(multiTurnChatEnabled, (newValue) => {
    store.dispatch('rag/updateMultiTurnChatEnabled', newValue);
    console.log("updateMultiTurnChatEnabled changed:", newValue);
});

watch(isExpandDetailProcess, (newValue) => {
    store.dispatch('rag/updateExpandDetailProcess', newValue);
    console.log("updateExpandDetailProcess changed:", newValue);
});

watch(retriveCount, (newValue) => {
    store.dispatch('rag/updateRetriveCount', newValue);
    console.log("updateRetriveCount changed:", newValue);
});

watch(fusionCount, (newValue) => {
    store.dispatch('rag/updateFusionCount', newValue);
    console.log("updateFusionCount changed:", newValue);
});

watch(rerankCount, (newValue) => {
    store.dispatch('rag/updateRerankCount', newValue);
    console.log("updateRerankCount changed:", newValue);
});

watch(rerankValue, (newValue) => {
    // store.dispatch('rag/updateRerankModelName', newValue);
    console.log("updateRerankModelName changed:", newValue);
});

watch(multiModalValue, (newValue) => {
    // store.dispatch('rag/updateMultiModalName', newValue);
    console.log("updateMultiModalName changed:", newValue);
});

</script>

<style scoped>
.rag-config-container {
    background-color: white;
    display: flex;
    flex-direction: column;
    /* padding: 20px; */
    width: 22%;
    padding: 10px;
}

.bg-grey {
    background-color: var(--chat-background-color);
    padding: 8px 10px 8px 10px;
    border-radius: 8px;
    margin-top: 14px;
}

.rag-config-header {
    font-weight: bold;
    display: flex;
    margin-left: 2px;
    margin-bottom: 12px;
}

.chat-setting-container {
    display: flex;
    flex-direction: column;
    margin-top: 0;
}

.container-setting-content {
    display: flex;
    flex-direction: column;
}

.retrive-setting-container {
    display: flex;
    flex-direction: column;
}

.rerank-setting-wrap {
    display: flex;
    flex-direction: column;
}

.container-header {
    color: black;
    margin-bottom: 20px;
    cursor: pointer;
}

.expand-detail-process,
.multi-turn-chat {
    margin-bottom: 0;
}

.switch-hint {
    margin-left: 8px;
    font-size: 14px;
}

.slider-demo-block {
    display: flex;
    flex-direction: column;
    align-items: self-start;
    margin-bottom: 20px;
}

.demonstration {
    width: 100%;
    font-size: 14px;
    color: black;
    display: flex;
    margin-bottom: 4px;
}

.setting-item-wrap {
    margin-bottom: 10px;
}

.tooltip {
    margin-left: 14px;
    /* 设置tooltip的左边距 */
}

.slider {
    size: "small"
}
</style>