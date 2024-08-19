<template>
    <div :class="['message', message.type]">
        <div class="message-photo-wrap">
            <img v-if="message.type === 'bot' || message.type === 'user'" :src="messagePhoto" class="message-photo" />
        </div>
        <div class="message-main-content">
            <div v-if="message.type === 'user'">
                <span class="message-content message-user-content" v-if="message.text"
                    v-html="parseMarkdown(message.text)"></span>
            </div>

            <div v-if="message.imageUrl" class="message-user-uploaded-image-wrapper">
                <img :src="message.imageUrl" alt="User uploaded image" class="message-user-uploaded-image"
                    @click="enlargeImage(message.imageUrl)" />
            </div>

            <div v-if="message.type === 'bot'" class="message-bot-content-wrap">
                <div class="message-bot-model">
                    <span>{{ botModel }}</span>
                </div>
                <div class="message-content message-bot-content">
                    <span v-if="message.text" v-html="renderedMarkdown"></span>
                </div>

                <div v-if="showFeedback">
                    <ChatFeedback @like="handleLike" @not-like="handleNotLike" @copy="handleCopy"
                        @refresh="handleRefresh"></ChatFeedback>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import "@/style/chat-message.css";
import hljs from "highlight.js";
import "highlight.js/styles/monokai-sublime.css"; // 引入 monokai 主题样式
import MarkdownIt from "markdown-it";
import { marked } from "marked";
import { computed } from "vue";
import ChatFeedback from "./ChatFeedback.vue";

interface Message {
    type: "user" | "bot";
    text?: string;
    imageUrl?: string;
    model?: string;
}

interface Props {
    message: Message;
    showFeedback: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(["refresh"]);

// 动态导入图片
const userPhoto = new URL("@/assets/happy_boy.jpg", import.meta.url).href;
const botPhoto = new URL("@/assets/girl.jpg", import.meta.url).href;
const userImgPhoto = new URL("@/assets/photo-blank.png", import.meta.url).href;

// 处理事件
const handleLike = (data: any) => {
    console.log("Like event received with data:", data);
};

const handleNotLike = (data: any) => {
    console.log("Not Like event received with data:", data);
};

const handleCopy = async () => {
    try {
        const data = props.message.text;
        if (data) {
            await navigator.clipboard.writeText(data);
            console.log("Text copied to clipboard:", data);
        } else {
            console.error("No message to copy");
        }
    } catch (error) {
        console.error("Failed to copy text to clipboard:", error);
    }
};

const handleRefresh = (data: any) => {
    console.log("Refresh event received with data:", data);
    console.log("Refresh event received with message:", data["message"]);
    emit("refresh", { message: props.message.text });
};

// Markdown 解析
const parseMarkdown = (text: string) => {
    return marked(text);
};

// 创建一个 MarkdownIt 实例，并配置代码高亮
const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str: string, lang: string) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre><code class="hljs ${lang}">${hljs.highlight(
                    str,
                    { language: lang, ignoreIllegals: true }
                ).value}</code></pre>`;
            } catch (err) {
                console.error(err);
            }
        }
        return `<pre><code class="hljs">${md.utils.escapeHtml(
            str
        )}</code></pre>`;
    },
});

// 计算属性
const messagePhoto = computed(() => {
    if (props.message.type === "user") {
        return userPhoto;
    } else if (props.message.type === "bot") {
        return botPhoto;
    }
    return userImgPhoto;
});

const botModel = computed(() => {
    return props.message.model;
});

const renderedMarkdown = computed(() => {
    return md.render(props.message.text || "");
});


const enlargeImage = (imageUrl: string) => {
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(123, 123, 124, 0.8)';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    modal.style.cursor = 'pointer';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '60%';
    img.style.height = 'auto';
    img.style.borderRadius = '10px';

    const closeButton = document.createElement('div');
    closeButton.textContent = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '30px';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '1001';
    closeButton.style.width = '40px';
    closeButton.style.height = '40px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';

    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    });

    modal.appendChild(img);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    const closeModal = () => {
        document.body.removeChild(modal);
    };

    modal.addEventListener('click', closeModal);
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        closeModal();
    });

    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });
};
</script>

<style scoped>
.code-block-container {
    position: relative;
    margin-top: 20px;
    /* 在代码块上方增加空间 */
}
</style>
