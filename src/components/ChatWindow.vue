<template>
    <div class="chat-window">
        <div class="chat-header" v-if="showHeader">
            <div class="toggle-container" v-if="showToggleContainer">
                <button class="btn-toggle" @click="toggleSidebar">{{ mode_name }}</button>
            </div>
            <div class="multi-turn-toggle" v-if="showMultiTurnToggle">
                <label>
                    <input type="checkbox" v-model="multiTurnChatEnabled">
                    支持多轮对话
                </label>
            </div>
        </div>

        <div class="chat-area" ref="chatArea">
            <ChatItemMessage v-for="(message, index) in messages" :key="index" :message="message"
                :showFeedback="showFeedback" :sourceBotType="sourceTypeValue" @refresh="handleRefresh" />

            <div v-if="isFollowQuestionVisible" class="chat-follow-questions-warp">
                <div v-for="(question, index) in questions" :key="index">
                    <span class="chat-follow-question" @click="handleQuestionClick(question)">{{ question }}</span>
                </div>
            </div>
            <div v-if="isFollowQuestionLoading" class="chat-follow-questions-loadding">
                <LoadingDots />
            </div>
        </div>
        <div class="input-area">
            <!-- 上传的图片容器 -->
            <div v-if="uploadedImages.length > 0" class="uploaded-images-container">
                <div v-for="(image, index) in uploadedImages" :key="index" class="uploaded-image-wrapper">
                    <img :src="image" alt="Uploaded" class="uploaded-image" />
                    <img src="@/assets/delete-icon.png" alt="Delete" class="delete-icon" @click="removeImage(index)" />
                </div>
            </div>

            <!-- 文件上传图标, 文本输入框, 发送消息图标 -->
            <div class="input-controls">
                <img src="@/assets/upload-icon.svg" alt="Upload" class="icon upload-icon" @click="handleFileUpload" />
                <textarea v-model="newMessage" :placeholder="InputPlaceholder" @input="autoResize"
                    @keydown="handleKeydown" :disabled="isBotResponding"></textarea>
                <img :src="iconSendSrc" alt="Send" class="icon send-icon" @click="handleSendMessage"
                    :class="{ disabled: isButtonDisabled }" />
            </div>
        </div>
        <Settings :isActive="showSidebar" @close="toggleSidebar" />
    </div>
</template>

<script setup lang="ts">
import sendAbleIcon from '@/assets/send-able.svg';
import sendDisableIcon from '@/assets/send-disable.svg';
import sendStopIcon from '@/assets/send_stop-icon.png';
import LoadingDots from '@/components/LoadingDots.vue';
import type { ChatCommonMessage } from "@/store/ChatCommonMessage";
import { API_CONFIG } from '@/store/config';
import { eventBus } from '@/utils/eventBus';
import Settings from '@/views/Settings.vue';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import '../style/chat-window.css'; // 导入CSS文件
import ChatItemMessage from './ChatItemMessage.vue';


interface ChatDetails {
    user_name: string;
    session_id: number;
}

interface ChatHistoryItem {
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
    model_name?: string;
}

const chatHistoryUrl = `${API_CONFIG.rootUrl}/chat/history/record`;
const imageUploadUrl = `${API_CONFIG.rootUrl}/images/upload`;

const props = defineProps({
    WebUrl: {
        type: String,
        required: true,
    },
    additionalParams: {
        type: Object,
        default: () => ({}),
    },
    InputPlaceholder: {
        type: String,
        default: 'Type your message here...',
    },
    showHeader: {
        type: Boolean,
        default: true,
    },
    showToggleContainer: {
        type: Boolean,
        default: true,
    },
    showMultiTurnToggle: {
        type: Boolean,
        default: true,
    },
    sourceType: {
        type: String,
        default: 'chat',
    },
});

const sessionId = ref<number | null>(null);
const store = useStore();
const socket = ref<WebSocket | null>(null);
const messages = ref<ChatCommonMessage[]>([]);
const questions = ref<string[]>([]);
const isFollowQuestionVisible = ref(false);
const isFollowQuestionLoading = ref(false);
const showFeedback = ref(false);
const lastMessage = ref('');

const newMessage = ref('');
const chatArea = ref<HTMLDivElement | null>(null);
const textarea = ref<HTMLTextAreaElement | null>(null);
const showSidebar = ref(false); // 控制侧边栏显示
const isBotResponding = ref(false); // 控制输入框和按钮的禁用状态
const isButtonDisabled = ref(true); // 按钮禁用状态
const uploadedImages = ref<string[]>([]); // 存储多个上传的图片Base64数据

