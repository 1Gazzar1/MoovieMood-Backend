import express, { ErrorRequestHandler, Request, Response } from "express";
import { CustomError, ERRORS } from "./errors/error";
import { config } from "dotenv";
import movieEmbeddingRouter from "./routes/MovieEmbeddingRouter";
import { embedUserQuery } from "./util/embeddings";
import { connectDB } from "./db/db";
import { RAG } from "./util/LLM_Chat";
import { MovieEmbedding, MovieEmbeddingType } from "./db/schema";

config();

const app = express();
const PORT = process.env.PORT;

// global middleware
app.use(express.json());

// test endpoint
app.get("/", (req, res) => {
    console.log(req.method, req.host, req.hostname);
    res.json("Hello world");
});

// RAG endpoint
app.post("/rag", async (req: Request, res: Response) => {
    // user query
    const { q } = req.query;
    console.log(q);

    const userPreference = req.body; //should be a list of movie ids
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
                limit: 5,
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
