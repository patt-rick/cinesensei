import { NextRequest, NextResponse } from "next/server";
import { STUB_MOVIES, STUB_ANIME } from "@/lib/stub-data";
import { Title } from "@/lib/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function searchTmdb(query: string, type: string): Promise<Title[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];

  const endpoint = type === "tv" ? "search/tv" : "search/movie";
  try {
    const res = await fetch(
      `${TMDB_BASE}/${endpoint}?api_key=${key}&query=${encodeURIComponent(query)}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 10).map((item: Record<string, unknown>) => ({
      id: `tmdb-${item.id}`,
      tmdbId: item.id as number,
      type: type === "tv" ? "tv" : "movie",
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
  const q = searchParams.get("q") || "";
  const type = searchParams.get("type") || "all";
  const genre = searchParams.get("genre") || "";
  const year = searchParams.get("year") || "";
  const language = searchParams.get("language") || "";

  if (!q && !genre && !year) {
    return NextResponse.json({ results: [] });
  }

  let results: Title[] = [];

  if (q) {
    const tmdbMovies = await searchTmdb(q, "movie");
    const tmdbTv = await searchTmdb(q, "tv");
    const tmdbResults = [...tmdbMovies, ...tmdbTv];

    if (tmdbResults.length > 0) {
      results = tmdbResults;
    } else {
      // Stub search
      const all = [...STUB_MOVIES, ...STUB_ANIME];
      results = all.filter(
        (t) =>
          t.title.toLowerCase().includes(q.toLowerCase()) ||
          t.overview.toLowerCase().includes(q.toLowerCase())
      );
    }
  } else {
    results = [...STUB_MOVIES, ...STUB_ANIME];
  }

  // Client-side filters on stub data
  if (type !== "all") {
    if (type === "anime") results = results.filter((t) => t.type === "anime");
    else if (type === "movie") results = results.filter((t) => t.type === "movie");
    else if (type === "tv") results = results.filter((t) => t.type === "tv");
  }
  if (genre) {
    results = results.filter((t) => t.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }
  if (year) {
    results = results.filter((t) => t.year === parseInt(year));
  }
  if (language) {
    results = results.filter((t) => t.language === language);
  }

  return NextResponse.json({ results: results.slice(0, 20) });
}
