// config.ts
export const API_URL: API_URL = {
    wsUrl: 'ws://localhost:8585/ws',
    rootUrl: 'http://localhost:8585',

    get wsChatUrl() {
        return `${this.wsUrl}/chat`;
    },
    get wsRagChatUrl() {
        return `${this.wsUrl}/rag/chat_query`;
    },
    get wsAgentStoryLineUrl() {
        return `${this.wsUrl}/agent/storyline`;
    },
    get wsAgentTranslateHuman() {
        return `${this.wsUrl}/agent/translate_human`;
    },
    get wsAgentSixHat() {
        return `${this.wsUrl}/agent/six_hat`;
    },
    get wsAgentOpenaiO1() {
        return `${this.wsUrl}/agent/openai_o1_reason`;
    },
    get loginUrl() {
        return `${this.rootUrl}/user/login`;
    },
    get registerUrl() {
        return `${this.rootUrl}/user/register`;
    },
    get fogetPasswordUrl() {
        return `${this.rootUrl}/user/forgot_password`;
    },
    get globalConfigUrl() {
        return `${this.rootUrl}/config/global`;
    },
    get chatHistoryUrl() {
        return `${this.rootUrl}/chat/history/record`;
    },
    get chatHistorySnapshots() {
        return `${this.rootUrl}/chat/history/snapshots`;
    },
    get chatHistoryDeleteUrl() {
        return `${this.rootUrl}/chat/history/delete`;
    },
    get imageUploadUrl() {
        return `${this.rootUrl}/images/upload`;
    },
    get knowledgeQueryAll() {
        return `${this.rootUrl}/rag/knowledge/query_all`;
    },
    get knowledgeChunkByFileIdUrl() {
        return `${this.rootUrl}/rag/knowledge/query_all_chunk_by_file_id`;
    },
    get queryMatchChunkUrl() {
        return `${this.rootUrl}/rag/vector/query_match_chunk`;
    },
    get queryAgentListUrl() {
        return `${this.rootUrl}/agent/list_all`;
    },
};

interface API_URL {
    wsUrl: string;
    wsChatUrl: string
    wsRagChatUrl: string
    wsAgentStoryLineUrl: string
    wsAgentSixHat: string
    wsAgentTranslateHuman: string
    wsAgentOpenaiO1: string
    rootUrl: string;
    loginUrl: string
    registerUrl: string
    fogetPasswordUrl: string
    globalConfigUrl: string;
    chatHistoryUrl: string
    chatHistorySnapshots: string
    chatHistoryDeleteUrl: string
    imageUploadUrl: string
    knowledgeQueryAll: string
    knowledgeChunkByFileIdUrl: string
    queryMatchChunkUrl: string
    queryAgentListUrl: string
}
