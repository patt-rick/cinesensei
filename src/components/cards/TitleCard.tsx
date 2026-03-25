"use client";

import Image from "next/image";
import { Star, Plus, Check, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { Title } from "@/lib/types";
import { formatReleaseDate, formatRelativeDate } from "@/lib/date-utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";

interface TitleCardProps {
  title: Title;
  onAddToWatchlist?: (title: Title) => void;
  isInWatchlist?: boolean;
  onLoginRequired?: () => void;
  className?: string;
}

export function TitleCard({
  title,
  onAddToWatchlist,
  isInWatchlist,
  onLoginRequired,
  className,
}: TitleCardProps) {
  const { user } = useAuth();

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      onLoginRequired?.();
      return;
    }
    onAddToWatchlist?.(title);
  };

  const posterUrl = title.posterPath?.startsWith("http")
    ? title.posterPath
    : title.posterPath
    ? `https://image.tmdb.org/t/p/w500${title.posterPath}`
    : null;

  const nextDate = title.nextAirDate;
  const releaseDate = title.releaseDate;

  return (
    <motion.div
      className={cn(
        "group relative bg-[#111827] rounded-xl overflow-hidden border border-[#1f2937] hover:border-indigo-500/50 transition-all duration-200",
        className
      )}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.15 }}
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative bg-[#1f2937]">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={title.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl text-gray-600">🎬</span>
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Type badge */}
        <div className="absolute top-2 left-2">
          <Badge
            className={cn(
              "text-xs font-medium",
              title.type === "anime"
                ? "bg-purple-600/80 text-white border-0"
                : title.type === "tv"
                ? "bg-cyan-600/80 text-white border-0"
                : "bg-indigo-600/80 text-white border-0"
            )}
          >
            {title.type === "anime" ? "Anime" : title.type === "tv" ? "TV" : "Movie"}
          </Badge>
        </div>

        {/* Watchlist button */}
        {onAddToWatchlist && (
          <button
            onClick={handleWatchlistClick}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all duration-150 opacity-0 group-hover:opacity-100",
              isInWatchlist
                ? "bg-green-600/80 text-white"
                : "bg-black/60 text-white hover:bg-indigo-600/80"
            )}
          >
            {isInWatchlist ? <Check size={14} /> : <Plus size={14} />}
          </button>
        )}

        {/* Rating */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-full">
          <Star size={11} className="text-yellow-400 fill-yellow-400" />
          <span className="text-xs text-white font-medium">{title.rating}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white truncate leading-tight">{title.title}</h3>

        {/* Date info */}
        {(nextDate || releaseDate) && (
          <div className="flex items-center gap-1 mt-1">
            <Calendar size={11} className="text-indigo-400 flex-shrink-0" />
            <div className="flex flex-col">
              {nextDate ? (
                <>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {formatReleaseDate(nextDate)}
                  </span>
                  <span className="text-[9px] text-gray-500">{formatRelativeDate(nextDate)}</span>
                </>
              ) : (
                <span className="text-[10px] text-gray-400 font-mono">
                  {formatReleaseDate(releaseDate)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Genres */}
        {title.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {title.genres.slice(0, 2).map((g) => (
              <span key={g} className="text-[10px] text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
