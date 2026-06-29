export default function OverviewPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold text-gray-700">Posts Remaining</h2>
          <p className="text-4xl font-bold text-primary mt-2">10</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold text-gray-700">New Applicants</h2>
          <p className="text-4xl font-bold text-primary mt-2">5</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border border-stroke">
          <h2 className="text-lg font-semibold text-gray-700">Expiring Soon</h2>
          <p className="text-4xl font-bold text-primary mt-2">2</p>
        </div>
      </div>
    </div>
  );
}
