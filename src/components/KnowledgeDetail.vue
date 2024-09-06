<template>
    <div class="knowledge-detail">
        <div class="title">
            <h1>{{ file_title_header }}</h1>
        </div>
        <div class="search-container">
            <el-input v-model="searchKeyword" placeholder="关键字搜索" prefix-icon="el-icon-search" @input="filterItems"
                class="search-input" :disabled="isLoading"></el-input>
            <el-input v-model="vectorSearchKeyword" placeholder="向量检索" @keyup.enter="performVectorSearch"
                class="vector-search-input" :disabled="isLoading"></el-input>
            <el-select v-model="selectedFileType" placeholder="选择文件类型" @change="filterItems" class="file-type-select"
                :disabled="isLoading">
                <el-option label="全部" value=""></el-option>
                <el-option v-for="type in fileTypes" :key="type" :label="type" :value="type"></el-option>
            </el-select>
        </div>
        <div class="content-container">
            <div class="grid-container-wrapper">
                <el-loading v-if="isLoading" :fullscreen="false" text="正在加载..."></el-loading>
                <div class="grid-container">
                    <div v-for="(item, index) in filteredKnowledgeItems" :key="index" class="grid-item"
                        @click="showItemDetails(item)">
                        <div class="item-header">
                            <span class="item-number">#{{ String(index + 1).padStart(3, '0') }}</span>
                            <span class="item-file-type">{{ item.file_type }}</span>
                            <span class="item-size">{{ item.text.length }}字符</span>
                        </div>
                        <div v-if="item.score && item.score !== '0'" class="item-score">Score: {{
                            parseFloat(String(item.score)).toFixed(2) }}</div>
                        <div class="item-content-wrap">
                            <div class="item-content">{{ item.text }}</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="summary-container" v-if="parsedFileData">
                <h3>文件信息</h3>
                <hr class="divider">
                <div class="file-info-menu">
                    <div class="menu-item">
                        <span class="menu-label">文件路径:</span>
                        <span class="menu-value"><br>{{ parsedFileData.file_path }}</span>
                    </div>
                    <div class="menu-item">
                        <span class="menu-label">文件名称:</span>
                        <span class="menu-value">{{ parsedFileData.file_title }}</span>
                    </div>
                    <div class="menu-item">
                        <span class="menu-label">文件大小:</span>
                        <span class="menu-value">{{ parsedFileData.file_size }}</span>
                    </div>
                    <div class="menu-item">
                        <span class="menu-label">创建日期:</span>
                        <span class="menu-value">{{ formatDate(parsedFileData.created_at) }}</span>
                    </div>
                    <div class="menu-item">
                        <span class="menu-label">修改日期:</span>
                        <span class="menu-value">{{ formatDate(parsedFileData.updated_at) }}</span>
                    </div>
                </div>
                <h3 class="tech-params">技术参数</h3>
                <hr class="divider">
                <div class="file-info-menu">
                    <div class="menu-item">
                        <span class="menu-label">chunk_size:</span>
                        <span class="menu-value">{{ parsedFileData.chunk_size }}</span>
                    </div>
                    <div class="menu-item">
                        <span class="menu-label">chunk_overlap:</span>
                        <span class="menu-value">{{ parsedFileData.chunk_overlap }}</span>
                    </div>
                </div>
            </div>
        </div>
        <el-dialog v-model="dialogVisible" title="详细内容" width="50%" height="70%">
            <RagNodeDialog :dialogNode="selectedItem"></RagNodeDialog>
        </el-dialog>

    </div>
</template>

<script setup lang="ts">
import { API_URL } from "@/constants/api_url";
import type { KnowledgeFileItem, RagChunkNode } from "@/interface/rag_item";
import { ElDialog, ElInput, ElLoading, ElOption, ElSelect } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import RagNodeDialog from "./RagNodeDialog.vue";

const route = useRoute();
const fileData = ref<KnowledgeFileItem | null>(null);
const file_title_header = ref<string>('');
const knowledgeItems = ref<RagChunkNode[]>([]);
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
const searchKeyword = ref('');
const vectorSearchKeyword = ref('');
const selectedFileType = ref('');
const filteredKnowledgeItems = ref<RagChunkNode[]>([]);
const parsedFileData = ref<KnowledgeFileItem | null>(null);
const fileTypes = ref<string[]>([]);
const isLoading = ref(false);

onMounted(() => {
    const fileDataParam = route.params.fileData as string;
    if (fileDataParam) {
        try {
            parsedFileData.value = JSON.parse(fileDataParam) as KnowledgeFileItem;
            console.log("parsedFileData: ", parsedFileData.value);
            fileData.value = parsedFileData.value;
            file_title_header.value = parsedFileData.value.file_title;
            if (parsedFileData.value.file_id) {
                fetchKnowledgeItems(parsedFileData.value.file_id);
            } else {
                console.error('文件ID不存在');
            }
        } catch (error) {
            console.error('解析文件数据失败:', error);
        }
    }
});

