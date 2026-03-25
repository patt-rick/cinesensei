"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Bookmark, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Title } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoginModal } from "@/components/layout/LoginModal";
import { useAuth } from "@/lib/auth-context";
import { addToWatchlist, getWatchlist } from "@/lib/firestore";
import { ALL_GENRES } from "@/lib/stub-data";
import { formatReleaseDate, formatRelativeDate } from "@/lib/date-utils";
import { toast } from "sonner";
import Image from "next/image";

type Phase = "idle" | "spinning" | "reveal";

function playTick() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 600 + Math.random() * 400;
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // AudioContext may not be available
  }
}

function playReveal() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    [0, 0.1, 0.2, 0.35].forEach((t, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = [523, 659, 784, 1047][i];
      gain.gain.setValueAtTime(0.15, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.3);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 0.3);
    });
  } catch {
    // AudioContext may not be available
  }
}

export default function LotteryPage() {
  const { user } = useAuth();
  const [pool, setPool] = useState<Title[]>([]);
  const [phase, setPhase] = useState<Phase>("idle");
  const [spinIndex, setSpinIndex] = useState(0);
  const [winner, setWinner] = useState<Title | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [confetti, setConfetti] = useState(false);

  // Filters
  const [type, setType] = useState("all");
  const [genre, setGenre] = useState("");

  const spinInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const spinCount = useRef(0);

  useEffect(() => {
    if (!user) return;
    getWatchlist(user.uid).then((wl) => {
      setWatchlistIds(new Set(wl.map((w) => w.titleId)));
    });
  }, [user]);

  const fetchPool = useCallback(async () => {
    const params = new URLSearchParams({ type, count: "8" });
    if (genre) params.set("genre", genre);
    const res = await fetch(`/api/lottery?${params}`).then((r) => r.json());
    return res.results as Title[];
  }, [type, genre]);

  const spin = useCallback(async () => {
    if (phase === "spinning") return;

    const results = await fetchPool();
    if (results.length < 3) {
      toast.error("Not enough titles to spin. Try different filters.");
      return;
    }

    setPool(results);
    setPhase("spinning");
    setWinner(null);
    spinCount.current = 0;

    // Spin: show rapid cycling then slow down
    const totalTicks = 20 + Math.floor(Math.random() * 15);

    spinInterval.current = setInterval(() => {
      spinCount.current++;
      setSpinIndex((i) => (i + 1) % results.length);
      if (soundEnabled) playTick();

      if (spinCount.current >= totalTicks) {
        clearInterval(spinInterval.current!);
        const winnerIndex = Math.floor(Math.random() * results.length);
        const picked = results[winnerIndex];
        setSpinIndex(winnerIndex);
        setWinner(picked);
        setPhase("reveal");
        setConfetti(true);
        if (soundEnabled) {
          setTimeout(playReveal, 300);
        }
        setTimeout(() => setConfetti(false), 3000);
      }
    }, spinCount.current < totalTicks * 0.6 ? 80 : 160);
  }, [phase, fetchPool, soundEnabled]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (spinInterval.current) clearInterval(spinInterval.current);
    };
  }, []);

  const handleSave = async () => {
    if (!winner) return;
    if (!user) {
      setShowLogin(true);
      return;
    }
    await addToWatchlist(user.uid, winner);
    setWatchlistIds((prev) => new Set([...prev, winner.id]));
    toast.success(`${winner.title} added to watchlist!`);
  };

  const reset = () => {
    setPhase("idle");
    setWinner(null);
    setPool([]);
    spinCount.current = 0;
  };

  const currentTitle = pool[spinIndex];
  const posterUrl = (winner || currentTitle)?.posterPath?.startsWith("http")
    ? (winner || currentTitle)!.posterPath
    : (winner || currentTitle)?.posterPath
    ? `https://image.tmdb.org/t/p/w500${(winner || currentTitle)!.posterPath}`
    : null;

  return (
    <div className="min-h-screen px-4 sm:px-8 py-8 flex flex-col items-center">
      {/* Confetti overlay */}
      <AnimatePresence>
        {confetti && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {Array.from({ length: 40 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-sm"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: "-10px",
                  backgroundColor: ["#6366f1", "#a855f7", "#06b6d4", "#f59e0b", "#22c55e"][
                    Math.floor(Math.random() * 5)
                  ],
                }}
                animate={{
                  y: ["0vh", "110vh"],
                  rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                  x: [0, (Math.random() - 0.5) * 200],
                }}
                transition={{
                  duration: 2 + Math.random() * 1.5,
                  delay: Math.random() * 1,
                  ease: "easeIn",
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center justify-center gap-2">
            <Shuffle className="text-indigo-400" />
            Lottery Mode
          </h1>
          <p className="text-gray-400 text-sm mt-1">Spin to discover your next watch</p>
        </div>

        {/* Filters */}
        {phase === "idle" && (
          <motion.div
            className="bg-[#111827] border border-[#1f2937] rounded-xl p-4 mb-6 grid grid-cols-2 gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Content Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="all">All</option>
                <option value="movie">Movies</option>
                <option value="anime">Anime</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full bg-[#1f2937] border border-[#374151] text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
              >
                <option value="">Any Genre</option>
                {ALL_GENRES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Wheel / Card display */}
        <div className="relative flex flex-col items-center justify-center mb-8">
          {/* Spinning phase */}
          {phase === "spinning" && currentTitle && (
            <motion.div
              className="relative w-48 h-72 rounded-xl overflow-hidden border-4 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.6)]"
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 0.3, repeat: Infinity, ease: "linear" }}
            >
              {posterUrl ? (
                <Image src={posterUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-indigo-900 flex items-center justify-center text-5xl">
                  🎬
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </motion.div>
          )}

          {/* Reveal phase */}
          {phase === "reveal" && winner && (
            <AnimatePresence>
              <motion.div
                className="flex flex-col items-center gap-4"
                initial={{ scale: 0.5, opacity: 0, rotateY: 180 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
              >
                <div className="relative w-48 h-72 rounded-xl overflow-hidden border-4 border-indigo-500 shadow-[0_0_60px_rgba(99,102,241,0.8)]">
                  {posterUrl ? (
                    <Image src={posterUrl} alt={winner.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full bg-indigo-900 flex items-center justify-center text-5xl">
                      🎬
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-indigo-400 text-xs font-medium mb-1 uppercase tracking-widest">
                    Tonight&apos;s Pick
                  </p>
                  <h2 className="text-2xl font-bold text-white">{winner.title}</h2>

                  <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                    <Badge className={winner.type === "anime" ? "bg-purple-600/80 text-white border-0" : "bg-indigo-600/80 text-white border-0"}>
                      {winner.type === "anime" ? "Anime" : winner.type === "tv" ? "TV" : "Movie"}
                    </Badge>
                    <span className="text-sm text-yellow-400">★ {winner.rating}</span>
                    {winner.year && <span className="text-sm text-gray-400">{winner.year}</span>}
                  </div>

                  {(winner.nextAirDate || winner.releaseDate) && (
                    <p className="text-xs text-indigo-300 font-mono mt-2">
                      {winner.nextAirDate ? (
                        <>Next: {formatReleaseDate(winner.nextAirDate)} ({formatRelativeDate(winner.nextAirDate)})</>
                      ) : (
                        formatReleaseDate(winner.releaseDate)
                      )}
                    </p>
                  )}

                  {winner.overview && (
                    <p className="text-sm text-gray-400 mt-3 max-w-xs line-clamp-3">{winner.overview}</p>
                  )}

                  <div className="flex gap-3 mt-4 justify-center">
                    <Button
                      onClick={handleSave}
                      disabled={watchlistIds.has(winner.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Bookmark size={15} className="mr-1.5" />
                      {watchlistIds.has(winner.id) ? "Saved" : "Save"}
                    </Button>
                    <Button variant="outline" onClick={reset} className="border-[#1f2937] text-gray-300 hover:bg-white/5">
                      <RotateCcw size={15} className="mr-1.5" /> Try Again
                    </Button>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Idle state */}
          {phase === "idle" && (
            <motion.div
              className="w-48 h-72 rounded-xl border-2 border-dashed border-[#1f2937] flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="text-center">
                <Shuffle size={40} className="text-indigo-400 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Press spin</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Spin button */}
        {phase !== "reveal" && (
          <div className="flex flex-col items-center gap-3">
            <Button
              onClick={spin}
              disabled={phase === "spinning"}
              className="w-full max-w-xs h-12 text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all duration-150"
            >
              {phase === "spinning" ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">↻</span> Spinning...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shuffle size={18} /> Spin the Wheel!
                </span>
              )}
            </Button>

            <button
              onClick={() => setSoundEnabled((s) => !s)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
              Sound {soundEnabled ? "On" : "Off"}
            </button>
          </div>
        )}
      </div>

      <LoginModal open={showLogin} onClose={() => setShowLogin(false)} />
    </div>
  );
}
