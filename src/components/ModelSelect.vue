<template>
    <div class="model-select-root">
        <div class="model-search-wrap">
            <input type="text" v-model="searchQuery" class="search-input" placeholder="Search..."
                @input="handleSearch" />
        </div>
        <div class="model-schema-item-holder">
            <div class="model-schema-item" v-for="(item, index) in filteredModelList" :key="index">
                <div class="item-title-holder">
                    <span class="title-desc">{{ item.desc }}</span>
                    <span class="title-price">Price</span>
                </div>
                <div class="name-holder">
                    <div v-for="(innerItem, innerIndex) in item.names" :key="innerIndex" class="name-item"
                        @click="handleSelectItem(item, innerItem)">
                        <span class="name">{{ innerItem.name }}</span>
                        <span class="price">{{ innerItem.input_price }}/{{ innerItem.output_price }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ModelNameSchema, ModelSchema } from '@/interface/model_schema';
import type { PropType } from 'vue';
import { computed, defineEmits, ref } from 'vue';

export interface SelectModelItem {
    model_item: ModelSchema
    model_name_item: ModelNameSchema
}

const props = defineProps({
    modelList: {
        type: Array as PropType<ModelSchema[]>,
        required: true,
    },
});

const emit = defineEmits(['selectModelItem']);

const searchQuery = ref('');  // 搜索框绑定的数据

// 处理选中项的逻辑
const handleSelectItem = (item: ModelSchema, innerItem: ModelNameSchema) => {
    const selectedData: SelectModelItem = {
        model_item: item,
        model_name_item: innerItem
    };
    emit('selectModelItem', selectedData);
};

// 处理搜索输入
const handleSearch = () => {
    // 输入时触发搜索
};

// 使用计算属性来动态过滤列表
const filteredModelList = computed(() => {
    if (!searchQuery.value) {
        return props.modelList;
    }
    const query = searchQuery.value.toLowerCase();
    return props.modelList.filter(item => {
        // 过滤 `desc` 或 `innerItem.name` 匹配到关键字的项目
        const nameMatches = item.names.some(innerItem => innerItem.name.toLowerCase().includes(query));
        const descMatches = [item.desc, item.owner_type].some(field => field.toLowerCase().includes(query));
        return descMatches || nameMatches;
    });
});

</script>

<style scoped>
.model-select-root {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 260px;
    background-color: white;
    overflow: hidden;
    padding-top: 10px;
}

.model-search-wrap {
    padding-left: 10px;
}

.search-input {
    padding: 6px 10px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: calc(100% - 20px);
    box-sizing: border-box;
}

.model-schema-item-holder {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #bbb #f9f9f9;
}

.model-schema-item-holder::-webkit-scrollbar {
    width: 8px;
}

.model-schema-item-holder::-webkit-scrollbar-track {
    background: #f9f9f9;
}

.model-schema-item-holder::-webkit-scrollbar-thumb {
    background-color: #bbb;
    border-radius: 10px;
    border: 2px solid #f9f9f9;
}

.model-schema-item-holder::-webkit-scrollbar-thumb:hover {
    background-color: #aaa;
}

.model-schema-item {
    display: flex;
    width: 100%;
    flex-direction: column;
    margin-bottom: 16px;
}

.item-title-holder {
    display: flex;
    justify-content: space-between;
    padding: 0 10px;
    color: var(--primary-color);
    margin-bottom: 10px;
}

.name-holder {
    display: flex;
    flex-direction: column;
}

.name-item {
    padding: 6px 10px;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
}

.name-item:hover {
    background-color: var(--chat-background-color-hover);
}
</style>
