import type { Metadata } from "next";
import { Anton, Bricolage_Grotesque, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";

const anton = Anton({ weight: "400", variable: "--font-anton", subsets: ["latin"] });
const bricolage = Bricolage_Grotesque({ variable: "--font-bricolage", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], style: ["italic", "normal"] });

export const metadata: Metadata = {
  title: "Packrat — make, remix, send starter packs",
  description:
    "The starter-pack meme as a native internet object. Make one, remix anyone's, send one to someone.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html
      lang="en"
      className={`${anton.variable} ${bricolage.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-40 border-b-[1.5px] border-ink bg-paper/85 backdrop-blur-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
            <Link href="/" className="group flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-sm border-[1.5px] border-ink bg-accent text-accent-ink tape-shadow-sm rot-2 text-lg">
                🐀
              </span>
              <span className="poster-title text-2xl tracking-tight">PACKRAT</span>
            </Link>
            <nav className="flex items-center gap-2">
              <Link href="/compose" className="btn btn-accent">
                + New pack
              </Link>
              {user ? (
                <Link href={`/@${user.handle}`} className="chip">
                  @{user.handle}
                </Link>
              ) : (
                <Link href="/login" className="btn">
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </header>
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
        <footer className="border-t-[1.5px] border-ink/40 px-4 py-6 text-center text-xs text-ink-soft">
          Packrat · a cultural mixtape · links are commodity, the commentary is the point.
        </footer>
      </body>
    </html>
  );
}
