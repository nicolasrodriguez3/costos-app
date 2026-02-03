import Image from "next/image";
import Link from "next/link";

import { envs } from "@/config/envs";

const title = envs.NEXT_PUBLIC_APP_TITLE;
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen text-white from-gray-900 via-gray-900 to-black bg-linear-to-br">
      {/* Navigation */}
      <nav className="fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md bg-gray-900/80 border-white/5">
        <div className="px-4 mx-auto max-w-6xl sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex gap-2 items-center">
              <Image src="/logo.svg" alt="Logo" width={32} height={32} />

              <span className="text-xl font-bold text-transparent bg-clip-text from-orange-400 to-red-500 bg-linear-to-r">
                {title}
              </span>
            </Link>
          </div>
        </div>
      </nav>
      <div className="grid flex-1 place-items-center w-full">{children}</div>
    </div>
  );
}
