import { redirect } from "next/navigation";
import Link from "next/link";
import { devLogin } from "@/lib/auth";

export const dynamic = "force-dynamic";

async function login(formData: FormData) {
  "use server";
  const handle = String(formData.get("handle") ?? "");
  try {
    await devLogin(handle);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not sign in";
    redirect(`/login?error=${encodeURIComponent(msg)}`);
  }
  redirect("/");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <div className="mx-auto max-w-md py-10">
      <div className="ink-border tape-shadow bg-paper-2 px-6 py-8 rot-3">
        <h1 className="poster-title text-3xl">Grab a handle</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Dev sign-in — pick a handle and you&rsquo;re in. (Social login lands at deploy; this is
          the local stand-in.)
        </p>
        <form action={login} className="mt-6 space-y-3">
          <div className="flex items-stretch">
            <span className="grid place-items-center border-[1.5px] border-r-0 border-ink bg-highlight px-3 font-bold">
              @
            </span>
            <input
              name="handle"
              autoFocus
              placeholder="mara"
              className="w-full border-[1.5px] border-ink bg-paper px-3 py-2 outline-none focus:bg-paper-2"
            />
          </div>
          {error ? <p className="text-sm font-semibold text-accent">{error}</p> : null}
          <button type="submit" className="btn btn-accent btn-lg w-full">
            Enter Packrat →
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-ink-soft">
          <Link href="/" className="underline">
            back to the feed
          </Link>
        </p>
      </div>
    </div>
  );
}
