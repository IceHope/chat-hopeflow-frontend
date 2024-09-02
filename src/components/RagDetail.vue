<template>
    <div class="rag-detail" v-if="props.ragEvent">
        <div class="header" @click="toggleTextSection" @mouseover="hoverIcon" @mouseleave="leaveIcon"
            :class="{ 'hovered': isHovered }">
            <span class="header-text">{{ props.ragEvent.current_event_desc }}</span>
            <el-icon>
                <ArrowUp v-if="isTextSectionVisible" />
                <ArrowDown v-else />
            </el-icon>
        </div>
        <div class="content">
            <div v-if="isTextSectionVisible" class="text-section">
                <div v-if="props.ragEvent.retrieve_desc" class="text-item">
                    <el-icon v-if="!props.ragEvent.retrieve_time">
                        <Loading />
                    </el-icon>
                    <el-icon v-else>
                        <SuccessFilled />
                    </el-icon>
                    <span class="retrieve-desc">{{ props.ragEvent.retrieve_desc }}</span>
                    <span v-if="props.ragEvent.retrieve_time" class="retrieve-time">{{ props.ragEvent.retrieve_time
                        }}</span>
                </div>

                <div v-if="props.ragEvent.rerank_desc" class="text-item">
                    <el-icon v-if="!props.ragEvent.rerank_time">
                        <Loading />
                    </el-icon>
                    <el-icon v-else>
                        <SuccessFilled />
                    </el-icon>
                    <span class="rerank-desc">{{ props.ragEvent.rerank_desc }}</span>
                    <span v-if="props.ragEvent.rerank_time" class="rerank-time">{{ props.ragEvent.rerank_time
                        }}</span>
                </div>


                <div v-if="props.ragEvent.image_qa_desc" class="text-item">
                    <el-icon v-if="!props.ragEvent.image_qa_time">
                        <Loading />
                    </el-icon>
                    <el-icon v-else>
                        <SuccessFilled />
                    </el-icon>
                    <span class="image-qa">{{ props.ragEvent.image_qa_desc }}</span>
                    <span v-if="props.ragEvent.image_qa_time" class="image-qa-time">{{ props.ragEvent.image_qa_time
                        }}</span>
                </div>

                <div v-if="props.ragEvent.generate_response_desc" class="text-item">
                    <el-icon v-if="!props.ragEvent.generate_response_time">
                        <Loading />
                    </el-icon>
                    <el-icon v-else>
                        <SuccessFilled />
                    </el-icon>
                    <span class="generate-response-desc">{{ props.ragEvent.generate_response_desc }}</span>
                    <span v-if="props.ragEvent.generate_response_time" class="generate-response-time">{{
                        props.ragEvent.generate_response_time }}</span>
                </div>
            </div>
            <div class="grid-section">
                <div class="grid-item" v-for="(item, index) in props.ragChunkNodes" :key="index"
                    @click="showItemDetails(item)">
                    <div class="item-content-wrap">
                        <div class="item-content">{{ item.text }}</div>
                    </div>
                    <div class="item-bottom">
                        <span class="item-file-type">{{ item.file_type }}</span>
                        <div v-if="item.score" class="item-score">score: {{ parseFloat(item.score).toFixed(2) }}</div>
                    </div>
                </div>
            </div>
            <el-dialog v-model="dialogVisible" title="详细内容" width="50%" height="70%">
                <RagNodeDialog :dialogNode="selectedItem"></RagNodeDialog>
            </el-dialog>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { RagChunkNode, RagEvent } from "@/store/RagItem";
import { ArrowDown, ArrowUp, Loading, SuccessFilled } from '@element-plus/icons-vue';
import { defineProps, ref } from 'vue';
import RagNodeDialog from "./RagNodeDialog.vue";

import { useStore } from "vuex";

const store = useStore();

interface Props {
    ragChunkNodes: RagChunkNode[];
    ragEvent: RagEvent | null;
}

const props = defineProps<Props>();
const isTextSectionVisible = ref(store.state.rag.isExpandDetailProcess);

const isHovered = ref(false);
const dialogVisible = ref(false);
const selectedItem = ref<RagChunkNode>({
    score: '',
    file_id: '',
    node_id: '',
    text: '',
    file_type: '',
    file_path: '',
    file_name: '',
    image_base64: ''
});

const toggleTextSection = () => {
    isTextSectionVisible.value = !isTextSectionVisible.value;
};

const hoverIcon = () => {
    isHovered.value = true;
};

const leaveIcon = () => {
    isHovered.value = false;
};

const showItemDetails = (item: RagChunkNode) => {
    selectedItem.value = item;
    dialogVisible.value = true;
};
</script>

<style scoped>
.rag-detail {
    padding: 16px 0 16px 0;
    background-color: white;
}

.header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    cursor: pointer;
}

.header-text {
    margin-left: 6px;
    margin-right: 10px;
    font-size: 18px;
    color: #606266;
}

.content {
    margin-top: 8px;
}

.text-section {
    margin-top: 10px;
    background-color: var(--chat-background-color);
    border-radius: 8px;
    padding-left: 15px;
    padding-top: 2px;
    padding-bottom: 6px;
}

.text-item {
    color: #606266;
    display: flex;
    align-items: center;
    margin-top: 10px;
}

.text-item span {
    margin-left: 10px;
}

.grid-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-top: 16px;
}

.grid-item {
    background-color: var(--chat-background-color);
    border-radius: 12px;
    padding: 14px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 130px;
    display: flex;
    flex-direction: column;
}

.grid-item:hover {
    background-color: #E6E8EB;
}

.grid-item:active {
    background-color: #D8DAE0;
}

.item-bottom {
    display: flex;
    justify-content: space-between;
}

.item-file-type {
    color: #909399;
    font-size: 0.9em;
}

.item-score {
    color: black;
    font-weight: bold;
    font-size: 0.9em;
}

.item-content-wrap {
    max-height: 100%;
    margin-bottom: 20px;
}

.item-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    color: #606266;
    font-size: 0.9em;
}
</style>
