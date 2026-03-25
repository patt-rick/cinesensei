import { NextRequest, NextResponse } from "next/server";
import { STUB_ANIME } from "@/lib/stub-data";
import { Title } from "@/lib/types";

const ANILIST_URL = "https://graphql.anilist.co";

const TRENDING_QUERY = `
query TrendingAnime($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: TRENDING_DESC, isAdult: false) {
      id
      title { romaji english native }
      description(asHtml: false)
      coverImage { large extraLarge }
      bannerImage
      genres
      averageScore
      popularity
      nextAiringEpisode { airingAt episode }
      startDate { year month day }
      episodes
      studios(isMain: true) { nodes { name } }
    }
  }
}
`;

function mapAnilistToTitle(item: Record<string, unknown>): Title {
  const titleData = item.title as Record<string, string>;
  const startDate = item.startDate as Record<string, number | null>;
  const coverImage = item.coverImage as Record<string, string>;
  const nextAiring = item.nextAiringEpisode as Record<string, number> | null;
  const studios = (item.studios as { nodes: { name: string }[] })?.nodes || [];

  const year = startDate?.year || undefined;
  const releaseDate = startDate?.year && startDate?.month && startDate?.day
    ? `${startDate.year}-${String(startDate.month).padStart(2, "0")}-${String(startDate.day).padStart(2, "0")}`
    : undefined;

  return {
    id: `anilist-${item.id}`,
    anilistId: item.id as number,
    type: "anime",
    title: titleData?.english || titleData?.romaji || "",
    overview: ((item.description as string) || "").replace(/<[^>]+>/g, ""),
    posterPath: coverImage?.extraLarge || coverImage?.large || undefined,
    genres: (item.genres as string[]) || [],
    rating: Math.round(((item.averageScore as number) || 0) / 10),
    voteCount: item.popularity as number,
    language: "ja",
    studio: studios[0]?.name,
    episodeCount: item.episodes as number | undefined,
    releaseDate,
    nextAirDate: nextAiring ? new Date(nextAiring.airingAt * 1000).toISOString().split("T")[0] : undefined,
    year: year as number | undefined,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre") || "";

  try {
    const res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        query: TRENDING_QUERY,
        variables: { page: 1, perPage: 20 },
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("AniList request failed");

    const json = await res.json();
    let results: Title[] = (json?.data?.Page?.media || []).map(mapAnilistToTitle);

    if (genre) {
      results = results.filter((t) =>
        t.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }

    return NextResponse.json({ results });
  } catch {
    // Fallback to stubs
    let results = [...STUB_ANIME];
    if (genre) {
      results = results.filter((t) =>
        t.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      );
    }
    return NextResponse.json({ results });
  }
}
