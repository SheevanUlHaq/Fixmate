import { useEffect,useState } from "react";
import api from "../../services/api";
import RequestFilters from "../../components/RequestFilters";
import RequestTable from "../../components/RequestTable";
import Spinner from "../../components/Spinner";

export default function TechnicianRequests(){
 const [filters,setFilters]=useState({}),[requests,setRequests]=useState(null);
 useEffect(()=>{api.get("/technician/requests",{params:filters}).then(({data})=>setRequests(data.data.requests)).catch(()=>setRequests([]))},[filters]);
 return <div className="space-y-6"><div><h1 className="text-3xl font-black">Assigned requests</h1><p className="mt-2 text-sm text-slate-500">Work assigned to you by administrators.</p></div><RequestFilters values={filters} onChange={setFilters}/>{requests===null?<Spinner/>:<RequestTable requests={requests}/>}</div>;
}
