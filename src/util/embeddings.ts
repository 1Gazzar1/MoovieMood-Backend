import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";
import { formatMovieToText } from "./formatMovie.js";
import type { MovieEmbeddingType } from "../db/schema.js";
import { ERRORS } from "../errors/error.js";
import { sleep } from "./sleep.js";
import type { Movie } from "../types/movie.js";
configDotenv();

const API_KEYS = [
    process.env.EMBEDDING_MODEL_API_KEY,
    process.env.EMBEDDING_MODEL_API_KEY2,
    process.env.EMBEDDING_MODEL_API_KEY3,
    process.env.EMBEDDING_MODEL_API_KEY4,
];
let currentIndex = 0;

function getGoogleClient(API_KEY: string) {
    return new GoogleGenAI({ apiKey: API_KEY });
}

export async function embedMovie(movie: Movie): Promise<MovieEmbeddingType> {
    const embedding = await makeEmbedding(formatMovieToText(movie));
    return { _id: movie.id, embedding };
}

export async function embedMovies(
    movies: Movie[]
): Promise<MovieEmbeddingType[]> {
    let output = [];
    // to avoid being rate limited.
    if (movies.length < 60) {
        return await Promise.all(
            movies.map(async (movie) => await embedMovie(movie))
        );
    }
    // do it normally and not parallel
    else {
        console.log(`-------Movies Incoming: ${movies.length}-------`);
        let count = 0;
        for (const movie of movies) {
            try {
                output.push(await embedMovie(movie));
                console.log(`${++count}- embedded movie with id: ${movie.id}`);

                await sleep((60 / 100) * 1000); // to avoid RPM (100 request)
            } catch (error) {
                const err =
                    error instanceof Error ? error.message : "Unknown Error";
                console.log(`${++count}- ${movie.id} Failed with ${err}`);
                continue;
            }
        }
        return output;
    }
}
export async function makeEmbedding(content: string, retries = 0) {
    const ai = getGoogleClient(API_KEYS[currentIndex]);
    try {
        const response = await ai.models.embedContent({
            model: "gemini-embedding-001",
            contents: content,
            config: {
                outputDimensionality: 768,
            },
        });
        const embedding = response.embeddings?.at(0)?.values;

        if (!embedding) throw ERRORS.INTERNAL("AI didn't return embeddings");

        return embedding;
    } catch (error) {
        // condition to avoid maximum recursion depth error.
        if (retries > API_KEYS.length)
            throw ERRORS.INTERNAL("All api keys are rate limited");

        const code = (error as any)?.error?.code as number | undefined;
        // too many requests means i'm getting rate limited.
        if (code === 429) {
            // switch to another api-key
            currentIndex = (currentIndex + 1) % API_KEYS.length;

            return makeEmbedding(content, retries + 1);
        }
        // if it's a weird error just throw it.
        throw error;
    }
}
