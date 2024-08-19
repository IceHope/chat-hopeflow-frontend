<template>
    <div class="grid-cards">
        <div v-for="(card, index) in cards" :key="index" class="card" @click="navigateToCardDetail(card.title)">
            <p>{{ card.title }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

interface Card {
    id: number;
    title: string;
}

const router = useRouter();

const cards: Card[] = [
    { id: 1, title: 'agent_translate' },
    { id: 2, title: 'agent_storyline' },
    { id: 3, title: 'agent_translate' },
    { id: 4, title: 'agent_translate' },
    { id: 5, title: 'agent_translate' },
    { id: 6, title: 'agent_translate' },
];

const navigateToCardDetail = (cardTitle: string) => {
    router.push({ name: cardTitle });
};
</script>

<style scoped>
.grid-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    /* 每行3列 */
    gap: 20px;
    /* 卡片之间的间距 */
}

.card {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    padding: 20px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.card:hover {
    background-color: #e0e0e0;
}
</style>