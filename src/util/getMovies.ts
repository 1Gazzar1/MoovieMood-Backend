import { ERRORS } from "src/errors/error";

async function getMovies() {
    const movies = await fetch(
        "https://raw.githubusercontent.com/1Gazzar1/MoovieMood/refs/heads/master/src/assets/final_movies_v4.json"
    );
    if (!movies.ok) throw ERRORS.INTERNAL("failed to fetch movies!");
    return (await movies.json()) as Movie[];
}

export async function getMoviesPerIds(ids: number[]) {
    const movies = await getMovies();
    return movies.filter((m) => ids.includes(m.id));
}

export async function getMoviesRange(start: number, end: number) {
    const movies = await getMovies();

    return movies.slice(start, end);
}
