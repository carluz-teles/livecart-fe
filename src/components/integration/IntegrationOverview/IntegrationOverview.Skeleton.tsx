import { Skeleton } from "@/components/ui/skeleton"

export function IntegrationOverviewSkeleton() {
  return (
    <div
      role="status"
      aria-label="Carregando integrações"
      className="flex flex-col gap-6"
    >
      <span className="sr-only">Carregando integrações…</span>
      <div aria-hidden="true" className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-xl" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 max-w-full" />
        </div>
      </div>
      <div
        aria-hidden="true"
        className="divide-y overflow-hidden rounded-xl border"
      >
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex items-center gap-4 p-5">
            <Skeleton className="size-10 rounded-lg" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>
      <Skeleton aria-hidden="true" className="h-10 w-full" />
      <Skeleton aria-hidden="true" className="h-52 w-full rounded-xl" />
    </div>
  )
}
