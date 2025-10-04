// app/unauthorized/page.tsx
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg text-center">
        <h1 className="text-2xl font-bold mb-4">Access denied</h1>
        <p className="mb-6">
          You don’t have permission to view that page. If you think this is a mistake,
          sign in with a different account or contact the site admin.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-in" className="btn">Sign In</Link>
          <Link href="/" className="btn-ghost">Home</Link>
        </div>
      </div>
    </main>
  );
}
