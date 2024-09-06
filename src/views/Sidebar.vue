<template>
    <div class="sidebar">
        <div class="sidebar-main-content">
            <div class="sidebar-header">
                <img class="sidebar-logo" src="@/assets/happy_boy.jpg">
                <span class="sidebar-title">HopeFlow</span>
            </div>
            <div class="menu-item-containr">
                <div v-for="item in menuItems" :key="item.routeName" class="menu-item"
                    :class="{ active: selectedItem === item.routeName, hovered: hoverItem === item.routeName }"
                    @click="navigate(item.routeName)" @mouseover="hoverItem = item.routeName"
                    @mouseleave="hoverItem = ''">
                    <div class="icon">{{ item.icon }}</div>
                    <span class="text">{{ item.text }}</span>
                </div>
            </div>
            <div class="sidebar-bottom">
                <el-popover placement="top-start" :width="160" trigger="hover">
                    <template #reference>
                        <div class="menu-user-container">
                            <div class="menu-user-photo-container">
                                <img src="@/assets/happy_boy.jpg" alt="User Photo" class="menu-user-photo" />
                            </div>
                            <div class="menu-user-name">
                                <span>{{ username }}</span>
                            </div>
                        </div>
                    </template>
                    <div class="popup-menu" :style="popupStyles">
                        <div class="popup-item" @click="goToProfile">个人资料</div>
                        <div class="popup-item" @click="logout">{{ loginFlag }}</div>
                    </div>
                </el-popover>
            </div>

        </div>
        <!-- 分割线 -->
        <div class="divider"></div>
    </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
const router = useRouter();
const store = useStore()

interface MenuItem {
    routeName: string;
    icon: string;
    text: string;
}


const hoverItem = ref('');
const selectedItem = ref('');
const popupPosition = ref({ top: 0, left: 0 });

const username = computed(() => store.state.user.name);

const loginFlag = computed(() => {
    return username.value ? '退出登录' : '登录';
});


const menuItems: MenuItem[] = [
    { routeName: 'chat', icon: '💬', text: '聊天' },
    { routeName: 'agent', icon: '🤖', text: '智能体' },
    { routeName: 'knowledge', icon: '📚', text: '知识库' },
    { routeName: 'rag', icon: '📚', text: '知识问答' },
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


const goToProfile = () => {
    // Navigate to profile page
};

const logout = () => {
    //已经登录状态,退出登录
    if (username.value) {
        console.log('Logging out...');
        ElMessage.info('用户已退出');
        localStorage.clear();
        store.dispatch('user/updateName', "");
    } else {
        console.log('to login');
        router.push({ name: 'login' });
    }
};

onMounted(() => {
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
    justify-content: space-between;
    background-color: white;
    height: 100%;
    padding-left: 12px;
}

.sidebar-main-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    color: black;
    align-items: stretch;
}

.sidebar-header {
    margin-left: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    display: flex;
    align-items: center;
}

.sidebar-logo {
    width: 40px;
    height: 40px;
    border-radius: 50%;
}

.sidebar-title {
    margin-left: 10px;
    font-size: 20px;
    font-weight: bold;
}

.sidebar-bottom {
    margin-top: auto;
}

.divider {
    width: 1px;
    /* 设置分割线的宽度 */
    background-color: var(--chat-background-color-hover);
    /* background-color: red; */
    /* 设置分割线的颜色 */
    height: 100%;
    /* 设置分割线的高度与父容器相同 */
}

.menu-item-containr {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    padding-right: 10px;
}

.menu-item {
    width: 88%;
    display: flex;
    align-items: flex-start;
    margin-top: 10px;
    padding: 8px 0 8px 10px;
    cursor: pointer;
    border-radius: 8px;
}

.menu-item:hover,
.menu-item.hovered,
.menu-item.active {
    background-color: var(--chat-background-color-hover);
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


.menu-user-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 90%;
    padding: 6px 6px 2px 6px;
    border-radius: 6px;
    cursor: pointer;
    box-sizing: border-box;
    margin-bottom: 16px;
}

.menu-user-container:hover {
    background-color: var(--chat-background-color-hover);
}


.menu-user-photo {
    width: 32px;
    height: 32px;
    border-radius: 50%;
}

.menu-user-name {
    margin-left: 8px;
    padding: 10px 10px 10px 10px;
    flex-grow: 1;
    text-align: left;
    color: black;
    border-radius: 8px
}

.popup-menu {
    display: flex;
    flex-direction: column;
}

.popup-item {
    margin-top: 6px;
    padding: 4px;
    color: black;
    cursor: pointer;
    border-radius: 6px
}

.popup-item:hover {
    background-color: var(--chat-background-color-hover);
}
</style>
