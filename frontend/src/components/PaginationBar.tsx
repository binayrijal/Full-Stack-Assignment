import { Button } from "./Button";

export type PaginationBarProps = {
  page: number;
  totalCount: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPrev: () => void;
  onNext: () => void;
  busy?: boolean;
};

export function PaginationBar({
  page,
  totalCount,
  pageSize,
  hasNext,
  hasPrevious,
  onPrev,
  onNext,
  busy,
}: PaginationBarProps) {
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-slate-600 sm:text-left">
        {totalCount === 0 ? (
          "No results"
        ) : (
          <>
            Showing <span className="font-medium text-slate-900">{from}</span>–
            <span className="font-medium text-slate-900">{to}</span> of{" "}
            <span className="font-medium text-slate-900">{totalCount}</span>
          </>
        )}
      </p>
      <div className="flex justify-center gap-2 sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 min-w-[100px]"
          disabled={!hasPrevious || busy}
          onClick={onPrev}
        >
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="min-h-11 min-w-[100px]"
          disabled={!hasNext || busy}
          onClick={onNext}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
