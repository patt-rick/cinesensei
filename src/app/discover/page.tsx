"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { Title } from "@/lib/types";
import { TitleCard } from "@/components/cards/TitleCard";
import { TitleDetailModal } from "@/components/cards/TitleDetailModal";
import { SkeletonCard } from "@/components/cards/SkeletonCard";
import { LoginModal } from "@/components/layout/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/firestore";
import { ALL_GENRES, ALL_LANGUAGES, STREAMING_PLATFORMS } from "@/lib/stub-data";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ContentType = "all" | "movie" | "tv" | "anime";

export default function DiscoverPage() {
  const { user } = useAuth();
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [type, setType] = useState<ContentType>("all");
  const [genre, setGenre] = useState("");
  const [year, setYear] = useState("");
  const [language, setLanguage] = useState("");
  const [platform, setPlatform] = useState("");

  const fetchTitles = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (type !== "all") params.set("type", type);
    if (genre) params.set("genre", genre);
    if (year) params.set("year", year);
    if (language) params.set("language", language);
    if (platform) params.set("platform", platform);

    try {
      let res;
      if (type === "anime") {
        res = await fetch(`/api/anime?${params}`).then((r) => r.json());
      } else {
        res = await fetch(`/api/titles?${params}`).then((r) => r.json());
      }
      setTitles(res.results || []);
    } catch {
      setTitles([]);
    }
    setLoading(false);
  }, [type, genre, year, language, platform]);

  useEffect(() => {
    fetchTitles();
  }, [fetchTitles]);

  useEffect(() => {
    if (!user) return;
    getWatchlist(user.uid).then((wl) => {
      setWatchlistIds(new Set(wl.map((w) => w.titleId)));
    });
  }, [user]);

  const handleToggleWatchlist = useCallback(
    async (title: Title) => {
      if (!user) {
        setShowLogin(true);
        return;
      }
      if (watchlistIds.has(title.id)) {
        await removeFromWatchlist(user.uid, title.id);
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(title.id);
          return next;
        });
        toast.success("Removed from watchlist");
      } else {
        await addToWatchlist(user.uid, title);
        setWatchlistIds((prev) => new Set([...prev, title.id]));
        toast.success("Added to watchlist");
      }
    },
    [user, watchlistIds]
  );

  const clearFilters = () => {
    setType("all");
    setGenre("");
    setYear("");
    setLanguage("");
    setPlatform("");
  };

  const hasFilters = type !== "all" || genre || year || language || platform;

  const years = Array.from({ length: 2025 - 1990 + 1 }, (_, i) => String(2025 - i));

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Discover</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Explore {titles.length} titles
          </p>
        </div>
        <div className="flex gap-2">
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-white text-xs">
              <X size={14} className="mr-1" /> Clear
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-[#1f2937] text-gray-300 hover:bg-white/5"
          >
            <SlidersHorizontal size={15} className="mr-1.5" /> Filters
            {hasFilters && <span className="ml-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
          </Button>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(["all", "movie", "tv", "anime"] as ContentType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-150 ${
              type === t
                ? "bg-indigo-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Filter panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className="mb-6 p-4 bg-[#111827] border border-[#1f2937] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Genre */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Genres</option>
                {ALL_GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Year</label>
              <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Years</option>
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Languages</option>
                {ALL_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Platform */}
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">All Platforms</option>
                {STREAMING_PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : titles.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <SlidersHorizontal size={40} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">No titles found</p>
          <p className="text-sm mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {titles.map((t) => (
            <motion.div
              key={t.id}
              onClick={() => setSelectedTitle(t)}
              className="cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <TitleCard
                title={t}
                onAddToWatchlist={handleToggleWatchlist}
                isInWatchlist={watchlistIds.has(t.id)}
                onLoginRequired={() => setShowLogin(true)}
              />
            </motion.div>
          ))}
        </div>
      )}

      <TitleDetailModal
        title={selectedTitle}
        open={!!selectedTitle}
        onClose={() => setSelectedTitle(null)}
        isInWatchlist={selectedTitle ? watchlistIds.has(selectedTitle.id) : false}
        onToggleWatchlist={handleToggleWatchlist}
        onLoginRequired={() => setShowLogin(true)}
      />

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
