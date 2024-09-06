export interface RagState {
    multiTurnChatEnabled: boolean;
    isExpandDetailProcess: boolean;

    rerankCount: number;
    retriveCount: number;
    fusionCount: number;

    rerankModelType: string;
    rerankModelName: string;

    multiModalType: string;
    multiModalName: string;
}

const state: RagState = {
    multiTurnChatEnabled: false,
    isExpandDetailProcess: true,

    rerankCount: 3,
    retriveCount: 6,
    fusionCount: 3,

    rerankModelType: '',
    rerankModelName: '',

    multiModalType: '',
    multiModalName: '',
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
    setRerankModelType(state: RagState, type: string) {
        state.rerankModelType = type;
    },
    setRerankModelName(state: RagState, name: string) {
        state.rerankModelName = name;
    },
    setMultiModalType(state: RagState, type: string) {
        state.multiModalType = type;
    },
    setMultiModalName(state: RagState, name: string) {
        state.multiModalName = name;
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
    updateRerankModelType({ commit }: { commit: Function }, type: string) {
        commit('setRerankModelType', type);
    },
    updateRerankModelName({ commit }: { commit: Function }, name: string) {
        commit('setRerankModelName', name);
    },
    updateMultiModalType({ commit }: { commit: Function }, type: string) {
        commit('setMultiModalType', type);
    },
    updateMultiModalName({ commit }: { commit: Function }, name: string) {
        commit('setMultiModalName', name);
    },
};

// 导出 Rag 模块
export const RagModule = {
    namespaced: true,
    state,
    mutations,
    actions,
};