const selectedType = ref(store.state.selectedType);
const selectedModel = ref(store.state.selectedModel);
const mode_name = ref(`${selectedType.value}: ${selectedModel.value}`);
const isFirstResponse = ref(true);
const isChatContentStreaming = ref(false)
const multiTurnChatEnabled = ref(true);

const sourceTypeValue = ref(props.sourceType); // 解析并保存sourceType属性
console.log("sourceTypeValue =", sourceTypeValue.value)


watch([newMessage, isBotResponding], ([newValue, botResponding]) => {
    isButtonDisabled.value = (newValue.trim() === "") && (!botResponding);
});

// 处理 "refresh" 事件
const handleRefresh = (data: { message: string }) => {
    console.log('Refresh event received with data:', data);
    console.log('Refresh event received with message:', data['message']);
    sendMessage(lastMessage.value);
};

// 根据 `isButtonDisabled` 状态计算图标路径
const iconSendSrc = computed(() => {
    if (isBotResponding.value) {
        return sendStopIcon;
    }
    console.info('iconSendSrc isButtonDisabled:', isButtonDisabled.value);
    return isButtonDisabled.value ? sendDisableIcon : sendAbleIcon;
});

function handleQuestionClick(question: string) {
    console.log('Clicked question:', question);
    sendMessage(question);
}
const performRag = (data: string, lastIndex: number) => {
    if (messages.value[lastIndex]?.type !== 'bot') {
        let ragEventChatItem = {
            retrieve_start_time: Date.now(),
            last_event_time: Date.now(),
            current_event_desc: '正在检索知识库 ...',
            retrieve_desc: '正在检索知识库 ...',
            retrieve_time: '',
            image_qa: '',
            image_qa_time: '',
            generate_response_desc: '',
            generate_response_time: ''
        };

        messages.value.push({
            type: 'bot',
            model: selectedModel.value,
            ragEvent: ragEventChatItem
        });
        return
    }

    if (data === "[CHAT_STREAM_START]") {
        isChatContentStreaming.value = true
        return
    }

    if (data === "[STREAM_DONE]") {
        console.log("[STREAM_DONE]");
        isBotResponding.value = false;
        isFollowQuestionLoading.value = true;
        isChatContentStreaming.value = false
        showFeedback.value = true;

        messages.value[lastIndex].ragEvent!.generate_response_desc = "最终回复已生成";
        messages.value[lastIndex].ragEvent!.current_event_desc = "完成知识库检索,分析3个文本";
        messages.value[lastIndex].ragEvent!.generate_response_time =
            ((Date.now() - messages.value[lastIndex].ragEvent!.last_event_time) / 1000).toFixed(2) + '秒';

        scrollToBottom();
        return
    }

    if (isChatContentStreaming.value) {
        messages.value[lastIndex].text = (messages.value[lastIndex].text || '') + data;
        scrollToBottom();
        return
    }

    if (data.startsWith("retrieve_chunk_done")) {
        messages.value[lastIndex].ragEvent!.retrieve_desc = "完成知识库检索";
        messages.value[lastIndex].ragEvent!.current_event_desc = "完成知识库检索";
        messages.value[lastIndex].ragEvent!.retrieve_time =
            ((Date.now() - messages.value[lastIndex].ragEvent!.last_event_time) / 1000).toFixed(2) + '秒';

    } else if (data.startsWith("generate_image_response_start")) {
        messages.value[lastIndex].ragEvent!.image_qa = "正在进行图像问答...";
        messages.value[lastIndex].ragEvent!.current_event_desc = "正在进行图像问答...";

    } else if (data.startsWith("generate_image_response_doone")) {
        messages.value[lastIndex].ragEvent!.image_qa = "图像问答完成";
        messages.value[lastIndex].ragEvent!.current_event_desc = "图像问答完成";
        messages.value[lastIndex].ragEvent!.image_qa_time =
            ((Date.now() - messages.value[lastIndex].ragEvent!.last_event_time) / 1000).toFixed(2) + '秒';

    } else if (data.startsWith("generate_final_response_start")) {
        messages.value[lastIndex].ragEvent!.generate_response_desc = "正在生成最终回复...";
        messages.value[lastIndex].ragEvent!.current_event_desc = "正在生成最终回复...";
    }

    messages.value[lastIndex].ragEvent!.last_event_time = Date.now();

    if (data.startsWith("{\"chunk_frontend_nodes\":")) {
        try {
            const jsonData = JSON.parse(data);
            if (jsonData.chunk_frontend_nodes && Array.isArray(jsonData.chunk_frontend_nodes)) {
                const chunkFrontendNodes = jsonData.chunk_frontend_nodes.map((node: any) => ({
                    score: node.score,
                    file_id: node.file_id,
                    node_id: node.node_id,
                    text: node.text,
                    file_type: node.file_type,
                    file_path: node.file_path,
                    file_name: node.file_name,
                    image_base64: node.image_base64
                }));
                console.log("解析出的chunk_frontend_nodes:", chunkFrontendNodes);
                messages.value[lastIndex].ragChunkList = chunkFrontendNodes;
            }
        } catch (error) {
            console.error("解析chunk_frontend_nodes数据时出错:", error);
        }
    }
}

