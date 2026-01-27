import Image from 'next/image'; 

export default function LoginAndVisitanteFooter() {
return (
<div className="mt-12 pt-8 border-t border-white/20 text-center space-y-6">
        <p className="text-white/80 text-sm">Sistema de gestión de archivos digitales</p>
        <div className="flex justify-center items-center gap-6 sm:gap-8">
          <div className="w-16 sm:w-20 md:w-24">
            <Image
              src="/logo_white.png"
              alt="Logo"
              width={400}
              height={400}
              className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              priority={false}
            />
          </div>
          <div className="w-[30%] max-w-[80px]">
            <Image
              src="/legado.png"
              alt="Legado"
              width={400}
              height={400}
              className="w-full h-auto opacity-90 hover:opacity-100 transition-opacity duration-300"
              priority={false}
            />
          </div>
        </div>
</div>
)}; 