import { Request, Response } from "express";
import { MovieEmbedding } from "src/db/schema";
import { embedMovie, embedMovies } from "src/util/embeddings";

export const createMovieEmbedding = async (req: Request, res: Response) => {
    const movie = req.body;
    const embedding = await embedMovie(movie);
    const document = await MovieEmbedding.create(embedding);
    res.status(200).json({ status: 200, document });
};

export const createMovieEmbeddings = async (req: Request, res: Response) => {
    const movies = req.body;
    const embeddings = await embedMovies(movies);
    const documents = await MovieEmbedding.create(embeddings);

    res.status(200).json({ status: 200, documents });
};
