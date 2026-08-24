import { useEffect, useState } from "react";
import { ClipboardList, CircleCheck, Clock3, FilePlus2, ListChecks } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import RequestTable from "../../components/RequestTable";
import { Link } from "react-router-dom";
import Spinner from "../../components/Spinner";

export default function EmployeeDashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { Promise.all([api.get("/requests/my"), api.get("/auth/me")]).then(([r]) => setData(r.data.data.requests)); }, []);
  if (!data) return <Spinner />;
  const count = s => data.filter(r=>r.status===s).length;
  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-blue-600">Employee workspace</p><h1 className="mt-1 text-3xl font-black">Your service overview</h1><p className="mt-2 text-sm text-slate-500">Track every issue you have reported.</p></div><Link to="/employee/create" className="btn-primary"><FilePlus2 size={18}/> New request</Link></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={ClipboardList} label="Total" value={data.length}/><StatCard icon={Clock3} label="Reported" value={count("REPORTED")}/><StatCard icon={ListChecks} label="In progress" value={count("IN_PROGRESS")+count("ASSIGNED")}/><StatCard icon={CircleCheck} label="Resolved" value={count("RESOLVED")}/><StatCard icon={CircleCheck} label="Closed" value={count("CLOSED")}/>
      </div>
      <div><div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Recent requests</h2><Link className="text-sm font-semibold text-blue-600" to="/employee/requests">View all</Link></div><RequestTable requests={data.slice(0,6)} /></div>
    </div>
  );
}
