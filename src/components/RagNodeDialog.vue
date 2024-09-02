<template>
    <div>
        <div class="dialog-content">
            <div v-if="dialogNode.image_base64" class="image-container">
                <img :src="'data:image/jpeg;base64,' + dialogNode.image_base64" alt="节点图片" @click="showFullImage"
                    class="node-image">
            </div>
            <div class="content-header">
                <div class="content-header-flag">
                    <div class="info-item">
                        <span class="info-label"><strong>文件类型：</strong></span>
                        <span class="info-value">{{ dialogNode.file_type }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label score"><strong>相似分:</strong></span>
                        <span class="info-value score">{{ parseFloat(dialogNode.score).toFixed(2) }}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label"><strong>字符数：</strong></span>
                        <span class="info-value">{{ dialogNode.text.length }}</span>
                    </div>
                </div>
                <hr class="divider">
            </div>

            <div class="content-text" v-html="marked(dialogNode.text)"></div>

            <div class="content-footer">
                <hr class="divider">
                <div class="info-item ">
                    <span class="info-label"><strong>文件路径：</strong></span>
                    <span class="info-value">{{ dialogNode.file_path }}</span>
                </div>
                <div class="info-item">
                    <span class="info-label"><strong>节点ID：</strong></span>
                    <span class="info-value">{{ dialogNode.node_id }}</span>
                </div>
            </div>
        </div>

        <el-dialog v-model="showFullImageDialog" :append-to-body="true" width="80%">
            <img :src="'data:image/jpeg;base64,' + dialogNode.image_base64" alt="大图" style="width: 100%;">
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import type { RagChunkNode } from "@/store/RagItem";
import { marked } from 'marked';
import { defineProps, ref } from 'vue';

const props = defineProps<{
    dialogNode: RagChunkNode;
}>();

const showFullImageDialog = ref(false);

const showFullImage = () => {
    showFullImageDialog.value = true;
};
</script>

<style scoped>
.dialog-content {
    padding: 30px 10px 10px 10px;
    max-height: 70vh;
    overflow-y: auto;
    font-size: 16px;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
}

.image-container {
    margin-bottom: 20px;
    text-align: center;
}

.node-image {
    max-width: 100%;
    max-height: 300px;
    cursor: pointer;
}

.content-header {
    display: flex;
    flex-direction: column;
}

.content-header-flag {
    display: flex;
    justify-content: space-between;
}

.content-footer {
    display: flex;
    flex-direction: column;
    margin-bottom: 10px;
}

.content-text {
    margin: 10px 0;
}

.divider {
    height: 1px;
    background-color: #e0e0e0;
    border: none;
    margin: 10px 0;
}

.info-item {
    display: flex;
    align-items: center;
    margin-bottom: 5px;
}


.info-label {
    font-weight: bold;
    margin-right: 5px;
}

.info-value {
    color: #606266;
}

.score {
    color: var(--primary-color);
    font-weight: bold;
}
</style>