function Pulse({ className }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
}

function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <Pulse className="h-3 w-24" />
      <Pulse className="h-8 w-36" />
      <Pulse className="h-3 w-20" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="card space-y-4">
      <Pulse className="h-4 w-40" />
      <div className="flex items-end gap-2 h-40">
        {[60, 80, 50, 90, 70, 85, 65, 75, 55, 88, 72, 95].map((h, i) => (
          <div
            key={i}
            className="flex-1 animate-pulse bg-gray-200 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Pulse className="h-7 w-48" />
          <Pulse className="h-4 w-32" />
        </div>
        <div className="flex gap-3">
          <Pulse className="h-9 w-28 rounded-lg" />
          <Pulse className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Executive Summary skeleton */}
      <div className="card space-y-4">
        <div className="flex justify-between items-start">
          <Pulse className="h-5 w-44" />
          <Pulse className="h-4 w-24" />
        </div>
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
        <Pulse className="h-4 w-4/6" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonChart />
        <SkeletonChart />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 card space-y-3">
          <Pulse className="h-4 w-32" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Pulse className="h-3 w-24 flex-1" />
              <Pulse className="h-3 w-16" />
            </div>
          ))}
        </div>
        <div className="lg:col-span-3 card space-y-4">
          <Pulse className="h-4 w-40" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-1.5">
              <Pulse className="h-3 w-full" />
              <Pulse className="h-3 w-4/5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
