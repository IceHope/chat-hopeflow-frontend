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

<script setup>
import sendAbleIcon from '@/assets/send-able.svg';
import sendDisableIcon from '@/assets/send-disable.svg';
import sendStopIcon from '@/assets/send_stop-icon.png';
import LoadingDots from '@/components/LoadingDots.vue';
import { API_CONFIG } from '@/store/config';
import { eventBus } from '@/utils/eventBus';
import Settings from '@/views/Settings.vue';
import { ElMessage } from 'element-plus';
import { marked } from 'marked';
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import '../style/chat-window.css'; // 导入CSS文件
import ChatItemMessage from './ChatItemMessage.vue';

const chatHistoryUrl = `${API_CONFIG.rootUrl}/chat/history/record`;
const imageUploadUrl = `${API_CONFIG.rootUrl}/images/upload`;

const props = defineProps({
    WebUrl: String,
    additionalParams: {
        type: Object,
        default: () => ({})
    },
    InputPlaceholder: {
        type: String,
        default: 'Type your message here...'
    }
});
const sessionId = ref(null)
const store = useStore();
const socket = ref(null);
const messages = ref([]);
const questions = ref([]);
const isFollowQuestionVisible = ref(false);
const isFollowQuestionLoading = ref(false);
const showFeedback = ref(false);
const lastMessage = ref('')

const newMessage = ref('');
const chatArea = ref(null);
const textarea = ref(null);
const showSidebar = ref(false); // 控制侧边栏显示
const isBotResponding = ref(false); // 控制输入框和按钮的禁用状态
const isButtonDisabled = ref(true); // 按钮禁用状态
const uploadedImages = ref([]); // 存储多个上传的图片Base64数据

const selectedType = ref(store.state.selectedType);
const selectedModel = ref(store.state.selectedModel);
const mode_name = ref(`${selectedType.value}: ${selectedModel.value}`);
const isFirstResponse = ref(true);
const multiTurnChatEnabled = ref(true);

watch([newMessage, isBotResponding], ([newValue, botResponding]) => {
    isButtonDisabled.value = ((newValue.trim() === "") && (!botResponding));
});

// 处理 "refresh" 事件
const handleRefresh = (data) => {
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
function handleQuestionClick(question) {
    console.log('Clicked question:', question);
    // 在这里处理点击事件，传入对应的 question

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
            isFirstResponse.value = false
        }
        if (!isBotResponding.value && data.includes('[Q]')) {
            isFollowQuestionVisible.value = true;
            isFollowQuestionLoading.value = false;
            const reply_questions = data.match(/\[Q\](.*?)\s*(?=\[Q\]|\s*$)/g)
                .map(q => q.replace(/\[Q\]/, '').trim());
            questions.value = reply_questions;
            return;
        }
        if (data === "[STREAM_DONE]") {
            console.log("[STREAM_DONE]");
            isBotResponding.value = false;
            isFollowQuestionLoading.value = true;
            showFeedback.value = true;
        } else if (messages.value[lastIndex].type !== 'bot') {
            messages.value.push({
                type: 'bot',
                text: data,
                model: selectedModel.value
            });
        } else {
            messages.value[lastIndex].text += data;
        }
        scrollToBottom();
    });


    socket.value.addEventListener('error', (error) => {
        console.error(`WebSocket error: ${error}`);
        ElMessage(`网络错误: ${error}`);
    });

    textarea.value = document.querySelector('textarea'); // 在 onMounted 中获取 textarea 的引用
};
const clearState = () => {
    messages.value = []
    isFirstResponse.value = true
    sessionId.value = null
    isFollowQuestionVisible.value = false
    showFeedback.value = false
}
const handleChatSelected = async (chatDetails) => {
    console.log('接收到的聊天数据:', chatDetails);
    clearState();
    try {
        console.log('handleChatSelected');
        const response = await fetch(chatHistoryUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(
                {
                    user_name: chatDetails.user_name,
                    session_id: chatDetails.session_id
                }
            ),
        });

        if (!response.ok) {
            ElMessage.error('获取聊天记录失败');
        } else {
            const data = await response.json();
            console.log('获取聊天记录成功: ');

            data.forEach(item => {

                // 判断 content 是否是数组
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
                    // content 不是数组的情况
                    if (item.role === 'assistant') {
                        messages.value.push({
                            type: 'bot',
                            text: item.content,
                            model: item.model_name
                        })
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
        // ElMessage.error('获取聊天记录失败:', error);
    }
}

const handleNewChatClick = async () => {
    console.log('handleNewChatClick');
    clearState()
};

onMounted(() => {
    console.log('onMounted...');
    initWebSocket();
    // 组件挂载时监听事件
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
    // 组件卸载时取消监听
    eventBus.$off('chatSelected', handleChatSelected);
    eventBus.$off('newChatClick', handleNewChatClick);
});




const enlargeImage = (imageUrl) => {
    // Create modal container
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(123, 123, 124, 0.8)'; // Gray overlay
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.zIndex = '1000';
    modal.style.cursor = 'pointer';

    // Create image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.width = '60%';
    img.style.height = 'auto';
    img.style.borderRadius = '10px'; // Optional: rounded corners

    // Create close button
    const closeButton = document.createElement('div');
    closeButton.textContent = '✖';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.fontSize = '30px';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';
    closeButton.style.zIndex = '1001'; // Ensure it's above the image
    closeButton.style.width = '40px'; // Set width for circular shape
    closeButton.style.height = '40px'; // Set height for circular shape
    closeButton.style.borderRadius = '50%'; // Make it circular
    closeButton.style.display = 'flex'; // Use flexbox to center content
    closeButton.style.alignItems = 'center'; // Center vertically
    closeButton.style.justifyContent = 'center'; // Center horizontally
    closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent background

    // Add hover effect
    closeButton.addEventListener('mouseover', () => {
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    });
    closeButton.addEventListener('mouseout', () => {
        closeButton.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    });

    // Append image and close button to modal
    modal.appendChild(img);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);

    // Function to close modal
    const closeModal = () => {
        document.body.removeChild(modal);
    };

    // Add event listener to close modal when clicking on the overlay or the close button
    modal.addEventListener('click', closeModal);
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent closing when clicking on the close button
        closeModal();
    });

    // Prevent closing the modal when clicking on the image
    img.addEventListener('click', (e) => {
        e.stopPropagation();
    });
};
const sendMessage = (send_msg) => {
    isFollowQuestionVisible.value = false;
    showFeedback.value = false;
    lastMessage.value = send_msg;
    if (socket.value.readyState === WebSocket.OPEN) {
        messages.value.push({
            type: 'user',
            text: send_msg,
        });

        // Push each image separately
        uploadedImages.value.forEach(image => {
            messages.value.push({
                type: 'user-img',
                imageUrl: image, // Use imageUrl to match with the template
            });
        });
        console.info('session_id: ' + sessionId.value);

        if (sessionId.value === null) {
            sessionId.value = Date.now(); // 获取当前时间的毫秒级时间戳
        }
        console.info('session_id: ' + sessionId.value);
        const message = {
            multi_turn_chat_enabled: multiTurnChatEnabled.value,
            user_name: localStorage.getItem('username'),
            session_id: sessionId.value,
            data: send_msg,
            image_urls: [...uploadedImages.value],
            model_type: selectedType.value,
            model_name: selectedModel.value,
            ...props.additionalParams
        };
        socket.value.send(JSON.stringify(message));
        newMessage.value = '';
        uploadedImages.value = []; // 发送消息后清空图片容器
        isBotResponding.value = true;
        autoResize(); // 调整高度
    } else {
        console.error('WebSocket connection is not open');
        ElMessage('WebSocket connection is not open')
    }

    scrollToBottom()
};

