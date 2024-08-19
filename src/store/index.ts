import { createStore } from 'vuex';

interface State {
    selectedType: string;
    selectedModel: string;
}

const store = createStore<State>({
    state() {
        return {
            selectedType: 'zhipu',
            selectedModel: 'GLM-4-Flash',
        };
    },
    mutations: {
        setSelectedType(state, type: string) {
            state.selectedType = type;
        },
        setSelectedModel(state, model: string) {
            state.selectedModel = model;
        },
    },
    getters: {
        getSelectedType: (state) => state.selectedType,
        getSelectedModel: (state) => state.selectedModel,
    },
});

export default store;
