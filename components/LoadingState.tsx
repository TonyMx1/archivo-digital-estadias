export default function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b3b60]">
      <div className="flex flex-col items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
        <br />
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0076aa]"></div>
      </div>
    </div>
  );
}
