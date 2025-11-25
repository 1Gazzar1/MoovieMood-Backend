import { Request, Response } from "express";
import { MovieEmbedding } from "../db/schema.js";
import { embedMovie, embedMovies } from "../util/embeddings.js";
import type { Movie } from "../types/movie.js";

export const createMovieEmbedding = async (req: Request, res: Response) => {
    const movie = req.body;
    const embedding = await embedMovie(movie);
    const document = await MovieEmbedding.create(embedding);
    res.status(200).json({ status: 200, document });
};

export const createMovieEmbeddings = async (req: Request, res: Response) => {
    const movies = req.body as Movie[];
    const moviesInDB = await MovieEmbedding.find().select("id");
    console.log(moviesInDB.length);
    const moviesInDbIdsSet = new Set<number>(moviesInDB.map((m) => m._id));
    const moviesNotInDb = movies.filter((m) => !moviesInDbIdsSet.has(m.id));

    const embeddings = await embedMovies(moviesNotInDb);
    const documents = await MovieEmbedding.create(embeddings);

    res.status(200).json({ status: 200, documents });
};
