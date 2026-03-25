export type MediaType = "movie" | "tv" | "anime";

export interface Title {
  id: string;
  tmdbId?: number;
  anilistId?: number;
  type: MediaType;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  nextAirDate?: string;
  genres: string[];
  rating: number;
  voteCount?: number;
  language?: string;
  studio?: string;
  episodeCount?: number;
  streamingPlatforms?: string[];
  year?: number;
}

export interface WatchlistItem {
  id: string;
  titleId: string;
  title: Title;
  addedAt: number;
  status: "plan_to_watch" | "watching" | "completed";
  progress?: number;
}

export interface UserRating {
  titleId: string;
  rating: number;
  ratedAt: number;
}

export interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
  preferences?: {
    genres: string[];
    languages: string[];
  };
  stats?: {
    moviesWatched: number;
    animesWatched: number;
    hoursWatched: number;
  };
}
