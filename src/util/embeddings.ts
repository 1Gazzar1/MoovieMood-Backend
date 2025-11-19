import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";
import { formatMovieToText } from "./formatMovie";
import {  MovieEmbeddingType } from "src/db/schema";
import { ERRORS } from "src/errors/error";
configDotenv();

const API_KEY = process.env.EMBEDDING_MODEL_API_KEY;
const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function embedMovie(movie: Movie): Promise<MovieEmbeddingType> {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: formatMovieToText(movie),
        config: {
            outputDimensionality: 768,
        },
    });
    const embedding = response.embeddings?.at(0)?.values;
    if (!embedding) throw new Error("AI returned no embedding!");
    return { _id: movie.id, embedding };
}

export async function embedMovies(movies: Movie[]) {
    return await Promise.all(
        movies.map(async (movie) => await embedMovie(movie))
    );
}

export async function embedUserQuery(query: string) {
    const response = await ai.models.embedContent({
        model: "gemini-embedding-001",
        contents: query,
        config: {
            outputDimensionality: 768,
        },
    });
    const embedding = response.embeddings?.at(0)?.values;

    if (!embedding) throw ERRORS.INTERNAL("AI didn't return embeddings");

    return embedding;
}
