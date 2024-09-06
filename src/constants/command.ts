// config.ts
export const COMMAND_KEY: COMMAND_KEY = {
    chat_stream_serve_start: "chat_stream_serve_start",
    chat_stream_serve_done: "chat_stream_serve_done",
    chat_stream_client_stop: "chat_stream_client_stop",
    rag_retrieve_chunk_start: 'rag_retrieve_chunk_start',
    rag_retrieve_chunk_done: 'rag_retrieve_chunk_done',
    rag_rerank_chunk_start: 'rag_rerank_chunk_start',
    rag_rerank_chunk_done: 'rag_rerank_chunk_done',
    rag_event_image_qa_start: 'rag_event_image_qa_start',
    rag_event_image_qa_done: 'rag_event_image_qa_done',
    rag_event_generate_start: 'rag_event_generate_start',
};

interface COMMAND_KEY {
    chat_stream_serve_start: string
    chat_stream_serve_done: string
    chat_stream_client_stop: string;
    rag_retrieve_chunk_start: string;
    rag_retrieve_chunk_done: string;
    rag_rerank_chunk_start: string;
    rag_rerank_chunk_done: string;
    rag_event_image_qa_start: string;
    rag_event_image_qa_done: string;
    rag_event_generate_start: string;
}