const stopBot = () => {
    if (socket.value.readyState === WebSocket.OPEN) {
        isBotResponding.value = false;

        const message = {
            command: "[CLIENT_STOP]",
            ...props.additionalParams
        };
        socket.value.send(JSON.stringify(message));
    }
};

const handleSendMessage = (event) => {
    if (isButtonDisabled.value) {
        event.stopPropagation(); // 阻止事件冒泡
        return; // 不处理点击事件
    }

    if (isBotResponding.value) {
        stopBot();
    } else {
        sendMessage();
    }
};

const scrollToBottom = () => {
    nextTick(() => {
        if (chatArea.value) {
            chatArea.value.scrollTop = chatArea.value.scrollHeight;
        }
    });
};

const parseMarkdown = (text) => {
    return marked(text);
};

const autoResize = () => {
    const lineHeight = 40; // 每行的高度为40px
    const maxLines = 8; // 最大行数
    const lines = newMessage.value.split('\n').length; // 计算当前文本的行数
    const newHeight = Math.min(lines, maxLines) * lineHeight; // 计算新的高度，但不超过最大行数

    textarea.value.style.height = `${newHeight}px`; // 设置textarea的高度
    textarea.value.style.overflowY = lines > maxLines ? 'auto' : 'hidden'; // 根据行数是否超出最大行数决定是否显示滚动条
};

const handleKeydown = (event) => {
    if (event.key === 'Enter') {
        // 检查 newMessage.value 是否为空
        if (!newMessage.value.trim()) {
            ElMessage('请输入内容后再发送'); // 提示用户输入内容
            event.preventDefault()
            return; // 不执行发送操作
        }

        if (event.shiftKey) {
            event.preventDefault(); // 阻止默认的换行行为
            newMessage.value += '\n'; // 手动添加换行符
            autoResize(); // 调整高度
        } else {
            event.preventDefault(); // 阻止默认的行为
            sendMessage(newMessage.value.trim()); // 发送消息
        }
    }
};

const handleFileUpload = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';

    fileInput.onchange = async () => {
        const files = fileInput.files;
        if (files.length === 0) return; // 如果没有选择文件，直接返回

        const uploadedUrls = []; // 用于保存上传后返回的URL
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
                        uploadedUrls.push(result.url); // 将返回的URL添加到数组中
                    } else {
                        console.error('上传失败:', response.statusText);
                        ElMessage('上传失败')
                    }
                } catch (error) {
                    console.error('上传过程中出现错误:', error);
                    ElMessage('上传过程中出现错误')
                }
            }
        }

        if (uploadedUrls.length > 0) {
            uploadedImages.value.push(...uploadedUrls); // 将所有URL添加到uploadedImages数组
        }
    };

    fileInput.click();
};
const removeImage = (index) => {
    uploadedImages.value.splice(index, 1); // 从数组中删除指定索引的图片
};

const toggleSidebar = () => {
    showSidebar.value = !showSidebar.value;

    selectedType.value = store.state.selectedType;
    selectedModel.value = store.state.selectedModel;

    mode_name.value = `${selectedType.value}: ${selectedModel.value}`;
};
</script>
