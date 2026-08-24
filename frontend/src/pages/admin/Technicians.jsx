import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Search, Star, UserCheck, UserX } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function Technicians() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/technicians");
      setRows(data.data.technicians || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load technicians");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return rows;
    return rows.filter((t) => `${t.name} ${t.email} ${t.profile?.specialization || ""}`.toLowerCase().includes(value));
  }, [rows, query]);

  const toggle = async (technician) => {
    try {
      await api.put(`/admin/technicians/${technician._id}/status`, { isActive: !technician.isActive });
      toast.success(`Technician ${technician.isActive ? "deactivated" : "activated"}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-blue-600">Workforce management</p><h1 className="mt-1 text-3xl font-black">Technicians</h1><p className="mt-2 text-sm text-slate-500">Manage technician access, specialization and workload.</p></div>
        <div className="relative w-full sm:w-72"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="input pl-10" placeholder="Search technicians..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </div>

      {loading ? <Spinner /> : filtered.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((technician) => (
            <div className="card p-5" key={technician._id}>
              <div className="flex items-start justify-between gap-3"><div><h3 className="font-bold">{technician.name}</h3><p className="text-sm text-slate-500">{technician.email}</p></div><span className={technician.isActive ? "rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-600" : "rounded-full bg-red-50 px-2 py-1 text-xs font-bold text-red-600"}>{technician.isActive ? "Active" : "Inactive"}</span></div>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Specialization</p><p className="mt-1 font-semibold">{technician.profile?.specialization || "Other"}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Experience</p><p className="mt-1 font-semibold">{technician.profile?.experience || 0} yrs</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Assigned</p><p className="mt-1 font-semibold">{technician.assignedRequests || 0}</p></div>
                <div className="rounded-xl bg-slate-50 p-3"><p className="text-xs text-slate-400">Rating</p><p className="mt-1 flex items-center gap-1 font-semibold"><Star size={14} className="text-amber-500"/>{technician.profile?.rating || 0}</p></div>
              </div>
              <button onClick={() => toggle(technician)} className="btn-secondary mt-5 w-full">{technician.isActive ? <><UserX size={16}/> Deactivate</> : <><UserCheck size={16}/> Activate</>}</button>
            </div>
          ))}
        </div>
      ) : <div className="card p-12 text-center text-sm text-slate-500">No technicians found.</div>}
    </div>
  );
}
