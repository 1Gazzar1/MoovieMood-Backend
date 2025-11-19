import mongoose from "mongoose";

const MovieEmbeddingSchema = new mongoose.Schema<MovieEmbeddingType>({
    _id: {
        type: Number,
        unique: true,
    },
    embedding: Array<Number>,
});

export const MovieEmbedding = mongoose.model(
    "MovieEmbedding",
    MovieEmbeddingSchema
);

export type MovieEmbeddingType = {
    _id: number;
    embedding: number[];
};
