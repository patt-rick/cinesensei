"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bookmark, Trash2, Star, Calendar } from "lucide-react";
import Image from "next/image";
import { WatchlistItem } from "@/lib/types";
import { LoginModal } from "@/components/layout/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { getWatchlist, removeFromWatchlist, updateWatchlistStatus, rateTitle } from "@/lib/firestore";
import { formatReleaseDate } from "@/lib/date-utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<WatchlistItem["status"], string> = {
  plan_to_watch: "Plan to Watch",
  watching: "Watching",
  completed: "Completed",
};

const STATUS_COLORS: Record<WatchlistItem["status"], string> = {
  plan_to_watch: "bg-indigo-600/20 text-indigo-300 border-indigo-500/30",
  watching: "bg-cyan-600/20 text-cyan-300 border-cyan-500/30",
  completed: "bg-green-600/20 text-green-300 border-green-500/30",
};

export default function WatchlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    getWatchlist(user.uid).then((wl) => {
      setItems(wl);
      setLoading(false);
    });
  }, [user, authLoading]);

  const handleRemove = async (titleId: string) => {
    if (!user) return;
    setRemovingId(titleId);
    await removeFromWatchlist(user.uid, titleId);
    setItems((prev) => prev.filter((i) => i.titleId !== titleId));
    setRemovingId(null);
    toast.success("Removed from watchlist");
  };

  const handleStatusChange = async (titleId: string, status: WatchlistItem["status"]) => {
    if (!user) return;
    await updateWatchlistStatus(user.uid, titleId, status);
    setItems((prev) =>
      prev.map((i) => (i.titleId === titleId ? { ...i, status } : i))
    );
  };

  const handleRate = async (titleId: string, rating: number) => {
    if (!user) return;
    await rateTitle(user.uid, titleId, rating);
    toast.success("Rating saved");
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <Bookmark size={48} className="text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view your watchlist</h2>
          <p className="text-gray-400 text-sm mb-6">Save movies and anime to watch later</p>
          <button
            onClick={() => setShowLogin(true)}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
          >
            Sign in
          </button>
          <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
        </div>
      </div>
    );
  }

  const stats = {
    total: items.length,
    completed: items.filter((i) => i.status === "completed").length,
    watching: items.filter((i) => i.status === "watching").length,
  };

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">My Watchlist</h1>
        <div className="flex gap-4 mt-2">
          <span className="text-sm text-gray-400">{stats.total} total</span>
          <span className="text-sm text-cyan-400">{stats.watching} watching</span>
          <span className="text-sm text-green-400">{stats.completed} completed</span>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 bg-[#111827] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <Bookmark size={48} className="mx-auto mb-4 opacity-40" />
          <p className="text-lg font-medium">Your watchlist is empty</p>
          <p className="text-sm mt-1">Browse Discover to add titles</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {items.map((item) => {
              const posterUrl = item.title.posterPath?.startsWith("http")
                ? item.title.posterPath
                : item.title.posterPath
                ? `https://image.tmdb.org/t/p/w154${item.title.posterPath}`
                : null;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: removingId === item.titleId ? 0.5 : 1, x: 0 }}
                  exit={{ opacity: 0, x: 60, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="bg-[#111827] border border-[#1f2937] rounded-xl p-3 flex items-center gap-3"
                >
                  {/* Poster */}
                  <div className="relative w-12 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#1f2937]">
                    {posterUrl ? (
                      <Image src={posterUrl} alt={item.title.title} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">🎬</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{item.title.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <Badge className={`text-xs border ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </Badge>
                      {(item.title.nextAirDate || item.title.releaseDate) && (
                        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-0.5">
                          <Calendar size={9} />
                          {formatReleaseDate(item.title.nextAirDate || item.title.releaseDate)}
                        </span>
                      )}
                    </div>

                    {/* Status selector */}
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.titleId, e.target.value as WatchlistItem["status"])
                      }
                      className="mt-1 text-xs bg-[#1f2937] border border-[#374151] text-gray-300 rounded px-1.5 py-0.5 focus:outline-none"
                    >
                      <option value="plan_to_watch">Plan to Watch</option>
                      <option value="watching">Watching</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  {/* Rating */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(item.titleId, star)}
                          className="text-yellow-400/40 hover:text-yellow-400 transition-colors"
                        >
                          <Star size={12} className="fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.titleId)}
                    disabled={removingId === item.titleId}
                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
