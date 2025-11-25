import { Router } from "express";
import {
    createMovieEmbedding,
    createMovieEmbeddings,
} from "../controllers/MovieEmbeddingController.js";

const movieEmbeddingRouter = Router();

movieEmbeddingRouter.post("/", createMovieEmbedding);

movieEmbeddingRouter.post("/batch", createMovieEmbeddings);

export default movieEmbeddingRouter;
