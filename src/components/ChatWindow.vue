<template>
    <div class="chat-window">
        <div class="chat-header">
            <div class="toggle-container">
                <button class="btn-toggle" @click="toggleSidebar">{{ mode_name }}</button>
            </div>
            <div class="multi-turn-toggle">
                <label>
                    <input type="checkbox" v-model="multiTurnChatEnabled">
                    支持多轮对话
                </label>
            </div>
        </div>

        <div class="chat-area" ref="chatArea">
            <ChatItemMessage v-for="(message, index) in messages" :key="index" :message="message"
                :showFeedback="showFeedback" @refresh="handleRefresh" />

            <div v-if="isFollowQuestionVisible" class="chat-follow-questions-warp">
                <div v-for="(question, index) in questions" :key="index" @click="handleQuestionClick(question)">
                    <span class="chat-follow-question">{{ question }}</span>
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
import { API_CONFIG } from '@/store/config';
import { eventBus } from '@/utils/eventBus';
import Settings from '@/views/Settings.vue';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import '../style/chat-window.css'; // 导入CSS文件
import ChatItemMessage from './ChatItemMessage.vue';

interface ChatMessage {
    type: 'user' | 'bot' | 'user-img';
    text?: string;
    imageUrl?: string;
    model?: string;
}

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
});

const sessionId = ref<number | null>(null);
const store = useStore();
const socket = ref<WebSocket | null>(null);
const messages = ref<ChatMessage[]>([]);
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
const multiTurnChatEnabled = ref(true);

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

const initWebSocket = () => {
    socket.value = new WebSocket(props.WebUrl);

    socket.value.addEventListener('open', () => {
        console.log('Connected to server');
    });

    socket.value.addEventListener('message', (event) => {
        const data = event.data;
        const lastIndex = messages.value.length - 1;

        if (isFirstResponse.value) {
            eventBus.$emit('performSendNewSession', sessionId.value);
            console.log('performSendNewSession');
            isFirstResponse.value = false;
        }

        if (!isBotResponding.value && data.includes('[Q]')) {
            isFollowQuestionVisible.value = true;
            isFollowQuestionLoading.value = false;
            const reply_questions = data.match(/\[Q\](.*?)\s*(?=\[Q\]|\s*$)/g)
                ?.map(q => q.replace(/\[Q\]/, '').trim()) || [];
            questions.value = reply_questions;
            return;
        }

        if (data === "[STREAM_DONE]") {
            console.log("[STREAM_DONE]");
            isBotResponding.value = false;
            isFollowQuestionLoading.value = true;
            showFeedback.value = true;
        } else if (messages.value[lastIndex]?.type !== 'bot') {
            messages.value.push({
                type: 'bot',
                text: data,
                model: selectedModel.value,
            });
        } else {
            messages.value[lastIndex].text = (messages.value[lastIndex].text || '') + data;
        }
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
                                imageUrl: contentItem.image_url.url,
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