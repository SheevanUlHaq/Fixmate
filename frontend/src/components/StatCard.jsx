export default function StatCard({ icon: Icon, label, value, hint }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{value ?? 0}</p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div className="rounded-xl bg-blue-50 p-3 text-blue-600"><Icon size={20} /></div>
      </div>
    </div>
  );
}
