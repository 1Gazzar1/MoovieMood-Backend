export type Movie = {
    id: number;
    release_date: string;
    title: string;
    vote_average: number;
    vote_count: number;
    poster_path: string;
    overview: string;
    cast: Array<string>;
    genres: Array<string>;
};
