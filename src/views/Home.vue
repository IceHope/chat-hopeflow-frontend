<template>
    <div class="home">
        <h1>欢迎: {{ username }}</h1>
        <div>
            <LoadingDots />
        </div>
    </div>
</template>

<script setup lang="ts">
import LoadingDots from '@/components/LoadingDots.vue';
import { computed } from "vue";
import { useStore } from 'vuex';

const store = useStore();
const username = computed(() => store.getters.getUsername);
</script>

<style scoped>
.home {
    display: flex;
    justify-content: center;
    /* 水平居中 */
    align-items: center;
    /* 垂直居中 */
    width: 100vw;
    /* 确保容器宽度占满视口 */
    height: 100vh;
    /* 确保容器高度占满视口 */
    margin: 0;
    /* 移除默认边距 */
}

h1 {
    margin: 0;
    /* 移除标题的默认边距 */
}
</style>