const fetchKnowledgeItems = async (fileId: string) => {
    isLoading.value = true;
    try {
        const response = await fetch(API_URL.knowledgeChunkByFileIdUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ file_id: fileId })
        });
        if (!response.ok) {
            throw new Error('获取知识条目失败');
        }
        const data = await response.json();
        knowledgeItems.value = data.map((item: RagChunkNode) => ({
            ...item,
            score: '0'
        }));
        filteredKnowledgeItems.value = knowledgeItems.value;
        fileTypes.value = [...new Set(knowledgeItems.value.map(item => item.file_type))];
    } catch (error) {
        console.error('获取知识条目失败:', error);
    } finally {
        isLoading.value = false;
    }
};

const showItemDetails = (item: RagChunkNode) => {
    selectedItem.value = item;
    dialogVisible.value = true;
};

const filterItems = () => {
    filteredKnowledgeItems.value = knowledgeItems.value.filter(item => {
        const matchesKeyword = item.text.toLowerCase().includes(searchKeyword.value.toLowerCase());
        const matchesFileType = selectedFileType.value === '' || item.file_type === selectedFileType.value;
        return matchesKeyword && matchesFileType;
    });
};

const performVectorSearch = async () => {
    if (vectorSearchKeyword.value.trim() === '') {
        filteredKnowledgeItems.value = knowledgeItems.value;
        return;
    }

    isLoading.value = true;

    try {
        const response = await fetch(API_URL.queryMatchChunkUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_id: parsedFileData.value?.file_id,
                query: vectorSearchKeyword.value
            })
        });

        if (!response.ok) {
            throw new Error('向量检索失败');
        }

        const data = await response.json();
        console.log("query_match_chunk: ", data);

        const matchedItems = new Map(data.map((item: any) => [item.node_id, item.score]));

        filteredKnowledgeItems.value = knowledgeItems.value
            .map(item => ({
                ...item,
                score: matchedItems.get(item.node_id) || ''
            }))
            .filter(item => item.score !== '')
            .sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
    } catch (error) {
        console.error('向量检索失败:', error);
    } finally {
        isLoading.value = false;
    }
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
};
</script>

<style scoped>
.knowledge-detail {
    background-color: white;
    padding: 20px 20px 40px;
    height: 100vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.title {
    margin-bottom: 20px;
}

.title h1 {
    font-size: 24px;
    color: #333;
    margin: 0;
}

.search-container {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 20px;
}

.search-input {
    width: 20%;
    margin-right: 10px;
}

.vector-search-input {
    width: 35%;
    margin-right: 10px;
}

.file-type-select {
    margin-left: 20px;
    width: 15%;
}

.content-container {
    display: flex;
    flex: 1;
    overflow: hidden;
    position: relative;
}

.grid-container-wrapper {
    width: 75%;
    overflow-y: auto;
    padding-right: 20px;
    padding-bottom: 40px;
    position: relative;
}

.grid-container {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
}

.summary-container {
    width: 25%;
    padding-left: 10px;
    border-left: 1px solid #e0e0e0;
}

.divider {
    height: 1px;
    background-color: #e0e0e0;
    border: none;
    margin: 10px 0;
}

.file-info-menu {
    margin-top: 10px;
}

.menu-item {
    font-size: 14px;
    margin-bottom: 15px;
}

.menu-label {
    margin-right: 10px;
    font-weight: bold;
}

.menu-value {
    display: inline-block;
    word-wrap: break-word;
    /* 自动换行 */
    word-break: break-all;
    /* 强制换行 */
    white-space: normal;
    /* 允许换行 */
    max-width: 100%;
    /* 限制最大宽度 */
}

.tech-params {
    font-size: 18px;
    margin-top: 20px;
    margin-bottom: 10px;
}

.grid-item {
    background-color: #F0F2F5;
    border-radius: 12px;
    padding: 15px;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    height: 180px;
    display: flex;
    flex-direction: column;
}

.grid-item:hover {
    background-color: #E6E8EB;
}

.grid-item:active {
    background-color: #D8DAE0;
}

.item-header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
}

.item-number {
    font-weight: bold;
    color: #4A4A4A;
}

.item-file-type {
    color: var(--primary-color);
}

.item-size {
    color: #909399;
}

.item-score {
    color: var(--primary-color);
    margin-bottom: 10px;
}

.item-content-wrap {
    max-height: 100%;
    margin-bottom: 10px;
}

.item-content {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 8;
    -webkit-box-orient: vertical;
    color: #606266;
    font-size: 0.9em;
}

.dialog-content {
    max-height: 70vh;
    overflow-y: auto;
    font-size: 16px;
    line-height: 1.5;
}

.content-wrapper {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20px;
}

.content-image {
    max-width: 200px;
    max-height: 200px;
    margin-right: 20px;
    object-fit: contain;
    cursor: pointer;
}

.content-text {
    flex: 1;
}

.content-footer {
    border-top: 1px solid #e0e0e0;
    padding-top: 10px;
    margin-top: 20px;
}

.file-path {
    font-size: 14px;
    color: #909399;
}

.large-image {
    max-width: 100%;
    max-height: 80vh;
    object-fit: contain;
}
</style>
