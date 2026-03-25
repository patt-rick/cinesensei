"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, LogOut, Film, Tv, Star, Bookmark, BarChart2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { getWatchlist, getUserRatings } from "@/lib/firestore";
import { LoginModal } from "@/components/layout/LoginModal";
import { Button } from "@/components/ui/button";
import { WatchlistItem, UserRating } from "@/lib/types";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, signOut, loading: authLoading } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [ratings, setRatings] = useState<UserRating[]>([]);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) return;
    Promise.all([getWatchlist(user.uid), getUserRatings(user.uid)]).then(([wl, r]) => {
      setWatchlist(wl);
      setRatings(r);
    });
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
  };

  if (!authLoading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <User size={48} className="text-indigo-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Sign in to view your profile</h2>
          <p className="text-gray-400 text-sm mb-6">Track your stats and preferences</p>
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

  const movies = watchlist.filter((w) => w.title.type === "movie");
  const anime = watchlist.filter((w) => w.title.type === "anime");
  const tv = watchlist.filter((w) => w.title.type === "tv");
  const completed = watchlist.filter((w) => w.status === "completed");
  const avgRating =
    ratings.length > 0
      ? (ratings.reduce((s, r) => s + r.rating, 0) / ratings.length).toFixed(1)
      : "—";

  // Genre breakdown
  const genreCount: Record<string, number> = {};
  watchlist.forEach((w) => {
    w.title.genres.forEach((g) => {
      genreCount[g] = (genreCount[g] || 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const statCards = [
    { label: "Watchlist", value: watchlist.length, icon: Bookmark, color: "text-indigo-400" },
    { label: "Movies", value: movies.length, icon: Film, color: "text-cyan-400" },
    { label: "Anime", value: anime.length, icon: Tv, color: "text-purple-400" },
    { label: "Completed", value: completed.length, icon: Star, color: "text-green-400" },
    { label: "Rated", value: ratings.length, icon: BarChart2, color: "text-yellow-400" },
    { label: "Avg Rating", value: avgRating, icon: Star, color: "text-orange-400" },
  ];

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8 max-w-2xl">
      {/* Profile header */}
      <motion.div
        className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 mb-6 flex items-center gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {user?.photoURL ? (
          <Image
            src={user.photoURL}
            alt={user.displayName || "User"}
            width={64}
            height={64}
            className="rounded-full border-2 border-indigo-500/50"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-indigo-600/30 border-2 border-indigo-500/50 flex items-center justify-center">
            <User size={28} className="text-indigo-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white truncate">
            {user?.displayName || "CineSensei User"}
          </h1>
          <p className="text-gray-400 text-sm truncate">{user?.email}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-gray-400 hover:text-white hover:bg-white/5"
        >
          <LogOut size={16} className="mr-1.5" /> Sign Out
        </Button>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            className="bg-[#111827] border border-[#1f2937] rounded-xl p-3 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Icon size={18} className={`${color} mx-auto mb-1`} />
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Genre breakdown */}
      {topGenres.length > 0 && (
        <motion.div
          className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-sm font-semibold text-white mb-3 flex items-center gap-1.5">
            <BarChart2 size={15} className="text-indigo-400" /> Favorite Genres
          </h2>
          <div className="space-y-2">
            {topGenres.map(([genre, count]) => (
              <div key={genre} className="flex items-center gap-2">
                <span className="text-sm text-gray-300 w-24 truncate">{genre}</span>
                <div className="flex-1 bg-[#1f2937] rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(count / topGenres[0][1]) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 font-mono w-4">{count}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TV shows */}
      {tv.length > 0 && (
        <div className="bg-[#111827] border border-[#1f2937] rounded-xl p-4">
          <h2 className="text-sm font-semibold text-white mb-2 flex items-center gap-1.5">
            <Tv size={15} className="text-cyan-400" /> TV Shows ({tv.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {tv.map((w) => (
              <span
                key={w.id}
                className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded-full truncate max-w-[120px]"
              >
                {w.title.title}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
