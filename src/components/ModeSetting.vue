<template>
    <div class="mode-setting">
        <div class="mode-setting-header">
            <div v-if="selectedModel" class="price-info">
                <el-descriptions direction="vertical" :column="3" border>
                    <el-descriptions-item label="价格 ¥" label-class-name="my-label">1M tokens</el-descriptions-item>
                    <el-descriptions-item label="输入" label-class-name="my-label">{{
                        inputPrice
                    }}</el-descriptions-item>
                    <el-descriptions-item label="输出" label-class-name="my-label">{{
                        outputPrice
                    }}</el-descriptions-item>
                </el-descriptions>
            </div>
            <span class="mode-setting-header-model">大语言模型</span>
        </div>
        <div class="mode-setting-content">
            <el-select v-model="selectedType" @change="handleTypeChange" class="custom-select"
                popper-class="custom-popper" size="large">
                <el-option v-for="item in chatTypes" :key="item.type" :label="`${item.type} - ${item.desc}`"
                    :value="item.type"></el-option>
            </el-select>

            <el-select v-model="selectedModel" @change="handleModelChange" class="custom-select"
                popper-class="custom-popper" size="large">
                <el-option v-for="model in filteredModels" :key="model.name" :label="model.name"
                    :value="model.name"></el-option>
            </el-select>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { API_CONFIG } from "@/store/config";
import { ElMessage } from "element-plus";
import "element-plus/dist/index.css"; // 导入 Element Plus 样式
import { onMounted, ref, watch } from "vue";
import { useStore } from "vuex";

const store = useStore();

const chatModelUrl = `${API_CONFIG.rootUrl}/chat/modes`;

interface ChatType {
    type: string;
    desc: string;
    names: Model[];
}

interface Model {
    name: string;
    input_price: number;
    output_price: number;
}

const selectedType = ref<string>("");
const selectedModel = ref<string>("");
const chatTypes = ref<ChatType[]>([]);
const filteredModels = ref<Model[]>([]);
const inputPrice = ref<number>(0);
const outputPrice = ref<number>(0);

const fetchChatTypes = async () => {
    try {
        const response = await fetch(chatModelUrl);
        if (!response.ok) {
            ElMessage("Failed to fetch chat types");
            throw new Error("Failed to fetch chat types");
        }
        const data = await response.json();
        chatTypes.value = data.models;
        if (chatTypes.value.length > 0) {
            selectedType.value = chatTypes.value[0].type;
            filteredModels.value = chatTypes.value[0].names;
            if (filteredModels.value.length > 0) {
                selectedModel.value = filteredModels.value[0].name;
                inputPrice.value = filteredModels.value[0].input_price;
                outputPrice.value = filteredModels.value[0].output_price;
            }
        } else {
            ElMessage("No chat types found");
        }
    } catch (error) {
        console.error("Error fetching chat types:", error);
        ElMessage("Error fetching chat types:");
    }
};

const handleTypeChange = () => {
    console.log("selectedType changed click:", selectedType.value);
    const selectedTypeItem = chatTypes.value.find(
        (item) => item.type === selectedType.value
    );
    if (selectedTypeItem) {
        filteredModels.value = selectedTypeItem.names;
        if (filteredModels.value.length > 0) {
            selectedModel.value = filteredModels.value[0].name;
            inputPrice.value = filteredModels.value[0].input_price;
            outputPrice.value = filteredModels.value[0].output_price;
        } else {
            selectedModel.value = "";
            inputPrice.value = 0;
            outputPrice.value = 0;
        }
    }
};

const handleModelChange = () => {
    console.log("selectedModel changed click:", selectedModel.value);
    const selectedModelItem = filteredModels.value.find(
        (model) => model.name === selectedModel.value
    );
    if (selectedModelItem) {
        inputPrice.value = selectedModelItem.input_price;
        outputPrice.value = selectedModelItem.output_price;
    }
};

onMounted(() => {
    fetchChatTypes();
});

watch(selectedType, (newType) => {
    store.dispatch('llmChat/updateType', newType);
    console.log("selectedType changed:", newType);
});

watch(selectedModel, (newModel) => {
    store.dispatch("llmChat/updateModel", newModel);
    console.log("selectedModel changed:", newModel);
});
</script>

<style scoped>
.mode-setting {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 30px;
    background-color: var(--background-color);
    box-sizing: border-box;
    overflow: hidden;
}

.mode-setting-header-model {
    font-size: 30px;
}

.mode-setting-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 20px;
    flex-wrap: wrap;
}

:deep(.my-label) {
    background: var(--chat-user-backgroud-color) !important;
}

.price-info {
    display: flex;
    align-items: flex-start;
}

.mode-setting-content {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    width: 100%;
}

.custom-select {
    max-width: 45%;
}

.custom-popper .el-select-dropdown__item {
    font-size: 16px;
    /* Font size for dropdown items */
    background-color: white;
    /* Background color */
    color: #333;
    /* Text color */
    height: 40px;
    /* Height for dropdown items */
    display: flex;
    align-items: center;
}

.custom-popper .el-select-dropdown__item:hover {
    background-color: var(--background-color);
    /* Background color on hover */
}
</style>
