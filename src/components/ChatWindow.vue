<template>
    <div class="chat-window">
        <div class="chat-header" v-if="showHeader">
            <div>
                <div class="chat-model-select" @click="toggleDropdown">
                    <span class="model-select">{{ selectedModel }}</span>
                    <img src="@/assets/down-more-icon.svg">
                </div>
            </div>

            <div class="dropdown-wrap" v-if="showDropdown">
                <ModelSelect :modelList="modelList" @selectModelItem="handleModelSelect"></ModelSelect>
            </div>
        </div>
        <!-- 遮罩层，点击后关闭下拉框 -->
        <div v-if="showDropdown" class="overlay" @click="closeDropdown"></div>

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

    </div>
</template>

<script setup lang="ts">
import sendAbleIcon from '@/assets/send-able.svg';
import sendDisableIcon from '@/assets/send-disable.svg';
import sendStopIcon from '@/assets/send_stop-icon.png';
import LoadingDots from '@/components/LoadingDots.vue';
import { API_URL } from '@/constants/api_url';
import type { ChatCommonMessage } from "@/interface/chat_common_message";
import { eventBus } from '@/utils/eventBus';
import { ElMessage } from 'element-plus';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import '../style/chat-window.css'; // 导入CSS文件
import ChatItemMessage from './ChatItemMessage.vue';
import ModelSelect, { type SelectModelItem } from './ModelSelect.vue';


interface ChatDetails {
    user_name: string;
    session_id: number;
}

interface ChatHistoryItem {
    role: string;
    content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
    model_name?: string;
}

const chatHistoryUrl = API_URL.chatHistoryUrl
const imageUploadUrl = API_URL.imageUploadUrl

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

const selectedType = computed(() => store.state.llmChat.selectedType);
const selectedModel = computed(() => store.state.llmChat.selectedModel);

const isFirstResponse = ref(true);
const isChatContentStreaming = ref(false)
const multiTurnChatEnabled = ref(true);
const chatStreamStartTime = ref<number>(0)

const sourceTypeValue = ref(props.sourceType); // 解析并保存sourceType属性
console.log("sourceTypeValue =", sourceTypeValue.value)

const commands = ref(store.state.config.commands)

const ragMultiTurnChatEnabled = computed(() => store.state.rag.multiTurnChatEnabled);
const ragRerankCount = computed(() => store.state.rag.rerankCount);
const ragRetriveCount = computed(() => store.state.rag.retriveCount);
const ragFusionCount = computed(() => store.state.rag.fusionCount);

const modelList = store.state.config.models.llm

