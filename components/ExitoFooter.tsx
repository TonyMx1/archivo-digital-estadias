import Image from 'next/image';

export default function ExitoFooter() {
  return (
    <footer className="bg-[#0b3b60] py-4 text-white mt-auto">
      <div className="container mx-auto px-4">
        {/* Imagen y texto con separador */}
        <div className="flex items-center justify-center gap-4">

          {/* Imagen */}
          <div className="w-[70px] sm:w-[80px]">
            <Image
              src="/legado.png"
              alt="Legado"
              width={300}
              height={300}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>

          {/* Separador vertical */}
          <div className="h-10 w-px bg-white/40"></div>

          {/* Texto */}
          <div>
            <p className="text-white/90 text-sm sm:text-base">
              Sistema de gestión de archivos digitales
            </p>
            {/* <p className="text-white/60 text-xs">
              Archivos Digitales
            </p> */}
          </div>

        </div>

        {/* Copyright centrado */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <p className="text-white/40 text-xs text-center">
            © {new Date().getFullYear()} Presidencia Municipal de San Juan del Río
          </p>
        </div>
      </div>
    </footer>
  );
}