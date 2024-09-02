export interface RagState {
    multiTurnChatEnabled: boolean;
    isExpandDetailProcess: boolean;

    rerankCount: number;
    retriveCount: number;
    fusionCount: number;
}

const state: RagState = {
    multiTurnChatEnabled: false,
    isExpandDetailProcess: true,
    rerankCount: 3,
    retriveCount: 6,
    fusionCount: 3
};

// mutations
const mutations = {
    setMultiTurnChatEnabled(state: RagState, enabled: boolean) {
        state.multiTurnChatEnabled = enabled;
    },
    setExpandDetailProcess(state: RagState, expand: boolean) {
        state.isExpandDetailProcess = expand;
    },
    setRerankCount(state: RagState, count: number) {
        state.rerankCount = count;
    },
    setRetriveCount(state: RagState, count: number) {
        state.retriveCount = count;
    },
    setFusionCount(state: RagState, count: number) {
        state.fusionCount = count;
    },
};

// actions
const actions = {
    updateMultiTurnChatEnabled({ commit }: { commit: Function }, enabled: boolean) {
        commit('setMultiTurnChatEnabled', enabled);
    },
    updateExpandDetailProcess({ commit }: { commit: Function }, expand: boolean) {
        commit('setExpandDetailProcess', expand);
    },
    updateRerankCount({ commit }: { commit: Function }, count: number) {
        commit('setRerankCount', count);
    },
    updateRetriveCount({ commit }: { commit: Function }, count: number) {
        commit('setRetriveCount', count);
    },
    updateFusionCount({ commit }: { commit: Function }, count: number) {
        commit('setFusionCount', count);
    },
};

// 导出 Rag 模块
export const RagModule = {
    namespaced: true,
    state,
    mutations,
    actions,
};