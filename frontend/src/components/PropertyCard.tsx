import type { Property } from "@/lib/api";
import { Button } from "./Button";

export type PropertyCardProps = {
  property: Property;
  liked: boolean;
  busy?: boolean;
  onToggleLike: () => void;
};

export function PropertyCard({
  property,
  liked,
  busy,
  onToggleLike,
}: PropertyCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm">
      <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-video">
        <img
          src={property.image}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h3 className="text-lg font-semibold leading-snug text-slate-900">
            {property.name}
          </h3>
          <span className="shrink-0 rounded-md bg-teal-50 px-2 py-1 text-sm font-semibold text-teal-800">
            ${property.price}
          </span>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
          {property.description}
        </p>
        <div className="mt-auto pt-2">
          <Button
            type="button"
            variant={liked ? "secondary" : "primary"}
            className="min-h-11 w-full touch-manipulation sm:w-auto"
            disabled={busy}
            onClick={onToggleLike}
          >
            {busy ? "…" : liked ? "Remove from favourites" : "Add to favourites"}
          </Button>
        </div>
      </div>
    </article>
  );
}
