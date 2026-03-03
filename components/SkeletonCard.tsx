export function SkeletonCard() {
  return (
    <div className="rounded-xl shadow-2xl p-6 text-white animate-pulse">
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg"></div>
        <div className="w-8 h-8 bg-white/20 rounded-full"></div>
      </div>
      <div className="text-5xl font-bold mb-2 bg-white/20 rounded-lg h-16 w-20"></div>
      <div className="text-white/90 text-lg font-semibold bg-white/20 rounded-lg h-6 w-24 mb-2"></div>
      <div className="text-white/70 text-sm bg-white/20 rounded-lg h-4 w-32"></div>
    </div>
  );
}
