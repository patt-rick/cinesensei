"use client";

import Image from "next/image";
import { X, Star, Calendar, Bookmark, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Title } from "@/lib/types";
import { formatReleaseDate, formatRelativeDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TitleDetailModalProps {
  title: Title | null;
  open: boolean;
  onClose: () => void;
  isInWatchlist?: boolean;
  onToggleWatchlist?: (title: Title) => void;
  onLoginRequired?: () => void;
}

export function TitleDetailModal({
  title,
  open,
  onClose,
  isInWatchlist,
  onToggleWatchlist,
  onLoginRequired,
}: TitleDetailModalProps) {
  if (!title) return null;

  const posterUrl = title.posterPath?.startsWith("http")
    ? title.posterPath
    : title.posterPath
    ? `https://image.tmdb.org/t/p/w500${title.posterPath}`
    : null;

  const backdropUrl = title.backdropPath?.startsWith("http")
    ? title.backdropPath
    : title.backdropPath
    ? `https://image.tmdb.org/t/p/w1280${title.backdropPath}`
    : null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div
            className="relative bg-[#111827] border border-[#1f2937] rounded-t-2xl sm:rounded-2xl w-full max-w-lg mx-0 sm:mx-4 max-h-[85vh] overflow-y-auto"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            {/* Backdrop */}
            {backdropUrl && (
              <div className="relative h-40 sm:h-48 overflow-hidden rounded-t-2xl">
                <Image src={backdropUrl} alt="" fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#111827]" />
              </div>
            )}

            <div className="p-5">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-black/50 p-1.5 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <div className="flex gap-4">
                {/* Poster */}
                <div className="relative flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden bg-[#1f2937]">
                  {posterUrl ? (
                    <Image src={posterUrl} alt={title.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white leading-tight">{title.title}</h2>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge
                      className={
                        title.type === "anime"
                          ? "bg-purple-600/80 text-white border-0 text-xs"
                          : "bg-indigo-600/80 text-white border-0 text-xs"
                      }
                    >
                      {title.type === "anime" ? "Anime" : title.type === "tv" ? "TV" : "Movie"}
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-white font-medium">{title.rating}</span>
                    </div>
                    {title.year && (
                      <span className="text-sm text-gray-400">{title.year}</span>
                    )}
                  </div>

                  {(title.nextAirDate || title.releaseDate) && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <Calendar size={13} className="text-indigo-400" />
                      <div>
                        {title.nextAirDate ? (
                          <p className="text-xs text-indigo-300 font-mono">
                            Next: {formatReleaseDate(title.nextAirDate)}{" "}
                            <span className="text-gray-400">
                              ({formatRelativeDate(title.nextAirDate)})
                            </span>
                          </p>
                        ) : (
                          <p className="text-xs text-gray-400 font-mono">
                            {formatReleaseDate(title.releaseDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Overview */}
              {title.overview && (
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">{title.overview}</p>
              )}

              {/* Genres */}
              {title.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {title.genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs text-gray-300 bg-white/8 border border-white/10 px-2 py-0.5 rounded-full"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}

              {/* Studio / Platform */}
              {(title.studio || title.streamingPlatforms?.length) && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-400">
                  {title.studio && <span>Studio: <strong className="text-gray-300">{title.studio}</strong></span>}
                  {title.streamingPlatforms?.length && (
                    <span>Streaming: <strong className="text-gray-300">{title.streamingPlatforms.join(", ")}</strong></span>
                  )}
                </div>
              )}

              {/* Watchlist button */}
              {onToggleWatchlist && (
                <Button
                  onClick={() => {
                    if (!onToggleWatchlist) return;
                    onToggleWatchlist(title);
                  }}
                  variant={isInWatchlist ? "secondary" : "default"}
                  className={`w-full mt-4 ${isInWatchlist ? "bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30" : "bg-indigo-600 hover:bg-indigo-700 text-white"}`}
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheck size={16} className="mr-2" /> In Watchlist
                    </>
                  ) : (
                    <>
                      <Bookmark size={16} className="mr-2" /> Add to Watchlist
                    </>
                  )}
                </Button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
