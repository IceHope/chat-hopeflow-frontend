<template>
    <div class="rag-config-container">
        <div class="rag-config-header"><span>RAG设置</span></div>
        <div class="chat-setting-container bg-grey">
            <div class="container-header-chat">
                <span>对话设置</span>
            </div>
            <div class="expand-detail-process">
                <el-checkbox v-model="isExpandDetailProcess" label="是否展开详细的检索过程" size="large" />
            </div>
            <div class="multi-turn-chat">
                <el-checkbox v-model="multiTurnChatEnabled" label="是否开启多轮对话" size="large" />
            </div>
        </div>
        <div class="retrive-setting-container bg-grey">
            <div class="container-header">
                <span>召回设置</span>
            </div>
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
                <el-slider class="slider" v-model="rerankCount" show-input :min="1" :max="10" :show-tooltip="false" />
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
                <el-slider v-model="retriveCount" show-input :min="1" :max="20" :show-tooltip="false" />
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
                <el-slider v-model="fusionCount" show-input :max="10" :show-tooltip="false" />
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

</script>

<style scoped>
.rag-config-container {
    background-color: white;
    display: flex;
    flex-direction: column;
    /* padding: 20px; */
    width: 25%;
    padding-top: 10px;
}

.rag-config-header {
    font-weight: bold;
    display: flex;
    margin-left: 14px;
    margin-bottom: 14px;
}

.chat-setting-container {
    display: flex;
    flex-direction: column;
}

.retrive-setting-container {
    margin-top: 30px;
    display: flex;
    flex-direction: column;
}

.bg-grey {
    background-color: var(--chat-background-color);
    padding: 10px 20px 10px 20px
}

.container-header {
    color: black;
    margin-bottom: 20px;
}

.container-header-chat {
    color: black;
    margin-bottom: 10px;
}

.expand-detail-process,
.multi-turn-chat {
    margin-bottom: 0;
}

.slider-demo-block {
    display: flex;
    flex-direction: column;
    align-items: self-start;
    margin-bottom: 20px;
}

.slider-demo-block .demonstration {
    width: 100%;
    font-size: 16px;
    color: black;
    display: flex;
}

.tooltip {
    margin-left: 14px;
    /* 设置tooltip的左边距 */
}
</style>