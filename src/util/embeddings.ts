import { GoogleGenAI } from "@google/genai";
import { configDotenv } from "dotenv";
import { formatMovieToText } from "./formatMovie.js";
import type { MovieEmbeddingType } from "../db/schema.js";
import { ERRORS } from "../errors/error.js";
import { sleep } from "./sleep.js";
import type { Movie } from "../types/movie.js";
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
