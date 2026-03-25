"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Title } from "@/lib/types";
import { TitleCard } from "@/components/cards/TitleCard";
import { TitleDetailModal } from "@/components/cards/TitleDetailModal";
import { SkeletonCard } from "@/components/cards/SkeletonCard";
import { LoginModal } from "@/components/layout/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/firestore";
import { ALL_GENRES, ALL_LANGUAGES } from "@/lib/stub-data";
import { toast } from "sonner";

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Title[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [showLogin, setShowLogin] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [genre, setGenre] = useState("");
  const [language, setLanguage] = useState("");
  const [type, setType] = useState("all");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    getWatchlist(user.uid).then((wl) => {
      setWatchlistIds(new Set(wl.map((w) => w.titleId)));
    });
  }, [user]);

  const doSearch = useCallback(
    async (q: string) => {
      if (!q.trim() && !genre && !language) {
        setResults([]);
        setSearched(false);
        return;
      }
      setLoading(true);
      setSearched(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (type !== "all") params.set("type", type);
      if (genre) params.set("genre", genre);
      if (language) params.set("language", language);

      try {
        const res = await fetch(`/api/search?${params}`).then((r) => r.json());
        setResults(res.results || []);
      } catch {
        setResults([]);
      }
      setLoading(false);
    },
    [type, genre, language]
  );

  const handleQueryChange = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(q), 400);
  };

  const handleFilterSearch = () => {
    doSearch(query);
  };

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

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      {/* Search input */}
      <div className="relative mb-4">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          placeholder="Search movies, anime, TV shows..."
          className="w-full bg-[#111827] border border-[#1f2937] focus:border-indigo-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-12 py-3 outline-none transition-colors duration-150"
          autoFocus
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              setSearched(false);
            }}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "movie", "tv", "anime"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              setType(t);
              setTimeout(() => doSearch(query), 0);
            }}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              type === t
                ? "bg-indigo-600 text-white"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white flex items-center gap-1 transition-all"
        >
          <SlidersHorizontal size={12} /> Filters
          {(genre || language) && <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />}
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <motion.div
          className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 mb-5 grid grid-cols-2 gap-3"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Genre</label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="">All Genres</option>
              {ALL_GENRES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none"
            >
              <option value="">All Languages</option>
              {ALL_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2">
            <button
              onClick={handleFilterSearch}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg font-medium transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : !searched ? (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">Search for movies & anime</p>
          <p className="text-sm mt-1">Type a title or use filters</p>
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Search size={48} className="mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium">No results found</p>
          <p className="text-sm mt-1">Try a different search term</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((t) => (
            <div key={t.id} onClick={() => setSelectedTitle(t)} className="cursor-pointer">
              <TitleCard
                title={t}
                onAddToWatchlist={handleToggleWatchlist}
                isInWatchlist={watchlistIds.has(t.id)}
                onLoginRequired={() => setShowLogin(true)}
              />
            </div>
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
