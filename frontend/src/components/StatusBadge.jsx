const map = {
  REPORTED: "bg-slate-100 text-slate-700",
  ASSIGNED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  CLOSED: "bg-violet-100 text-violet-700",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${map[status] || "bg-slate-100 text-slate-700"}`}>
      {status?.replace("_", " ")}
    </span>
  );
}
