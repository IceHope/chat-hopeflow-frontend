<template>
    <div class="sidebar">
        <div class="menu-item-containr">
            <div v-for="item in menuItems" :key="item.routeName" class="menu-item"
                :class="{ active: selectedItem === item.routeName, hovered: hoverItem === item.routeName }"
                @click="navigate(item.routeName)" @mouseover="hoverItem = item.routeName" @mouseleave="hoverItem = ''">
                <div class="icon">{{ item.icon }}</div>
                <span class="text">{{ item.text }}</span>
            </div>
        </div>
        <div class="menu-user-container" @click="togglePopup" @mouseover="hover = true" @mouseleave="hover = false">
            <div class="menu-user-photo-container">
                <img src="@/assets/happy_boy.jpg" alt="User Photo" class="menu-user-photo" />
            </div>
            <div class="menu-user-name">
                <span>{{ username }}</span>
            </div>
        </div>

        <div v-if="showPopup" class="popup-menu" :style="popupStyles">
            <div class="popup-item" @click="goToProfile">个人资料</div>
            <div class="popup-item" @click="logout">{{ loginFlag }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';

interface MenuItem {
    routeName: string;
    icon: string;
    text: string;
}

const username = ref(localStorage.getItem('username') || '');
const router = useRouter();
const hoverItem = ref('');
const selectedItem = ref('');
const showPopup = ref(false);
const popupPosition = ref({ top: 0, left: 0 });
const hover = ref(false);
const loginFlag = ref('');
let menuUserContainer: HTMLElement | null = null;

const menuItems: MenuItem[] = [
    { routeName: 'chat', icon: '💬', text: '对话' },
    { routeName: 'rag', icon: '📚', text: 'RAG' },
    { routeName: 'agent', icon: '🤖', text: '智能体' },
    { routeName: 'knowledge', icon: '📚', text: '知识库' },
];

const navigate = (routeName: string) => {
    if (!localStorage.getItem('authToken')) {
        ElMessage.error('请先登录');
        router.push({ name: 'login' });
        return;
    }
    selectedItem.value = routeName;
    router.push({ name: routeName });
};

const togglePopup = (event: MouseEvent) => {
    if (localStorage.getItem('authToken')) {
        loginFlag.value = '退出登录';
    } else {
        loginFlag.value = '登录';
    }
    showPopup.value = !showPopup.value;
    if (menuUserContainer) {
        const rect = menuUserContainer.getBoundingClientRect();
        popupPosition.value = {
            top: rect.top + window.scrollY - 10 - 100, // Position above the menu-user-container
            left: rect.left + window.scrollX,
        };
    }
};

const goToProfile = () => {
    showPopup.value = false;
    // Navigate to profile page
};

const logout = () => {
    showPopup.value = false;
    //已经登录状态,退出登录
    if (localStorage.getItem('authToken')) {
        console.log('Logging out...');
        ElMessage.info('用户已退出');
        localStorage.clear();
    } else {
        console.log('to login');
        router.push({ name: 'login' });
    }
};

onMounted(() => {
    menuUserContainer = document.querySelector('.menu-user-container');
});

const popupStyles = computed(() => ({
    top: `${popupPosition.value.top}px`,
    left: `${popupPosition.value.left}px`,
}));
</script>

<style scoped>
/* ... (styles remain the same) ... */
</style>

<style scoped>
.sidebar {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding-right: 10px;
    background: linear-gradient(to bottom, #8E75F3, #568AF8);
    /* 从上到下的渐变 */
    color: #fff;
    /* 设置字体颜色为白色以便在渐变背景上清晰可见 */
    box-sizing: border-box;
}

.menu-item-containr {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
}

.menu-item {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    margin-left: 10px;
    margin-top: 10px;
    padding: 10px;
    cursor: pointer;
    width: 90%;
    border-radius: 8px;
}

.menu-item:hover,
.menu-item.hovered {
    background-color: #F1F2F3;
    color: black;
}

.menu-item.active {
    background-color: #F1F2F3;
    color: black;
}

.icon {
    margin-right: 10px;
    font-size: 20px;
    display: flex;
    align-items: center;
    width: 24px;
    height: 24px;
}

.text {
    font-size: 16px;
    display: flex;
    align-items: center;
}

.menu-item:active {
    transform: scale(0.95);
}

.menu-user-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    max-width: 100%;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    box-sizing: border-box;
    /* Ensure padding and border are included in the width */
}

.menu-user-container:hover {
    background-color: #F9F9F9;
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

.menu-user-container:active {
    transform: scale(0.98);
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.2);
}

.menu-user-photo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.menu-user-name {
    flex-grow: 1;
    text-align: left;
    padding-left: 10px;
    color: white;
    transition: color 0.3s;
}

.menu-user-container:hover .menu-user-name,
.menu-user-container:hover .menu-user-setting {
    color: black;
}

.popup-menu {
    position: absolute;
    /* Changed from fixed to absolute */
    background-color: white;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding: 10px;
    z-index: 1000;
}

.popup-item {
    color: black;
    padding: 8px 12px;
    cursor: pointer;
}

.popup-item:hover {
    background-color: #f1f2f3;
}
</style>