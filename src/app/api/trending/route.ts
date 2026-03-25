import { NextRequest, NextResponse } from "next/server";
import { STUB_MOVIES, STUB_ANIME } from "@/lib/stub-data";
import { Title } from "@/lib/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function fetchTmdbTrending(): Promise<Title[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];

  try {
    const res = await fetch(`${TMDB_BASE}/trending/all/week?api_key=${key}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 8).map((item: Record<string, unknown>) => ({
      id: `tmdb-${item.id}`,
      tmdbId: item.id as number,
      type: (item.media_type as string) === "movie" ? "movie" : "tv",
      title: (item.title as string) || (item.name as string) || "",
      overview: (item.overview as string) || "",
      posterPath: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : undefined,
      backdropPath: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : undefined,
      releaseDate: (item.release_date as string) || (item.first_air_date as string) || undefined,
      genres: [],
      rating: Math.round(((item.vote_average as number) || 0) * 10) / 10,
      voteCount: item.vote_count as number,
      language: item.original_language as string,
      year: parseInt(
        ((item.release_date as string) || (item.first_air_date as string) || "").split("-")[0]
      ) || undefined,
    }));
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";

  const tmdbResults = await fetchTmdbTrending();

  let results: Title[];
  if (tmdbResults.length > 0) {
    results = tmdbResults;
  } else {
    // Use stub data
    if (type === "movie") results = STUB_MOVIES.slice(0, 8);
    else if (type === "anime") results = STUB_ANIME.slice(0, 8);
    else results = [...STUB_MOVIES.slice(0, 4), ...STUB_ANIME.slice(0, 4)];
  }

  return NextResponse.json({ results });
}
