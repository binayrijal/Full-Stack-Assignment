import type { ReactNode } from "react";

export type LayoutProps = {
  children: ReactNode;
  title?: string;
};

export function Layout({ children, title = "Property Buyer" }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <a href="/" className="text-lg font-semibold tracking-tight text-teal-800">
            {title}
          </a>
          <nav className="flex gap-2 text-sm text-slate-600">
            <span className="rounded-md px-2 py-1">Catalog</span>
            <span className="rounded-md px-2 py-1">Favourites</span>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
