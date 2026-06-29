"use client"

export default function JobCardSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl border border-border bg-card flex gap-4">
          <div className="w-14 h-14 bg-muted rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-muted rounded w-3/4" />
            <div className="h-3 bg-muted rounded w-1/2" />
            <div className="flex gap-2 mt-3">
              <div className="h-3 bg-muted rounded w-20" />
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-3 bg-muted rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
