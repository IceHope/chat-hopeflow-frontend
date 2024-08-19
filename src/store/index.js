import { createStore } from 'vuex';

const store = createStore({
    state() {
        return {
            selectedType: 'zhipu',
            selectedModel: 'GLM-4-Flash',
        };
    },
    mutations: {
        setSelectedType(state, type) {
            state.selectedType = type;
        },
        setSelectedModel(state, model) {
            state.selectedModel = model;
        },
    },
    getters: {
        // 添加getters来访问状态
        getSelectedType: state => state.selectedType,
        getSelectedModel: state => state.selectedModel,
    }
});

export default store;
