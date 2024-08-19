<template>
    <el-col>
        <h2>Chat Hope</h2>
        <el-menu class="el-menu-vertical-demo">
            <el-menu-item @click="navigate('Chat')" index="chat" size="60">
                <el-icon>
                    <Reading />
                </el-icon>
                <span>Navigator Two</span>
            </el-menu-item>

            <el-menu-item index="bug">
                <el-icon :size="200" color="#5989F7">
                    <setting />
                </el-icon>
                <span>Navigator Four</span>
            </el-menu-item>
        </el-menu>
    </el-col>

</template>

<script lang="ts" setup>
import {
    Reading,
    Setting
} from '@element-plus/icons-vue';
import { useRouter } from 'vue-router'; // 引入 useRouter
const handleSelect = (key: string, keyPath: string[]) => {
    console.log("handleSelect", key, keyPath)
}
const router = useRouter(); // 获取 router 实例

const navigate = (routeName: string) => {
    // router.push({ name: routeName }); // 路由跳转
    console.log("navigate", routeName)
}

</script>

<style scoped></style>