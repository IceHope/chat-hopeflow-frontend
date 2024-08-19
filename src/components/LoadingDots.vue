<template>
    <div class="loading-container">
        <div class="dot" v-for="(dot, index) in 3" :key="index" :style="{ animationDelay: `${index * 0.3}s` }"></div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.loading-container {
    display: flex;
    justify-content: left;
    align-items: center;
    gap: 8px;
}

.dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: #3498db;
    /* 初始颜色 */
    animation: dot-blink 1.5s infinite;
}

.dot:nth-child(2) {
    animation-delay: 0.3s;
}

.dot:nth-child(3) {
    animation-delay: 0.6s;
}

@keyframes dot-blink {

    0%,
    100% {
        opacity: 1;
        background-color: #3498db;
        /* 开始颜色 */
    }

    50% {
        opacity: 0.3;
        background-color: #e74c3c;
        /* 中间颜色 */
    }
}
</style>