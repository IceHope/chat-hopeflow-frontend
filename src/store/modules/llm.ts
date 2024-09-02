export interface LlmChatState {
    selectedType: string;
    selectedModel: string;
}

const state: LlmChatState = {
    selectedType: "zhipu",
    selectedModel: "GLM-4-Flash"
}

// mutations
const mutations = {
    setSelectedType(state: LlmChatState, type: string) {
        state.selectedType = type;
    },
    setSelectedModel(state: LlmChatState, model: string) {
        state.selectedModel = model;
    },
};

// actions
const actions = {
    updateType({ commit }: { commit: Function }, type: string) {
        commit('setSelectedType', type);
    },
    updateModel({ commit }: { commit: Function }, model: string) {
        commit('setSelectedModel', model);
    },
};

// 导出 LlmChat 模块
export const LlmChatModule = {
    namespaced: true,
    state,
    mutations,
    actions,
};