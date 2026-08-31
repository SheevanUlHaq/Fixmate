import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, ClipboardList, LayoutDashboard, LogOut, Settings, ShieldCheck, Users, Wrench, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "../components/NotificationBell";
import Footer from "../components/Footer";
import { useState } from "react";

const navByRole = {
  employee: [
    ["/employee", "Dashboard", LayoutDashboard],
    ["/employee/requests", "My Requests", ClipboardList],
    ["/employee/create", "Create Request", Wrench],
    ["/notifications", "Notifications", Bell],
    ["/profile", "Profile", Settings]
  ],
  technician: [
    ["/technician", "Dashboard", LayoutDashboard],
    ["/technician/requests", "Assigned Requests", ClipboardList],
    ["/technician/profile", "My Profile", Settings],
    ["/notifications", "Notifications", Bell]
  ],
  admin: [
    ["/admin", "Dashboard", LayoutDashboard],
    ["/admin/requests", "All Requests", ClipboardList],
    ["/admin/technicians", "Technicians", Users],
    ["/admin/users", "Users", ShieldCheck],
    ["/notifications", "Notifications", Bell],
    ["/profile", "Profile", Settings]
  ]
};

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const nav = navByRole[user.role] || [];

  const handleLogout = () => { logout(); navigate("/login"); };
  const handleHome = () => {
    const dashboardByRole = {
      employee: "/employee",
      technician: "/technician",
      admin: "/admin"
    };
    navigate(dashboardByRole[user.role] || "/");
    setOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white p-5 transition-transform md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between">
          <button type="button" onClick={handleHome} aria-label="Go to dashboard" className="text-xl font-black tracking-tight text-slate-900">
            Fix<span className="text-blue-600">Mate</span>
          </button>
          <button className="md:hidden" onClick={() => setOpen(false)}><X size={20}/></button>
        </div>
        <div className="mt-8 rounded-2xl bg-slate-900 p-4 text-white">
          <p className="text-xs uppercase tracking-widest text-slate-400">{user.role}</p>
          <p className="mt-1 font-semibold">{user.name}</p>
          <p className="truncate text-xs text-slate-400">{user.email}</p>
        </div>
        <nav className="mt-6 space-y-1">
          {nav.map(([to, label, Icon]) => (
            <NavLink key={to} to={to} end={to === `/${user.role}`} onClick={() => setOpen(false)}
              className={({isActive}) => `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${isActive ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <Icon size={18}/>{label}
            </NavLink>
          ))}
        </nav>
        <button onClick={handleLogout} className="absolute bottom-5 left-5 right-5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
          <LogOut size={18}/> Sign out
        </button>
      </aside>

      <div className="md:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-8">
          <button className="rounded-lg p-2 md:hidden" onClick={() => setOpen(true)}><Menu size={20}/></button>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-slate-500">Service operations</p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <div className="hidden text-right sm:block"><p className="text-sm font-semibold">{user.name}</p><p className="text-xs text-slate-400">{user.role}</p></div>
            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-900 text-sm font-bold text-white">{user.name?.[0]}</div>
          </div>
        </header>
        <main className="p-4 md:p-8"><Outlet /></main>
        <Footer app />
      </div>
    </div>
  );
}
