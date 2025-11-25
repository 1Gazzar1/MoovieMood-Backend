import express, { ErrorRequestHandler, Request, Response } from "express";
import { CustomError, ERRORS } from "./errors/error";
import { config } from "dotenv";
import movieEmbeddingRouter from "./routes/MovieEmbeddingRouter";
import { embedUserQuery } from "./util/embeddings";
import { connectDB } from "./db/db";
import { getGroqChatCompletion, RAG } from "./util/LLM_Chat";
import { MovieEmbedding, MovieEmbeddingType } from "./db/schema";
import { getMoviesRange } from "./util/getMovies";
import cors from "cors";
import { log } from "./middleware/log";

config();

const app = express();
const PORT = process.env.PORT;

// global middleware

// cors
app.use(
    cors({
        origin: ["http://localhost:5173", "https://mooviemood.vercel.app"],
    })
);

// json bodies
app.use(express.json({ limit: "50mb" }));

// logging middleware

app.use(log);

// test endpoint
app.get("/", (req, res) => {
    console.log(req.method, req.host, req.hostname);
    res.json("Hello world");
});
app.get("/movies/:start/:end", async (req: Request, res: Response) => {
    const st = +req.params.start;
    const end = +req.params.end;

    const movies = await getMoviesRange(st, end);

    res.status(200).json(movies);
});
// ai chat endpoint
app.post("/ai", async (req: Request, res: Response) => {
    // query , which consists of all the chats of the user and the ai.
    const { q } = req.body;
    const response = await getGroqChatCompletion(q);

    res.status(200).json({ msg: response });
});
// RAG endpoint
app.post("/rag", async (req: Request, res: Response) => {
    // user query
    const { q } = req.query;
    console.log(q);

    const userPreference = req.body || []; //should be a list of movie ids
    if (!Array.isArray(userPreference))
        throw ERRORS.BAD_REQUEST("body has an object and not a list!");
    console.log(userPreference);

    if (typeof q !== "string")
        throw ERRORS.BAD_REQUEST("user query must be string!");

    // embed the user query (question)
    const userEmbedding = await embedUserQuery(q);

    // vector search --  to compare 'embedding' with db's embeddings
    const movieEmbeddings = (await MovieEmbedding.aggregate([
        {
            $vectorSearch: {
                index: "vector_index",
                path: "embedding",
                queryVector: userEmbedding,
                numCandidates: 150,
                limit: 10,
            },
        },
    ])) as MovieEmbeddingType[];

    // only select the movie ids
    const relevantMovieIds = movieEmbeddings.map((doc) => doc._id);
    // LLM chat message
    const response = await RAG(q, relevantMovieIds, userPreference);

    res.status(200).json({ status: 200, response });
});
app.use("/Embed", movieEmbeddingRouter);

// connect to DB
await connectDB();

app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`);
});

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    if (err instanceof CustomError) {
        const errMsg = `ERROR: ${err.name}\nSTATUS: ${err.statusCode}\nMESSAGE: ${err.message}`;
        console.log(errMsg);
        res.status(err.statusCode).send(errMsg);
    } else {
        console.log(err.message);
        res.status(500).send(err.message || "INTERNAL ERROR");
    }
};

app.use(errorHandler);
