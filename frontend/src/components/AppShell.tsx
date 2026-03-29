import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export function AppShell({
  children,
  title = "Property Buyer",
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link
            to="/dashboard"
            className="text-lg font-semibold tracking-tight text-teal-800"
          >
            {title}
          </Link>
          <nav className="flex flex-wrap items-center gap-3 text-sm font-medium">
            <Link
              to="/submit-property"
              className="text-slate-600 underline-offset-2 hover:text-teal-800 hover:underline"
            >
              List a property
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
