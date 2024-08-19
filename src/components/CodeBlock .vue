<template>
    <div class="content">
        <div v-html="renderedContent" class="markdown-content"></div>
    </div>
</template>

<script setup>
import hljs from 'highlight.js';
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';

// 定义 props
const props = defineProps({
    content: String,
    language: String,
    type: {
        type: String,
        default: 'markdown',
    },
});

// 初始化 MarkdownIt
const markdown = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: (str, lang) => {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return `<pre class="code-block"><button class="copy-button" onclick="copyToClipboard('${encodeURIComponent(str)}')">复制</button><code class="hljs ${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
            } catch (err) {
                console.error(err);
            }
        }
        return `<pre class="code-block"><button class="copy-button" onclick="copyToClipboard('${encodeURIComponent(str)}')">复制</button><code class="hljs">${hljs.highlightAuto(str).value}</code></pre>`;
    },
});

// 计算属性，渲染 Markdown 内容
const renderedContent = computed(() => markdown.render(props.content));

// 复制代码块内容到剪贴板
const copyToClipboard = (code) => {
    navigator.clipboard.writeText(decodeURIComponent(code)).then(() => {
        alert('代码已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
    });
};
</script>

<style scoped>
/* Markdown 内容样式 */
.markdown-content {
    position: relative;
}

/* 代码块样式 */
.code-block {
    position: relative;
    margin: 1em 0;
    background-color: #2d2d2d;
    color: #fff;
    padding: 1em;
    border-radius: 4px;
    overflow-x: auto;
}

/* 复制按钮样式 */
.copy-button {
    position: absolute;
    top: 5px;
    right: 5px;
    background: #333;
    color: #fff;
    border: none;
    border-radius: 3px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 12px;
}

.copy-button:hover {
    background-color: #555;
}
</style>
