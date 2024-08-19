<template>
    <div class="settings-sidebar" :class="{ active: isActive }">
        <div class="settings-content">
            <ModeSetting />
        </div>
        <div class="button-container">
            <button @click="closeSidebar">确定</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import ModeSetting from '@/components/ModeSetting.vue';

const props = defineProps({
    isActive: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['close']);

const closeSidebar = () => {
    emit('close');
};
</script>

<style scoped>
.settings-sidebar {
    position: fixed;
    top: 0;
    right: 0;
    width: 40%;
    height: 100vh;
    background: white;
    box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
    transform: translateX(100%);
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.settings-sidebar.active {
    transform: translateX(0);
}

.settings-content {
    padding: 20px 0px;
    flex: 1;
    overflow-y: auto;
}

.button-container {
    display: flex;
    justify-content: center;
    padding: 20px 0px;
}

.button-container button {
    width: 90%;
}
</style>
