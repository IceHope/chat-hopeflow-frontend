import StorylineAgent from '@/components/agent/StorylineAgent.vue';
import TranslateAgent from '@/components/agent/TranslateAgent.vue';
import Agent from '@/views/Agent.vue';
import Chat from '@/views/Chat.vue';
import Home from '@/views/Home.vue';
import Login from '@/views/Login.vue';
import Rag from '@/views/Rag.vue';
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    { path: '/', name: "login", component: Login },
    { path: '/home', name: "home", component: Home },
    { path: '/chat', name: "chat", component: Chat },
    { path: '/rag', name: "rag", component: Rag },
    { path: '/agent', name: "agent", component: Agent },
    { path: '/agent_translate', name: "agent_translate", component: TranslateAgent },
    { path: '/agent_storyline', name: "agent_storyline", component: StorylineAgent },
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
