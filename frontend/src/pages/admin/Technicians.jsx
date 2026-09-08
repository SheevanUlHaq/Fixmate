import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Search, Star, UserCheck, UserPlus, UserX } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function Technicians() {
  const [rows, setRows] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

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

  const createTechnician = async (event) => {
    event.preventDefault();
    setCreating(true);
    try {
      await api.post("/admin/technicians", form);
      toast.success("Technician account created");
      setForm({ name: "", email: "", phone: "", password: "" });
      setShowCreate(false);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not create technician");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-blue-600">Workforce management</p><h1 className="mt-1 text-3xl font-black">Technicians</h1><p className="mt-2 text-sm text-slate-500">Create and manage separate technician accounts.</p></div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row"><button className="btn-primary" onClick={() => setShowCreate((value) => !value)}><UserPlus size={16}/>{showCreate ? "Cancel" : "Add technician"}</button><div className="relative w-full sm:w-72"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="input pl-10" placeholder="Search technicians..." value={query} onChange={(e) => setQuery(e.target.value)} /></div></div>
      </div>

      {showCreate && <form className="card grid gap-4 p-5 md:grid-cols-2" onSubmit={createTechnician}>
        <div><label className="label" htmlFor="technician-name">Full name</label><input id="technician-name" className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}/></div>
        <div><label className="label" htmlFor="technician-email">Email address</label><input id="technician-email" type="email" className="input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}/></div>
        <div><label className="label" htmlFor="technician-phone">Phone (optional)</label><input id="technician-phone" className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}/></div>
        <div><label className="label" htmlFor="technician-password">Temporary password</label><input id="technician-password" type="password" className="input" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}/></div>
        <div className="md:col-span-2 flex justify-end"><button className="btn-primary" disabled={creating}>{creating ? "Creating..." : "Create technician account"}</button></div>
      </form>}

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
