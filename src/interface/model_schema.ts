export interface ModelNameSchema {
    name: string;
    input_price: number;
    output_price: number;
}
export interface ModelSchema {
    modal_type: string;
    owner_type: string;
    desc: string;
    names: ModelNameSchema[];
}

export interface ModelListSchema {
    llm: ModelSchema[];
    multi_modal: ModelSchema[];
    embedding: ModelSchema[];
    rerank: ModelSchema[];
}
