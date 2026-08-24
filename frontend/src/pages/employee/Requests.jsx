import { useEffect, useState } from "react";
import api from "../../services/api";
import RequestFilters from "../../components/RequestFilters";
import RequestTable from "../../components/RequestTable";
import Spinner from "../../components/Spinner";

export default function EmployeeRequests() {
  const [filters,setFilters]=useState({}); const [requests,setRequests]=useState(null);
  useEffect(()=>{api.get("/requests/my",{params:filters}).then(({data})=>setRequests(data.data.requests)).catch(()=>setRequests([]))},[filters]);
  return <div className="space-y-6"><div><h1 className="text-3xl font-black">My requests</h1><p className="mt-2 text-sm text-slate-500">Search and track issues you have reported.</p></div><RequestFilters values={filters} onChange={setFilters}/>{requests===null?<Spinner/>:<RequestTable requests={requests}/>}</div>;
}
