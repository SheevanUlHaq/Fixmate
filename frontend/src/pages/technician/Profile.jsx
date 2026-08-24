import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

export default function TechnicianProfile() {
  const [form, setForm] = useState({
      specialization: "",
      experience: 0,
      availability: "Available",
    }),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    api
      .get("/technician/profile")
      .then(({ data }) => {
        if (data.data.profile) setForm(data.data.profile);
      })
      .finally(() => setLoading(false));
  }, []);
  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put("/technician/profile", form);
      toast.success("Profile updated");
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };
  if (loading) return <div>Loading...</div>;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-black">Technician profile</h1>
      <form onSubmit={save} className="card mt-6 space-y-5 p-6">
        <div>
          <label className="label">Specialization</label>
          <select
            className="input"
            value={form.specialization}
            onChange={(e) =>
              setForm({ ...form, specialization: e.target.value })
            }
          >
            {[
              "Electrical",
              "Plumbing",
              "IT",
              "Cleaning",
              "Furniture",
              "HVAC",
              "Other",
            ].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Experience (years)</label>
          <input
            className="input"
            type="number"
            min="0"
            value={form.experience}
            onChange={(e) => setForm({ ...form, experience: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Availability</label>
          <select
            className="input"
            value={form.availability}
            onChange={(e) => setForm({ ...form, availability: e.target.value })}
          >
            {["Available", "Busy", "Offline"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <button className="btn-primary">Save profile</button>
      </form>
    </div>
  );
}
