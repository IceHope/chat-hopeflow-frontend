// 定义 User 模块的状态接口
export interface UserState {
    name: string;
    password: string;
}

// 模块的初始状态
const state: UserState = {
    name: '',
    password: '',
};

// mutations
const mutations = {
    setName(state: UserState, name: string) {
        state.name = name;
    },
    setPassword(state: UserState, password: string) {
        state.password = password;
    },
};

// actions
const actions = {
    updateName({ commit }: { commit: Function }, name: string) {
        commit('setName', name);
    },
    updatePassword({ commit }: { commit: Function }, password: string) {
        commit('setPassword', password);
    },
};

// 导出 User 模块
export const UserModule = {
    namespaced: true,
    state,
    mutations,
    actions,
};
