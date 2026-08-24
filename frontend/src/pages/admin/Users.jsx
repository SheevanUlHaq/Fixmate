import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { UserCheck, UserX, Wrench } from "lucide-react";
import Spinner from "../../components/Spinner";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/users");
      setUsers(data.data.users || []);
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return users;
    return users.filter((u) => `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(value));
  }, [users, query]);

  const promote = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/role`);
      toast.success(`${user.name} is now a technician`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update role");
    }
  };

  const toggleStatus = async (user) => {
    try {
      await api.put(`/admin/users/${user._id}/status`, { isActive: !user.isActive });
      toast.success(`${user.name} is now ${user.isActive ? "inactive" : "active"}`);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Could not update account status");
    }
  };

  const employees = users.filter((u) => u.role === "employee").length;
  const technicians = users.filter((u) => u.role === "technician").length;
  const active = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-600">Account management</p>
          <h1 className="mt-1 text-3xl font-black">Users</h1>
          <p className="mt-2 text-sm text-slate-500">View employees and manage FixMate account access.</p>
        </div>
        <input className="input w-full sm:w-72" placeholder="Search name, email or role..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Employees</p><p className="mt-2 text-2xl font-black">{employees}</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Technicians</p><p className="mt-2 text-2xl font-black">{technicians}</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Active accounts</p><p className="mt-2 text-2xl font-black">{active}</p></div>
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-5 py-4">Name</th><th className="px-5 py-4">Email</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Status</th><th className="px-5 py-4">Joined</th><th className="px-5 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4 font-semibold">{user.name}</td>
                    <td className="px-5 py-4 text-slate-600">{user.email}</td>
                    <td className="px-5 py-4 capitalize">{user.role}</td>
                    <td className="px-5 py-4">{user.isActive ? <span className="font-semibold text-emerald-600">Active</span> : <span className="font-semibold text-red-600">Inactive</span>}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.role === "employee" && <button className="btn-secondary" onClick={() => promote(user)}><Wrench size={14} /> Make technician</button>}
                        {user.role !== "admin" && <button className="btn-secondary" onClick={() => toggleStatus(user)}>{user.isActive ? <><UserX size={14} /> Deactivate</> : <><UserCheck size={14} /> Activate</>}</button>}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && <tr><td colSpan="6" className="px-5 py-12 text-center text-slate-500">No users found.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
