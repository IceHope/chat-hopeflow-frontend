import ElementPlus from 'element-plus';
import 'element-plus/theme-chalk/index.css';
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import './style/main.css';
import './style/variables.css';

const app = createApp(App);

app.use(ElementPlus);
app.use(router);
app.use(store);

// 在应用启动时加载配置
store.dispatch('config/loadConfig').then(() => {
    // 在配置加载完成后挂载应用
    app.mount('#app');
}).catch(error => {
    console.error('Error loading config:', error);
    app.mount('#app');  // 即使加载失败，也继续挂载应用
});
