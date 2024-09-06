import { createStore } from 'vuex';
import { ConfigModule, type ConfigState } from './modules/config';
import { LlmChatModule, type LlmChatState } from './modules/llm';
import { RagModule, type RagState } from './modules/rag';
import { UserModule, type UserState } from './modules/user';

export interface RootState {
    config: ConfigState
    user: UserState;
    llmChat: LlmChatState;
    rag: RagState,
}

export default createStore<RootState>({
    modules: {
        user: UserModule,
        llmChat: LlmChatModule,
        rag: RagModule,
        config: ConfigModule
    },
});