const initWebSocket = () => {
    socket.value = new WebSocket(props.WebUrl);

    socket.value.addEventListener('open', () => {
        console.log('已连接到服务器');
    });

    socket.value.addEventListener('message', (event) => {
        const data = event.data;
        const lastIndex = messages.value.length - 1;

        if (isFirstResponse.value) {
            eventBus.$emit('performSendNewSession', sessionId.value);
            console.log('执行发送新会话');
            isFirstResponse.value = false;
        }

        if (!isBotResponding.value && data.includes('[Q]')) {
            isFollowQuestionVisible.value = true;
            isFollowQuestionLoading.value = false;
            const reply_questions = data.match(/\[Q\](.*?)\s*(?=\[Q\]|\s*$)/g)
                ?.map((q: string) => q.replace(/\[Q\]/, '').trim()) || [];
            questions.value = reply_questions;
            return;
        }


        if (sourceTypeValue.value === "rag") {
            performRag(data, lastIndex)
            scrollToBottom();
            return
        }

        if (data === "[STREAM_DONE]") {
            console.log("[STREAM_DONE]");
            isBotResponding.value = false;
            isFollowQuestionLoading.value = true;
            showFeedback.value = true;
            scrollToBottom();
            return
        }

        if (messages.value[lastIndex]?.type !== 'bot') {
            messages.value.push({
                type: 'bot',
                text: data,
                model: selectedModel.value,
            });
            scrollToBottom();
            return
        }

        messages.value[lastIndex].text = (messages.value[lastIndex].text || '') + data;
        scrollToBottom();
    });

    socket.value.addEventListener('error', (error) => {
        console.error(`WebSocket error: ${error}`);
        ElMessage(`网络错误: ${error}`);
    });

    textarea.value = document.querySelector('textarea');
};

const clearState = () => {
    messages.value = [];
    isFirstResponse.value = true;
    sessionId.value = null;
    isFollowQuestionVisible.value = false;
    showFeedback.value = false;
};

const handleChatSelected = async (chatDetails: ChatDetails) => {
    console.log('接收到的聊天数据:', chatDetails);
    clearState();
    try {
        console.log('handleChatSelected');
        const response = await fetch(chatHistoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_name: chatDetails.user_name,
                session_id: chatDetails.session_id,
            }),
        });

        if (!response.ok) {
            ElMessage.error('获取聊天记录失败');
        } else {
            const data: ChatHistoryItem[] = await response.json();
            console.log('获取聊天记录成功: ');

            data.forEach(item => {
                if (Array.isArray(item.content)) {
                    item.content.forEach(contentItem => {
                        if (contentItem.type === 'text') {
                            messages.value.push({
                                type: 'user',
                                text: contentItem.text,
                            });
                        } else if (contentItem.type === 'image_url') {
                            messages.value.push({
                                type: 'user-img',
                                imageUrl: contentItem.image_url?.url ?? '', // Provide a default value (e.g., an empty string)
                            });
                        }
                    });
                } else {
                    if (item.role === 'assistant') {
                        messages.value.push({
                            type: 'bot',
                            text: item.content,
                            model: item.model_name,
                        });
                    } else {
                        messages.value.push({
                            type: 'user',
                            text: item.content,
                        });
                    }
                }
                scrollToBottom();
            });
        }
        sessionId.value = chatDetails.session_id;
    } catch (error) {
        console.error('获取聊天记录失败:', error);
    }
};

