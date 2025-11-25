import { Groq } from "groq-sdk";
import { getMoviesPerIds } from "./getMovies.js";
import { formatMovieToText } from "./formatMovie.js";

const groq = new Groq({ apiKey: process.env.LLM_MODEL_API_KEY });

export async function RAG(
    userQuery: string,
    relevantMovieIds: number[],
    userPreference: number[] // also movieIds (but the ones the user watched / liked)
) {
    const relevantMovies = await getMoviesPerIds(relevantMovieIds);
    const userMovies = await getMoviesPerIds(userPreference);
    const aiQuery = `
        You are an AI Assistant for a Movie website.

        Relevant Movie Info: 
        ${relevantMovies
            .map((m, i) => `${i}-  ${formatMovieToText(m)}`)
            .join("\n")}


        User Likes: 
        ${userMovies.map((m, i) => `${i}-  ${formatMovieToText(m)}`).join("\n")}
    
        User Question: 
        ${userQuery}
        `;
    console.log(aiQuery);
    const chatCompletion = await getGroqChatCompletion(aiQuery);

    const returns = chatCompletion.choices[0]?.message?.content || "";
    console.log(returns);
    return returns;
}

export async function getGroqChatCompletion(
    query: string,
    model = "openai/gpt-oss-20b"
) {
    return groq.chat.completions.create({
        messages: [
            {
                role: "user",
                content: query,
            },
        ],
        model: model,
    });
}
