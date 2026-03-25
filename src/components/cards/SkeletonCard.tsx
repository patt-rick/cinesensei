export function SkeletonCard() {
  return (
    <div className="bg-[#111827] rounded-xl overflow-hidden border border-[#1f2937] animate-pulse">
      <div className="aspect-[2/3] bg-[#1f2937]" />
      <div className="p-3 space-y-2">
        <div className="h-3 bg-[#1f2937] rounded w-3/4" />
        <div className="h-2 bg-[#1f2937] rounded w-1/2" />
      </div>
    </div>
  );
}
