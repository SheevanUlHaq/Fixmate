import { useEffect,useState } from "react";
import { ClipboardList, CircleCheck, Clock3, Star } from "lucide-react";
import api from "../../services/api";
import StatCard from "../../components/StatCard";
import RequestTable from "../../components/RequestTable";
import Spinner from "../../components/Spinner";

export default function TechnicianDashboard(){
 const [data,setData]=useState(null),[requests,setRequests]=useState([]);
 useEffect(()=>{Promise.all([api.get("/technician/dashboard"),api.get("/technician/requests")]).then(([d,r])=>{setData(d.data.data.stats);setRequests(r.data.data.requests)})},[]);
 if(!data)return <Spinner/>;
 return <div className="space-y-7"><div><p className="text-sm font-semibold text-blue-600">Technician workspace</p><h1 className="mt-1 text-3xl font-black">Workload overview</h1><p className="mt-2 text-sm text-slate-500">Stay on top of assigned service work.</p></div>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatCard icon={ClipboardList} label="Assigned" value={data.assigned}/><StatCard icon={Clock3} label="In progress" value={data.IN_PROGRESS}/><StatCard icon={CircleCheck} label="Resolved" value={data.RESOLVED}/><StatCard icon={Star} label="Average rating" value={data.averageRating||"—"}/></div>
 <div><h2 className="mb-3 text-lg font-bold">Recent assignments</h2><RequestTable requests={requests.slice(0,8)}/></div></div>;
}
