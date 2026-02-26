import { Home } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { GoBackButton } from "@/components/ui/go-back-button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 text-center min-h-[calc(100vh-4rem)]">
      <div className="relative w-full max-w-xl mx-auto">
        {/* Animated SVG Illustration */}
        <svg
          viewBox="0 0 800 400"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto drop-shadow-xl z-0"
        >
          <defs>
            <linearGradient id="textGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Abstract Floating Shapes */}
          <g>
            <circle cx="150" cy="100" r="16" fill="hsl(var(--primary))" opacity="0.3">
              <animate attributeName="cy" values="100; 80; 100" dur="4s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3; 0.6; 0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            <rect x="650" y="80" width="24" height="24" rx="6" fill="hsl(var(--primary))" opacity="0.2" transform="rotate(25 662 92)">
               <animateTransform attributeName="transform" type="rotate" from="25 662 92" to="385 662 92" dur="15s" repeatCount="indefinite" />
               <animate attributeName="y" values="80; 110; 80" dur="6s" repeatCount="indefinite" />
            </rect>
            <polygon points="200,320 220,350 180,350" fill="hsl(var(--primary))" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 200 335" to="-360 200 335" dur="10s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4; 0.1; 0.4" dur="5s" repeatCount="indefinite" />
            </polygon>
            <circle cx="600" cy="300" r="10" fill="hsl(var(--primary))" opacity="0.5">
              <animate attributeName="cx" values="600; 630; 600" dur="7s" repeatCount="indefinite" />
              <animate attributeName="cy" values="300; 270; 300" dur="5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Central 404 Text */}
          <text
            x="400"
            y="260"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="220"
            fontWeight="900"
            textAnchor="middle"
            fill="url(#textGradient)"
            filter="url(#glow)"
            className="select-none"
          >
            404
            <animate attributeName="opacity" values="0.85; 1; 0.85" dur="3s" repeatCount="indefinite" />
          </text>

          {/* Orbital rings */}
          <ellipse cx="400" cy="190" rx="300" ry="70" fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeDasharray="10 10" opacity="0.2" transform="rotate(-10 400 190)">
            <animateTransform attributeName="transform" type="rotate" from="-10 400 190" to="350 400 190" dur="60s" repeatCount="indefinite" />
          </ellipse>
          <ellipse cx="400" cy="190" rx="200" ry="45" fill="none" stroke="hsl(var(--primary))" strokeWidth="1" opacity="0.3" transform="rotate(15 400 190)">
             <animateTransform attributeName="transform" type="rotate" from="15 400 190" to="-345 400 190" dur="40s" repeatCount="indefinite" />
          </ellipse>
          
          {/* Animated Magnifying Glass / Scanner */}
          <g>
            <animateTransform
              attributeName="transform"
              type="translate"
              values="0,0; -50,-25; 50,-35; 0,0"
              dur="8s"
              repeatCount="indefinite"
            />
            {/* Outline of glass */}
            <circle cx="450" cy="180" r="55" fill="none" stroke="currentColor" strokeWidth="12" strokeOpacity="0.8" className="text-foreground" />
            {/* Handle */}
            <path
              d="M489 219 L 535 265"
              fill="none"
              stroke="currentColor"
              strokeWidth="22"
              strokeLinecap="round"
              className="text-foreground"
            />
            {/* Glass Lens (adds a slight tint and shine) */}
            <circle cx="450" cy="180" r="49" fill="hsl(var(--background))" fillOpacity="0.7" />
            {/* Inner reflection curve */}
            <path d="M415 160 Q 435 140 465 150" fill="none" stroke="hsl(var(--background))" strokeWidth="6" strokeLinecap="round" opacity="0.6" className="mix-blend-overlay" />
          </g>
        </svg>
      </div>

      <div className="z-10 flex flex-col items-center gap-3 mt-4 max-w-md">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-foreground">
          Página no encontrada
        </h2>
        <p className="text-lg text-muted-foreground">
          La página que buscas no existe o fue movida.
        </p>
      </div>

      <div className="z-10 flex flex-col sm:flex-row gap-4 mt-8 w-full justify-center sm:w-auto">
        <Button size="lg" className="rounded-full gap-2 transition-transform hover:scale-105" asChild>
          <Link href="/dashboard">
            <Home className="w-4 h-4" />
            Volver al inicio
          </Link>
        </Button>
        <GoBackButton />
      </div>
    </main>
  );
}
