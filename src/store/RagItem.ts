export interface KnowledgeFileItem {
    id: string;
    file_id: string;
    file_path: string;
    file_title: string;
    file_name: string;
    file_size: string;
    chunk_size: number;
    chunk_overlap: number;
    updated_at: string;
    created_at: string
    enabled: boolean;
}

export interface RagChunkNode {
    score: string;
    file_id: string;
    node_id: string;
    text: string;
    file_type: string;
    file_path: string;
    file_name: string
    image_base64: string;
}

export interface RagEvent {
    current_event_desc: string
    retrieve_desc: string
    retrieve_time: string
    rerank_desc: string
    rerank_time: string
    image_qa_desc: string
    image_qa_time: string
    generate_response_desc: string
    generate_response_time: string
}