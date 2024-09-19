<template>
    <div class="grid-cards">
        <div v-for="(card, index) in cards" :key="index" class="card" @click="navigateToCardDetail(card)">
            <span class="title">{{ card.title }}</span>
            <span class="desc">{{ card.desc }}</span>
            <div class="bottom">
                <div class="tool-wrap">
                    <img src="@/assets/agent-llm-icon.png" class="icon-llm">
                    <span class="tool-count-text">×{{ card.node_count }}</span>
                </div>
                <span class="frame">{{ card.frame }}</span>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { API_URL } from '@/constants/api_url';
import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface Card {
    item_id: string
    title: string
    desc: string
    frame: string
    node_count: number
    flow_desc: string
}

const router = useRouter();
const cards = ref<Card[]>([]);

const fetchCards = async () => {
    try {
        const response = await fetch(API_URL.queryAgentListUrl);
        console.log("agentList", response)
        if (!response.ok) {
            throw new Error('网络响应不正常');
        }
        const data = await response.json();
        cards.value = data;
    } catch (error) {
        console.error('获取卡片数据失败:', error);
        ElMessage.error('获取卡片数据失败:' + error)
    }
};

onMounted(() => {
    fetchCards();
});

const navigateToCardDetail = (card: Card) => {
    router.push({ name: card.item_id, params: { flow_desc: card.flow_desc, title: card.title } });
};
</script>

<style scoped>
.grid-cards {
    padding: 20px;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 每行3列 */
    gap: 18px;
    /* 卡片之间的间距 */
}

.card {
    display: flex;
    flex-direction: column;
    background-color: white;
    padding: 14px;
    cursor: pointer;
    border-radius: 20px;
}

.card:hover {
    background-color: var(--chat-background-color-hover);
    /* 白色稍微偏灰色一些 */
}

.title {
    font-weight: bold;
}

.desc {
    margin-top: 20px;
    color: var(--primary-text-ccolor);
}

.bottom {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
}

.tool-wrap {
    display: flex;
}

.icon-llm {
    width: 24px;
    height: 24px;
}

.tool-count-text {
    margin-left: 20px;
    color: var(--primary-text-ccolor);
}
</style>
<!-- End of Selection -->