"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Title } from "@/lib/types";
import { TitleCard } from "@/components/cards/TitleCard";
import { TitleDetailModal } from "@/components/cards/TitleDetailModal";
import { SkeletonCard } from "@/components/cards/SkeletonCard";
import { LoginModal } from "@/components/layout/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { addToWatchlist, removeFromWatchlist, getWatchlist } from "@/lib/firestore";
import { toast } from "sonner";
import Image from "next/image";

export default function HomePage() {
  const { user } = useAuth();
  const [trending, setTrending] = useState<Title[]>([]);
  const [anime, setAnime] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroIndex, setHeroIndex] = useState(0);
  const [selectedTitle, setSelectedTitle] = useState<Title | null>(null);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    async function load() {
      const [trendingRes, animeRes] = await Promise.all([
        fetch("/api/trending").then((r) => r.json()),
        fetch("/api/anime").then((r) => r.json()),
      ]);
      setTrending(trendingRes.results || []);
      setAnime(animeRes.results || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (!user) return;
    getWatchlist(user.uid).then((wl) => {
      setWatchlistIds(new Set(wl.map((w) => w.titleId)));
    });
  }, [user]);

  // Auto-advance hero
  useEffect(() => {
    if (trending.length === 0) return;
    const interval = setInterval(() => {
      setHeroIndex((i) => (i + 1) % Math.min(trending.length, 5));
    }, 5000);
    return () => clearInterval(interval);
  }, [trending.length]);

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

  const heroTitle = trending[heroIndex];
  const heroBackdrop = heroTitle?.backdropPath?.startsWith("http")
    ? heroTitle.backdropPath
    : heroTitle?.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${heroTitle.backdropPath}`
    : null;
  const heroCount = Math.min(trending.length, 5);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative h-[50vh] sm:h-[60vh] overflow-hidden">
        {heroBackdrop ? (
          <Image
            src={heroBackdrop}
            alt={heroTitle?.title || ""}
            fill
            className="object-cover transition-opacity duration-700"
            priority
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-[#0a0a0a]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/60 to-transparent" />

        {heroTitle && (
          <div className="absolute bottom-10 left-6 sm:left-10 right-6 sm:right-auto max-w-lg">
            <motion.div
              key={heroIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <p className="text-indigo-400 text-sm font-medium mb-1 flex items-center gap-1">
                <TrendingUp size={14} /> Trending Now
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 leading-tight">
                {heroTitle.title}
              </h1>
              <p className="text-gray-300 text-sm line-clamp-2 mb-4">{heroTitle.overview}</p>
              <button
                onClick={() => setSelectedTitle(heroTitle)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors duration-150"
              >
                View Details
              </button>
            </motion.div>
          </div>
        )}

        {/* Hero nav dots */}
        {heroCount > 1 && (
          <div className="absolute bottom-4 right-6 flex items-center gap-2">
            <button
              onClick={() => setHeroIndex((i) => (i - 1 + heroCount) % heroCount)}
              className="p-1 text-white/60 hover:text-white"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: heroCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === heroIndex ? "bg-white w-4" : "bg-white/40 w-1.5"
                }`}
              />
            ))}
            <button
              onClick={() => setHeroIndex((i) => (i + 1) % heroCount)}
              className="p-1 text-white/60 hover:text-white"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </section>

      <div className="px-4 sm:px-8 pt-8 space-y-10 pb-8">
        {/* AI Picks banner */}
        <motion.div
          className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl p-4 flex items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Sparkles size={20} className="text-indigo-400 flex-shrink-0" />
          <div>
            <p className="text-white text-sm font-semibold">AI-Powered Recommendations</p>
            <p className="text-gray-400 text-xs">
              Sign in to get personalized picks based on your taste
            </p>
          </div>
        </motion.div>

        {/* Trending Movies + TV */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" /> Trending Now
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : trending.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <TrendingUp size={36} className="mx-auto mb-3 opacity-50" />
              <p>No trending titles available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {trending.map((t) => (
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
        </section>

        {/* Top Anime */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-purple-400">✦</span> Top Anime
          </h2>
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : anime.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <span className="text-4xl block mb-3">✦</span>
              <p>No anime available</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {anime.slice(0, 10).map((t) => (
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
        </section>
      </div>

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
