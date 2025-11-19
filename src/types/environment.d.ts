declare namespace NodeJS {
    interface ProcessEnv {
        PORT: number;
        DATABASE_URL: string;
        EMBEDDING_MODEL_API_KEY: string;
        LLM_MODEL_API_KEY: string;
    }
}
