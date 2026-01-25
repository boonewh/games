import Link from "next/link";

export default function WrathUnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6 bg-stone-dark font-spectral">
      <div className="max-w-lg text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-abyssal-red to-red-900 rounded-sm flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-parchment" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-4 text-wotr-gold font-cinzel uppercase tracking-widest">Access Denied</h1>
        <p className="mb-6 text-parchment/80 leading-relaxed">
          The Wardstone&apos;s protective magic bars your passage. You don&apos;t have permission to view that page.
          If you believe this is a mistake, sign in with a different account or contact the crusade commander.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/sign-in"
            className="px-6 py-3 bg-wotr-gold hover:bg-wotr-gold/90 text-stone-dark font-bold rounded-sm transition-colors font-cinzel uppercase tracking-wider"
          >
            Sign In
          </Link>
          <Link
            href="/wrath"
            className="px-6 py-3 border border-zinc-700 hover:border-wardstone-blue text-parchment hover:text-wardstone-blue rounded-sm transition-colors font-cinzel uppercase tracking-wider"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  );
}
