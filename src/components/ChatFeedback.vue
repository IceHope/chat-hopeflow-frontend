<template>
    <div class="message-bot-feedback">
        <img :src="getIconSrc('like')" class="feedback-icon" @click="toggleIcon('like')" :alt="icons.like.alt" />
        <img :src="getIconSrc('notLike')" class="feedback-icon" @click="toggleIcon('notLike')"
            :alt="icons.notLike.alt" />
        <img :src="getIconSrc('copy')" class="feedback-icon" @click="toggleIcon('copy')" :alt="icons.copy.alt" />
        <img :src="getIconSrc('refresh')" class="feedback-icon" @click="toggleIcon('refresh')"
            :alt="icons.refresh.alt" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
// 导入 SVG 图标
import copyNormalIcon from '@/assets/copy-normal-icon.svg';
import copySelectIcon from '@/assets/copy-select-icon.svg';
import likeNormalIcon from '@/assets/like-normal-icon.svg';
import likeSelectIcon from '@/assets/like-select-icon.svg';
import notLikeNormalIcon from '@/assets/not-like-normal-icon.svg';
import notLikeSelectIcon from '@/assets/not-like-select-icon.svg';
import refreshNormalIcon from '@/assets/refresh-normal-icon.svg';
import refreshSelectIcon from '@/assets/refresh-select-icon.svg';

import { defineEmits } from 'vue';

const emit = defineEmits(['like', 'notLike', 'copy', 'refresh']);

// 更新后的图标路径，包括正常状态和选中状态的路径
const icons = {
    like: {
        src: likeNormalIcon,
        activeSrc: likeSelectIcon,
        alt: 'Like'
    },
    notLike: {
        src: notLikeNormalIcon,
        activeSrc: notLikeSelectIcon,
        alt: 'Not Like'
    },
    copy: {
        src: copyNormalIcon,
        activeSrc: copySelectIcon,
        alt: 'Copy'
    },
    refresh: {
        src: refreshNormalIcon,
        activeSrc: refreshSelectIcon,
        alt: 'Refresh'
    }
};

// 状态控制，是否为活跃状态
const activeIcons = ref({});

// 根据状态切换图标
const getIconSrc = (key) => {
    return activeIcons.value[key] ? icons[key].activeSrc : icons[key].src;
};

// 切换图标状态
const toggleIcon = (key) => {
    activeIcons.value[key] = !activeIcons.value[key];

    emit(key, { message: `feedback from ${key}` });
};
</script>

<style scoped>
.feedback-icon {
    margin-top: 5px;
    margin-right: 5px;
    width: 24px;
    height: 24px;
    cursor: pointer;
    padding: 5px;
    border-radius: 20%;
    /* To create a circular background */
}

.feedback-icon:hover {
    opacity: 0.7;
    background-color: rgba(0, 0, 0, 0.1);
    /* Change to your desired color */
}

.feedback-icon:active {
    transform: scale(0.9);
    background-color: rgba(0, 0, 0, 0.2);
    /* Slightly darker on click */
}
</style>
