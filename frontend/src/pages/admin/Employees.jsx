import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { Search, UserCheck, UserX } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/employees");
      setEmployees(data.data.employees || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return employees;
    return employees.filter((employee) => `${employee.name} ${employee.email}`.toLowerCase().includes(value));
  }, [employees, query]);

  const toggleStatus = async (employee) => {
    try {
      await api.put(`/admin/employees/${employee._id}/status`, { isActive: !employee.isActive });
      toast.success(`${employee.name} is now ${employee.isActive ? "inactive" : "active"}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update employee status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm font-semibold text-blue-600">Employee management</p><h1 className="mt-1 text-3xl font-black">Employees</h1><p className="mt-2 text-sm text-slate-500">View and manage employee accounts only.</p></div>
        <div className="relative w-full sm:w-72"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input className="input pl-10" placeholder="Search employees..." value={query} onChange={(e) => setQuery(e.target.value)} /></div>
      </div>

      <div className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total employees</p><p className="mt-2 text-2xl font-black">{employees.length}</p></div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Action</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((employee) => <tr key={employee._id}><td className="px-5 py-4 font-semibold">{employee.name}</td><td className="px-5 py-4 text-slate-600">{employee.email}</td><td className="px-5 py-4 text-slate-600">{employee.phone || "—"}</td><td className="px-5 py-4">{employee.isActive ? <span className="font-semibold text-emerald-600">Active</span> : <span className="font-semibold text-red-600">Inactive</span>}</td><td className="px-5 py-4 text-slate-500">{new Date(employee.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><button className="btn-secondary" onClick={() => toggleStatus(employee)}>{employee.isActive ? <><UserX size={14}/> Deactivate</> : <><UserCheck size={14}/> Activate</>}</button></td></tr>)}
              {!filtered.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No employees found.</td></tr>}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}