const handleNewChatClick = async () => {
    console.log('handleNewChatClick');
    clearState();
};

onMounted(() => {
    console.log('onMounted...');
    initWebSocket();
    eventBus.$on('chatSelected', handleChatSelected);
    eventBus.$on('newChatClick', handleNewChatClick);
});

onBeforeUnmount(() => {
    console.log('onBeforeUnmount...');
    if (socket.value) {
        socket.value.close();
        console.log('onBeforeUnmount close client');
        ElMessage(`onBeforeUnmount close client`);
    }
    eventBus.$off('chatSelected', handleChatSelected);
    eventBus.$off('newChatClick', handleNewChatClick);
});

const sendMessage = (send_msg: string) => {
    isFollowQuestionVisible.value = false;
    showFeedback.value = false;
    lastMessage.value = send_msg;

    if (socket.value?.readyState === WebSocket.OPEN) {
        messages.value.push({
            type: 'user',
            text: send_msg,
        });

        uploadedImages.value.forEach(image => {
            messages.value.push({
                type: 'user-img',
                imageUrl: image,
            });
        });

        if (sessionId.value === null) {
            sessionId.value = Date.now();
        }

        const message = {
            multi_turn_chat_enabled: multiTurnChatEnabled.value,
            user_name: localStorage.getItem('username'),
            session_id: sessionId.value,
            data: send_msg,
            image_urls: [...uploadedImages.value],
            model_type: selectedType.value,
            model_name: selectedModel.value,
            ...props.additionalParams,
        };

        socket.value.send(JSON.stringify(message));
        newMessage.value = '';
        uploadedImages.value = [];
        isBotResponding.value = true;
        autoResize();
    } else {
        console.error('WebSocket connection is not open');
        ElMessage('WebSocket connection is not open');
    }

    scrollToBottom();
};

const stopBot = () => {
    if (socket.value?.readyState === WebSocket.OPEN) {
        isBotResponding.value = false;

        const message = {
            command: "[CLIENT_STOP]",
            ...props.additionalParams,
        };
        socket.value.send(JSON.stringify(message));
    }
};

const handleSendMessage = (event: MouseEvent) => {
    if (isButtonDisabled.value) {
        event.stopPropagation();
        return;
    }

    if (isBotResponding.value) {
        stopBot();
    } else {
        sendMessage(newMessage.value.trim());
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatArea.value) {
            chatArea.value.scrollTop = chatArea.value.scrollHeight;
        }
    });
};


const autoResize = () => {
    const lineHeight = 40;
    const maxLines = 8;
    const lines = newMessage.value.split('\n').length;
    const newHeight = Math.min(lines, maxLines) * lineHeight;

    if (textarea.value) {
        textarea.value.style.height = `${newHeight}px`;
        textarea.value.style.overflowY = lines > maxLines ? 'auto' : 'hidden';
    }
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        if (!newMessage.value.trim()) {
            ElMessage('请输入内容后再发送');
            event.preventDefault();
            return;
        }

        if (event.shiftKey) {
            event.preventDefault();
            newMessage.value += '\n';
            autoResize();
        } else {
            event.preventDefault();
            sendMessage(newMessage.value.trim());
        }
    }
};

const handleFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
        const files = fileInput.files;
        if (!files || files.length === 0) return;

        const uploadedUrls: string[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file) {
                const formData = new FormData();
                formData.append('file', file);

                try {
                    const response = await fetch(imageUploadUrl, {
                        method: 'POST',
                        body: formData,
                    });

                    if (response.ok) {
                        const result = await response.json();
                        uploadedUrls.push(result.url);
                    } else {
                        console.error('上传失败:', response.statusText);
                        ElMessage('上传失败');
                    }
                } catch (error) {
                    console.error('上传过程中出现错误:', error);
                    ElMessage('上传过程中出现错误');
                }
            }
        }

        if (uploadedUrls.length > 0) {
            uploadedImages.value.push(...uploadedUrls);
        }
    };

    fileInput.click();
};

const removeImage = (index: number) => {
    uploadedImages.value.splice(index, 1);
};

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;

    selectedType.value = store.state.selectedType;
    selectedModel.value = store.state.selectedModel;

    mode_name.value = `${selectedType.value}: ${selectedModel.value}`;
};
</script>