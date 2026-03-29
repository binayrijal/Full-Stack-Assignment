import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/Button";
import { PaginationBar } from "@/components/PaginationBar";
import { PropertyCard } from "@/components/PropertyCard";
import { useAuth } from "@/hooks/useAuth";
import {
  fetchCatalog,
  fetchFavourites,
  toggleFavourite,
  type Paginated,
  type Property,
} from "@/lib/api";

const PAGE_SIZE = 6;

export function DashboardPage() {
  const { user, logout, refreshProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab =
    searchParams.get("tab") === "favourites" ? "favourites" : "catalog";

  const setTab = useCallback(
    (t: "catalog" | "favourites") => {
      if (t === "catalog") setSearchParams({});
      else setSearchParams({ tab: "favourites" });
    },
    [setSearchParams],
  );

  const [catPage, setCatPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [catalog, setCatalog] = useState<Paginated<Property> | null>(null);
  const [favs, setFavs] = useState<Paginated<Property> | null>(null);
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(() => new Set());
  const [loading, setLoading] = useState(true);
  const [toggleId, setToggleId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadFavouriteIdSet = useCallback(async () => {
    const res = await fetchFavourites(1, 100);
    setFavouriteIds(new Set(res.data.results.map((p) => p.id)));
  }, []);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        if (tab === "catalog") {
          const res = await fetchCatalog(catPage, PAGE_SIZE);
          if (!cancelled) {
            setCatalog(res.data);
            await loadFavouriteIdSet();
          }
        } else {
          const res = await fetchFavourites(favPage, PAGE_SIZE);
          if (!cancelled) {
            setFavs(res.data);
            setFavouriteIds(new Set(res.data.results.map((p) => p.id)));
          }
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tab, catPage, favPage, loadFavouriteIdSet]);

  const onToggle = async (p: Property, liked: boolean) => {
    setToggleId(p.id);
    setError(null);
    try {
      await toggleFavourite(p.id, !liked);
      await loadFavouriteIdSet();
      if (tab === "favourites") {
        const res = await fetchFavourites(favPage, PAGE_SIZE);
        setFavs(res.data);
      } else if (tab === "catalog") {
        const res = await fetchCatalog(catPage, PAGE_SIZE);
        setCatalog(res.data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update favourite");
    } finally {
      setToggleId(null);
    }
  };

  const catPagination = useMemo(() => {
    if (!catalog) return null;
    const total = catalog.count;
    const hasNext = Boolean(catalog.next);
    const hasPrevious = Boolean(catalog.previous);
    return { total, hasNext, hasPrevious };
  }, [catalog]);

  const favPagination = useMemo(() => {
    if (!favs) return null;
    return {
      total: favs.count,
      hasNext: Boolean(favs.next),
      hasPrevious: Boolean(favs.previous),
    };
  }, [favs]);

  const tabClass = (active: boolean) =>
    `min-h-12 flex-1 touch-manipulation rounded-xl px-4 py-3 text-sm font-semibold transition sm:min-h-0 sm:flex-none sm:px-6 ${
      active
        ? "bg-teal-600 text-white shadow-md"
        : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
    }`;

  return (
    <AppShell>
      <div className="space-y-6 pb-24 md:pb-8">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Signed in as</p>
              <p className="text-xl font-semibold text-slate-900">
                {user?.name ?? "…"}
              </p>
              <p className="mt-1 text-sm text-slate-600">
                Role:{" "}
                <span className="font-medium capitalize text-slate-800">
                  {user?.role ?? "—"}
                </span>
              </p>
              <p className="mt-0.5 break-all text-sm text-slate-500">
                {user?.email}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              <Link
                to="/dashboard/list-property"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-teal-50 px-4 py-2 text-center text-sm font-semibold text-teal-900 ring-1 ring-teal-200 transition hover:bg-teal-100 sm:w-auto"
              >
                List a new property
              </Link>
              <Button
                type="button"
                variant="secondary"
                className="min-h-11 w-full shrink-0 sm:w-auto"
                onClick={() => logout()}
              >
                Log out
              </Button>
            </div>
          </div>
        </section>

        <div
          className="hidden gap-2 sm:flex sm:justify-start"
          role="tablist"
          aria-label="Dashboard sections"
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "catalog"}
            className={tabClass(tab === "catalog")}
            onClick={() => setTab("catalog")}
          >
            Browse catalog
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "favourites"}
            className={tabClass(tab === "favourites")}
            onClick={() => setTab("favourites")}
          >
            My favourites
          </button>
        </div>

        {error ? (
          <p
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        {loading ? (
          <div className="flex justify-center py-16">
            <div
              className="h-10 w-10 animate-spin rounded-full border-2 border-teal-600 border-t-transparent"
              aria-label="Loading"
            />
          </div>
        ) : tab === "catalog" && catalog ? (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {catalog.results.map((p) => (
                <PropertyCard
                  key={p.id}
                  property={p}
                  liked={favouriteIds.has(p.id)}
                  busy={toggleId === p.id}
                  onToggleLike={() =>
                    void onToggle(p, favouriteIds.has(p.id))
                  }
                />
              ))}
            </div>
            {catPagination ? (
              <PaginationBar
                page={catPage}
                totalCount={catPagination.total}
                pageSize={PAGE_SIZE}
                hasNext={catPagination.hasNext}
                hasPrevious={catPagination.hasPrevious}
                onPrev={() => setCatPage((x) => Math.max(1, x - 1))}
                onNext={() => setCatPage((x) => x + 1)}
                busy={Boolean(toggleId)}
              />
            ) : null}
          </>
        ) : tab === "favourites" && favs ? (
          <>
            {favs.results.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center text-slate-600">
                No favourites yet. Browse the catalog and add properties you
                like.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {favs.results.map((p) => (
                  <PropertyCard
                    key={p.id}
                    property={p}
                    liked
                    busy={toggleId === p.id}
                    onToggleLike={() => void onToggle(p, true)}
                  />
                ))}
              </div>
            )}
            {favPagination ? (
              <PaginationBar
                page={favPage}
                totalCount={favPagination.total}
                pageSize={PAGE_SIZE}
                hasNext={favPagination.hasNext}
                hasPrevious={favPagination.hasPrevious}
                onPrev={() => setFavPage((x) => Math.max(1, x - 1))}
                onNext={() => setFavPage((x) => x + 1)}
                busy={Boolean(toggleId)}
              />
            ) : null}
          </>
        ) : null}

        <nav
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
          aria-label="Quick navigation"
        >
          <div className="mx-auto flex max-w-lg justify-center gap-2 px-3">
            <button
              type="button"
              className={`min-h-[3rem] flex-1 rounded-xl text-sm font-semibold touch-manipulation ${
                tab === "catalog"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setTab("catalog")}
            >
              Browse
            </button>
            <button
              type="button"
              className={`min-h-[3rem] flex-1 rounded-xl text-sm font-semibold touch-manipulation ${
                tab === "favourites"
                  ? "bg-teal-600 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
              onClick={() => setTab("favourites")}
            >
              Saved
            </button>
          </div>
        </nav>
      </div>
    </AppShell>
  );
}
