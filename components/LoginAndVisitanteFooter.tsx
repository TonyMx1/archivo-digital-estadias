import Image from 'next/image'; 

export default function LoginAndVisitanteFooter() {
return (
<div className="mt-8 text-center space-y-4">
        <p className="text-white/80 text-sm">Sistema de gestión de archivos digitales</p>
        <div className="flex justify-center items-center gap-4">
          <div className="w-[40%] max-w-[100px]">
            <Image
              src="/logo_white.png"
              alt="Logo Presidencia"
              width={500}
              height={500}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>
          <div className="w-[30%] max-w-[80px]">
            <Image
              src="/logo-Photoroom.png"
              alt="Logo Legado"
              width={400}
              height={400}
              className="w-full h-auto opacity-90"
              priority={false}
            />
          </div>
        </div>
</div>
)}; 