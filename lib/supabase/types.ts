export interface DownloadLink {
  label: string;
  url: string;
  season?: number;
  episode?: number;
}

export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  year: number | null;
  genre: string | null;
  rating: number | null;
  duration: string | null;
  studio: string | null;
  director: string | null;
  cast: string | null;
  poster: string | null;
  backdrop: string | null;
  synopsis: string | null;
  trailer: string | null;
  download_links: DownloadLink[];
  featured: boolean;
  popular: boolean;
  updated_at: string | null;
  created_at: string;
}

export interface ContentItemInput {
  id: string;
  title: string;
  slug: string;
  type: "movie" | "series";
  year: number | null;
  genre: string | null;
  rating: number | null;
  duration: string | null;
  studio: string | null;
  director: string | null;
  cast: string | null;
  poster: string | null;
  backdrop: string | null;
  synopsis: string | null;
  trailer: string | null;
  download_links: DownloadLink[];
  featured: boolean;
  popular: boolean;
  updated_at: string | null;
}

export interface TMDBResponse {
  tmdb_id: number;
  media: "movie" | "tv";
  title: string;
  year: number | null;
  poster: string | null;
  backdrop: string | null;
  synopsis: string | null;
  duration: string | null;
  rating: number | null;
  imdb_id: string | null;
  genre: string | null;
  cast: string | null;
  director: string | null;
}

export interface TMDBDetailResponse extends TMDBResponse {
  seasons?: TMDBSeason[];
}

export interface TMDBSeason {
  season_number: number;
  episode_count: number;
  air_date: string | null;
  name: string;
  overview: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface SearchParams {
  q?: string;
  genre?: string;
  type?: "movie" | "series" | "all";
  sort?: "year" | "updated" | "rating";
  page?: number;
  limit?: number;
}