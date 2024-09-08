<template>
    <div class="knowledge-container">
        <div class="header">
            <h1>知识库</h1>
            <el-button type="primary" icon="el-icon-plus">新建知识库</el-button>
        </div>
        <div class="file-list-header">
            <span class="header-item">知识</span>
            <span class="header-item">大小</span>
            <span class="header-item">编辑时间</span>
            <span class="header-item">启用</span>
            <span class="header-item">操作</span>
        </div>
        <div class="file-list">
            <div v-for="(file, index) in sortedFiles" :key="file.id" class="file-item"
                :class="{ 'file-item-hover': hoveredItem === index }" @mouseover="hoveredItem = index"
                @mouseleave="hoveredItem = null" @click="selectFile(file)">
                <div class="file-info">
                    <div class="file-icon">
                        <el-icon>
                            <Document />
                        </el-icon>
                    </div>
                    <div class="file-details">
                        <div class="file-title">{{ file.file_title }}</div>
                        <div class="file-subtitle">{{ file.file_name }}</div>
                    </div>
                </div>
                <span class="file-size">{{ file.file_size }}</span>
                <span class="file-date">{{ file.updated_at }}</span>
                <el-switch v-model="file.enabled" class="file-switch" @click.stop />
                <div class="file-actions">
                    <el-dropdown trigger="click" @command="handleCommand($event, file)" @click.stop>
                        <el-button type="text" class="more-button">
                            <el-icon>
                                <MoreFilled />
                            </el-icon>
                        </el-button>
                        <template #dropdown>
                            <el-dropdown-menu>
                                <el-dropdown-item command="edit">编辑</el-dropdown-item>
                                <el-dropdown-item command="delete">删除</el-dropdown-item>
                            </el-dropdown-menu>
                        </template>
                    </el-dropdown>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { API_URL } from "@/constants/api_url";
import type { KnowledgeFileItem } from "@/interface/rag_item";
import { Document, MoreFilled } from '@element-plus/icons-vue';
import { ElButton, ElDropdown, ElDropdownItem, ElDropdownMenu, ElIcon, ElMessage, ElSwitch } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useStore } from 'vuex';
const store = useStore();
const request_knowledge_url = API_URL.knowledgeQueryAll;
const router = useRouter();

const files = ref<KnowledgeFileItem[]>([]);

const sortedFiles = computed(() => {
    return [...files.value].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
});

const hoveredItem = ref<number | null>(null);

function handleCommand(command: string, file: KnowledgeFileItem) {
    if (command === 'edit') {
        editFile(file);
    } else if (command === 'delete') {
        deleteFile(file);
    }
}

function editFile(file: KnowledgeFileItem) {
    console.log('编辑文件:', file);
}

function deleteFile(file: KnowledgeFileItem) {
    console.log('删除文件:', file);
}

function selectFile(file: KnowledgeFileItem) {
    console.log('选择文件:', file);
    router.push({
        name: 'knowledge_detail',
        params: { fileData: JSON.stringify(file) }
    });
}

function formatFileSize(bytes: number): string {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

function formatDate(timestamp: number): string {
    const date = new Date(timestamp * 1000); // 将秒转换为毫秒
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).replace(/\//g, '-');
}

onMounted(async () => {
    try {
        const response = await fetch(request_knowledge_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ user_name: localStorage.getItem('username'), })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`网络响应不正常: ${response.status} ${response.statusText}, 详情: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        files.value = data.map((item: any) => ({
            id: item.id,
            file_id: item.file_id,
            file_title: item.file_title,
            file_path: item.file_path,
            file_name: item.file_name,
            file_size: formatFileSize(item.file_size),
            chunk_size: item.chunk_size,
            chunk_overlap: item.chunk_overlap,
            updated_at: formatDate(item.updated_at),
            created_at: formatDate(item.created_at),
            enabled: true
        }));
    } catch (error) {
        console.error('获取知识库数据失败:', error);
        ElMessage.error('获取知识库数据失败:' + error)
    }
});
</script>

<style scoped>
.knowledge-container {
    padding: 24px;
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.file-list-header {
    display: flex;
    align-items: center;
    padding: 0 16px;
    margin-bottom: 12px;
    font-weight: bold;
    color: #606266;
}

.header-item {
    flex: 1;
}

.header-item:nth-child(1) {
    flex: 3;
    text-align: left;
}

.header-item:nth-child(2),
.header-item:nth-child(3) {
    flex: 0.7;
    text-align: left;
}

.header-item:nth-child(4) {
    flex: 0.5;
    text-align: left;
}

.header-item:nth-child(5) {
    flex: 0.5;
    text-align: right;
}

.file-list {
    display: flex;
    flex-direction: column;
}

.file-item {
    display: flex;
    align-items: center;
    padding: 20px 16px;
    background-color: var(--chat-background-color);
    border-top: 1px solid #DCDCDE;
    cursor: pointer;
}

.file-item:last-child {
    border-bottom: none;
}

.file-item-hover {
    background-color: var(--chat-background-color-hover);
}

.file-item:active {
    background-color: var(--chat-background-color-hover);
}

.file-info {
    display: flex;
    align-items: center;
    width: 55%;
}

.file-icon {
    margin-right: 16px;
    font-size: 24px;
    color: #409EFF;
    flex-shrink: 0;
}

.file-details {
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.file-title {
    font-weight: bold;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-subtitle {
    font-size: 0.9em;
    color: #606266;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.file-size,
.file-date {
    flex: 0.7;
    color: #909399;
    font-size: 0.9em;
    text-align: left;
}

.file-switch {
    flex: 0.5;
    text-align: center;
}

.file-actions {
    flex: 0.5;
    text-align: center;
}

.more-button {
    background-color: #f0f2f5;
    border-radius: 4px;
    padding: 6px;
}

.more-button:hover {
    background-color: #e6e8eb;
}

.more-button:active {
    background-color: #d9dce0;
}
</style>