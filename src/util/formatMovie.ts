import type { Movie } from "../types/movie.js";
export function formatMovieToText(movie: Movie) {
    return `Title: ${movie.title}
            Release Date: ${movie.release_date}
            Rating: ${movie.vote_average}
            Vote Count (popularity):${movie.vote_count}
            Genres: ${movie.genres.join(", ")}
            Cast Members: ${movie.cast.join(", ")}
            Movie Overview: 
            ${movie.overview}`;
}
