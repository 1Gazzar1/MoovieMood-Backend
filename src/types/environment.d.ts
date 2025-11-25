declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number;
        DATABASE_URL: string;
        EMBEDDING_MODEL_API_KEY: string;
        EMBEDDING_MODEL_API_KEY2: string;
        EMBEDDING_MODEL_API_KEY3: string;
        LLM_MODEL_API_KEY: string;
    }
}
