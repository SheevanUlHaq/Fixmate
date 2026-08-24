import { useEffect, useState } from "react";
import {
  AlertTriangle,
  ClipboardList,
  CircleCheck,
  Clock3,
  Layers,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import Spinner from "../../components/Spinner";

const colors = [
  "#2563eb",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#64748b",
  "#14b8a6",
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get("/admin/dashboard").then(({ data }) => setData(data.data));
  }, []);
  if (!data) return <Spinner />;
  const status = Object.fromEntries(data.status.map((x) => [x._id, x.count]));
  return (
    <div className="space-y-7">
      <div>
        <p className="text-sm font-semibold text-blue-600">
          Admin control center
        </p>
        <h1 className="mt-1 text-3xl font-black">Service operations</h1>
        <p className="mt-2 text-sm text-slate-500">
          Monitor demand, workload and resolution progress.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ClipboardList}
          label="Total requests"
          value={data.totalRequests}
        />
        <StatCard
          icon={Clock3}
          label="In progress"
          value={(status.ASSIGNED || 0) + (status.IN_PROGRESS || 0)}
        />
        <StatCard
          icon={CircleCheck}
          label="Resolved"
          value={status.RESOLVED || 0}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical"
          value={data.criticalRequests}
        />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="font-bold">Requests by category</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <BarChart data={data.category}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2563eb" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-5">
          <h2 className="font-bold">Requests by status</h2>
          <div className="mt-5 h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={data.status}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={90}
                  label
                >
                  {data.status.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <div className="card overflow-hidden">
        <div className="border-b border-slate-100 p-5">
          <h2 className="font-bold">Technician workload</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-3">Technician</th>
                <th className="px-5 py-3">Assigned</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.technicians.map((t) => (
                <tr key={t._id}>
                  <td className="px-5 py-4 font-semibold">{t.name}</td>
                  <td className="px-5 py-4">{t.assigned}</td>
                  <td className="px-5 py-4">
                    <span
                      className={t.active ? "text-emerald-600" : "text-red-600"}
                    >
                      {t.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
