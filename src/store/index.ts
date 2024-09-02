import { createStore } from 'vuex';
import { LlmChatModule, type LlmChatState } from './modules/llm';
import { RagModule, type RagState } from './modules/rag';
import { UserModule, type UserState } from './modules/user';

export interface RootState {
    user: UserState;
    llmChat: LlmChatState;
    rag: RagState,
}

export default createStore<RootState>({
    modules: {
        user: UserModule,
        llmChat: LlmChatModule,
        rag: RagModule,
    },
});


