import StorylineAgent from '@/components/agent/StorylineAgent.vue';
import TranslateAgent from '@/components/agent/TranslateAgent.vue';
import KnowledgeDetail from '@/components/KnowledgeDetail.vue';
import Agent from '@/views/Agent.vue';
import Chat from '@/views/Chat.vue';
import Home from '@/views/Home.vue';
import Knowledge from '@/views/Knowledge.vue';
import Login from '@/views/Login.vue';
import Rag from '@/views/Rag.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', name: "login", component: Login },
    { path: '/home', name: "home", component: Home },
    { path: '/chat', name: "chat", component: Chat },
    { path: '/rag', name: "rag", component: Rag },
    { path: '/knowledge', name: "knowledge", component: Knowledge },
    { path: '/knowledge_detail', name: "knowledge_detail", component: KnowledgeDetail },
    { path: '/agent', name: "agent", component: Agent },
    { path: '/agent_translate', name: "agent_translate", component: TranslateAgent },
    { path: '/agent_storyline', name: "agent_storyline", component: StorylineAgent },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
