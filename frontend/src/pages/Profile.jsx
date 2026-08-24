import { useAuth } from "../context/AuthContext";

export default function Profile(){
 const {user}=useAuth();
 return <div className="mx-auto max-w-2xl"><h1 className="text-3xl font-black">Profile</h1><div className="card mt-6 p-6"><div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-900 text-xl font-black text-white">{user.name?.[0]}</div><dl className="mt-7 space-y-5"><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Name</dt><dd className="mt-1 font-semibold">{user.name}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Email</dt><dd className="mt-1 font-semibold">{user.email}</dd></div><div><dt className="text-xs font-bold uppercase tracking-wider text-slate-400">Role</dt><dd className="mt-1 capitalize font-semibold">{user.role}</dd></div></dl></div></div>;
}
