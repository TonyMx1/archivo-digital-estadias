import Image from 'next/image'; 

export default function LoginAndVisitanteFooter() {
return (
<div className="mt-8 text-center space-y-4">
        <p className="text-white/80 text-sm">Sistema de gestión de archivos digitales</p>
        <div className="flex justify-center items-center gap-4">
          <div className="w-[30%] max-w-[80px]">
            <Image
              src="/logo_white.png"
              alt="Logo"
              width={400}
              height={400}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>
          <div className="w-[30%] max-w-[80px]">
            <Image
              src="/legado.png"
              alt="Legado"
              width={400}
              height={400}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>
        </div>
</div>
)}; 