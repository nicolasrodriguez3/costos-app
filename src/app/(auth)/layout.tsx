import Link from "next/link";

import { envs } from "@/config/envs";

const title = envs.NEXT_PUBLIC_APP_TITLE;
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-gray-900 to-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🍕</span>
              <span className="font-bold text-xl bg-linear-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                {title}
              </span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="flex-1 w-full grid place-items-center">{children}</div>
    </div>
  );
}
