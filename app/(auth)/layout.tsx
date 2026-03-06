import HeaderAll from "@/components/HeaderAll";
import ExitoFooter from "@/components/ExitoFooter";
import { SessionTimer } from "@/components/SessionTimer";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <SessionTimer sessionTimeout={30} warningTime={5} />
      <HeaderAll showMenuButton={true} showBackButton={false} />
      
      {/* Contenido principal */}
      <main className="flex-1 bg-primary p-4 pb-0">
        {children}
      </main>

      {/* Footer */}
      <footer>
        <ExitoFooter />
      </footer>
    </div>
  );
}
