// Type definitions for the komik reader app

export interface Manga {
  slug: string;
  title: string;
  alternativeTitle?: string;
  cover: string;
  author: string;
  artist?: string;
  status: "ongoing" | "completed" | "hiatus";
  type: "manga" | "manhwa" | "manhua" | "comic";
  synopsis: string;
  genres: string[];
  releaseYear: number;
  rating: number;
  chapters: Chapter[];
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  number: number;
  title: string;
  releaseDate: string;
  pages: string[]; // URLs to page images
}

export interface SearchFilters {
  query?: string;
  genre?: string;
  status?: string;
  type?: string;
  sort?: "latest" | "popular" | "title";
}
