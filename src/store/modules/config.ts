import { API_URL } from "@/constants/api_url";
import type { ModelListSchema } from "@/interface/model_schema";

export interface ConfigState {
    models: ModelListSchema;
    commands: Record<string, string>;
}

const state: ConfigState = {
    models: {} as ModelListSchema,
    commands: {}
}

// mutations
const mutations = {
    updateModels(state: ConfigState, models: ModelListSchema) {
        state.models = models;
    },
    updateCommands(state: ConfigState, commands: Record<string, string>) {
        state.commands = commands;
    },
};

// actions
const actions = {
    async loadConfig({ commit }: { commit: Function }) {
        try {
            const url = API_URL.globalConfigUrl
            const response = await fetch(url);
            const data = await response.json();

            // 假设后台返回的数据结构如下
            // {
            //    models: { ... },
            //    commands: { ... }
            // }

            commit('updateModels', data.models);
            commit('updateCommands', data.commands);
            console.log("config= ", data)
        } catch (error) {
            console.error('Failed to load config:', error);
        }
    },
    updateModels({ commit }: { commit: Function }, models: ModelListSchema) {
        commit('updateModels', models);
    },
    updateCommands({ commit }: { commit: Function }, commands: Record<string, string>) {
        commit('updateCommands', commands);
    },
};

// 导出 Config 模块
export const ConfigModule = {
    namespaced: true,
    state,
    mutations,
    actions,
};
