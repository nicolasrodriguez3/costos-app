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
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <span className="font-bold text-xl bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {title}
              </span>
            </div>
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8">
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-30 -left-40 w-80 h-80 bg-red-500/20 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Próximamente disponible</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            <span className="bg-linear-to-r from-orange-400 via-red-500 to-orange-600 bg-clip-text text-transparent">
              Gestiona tu pizzería
            </span>
            <br />
            <span className="text-white">como un profesional</span>
          </h1>

          <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10">
            Controla ingredientes, calcula costos automáticamente, registra
            ventas y visualiza el rendimiento de tu negocio en un solo lugar.
          </p>

          <a
            href="#waitlist"
            className="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-orange-500/25"
          >
            Únete a la lista de espera
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Todo lo que necesitas para{" "}
              <span className="bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                tu negocio
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Herramientas diseñadas específicamente para pizzerías y negocios
              de comida.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-linear-to-br from-orange-500/20 to-red-500/20 text-orange-400 mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Section */}
      <section id="waitlist" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm transition-all duration-500 hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">🚀</span>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                Sé el primero en probarla
              </h2>
              <p className="text-gray-400">
                Déjanos tu email y te avisaremos cuando Pizza Manager esté
                disponible.
              </p>
            </div>

            <WaitlistForm />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center text-gray-500 text-sm">
          <p>© 2026 {title}. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
