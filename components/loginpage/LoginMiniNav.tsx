import Link from "next/link";

export default function SignInMiniNav() {
  return (
    <nav className="fixed top-0 w-full bg-auth-surface z-50">
      <div className="flex justify-between items-center w-full px-8 h-20">
        <Link href="/" className="no-underline">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-serif font-bold text-lime-500">PTG</span>
            <span className="font-headline text-lg tracking-tight text-on-surface">
              Retail Platform
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="auth-back-link text-on-surface text-sm font-medium no-underline"
        >
          Back
        </Link>
      </div>
    </nav>
  );
}
