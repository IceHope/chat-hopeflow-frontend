import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './style/main.css';
import './style/variables.css';

createApp(App).
    use(ElementPlus).
    use(router).
    use(store).
    mount('#app');
