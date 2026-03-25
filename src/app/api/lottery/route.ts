import { NextRequest, NextResponse } from "next/server";
import { STUB_MOVIES, STUB_ANIME } from "@/lib/stub-data";
import { Title } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "all";
  const genre = searchParams.get("genre") || "";
  const rawYear = searchParams.get("year") || "";
  const year = /^\d{4}$/.test(rawYear) ? rawYear : "";
  const rawCount = parseInt(searchParams.get("count") || "8");
  const count = Number.isFinite(rawCount) ? Math.min(Math.max(rawCount, 1), 20) : 8;

  let pool: Title[];
  if (type === "anime") pool = [...STUB_ANIME];
  else if (type === "movie") pool = [...STUB_MOVIES];
  else pool = [...STUB_MOVIES, ...STUB_ANIME];

  if (genre) {
    pool = pool.filter((t) => t.genres.some((g) => g.toLowerCase() === genre.toLowerCase()));
  }
  if (year) {
    pool = pool.filter((t) => String(t.year) === year);
  }

  // Shuffle
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const picks = shuffled.slice(0, Math.min(count, shuffled.length));

  // If pool too small, pad with all titles
  if (picks.length < 3) {
    const all = [...STUB_MOVIES, ...STUB_ANIME].sort(() => Math.random() - 0.5);
    return NextResponse.json({ results: all.slice(0, count) });
  }

  return NextResponse.json({ results: picks });
}