const handleModelSelect = (data: SelectModelItem) => {
    const { model_item, model_name_item } = data;
    console.log("父组件接收到的选中项:", model_item, model_name_item);
    store.dispatch('llmChat/updateType', model_item.owner_type);
    store.dispatch('llmChat/updateModel', model_name_item.name);
    toggleDropdown()
    // 在这里处理选中的项，例如更新状态或发起请求
};
const showDropdown = ref(false);

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};
// 点击其他区域时关闭下拉框
const closeDropdown = () => {
    showDropdown.value = false;
};

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
        console.log("data =", data, Date.now())
        let ragEventChatItem = {
            current_event_desc: '正在分析问题意图...',
            query_parse_desc: "正在分析问题意图...",
            query_parse_time: "",
            retrieve_desc: '',
            retrieve_time: '',
            rerank_desc: '',
            rerank_time: "",
            image_qa_desc: '',
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

    if (data.startsWith(commands.value["chat_stream_serve_start"])) {
        isChatContentStreaming.value = true
        chatStreamStartTime.value = Date.now()
        messages.value[lastIndex].ragEvent!.generate_response_desc = "正在生成最终回复...";
        messages.value[lastIndex].ragEvent!.current_event_desc = "正在生成最终回复...";
        return
    }

    if (data.startsWith(commands.value["chat_stream_serve_done"])) {
        console.log("[chat_stream_serve_done]");

        messages.value[lastIndex].ragEvent!.generate_response_time =
            ((Date.now() - chatStreamStartTime.value) / 1000).toFixed(2) + '秒';

        messages.value[lastIndex].ragEvent!.generate_response_desc = "最终回复完成 :  ";
        messages.value[lastIndex].ragEvent!.current_event_desc
            = "完成知识库检索, 分析了" + ragRerankCount.value + "个文本块"


        isBotResponding.value = false;
        if (sourceTypeValue.value !== "agent") {
            isFollowQuestionLoading.value = true;
            showFeedback.value = true;
        }

        isChatContentStreaming.value = false
        chatStreamStartTime.value = 0

        scrollToBottom();
        return
    }

    if (isChatContentStreaming.value) {
        messages.value[lastIndex].text = (messages.value[lastIndex].text || '') + data;
        scrollToBottom();
        return
    }
    if (data.startsWith(commands.value["rag_retrieve_chunk_done"])) {
        messages.value[lastIndex].ragEvent!.retrieve_desc = "检索完成 : " + ragRetriveCount.value + "个chunk"
        messages.value[lastIndex].ragEvent!.current_event_desc = "文本检索完成";
        messages.value[lastIndex].ragEvent!.retrieve_time = data.split("]")[1] + '秒';

        messages.value[lastIndex].ragEvent!.rerank_desc = "正在进行重排序...";
        messages.value[lastIndex].ragEvent!.current_event_desc = "正在进行重排序...";

    } else if (data.startsWith(commands.value["rag_rerank_chunk_done"])) {
        messages.value[lastIndex].ragEvent!.rerank_desc = "重排序完成 : " + ragRetriveCount.value + " -> " + ragRerankCount.value;
        messages.value[lastIndex].ragEvent!.current_event_desc = "文本重排序完成";
        messages.value[lastIndex].ragEvent!.rerank_time = data.split("]")[1] + '秒';

    } else if (data.startsWith(commands.value["rag_event_image_qa_start"])) {
        messages.value[lastIndex].ragEvent!.image_qa_desc = "正在进行图像问答...";
        messages.value[lastIndex].ragEvent!.current_event_desc = "正在进行图像问答...";

    } else if (data.startsWith(commands.value["rag_event_image_qa_done"])) {
        messages.value[lastIndex].ragEvent!.image_qa_desc = "图像问答完成  ";
        messages.value[lastIndex].ragEvent!.current_event_desc = "图像问答完成 : ";
        messages.value[lastIndex].ragEvent!.image_qa_time = data.split("]")[1] + '秒';
    }

    if (data.startsWith("{\"rag_parse_context_question\":")) {
        try {
            const jsonData = JSON.parse(data);
            const receive_text = jsonData.rag_parse_context_question
            if (receive_text) {
                const parse_question = receive_text.split("[rag_parse_question_done]")[0]
                const cost_time = receive_text.split("[rag_parse_question_done]")[1]
                messages.value[lastIndex].ragEvent!.query_parse_desc = "意图解析完成: " + parse_question
                messages.value[lastIndex].ragEvent!.query_parse_time = cost_time + '秒';

                messages.value[lastIndex].ragEvent!.retrieve_desc = "正在检索知识块..."
                messages.value[lastIndex].ragEvent!.current_event_desc = "正在检索知识块...";
            }
        } catch (error) {
            console.error("解析问题时出错:", error);
        }
    }

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

        if (data === commands.value["chat_stream_serve_done"]) {
            console.log("[chat_stream_serve_done]");
            isBotResponding.value = false;
            if (sourceTypeValue.value !== "agent") {
                isFollowQuestionLoading.value = true;
                showFeedback.value = true;
            }

            scrollToBottom();
            return
        }
        // 对话结束后后端的反馈
        if (!isBotResponding.value) {
            console.log(messages.value[lastIndex]?.type)
            // LOG显示有数据,为何不显示出来?
            console.log("bot : ", data)
            messages.value.push({
                type: 'bot',
                text: data,
                model: selectedModel.value,
            });
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

        const rag_config = {
            rag_rerank_count: ragRerankCount.value,
            rag_retrieve_count: ragRetriveCount.value,
            rag_fusion_count: ragFusionCount.value,
        };
        const message = {
            multi_turn_chat_enabled: multiTurnChatEnabled.value,
            rag_multi_turn_chat_enabled: ragMultiTurnChatEnabled.value,
            user_name: localStorage.getItem('username'),
            session_id: sessionId.value,
            data: send_msg,
            image_urls: [...uploadedImages.value],
            model_type: selectedType.value,
            model_name: selectedModel.value,
            ...rag_config,
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
            command: commands.value["chat_stream_client_stop"],
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

</script>