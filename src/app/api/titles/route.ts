import { NextRequest, NextResponse } from "next/server";
import { STUB_MOVIES, STUB_ANIME } from "@/lib/stub-data";
import { Title } from "@/lib/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

async function fetchTmdbDiscover(params: Record<string, string>): Promise<Title[]> {
  const key = process.env.TMDB_API_KEY;
  if (!key) return [];

  const query = new URLSearchParams({ api_key: key, ...params });
  const mediaType = params.type === "tv" ? "tv" : "movie";

  try {
    const res = await fetch(`${TMDB_BASE}/discover/${mediaType}?${query}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).slice(0, 20).map((item: Record<string, unknown>) => ({
      id: `tmdb-${item.id}`,
      tmdbId: item.id as number,
      type: mediaType,
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
  const genre = searchParams.get("genre") || "";
  const rawYear = searchParams.get("year") || "";
  const year = /^\d{4}$/.test(rawYear) ? rawYear : "";
  const language = searchParams.get("language") || "";
  const platform = searchParams.get("platform") || "";

  const tmdbParams: Record<string, string> = { type };
  if (year) tmdbParams["primary_release_year"] = year;
  if (language) tmdbParams["with_original_language"] = language;

  const tmdbResults = await fetchTmdbDiscover(tmdbParams);

  let results: Title[];
  if (tmdbResults.length > 0) {
    results = tmdbResults;
  } else {
    // Stub data with filters
    if (type === "anime") results = [...STUB_ANIME];
    else if (type === "movie") results = [...STUB_MOVIES];
    else results = [...STUB_MOVIES, ...STUB_ANIME];
  }

  if (genre) {
    results = results.filter((t) => t.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }
  if (year) {
    results = results.filter((t) => String(t.year) === year);
  }
  if (language) {
    results = results.filter((t) => t.language === language);
  }
  if (platform) {
    results = results.filter((t) =>
      t.streamingPlatforms?.some((p) => p.toLowerCase() === platform.toLowerCase())
    );
  }

  return NextResponse.json({ results });
}
