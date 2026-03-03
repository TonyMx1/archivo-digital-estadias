import Image from 'next/image';

export default function ExitoFooter() {
  return (
    <footer className="bg-[#0b3b60] py-4 text-white mt-auto">
      <div className="container mx-auto px-4">
        {/* Imagen y texto con separador */}
        <div className="flex items-center justify-center gap-4">

          {/* Imagen */}
          <div className="w-[60px] sm:w-[80px]">
            <Image
              src="/logo_white.png"
              alt="Legado"
              width={500}
              height={500}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>

          {/* Separador vertical */}
          <div className="h-15 w-px bg-white/50"></div>

          {/* Texto */}
          <div>
            <p className="text-white/90 text-sm sm:text-base">
              Sistema de Archivo para la Administración Municipal
            </p>

            {/* <p className="text-white/60 text-xs">
              Archivos Digitales
            </p> */}
          </div>

        </div>

        {/* Copyright centrado */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="text-white/40 text-xs flex items-center justify-center gap-1 flex-wrap">
            <span>© {new Date().getFullYear()} Municipio de San Juan del Río. Todos los derechos reservados.</span>
            <span className="mx-1">•</span>
            <a href="/acerca-de" className="text-white/60 hover:text-white transition-colors">
              Acerca de ésta página
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}