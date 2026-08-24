const map = {
  Low: "bg-slate-100 text-slate-600",
  Medium: "bg-blue-100 text-blue-700",
  High: "bg-orange-100 text-orange-700",
  Critical: "bg-red-100 text-red-700"
};

export default function PriorityBadge({ priority }) {
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${map[priority]}`}>{priority}</span>;
}
