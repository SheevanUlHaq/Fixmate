import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import PriorityBadge from "./PriorityBadge";
import { ArrowUpRight } from "lucide-react";

export default function RequestTable({ requests = [], empty = "No requests found." }) {
  if (!requests.length) return <div className="card p-10 text-center text-sm text-slate-500">{empty}</div>;

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Request</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Priority</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Created</th>
              <th className="px-5 py-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((r) => (
              <tr key={r._id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <p className="font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{r.location}</p>
                </td>
                <td className="px-5 py-4 text-slate-600">{r.category}</td>
                <td className="px-5 py-4"><PriorityBadge priority={r.priority} /></td>
                <td className="px-5 py-4"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-4 text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                <td className="px-5 py-4 text-right">
                  <Link to={`/request/${r._id}`} className="inline-flex rounded-lg p-2 text-slate-400 hover:bg-white hover:text-slate-900">
                    <ArrowUpRight size={18} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
