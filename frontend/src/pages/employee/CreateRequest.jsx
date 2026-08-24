import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../services/api";

const initial = { title:"", description:"", category:"IT", priority:"Medium", location:"" };

export default function CreateRequest() {
  const [form,setForm]=useState(initial); const [image,setImage]=useState(null); const [loading,setLoading]=useState(false); const navigate=useNavigate();
  const submit=async e=>{e.preventDefault();setLoading(true);try{const fd=new FormData();Object.entries(form).forEach(([k,v])=>fd.append(k,v));if(image)fd.append("image",image);const {data}=await api.post("/requests",fd);toast.success(data.message);navigate(`/request/${data.data.request._id}`)}catch(e){toast.error(e.response?.data?.message||"Could not create request")}finally{setLoading(false)}};
  return <div className="mx-auto max-w-3xl"><div className="mb-7"><p className="text-sm font-semibold text-blue-600">New request</p><h1 className="mt-1 text-3xl font-black">Report a service issue</h1><p className="mt-2 text-sm text-slate-500">Give the team enough context to act quickly.</p></div>
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div><label className="label">Title</label><input className="input" required maxLength="120" placeholder="e.g. AC not cooling in conference room" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/></div>
      <div><label className="label">Description</label><textarea className="input min-h-32" required placeholder="Describe what is happening..." value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Category</label><select className="input" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{["Electrical","Plumbing","IT","Cleaning","Furniture","HVAC","Other"].map(x=><option key={x}>{x}</option>)}</select></div>
        <div><label className="label">Priority</label><select className="input" value={form.priority} onChange={e=>setForm({...form,priority:e.target.value})}>{["Low","Medium","High","Critical"].map(x=><option key={x}>{x}</option>)}</select></div>
      </div>
      <div><label className="label">Location</label><input className="input" required placeholder="Building / floor / room" value={form.location} onChange={e=>setForm({...form,location:e.target.value})}/></div>
      <div><label className="label">Issue image <span className="font-normal text-slate-400">(optional, one image)</span></label><input className="block w-full rounded-xl border border-dashed border-slate-300 p-4 text-sm" type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setImage(e.target.files?.[0]||null)}/><p className="mt-1 text-xs text-slate-400">JPG, PNG or WebP · max 5MB</p></div>
      <button disabled={loading} className="btn-primary w-full">{loading?"Submitting...":"Submit request"}</button>
    </form>
  </div>;
}
