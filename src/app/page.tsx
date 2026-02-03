import {
  ArrowRight,
  BarChart3,
  Calculator,
  ChefHat,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { WaitlistForm } from "@/components/WaitlistForm";
import { envs } from "@/config/envs";

const features = [
  {
    icon: ChefHat,
    title: "Recetas Inteligentes",
    description:
      "Crea y gestiona tus recetas con cálculo automático de costos por ingrediente.",
  },
  {
    icon: Calculator,
    title: "Control de Costos",
    description:
      "Conoce el costo real de cada producto y establece precios que maximicen tu ganancia.",
  },
  {
    icon: ShoppingCart,
    title: "Punto de Venta",
    description:
      "Sistema POS integrado para registrar tus ventas de forma rápida y sencilla.",
  },
  {
    icon: BarChart3,
    title: "Reportes y Analytics",
    description:
      "Visualiza el rendimiento de tu negocio con estadísticas en tiempo real.",
  },
];

const title = envs.NEXT_PUBLIC_APP_TITLE;

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden relative min-h-screen text-white from-gray-900 via-gray-900 to-black bg-linear-to-br">
      {/* Global Background Decorations */}
      <div
        className="overflow-hidden absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(800px circle at top right, rgba(249, 115, 22, 0.12) 0%, transparent 70%),
            radial-gradient(800px circle at 0% 500px, rgba(239, 68, 68, 0.12) 0%, transparent 70%),
            radial-gradient(1000px circle at 70% 99%, rgba(239, 68, 68, 0.09) 0%, transparent 70%)
          `,
        }}
      />
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md bg-gray-900/80 border-white/5">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex gap-2 items-center">
              <span className="text-2xl">🍕</span>
              <span className="text-xl font-bold text-transparent bg-clip-text from-orange-400 to-red-500 bg-linear-to-r">
                {title}
              </span>
            </Link>
            <div className="flex relative gap-2 items-center">
              <div className="relative z-0 text-sm text-gray-300 transition-colors peer">
                Iniciar sesión
              </div>
              <span className="absolute -top-3 left-1/2 z-20 px-2 py-0.5 text-sm text-orange-500 whitespace-nowrap bg-white rounded-full border opacity-0 transition-opacity -translate-x-1/2 pointer-events-none border-white/10 peer-hover:opacity-100">
                ¡Muy pronto!
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-32 w-full sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-4xl text-center">
          <div className="inline-flex gap-2 items-center px-4 py-2 mb-8 text-sm text-gray-300 rounded-full border bg-white/5 border-white/10">
            <span>Disponible muy pronto</span>
            <Sparkles className="w-4 h-4 text-orange-400" />
          </div>

          <h1 className="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl md:text-6xl">
            <span className="text-white">Controlá los</span>
            <br />
            <span className="text-transparent bg-clip-text from-orange-400 via-red-500 to-orange-600 bg-linear-to-r">
              números de tu negocio
            </span>
            <br />
            <span className="text-white">como un profesional</span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 sm:text-xl">
            Controla ingredientes, calcula costos automáticamente, registra
            ventas y visualiza el rendimiento de tu negocio en un solo lugar.
          </p>

          <a
            href="#waitlist"
            className="inline-flex gap-2 items-center px-8 py-4 text-lg font-semibold from-orange-500 to-red-600 rounded-xl shadow-lg transition-all duration-300 transform bg-linear-to-r hover:from-orange-600 hover:to-red-700 hover:scale-105 shadow-orange-500/25"
          >
            Únete a la lista de espera
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              Todo lo que necesitas para{" "}
              <span className="text-transparent bg-clip-text from-orange-400 to-red-500 bg-linear-to-r">
                tu negocio
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-400">
              Herramientas diseñadas específicamente para pizzerías y negocios
              de comida.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl border transition-all duration-300 group bg-white/5 border-white/10 hover:bg-white/10 hover:border-orange-500/30"
              >
                <div className="inline-flex justify-center items-center mb-4 w-12 h-12 text-orange-400 rounded-xl transition-transform bg-linear-to-br from-orange-500/20 to-red-500/20 group-hover:scale-110">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section
        id="waitlist"
        className="overflow-hidden relative px-4 py-20 sm:px-6 lg:px-8"
      >
        <div
          className="mx-auto max-w-md transition-transform duration-300 group/card 
          hover:scale-[102%]"
        >
          <div
            className="relative p-8 rounded-2xl bg-gray-950/40 border 
            border-white/10 backdrop-blur-md transition-all duration-500 
            hover:border-orange-500/50 focus-within:border-orange-500/50 
            hover:shadow-[0_0_40px_rgba(249,115,22,0.15)] 
            focus-within:shadow-[0_0_40px_rgba(249,115,22,0.15)] overflow-hidden"
          >
            <div
              className="absolute inset-0 rounded-2xl border-2 border-transparent 
              opacity-0 transition-opacity duration-500 pointer-events-none 
              group-hover/card:opacity-100 group-focus-within/card:opacity-100 
              mask-[linear-gradient(white,white),linear-gradient(white,white)] 
              [mask-clip:padding-box,border-box] mask-exclude 
              [-webkit-mask-composite:destination-out]"
            >
              <div
                className="absolute -inset-full animate-spin-slow 
                  bg-[conic-gradient(from_0deg,transparent_0,transparent_45%,rgb(249,115,22)_50%,transparent_55%,transparent_100%)]"
                style={{ animationDuration: "5s" }}
              />
            </div>

            <div className="relative z-10">
              <div className="mb-8 text-center">
                <span className="block mb-4 text-4xl">🚀</span>
                <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
                  Sé el primero en probarla
                </h2>
                <p className="text-gray-400">
                  Déjanos tu email y te avisaremos cuando {title} esté
                  disponible.
                </p>
              </div>

              <WaitlistForm />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-8 border-t border-white/5">
        <div className="mx-auto max-w-6xl text-sm text-center text-gray-500">
          <p>© 2026 {title}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
