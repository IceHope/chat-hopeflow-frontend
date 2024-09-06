import type { RagChunkNode, RagEvent } from "./rag_item";

export interface ChatCommonMessage {
    type: 'user' | 'bot' | 'user-img';
    text?: string;
    imageUrl?: string;
    model?: string;
    ragEvent?: RagEvent;
    ragChunkList?: RagChunkNode[];
}